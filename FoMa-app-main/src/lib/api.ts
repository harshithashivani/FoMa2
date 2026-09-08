import type { InventoryItem, EquipmentCheck, ProductionBatch, Alert } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws') + '/ws';

// ---- Raw shapes returned by the FastAPI backend ----------------------------

type RawInventoryItem = {
  id: number;
  material: string;
  quantity: number;
  unit: string;
  expiry_date: string; // ISO date
  expiry_tone: 'good' | 'urgent';
  wastage_pct: number;
  auto_order: boolean;
};

type RawEquipment = {
  id: number;
  name: string;
  status: 'operational' | 'warning' | 'offline';
  detail: string;
};

type RawBatch = {
  id: number;
  product: string;
  status: 'scheduled' | 'running' | 'completed' | 'delayed';
  start_time: string;
  end_time: string;
  progress: number;
};

type RawAlert = {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  source: string;
  created_at: string; // ISO datetime
};

// ---- Small formatting helpers (backend gives raw numbers/dates; the UI
// wants display strings, same as the original data.ts) ----------------------

function formatStock(quantity: number, unit: string): string {
  return `${quantity.toLocaleString()} ${unit}`;
}

function formatExpiry(expiryDateIso: string): string {
  const days = Math.ceil(
    (new Date(expiryDateIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return 'Expired';
  if (days < 60) return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  if (days < 90) return `${Math.round(days / 7)} Weeks`;
  return `${Math.round(days / 30)} Months`;
}

function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function adaptInventory(raw: RawInventoryItem): InventoryItem {
  return {
    id: raw.id,
    material: raw.material,
    stock: formatStock(raw.quantity, raw.unit),
    expiry: formatExpiry(raw.expiry_date),
    expiryTone: raw.expiry_tone,
    wastage: `${raw.wastage_pct.toFixed(1)}%`,
    autoOrder: raw.auto_order,
  };
}

function adaptEquipment(raw: RawEquipment): EquipmentCheck {
  return { id: raw.id, name: raw.name, status: raw.status, detail: raw.detail };
}

function adaptBatch(raw: RawBatch): ProductionBatch {
  return {
    id: raw.id,
    product: raw.product,
    status: raw.status,
    start: raw.start_time,
    end: raw.end_time,
    progress: raw.progress,
  };
}

function adaptAlert(raw: RawAlert): Alert {
  return {
    id: raw.id,
    severity: raw.severity,
    message: raw.message,
    source: raw.source,
    time: formatRelativeTime(raw.created_at),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Public API used by App.tsx --------------------------------------------

export async function fetchInventory(): Promise<InventoryItem[]> {
  const raw = await request<RawInventoryItem[]>('/api/inventory');
  return raw.map(adaptInventory);
}

export async function fetchEquipment(): Promise<EquipmentCheck[]> {
  const raw = await request<RawEquipment[]>('/api/equipment');
  return raw.map(adaptEquipment);
}

export async function fetchBatches(): Promise<ProductionBatch[]> {
  const raw = await request<RawBatch[]>('/api/production');
  return raw.map(adaptBatch);
}

export async function fetchAlerts(): Promise<Alert[]> {
  const raw = await request<RawAlert[]>('/api/alerts');
  return raw.map(adaptAlert);
}

export async function toggleAutoOrder(id: number, autoOrder: boolean): Promise<void> {
  await request(`/api/inventory/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ auto_order: autoOrder }),
  });
}

export async function addInventoryItem(material: string, stockInput: string): Promise<void> {
  // stockInput looks like "500 kg" — split into a number + unit.
  const trimmed = stockInput.trim();
  const match = trimmed.match(/^([\d,.]+)\s*(.*)$/);
  const quantity = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  const unit = (match && match[2]) || 'kg';

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);

  await request('/api/inventory', {
    method: 'POST',
    body: JSON.stringify({
      material,
      quantity,
      unit,
      expiry_date: expiry.toISOString().slice(0, 10),
      wastage_pct: 0,
      auto_order: false,
    }),
  });
}

// ---- Live updates via WebSocket --------------------------------------------
// The backend's simulator (standing in for the edge gateway/Kafka pipeline)
// pushes events here as they happen. We expose a tiny subscribe helper so
// App.tsx can react without knowing about WebSocket details.

export type LiveEvent =
  | { type: 'equipment_metric'; data: { equipment_id: number; status: string } }
  | { type: 'production_update'; data: { batch_id: number; progress: number; status: string } }
  | { type: string; data: unknown };

export function connectLiveUpdates(onEvent: (event: LiveEvent) => void): () => void {
  let socket: WebSocket | null = null;
  let closedByUs = false;

  function connect() {
    socket = new WebSocket(WS_URL);
    socket.onmessage = (msg) => {
      try {
        onEvent(JSON.parse(msg.data));
      } catch {
        // ignore malformed frames
      }
    };
    socket.onclose = () => {
      if (!closedByUs) setTimeout(connect, 3000); // simple auto-reconnect
    };
  }

  connect();

  return () => {
    closedByUs = true;
    socket?.close();
  };
}