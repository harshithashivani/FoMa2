export type InventoryItem = {
  id: number;
  material: string;
  stock: string;
  expiry: string;
  expiryTone: 'good' | 'urgent';
  wastage: string;
  autoOrder: boolean;
};

export type Notification = {
  id: number;
  title: string;
  detail: string;
  tone: 'urgent' | 'warning' | 'info';
  time: string;
};

export type EquipmentCheck = {
  id: number;
  name: string;
  status: 'operational' | 'warning' | 'offline';
  detail: string;
};

export type ProductionBatch = {
  id: number;
  product: string;
  status: 'scheduled' | 'running' | 'completed' | 'delayed';
  start: string;
  end: string;
  progress: number;
};

export type Alert = {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  source: string;
  time: string;
};
