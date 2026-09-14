import { FileDown, Plus, Search, TrendingUp, Trash2 } from 'lucide-react';
import type { InventoryItem } from '../types';

type Props = {
  inventory: InventoryItem[];
  query: string;
  onQueryChange: (value: string) => void;
  onToggleOrder: (id: number) => void;
  onAddStock: () => void;
  onReport: () => void;
  onDeleteItem: (id: number, material: string) => void;
};

export function InventoryView({ inventory, query, onQueryChange, onToggleOrder, onAddStock, onReport, onDeleteItem }: Props) {
  const filtered = inventory.filter((item) => item.material.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="page-header">
        <div><h1>Inventory &amp; Waste Optimization</h1><p>Monitor stock levels, track wastage, and optimize scheduling.</p></div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onReport}><FileDown size={15} /> Download Report</button>
          <button className="primary-button" onClick={onAddStock}><Plus size={16} /> Add Stock</button>
        </div>
      </div>

      <section className="insight-banner">
        <div className="insight-copy"><div className="insight-icon"><TrendingUp size={22} /></div><div><h2>Optimization Insight</h2><p>Potential <strong>$12k savings</strong> this month by optimizing Batch X scheduling.</p></div></div>
      </section>

      <section className="card table-card">
        <div className="table-heading">
          <h2>Raw Material Status</h2>
          <label className="search-box"><Search size={14} /><input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search inventory..." /></label>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Material</th><th>Current Stock</th><th>Expiry Status</th><th>Wastage Rate</th><th>Auto-Order</th><th></th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={item.expiryTone === 'urgent' ? 'urgent-row' : ''}>
                  <td className="material-name">{item.material}</td>
                  <td className={item.expiryTone === 'urgent' ? 'urgent-text stock' : 'stock'}>{item.stock}</td>
                  <td><span className={`expiry-pill ${item.expiryTone}`}><i />{item.expiry}</span></td>
                  <td className={item.expiryTone === 'urgent' ? 'urgent-text wastage' : 'wastage'}>{item.wastage}{item.expiryTone === 'urgent' && <TrendingUp size={13} />}</td>
                  <td><button className={`toggle ${item.autoOrder ? 'on' : ''}`} onClick={() => onToggleOrder(item.id)} aria-label={`Toggle auto-order for ${item.material}`}><span /></button></td>
                  <td>
                    <button
                      onClick={() => onDeleteItem(item.id, item.material)}
                      aria-label={`Delete ${item.material}`}
                      title="Delete material"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td className="empty-state" colSpan={6}>No materials match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}