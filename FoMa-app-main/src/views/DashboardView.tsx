import { AlertTriangle, ArrowRight, Boxes, Clock, Package, TrendingDown, TrendingUp } from 'lucide-react';
import type { InventoryItem, Alert, ProductionBatch } from '../types';

type Props = {
  inventory: InventoryItem[];
  alerts: Alert[];
  batches: ProductionBatch[];
  onNavigate: (page: string) => void;
};

export function DashboardView({ inventory, alerts, batches, onNavigate }: Props) {
  const urgentCount = inventory.filter((i) => i.expiryTone === 'urgent').length;
  const runningBatches = batches.filter((b) => b.status === 'running').length;
  const avgWastage = (inventory.reduce((sum, i) => sum + parseFloat(i.wastage), 0) / inventory.length).toFixed(1);

  const stats = [
    { label: 'Active Materials', value: String(inventory.length), icon: Package, tone: 'navy' },
    { label: 'Urgent Expiries', value: String(urgentCount), icon: Clock, tone: urgentCount > 0 ? 'red' : 'green' },
    { label: 'Running Batches', value: String(runningBatches), icon: Boxes, tone: 'navy' },
    { label: 'Avg Wastage', value: `${avgWastage}%`, icon: TrendingDown, tone: 'green' },
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Operations Dashboard</h1><p>Real-time overview of facility performance and key metrics.</p></div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.tone}`}><s.icon size={22} /></div>
            <div><strong>{s.value}</strong><span>{s.label}</span></div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card waste-card">
          <div className="card-heading"><h2>Waste Trends</h2><span>Last 30 Days</span></div>
          <div className="chart-area" aria-label="Waste trends chart">
            <div className="bars">{[40, 35, 60, 45, 20, 15, 10].map((height, index) => <div key={index} className={`bar ${index > 4 ? 'bar-navy' : ''}`} style={{ height: `${height}%` }} title={`${[12, 10, 18, 14, 6, 4, 3][index]}%`} />)}</div>
            <div className="chart-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
          </div>
        </section>

        <section className="card alerts-card">
          <div className="card-heading"><h2>System Alerts</h2><button className="card-link" onClick={() => onNavigate('Analytics')}>View all <ArrowRight size={13} /></button></div>
          <div className="alerts-list">
            {alerts.map((a) => (
              <div key={a.id} className={`alert-row ${a.severity}`}>
                <div className="alert-icon">{a.severity === 'critical' ? <AlertTriangle size={18} /> : a.severity === 'warning' ? <TrendingUp size={18} /> : <Package size={18} />}</div>
                <div className="alert-body"><strong>{a.message}</strong><span>{a.source} · {a.time}</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card quick-inventory">
        <div className="card-heading"><h2>Inventory Snapshot</h2><button className="card-link" onClick={() => onNavigate('Inventory')}>Go to Inventory <ArrowRight size={13} /></button></div>
        <div className="quick-inv-grid">
          {inventory.map((item) => (
            <div key={item.id} className={`quick-inv-item ${item.expiryTone === 'urgent' ? 'urgent' : ''}`}>
              <strong>{item.material}</strong>
              <span>{item.stock}</span>
              <span className={`quick-expiry ${item.expiryTone}`}>{item.expiry}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
