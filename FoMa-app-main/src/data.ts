import type { InventoryItem, EquipmentCheck, ProductionBatch, Alert } from './types';

export const initialInventory: InventoryItem[] = [
  { id: 1, material: 'Industrial Flour Type A', stock: '14,500 kg', expiry: '6 Months', expiryTone: 'good', wastage: '2.4%', autoOrder: true },
  { id: 2, material: 'Granulated Sugar', stock: '8,200 kg', expiry: '12 Months', expiryTone: 'good', wastage: '1.1%', autoOrder: true },
  { id: 3, material: 'Palm Oil Blend', stock: '1,200 L', expiry: '2 Weeks', expiryTone: 'urgent', wastage: '8.5%', autoOrder: false },
  { id: 4, material: 'Cocoa Powder', stock: '4,500 kg', expiry: '8 Months', expiryTone: 'good', wastage: '3.2%', autoOrder: true },
  { id: 5, material: 'Salt (Bulk)', stock: '2,100 kg', expiry: '24 Months', expiryTone: 'good', wastage: '0.5%', autoOrder: false },
];

export const equipmentChecks: EquipmentCheck[] = [
  { id: 1, name: 'Mixer Unit A-12', status: 'operational', detail: 'Running normally · 142h since last service' },
  { id: 2, name: 'Conveyor Belt 3', status: 'warning', detail: 'Vibration above threshold · service due in 48h' },
  { id: 3, name: 'Oven Section B', status: 'operational', detail: 'Temperature stable · all sensors nominal' },
  { id: 4, name: 'Packaging Line 2', status: 'offline', detail: 'Manual stop engaged · awaiting maintenance' },
  { id: 5, name: 'Cooling Tower C', status: 'operational', detail: 'Flow rate optimal · 88% efficiency' },
];

export const productionBatches: ProductionBatch[] = [
  { id: 1, product: 'Artisan Bread Loaf 500g', status: 'running', start: '06:00', end: '14:00', progress: 65 },
  { id: 2, product: 'Chocolate Cookies 200g', status: 'scheduled', start: '14:00', end: '20:00', progress: 0 },
  { id: 3, product: 'Whole Wheat Rolls 100g', status: 'completed', start: '22:00', end: '06:00', progress: 100 },
  { id: 4, product: 'Premium Cake Mix 1kg', status: 'delayed', start: '08:00', end: '12:00', progress: 30 },
  { id: 5, product: 'Sugar-Free Biscuits 150g', status: 'scheduled', start: '20:00', end: '02:00', progress: 0 },
];

export const systemAlerts: Alert[] = [
  { id: 1, severity: 'critical', message: 'Palm Oil Blend stock critically low — 2 weeks to expiry', source: 'Inventory Monitor', time: '2m ago' },
  { id: 2, severity: 'warning', message: 'Conveyor Belt 3 vibration above safe threshold', source: 'Equipment Sensor', time: '18m ago' },
  { id: 3, severity: 'warning', message: 'Premium Cake Mix batch running 2h behind schedule', source: 'Production Planner', time: '45m ago' },
  { id: 4, severity: 'info', message: 'Daily waste report generated — Week 4 down 40%', source: 'Analytics Engine', time: '3h ago' },
];

export const supportArticles = [
  { id: 1, title: 'How to add a new raw material to inventory', category: 'Inventory', content: 'Click the "Add Stock" button in the top-right of the Inventory page. Enter the material name and current stock quantity, then submit. The new item appears immediately in your inventory table with default expiry and wastage values.' },
  { id: 2, title: 'Setting up auto-order for materials', category: 'Inventory', content: 'In the Inventory table, use the toggle switch in the Auto-Order column for any material. When enabled (blue), the system will automatically place purchase orders when stock drops below a threshold. When disabled, you will receive a notification instead.' },
  { id: 3, title: 'Understanding waste trend charts', category: 'Analytics', content: 'The Waste Trends chart shows weekly wastage percentages over the last 30 days. Coral bars represent higher waste periods and navy bars represent recent improvement. Hover over any bar to see the exact percentage for that week.' },
  { id: 4, title: 'Emergency Stop — what it does', category: 'Safety', content: 'The Emergency Stop button halts all scheduled production batches and brings equipment to a safe state. A confirmation dialog appears before activation. When engaged, a red banner appears at the top of every page. Use the "Resume Operations" button in the banner to restart.' },
  { id: 5, title: 'Reading the Safety Center', category: 'Safety', content: 'Click the heartbeat icon in the top bar to open the Safety Center. It shows a live summary of equipment status — operational, warning, and offline counts — plus a detailed list of each machine with its current condition and service notes.' },
  { id: 6, title: 'Managing notification preferences', category: 'Settings', content: 'Open Settings from the sidebar to configure which alerts you receive. You can toggle urgent expiry warnings, high wastage alerts, auto-order reminders, equipment warnings, and production delay notifications independently.' },
];
