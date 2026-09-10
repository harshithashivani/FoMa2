import { AlertTriangle, TrendingDown, TrendingUp, Package, Clock } from 'lucide-react';
import type { InventoryItem, Alert } from '../types';

type Props = {
  inventory: InventoryItem[];
  alerts: Alert[];
};

export function AnalyticsView({ inventory, alerts }: Props) {
  const avgWastage = (inventory.reduce((sum, i) => sum + parseFloat(i.wastage), 0) / inventory.length).toFixed(1);
  const totalMaterials = inventory.length;
  const urgentItems = inventory.filter((i) => i.expiryTone === 'urgent').length;
  const autoOrderCount = inventory.filter((i) => i.autoOrder).length;

  const wasteData = inventory.map((item) => ({ material: item.material, rate: parseFloat(item.wastage) }));
  const maxWaste = Math.max(1, ...wasteData.map((d) => d.rate));

  return (
    <>
      <div className="page-header">
        <div><h1>Analytics &amp; Insights</h1><p>Deep dive into waste patterns, stock health, and operational efficiency.</p></div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-icon navy"><Package size={22} /></div><div><strong>{totalMaterials}</strong><span>Tracked Materials</span></div></div>
        <div className="stat-card"><div className="stat-icon red"><Clock size={22} /></div><div><strong>{urgentItems}</strong><span>Urgent Expiries</span></div></div>
        <div className="stat-card"><div className="stat-icon green"><TrendingDown size={22} /></div><div><strong>{avgWastage}%</strong><span>Avg Wastage</span></div></div>
        <div className="stat-card"><div className="stat-icon navy"><TrendingUp size={22} /></div><div><strong>{autoOrderCount}</strong><span>Auto-Order Active</span></div></div>
      </div>

      <div className="dashboard-grid">
        <section className="card waste-card">
          <div className="card-heading"><h2>Waste Trends</h2><span>Last 30 Days</span></div>
          <div className="chart-area" aria-label="Waste trends chart">
            <div className="bars">{[40, 35, 60, 45, 20, 15, 10].map((height, index) => <div key={index} className={`bar ${index > 4 ? 'bar-navy' : ''}`} style={{ height: `${height}%` }} title={`${[12, 10, 18, 14, 6, 4, 3][index]}%`} />)}</div>
            <div className="chart-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
          </div>
        </section>

        <section className="card">
          <div className="card-heading"><h2>Wastage by Material</h2><span>% of total</span></div>
          <div className="waste-breakdown">
            {wasteData.map((d) => (
              <div key={d.material} className="waste-bar-row">
                <span className="waste-bar-label">{d.material}</span>
                <div className="waste-bar-track"><div className={`waste-bar-fill ${d.rate >= 5 ? 'high' : ''}`} style={{ width: `${(d.rate / maxWaste) * 100}%` }} /></div>
                <span className="waste-bar-value">{d.rate}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card alerts-card">
        <div className="card-heading"><h2>All System Alerts</h2><span>{alerts.length} active</span></div>
        <div className="alerts-list">
          {alerts.map((a) => (
            <div key={a.id} className={`alert-row ${a.severity}`}>
              <div className="alert-icon">{a.severity === 'critical' ? <AlertTriangle size={18} /> : a.severity === 'warning' ? <TrendingUp size={18} /> : <Package size={18} />}</div>
              <div className="alert-body"><strong>{a.message}</strong><span>{a.source} · {a.time}</span></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}