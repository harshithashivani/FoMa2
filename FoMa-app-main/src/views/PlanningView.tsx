import { Clock, PlayCircle, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import type { ProductionBatch } from '../types';

type Props = {
  batches: ProductionBatch[];
  onAddBatch: () => void;
  canAddBatch: boolean;
};

const statusConfig = {
  running: { icon: PlayCircle, label: 'Running', color: 'navy' },
  scheduled: { icon: Clock, label: 'Scheduled', color: 'gray' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'green' },
  delayed: { icon: AlertCircle, label: 'Delayed', color: 'red' },
} as const;

export function PlanningView({ batches, onAddBatch, canAddBatch }: Props) {
  return (
    <>
      <div className="page-header">
        <div><h1>Production Planning</h1><p>Schedule and monitor production batches across all lines.</p></div>
      </div>

      <section className="card planning-card">
        <div className="card-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2>Today's Production Schedule</h2>
            <button
              className="clear-all"
              onClick={onAddBatch}
              disabled={!canAddBatch}
              title={canAddBatch ? undefined : 'Plant Manager access required'}
            >
              + Add Batch
            </button>
          </div>
          <span><CalendarDays size={13} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="batch-list">
          {batches.map((batch) => {
            const cfg = statusConfig[batch.status];
            return (
              <div key={batch.id} className="batch-item">
                <div className="batch-info">
                  <div className={`batch-status-icon ${cfg.color}`}><cfg.icon size={20} /></div>
                  <div><strong>{batch.product}</strong><span>{batch.start} — {batch.end}</span></div>
                </div>
                <div className="batch-progress-wrap">
                  <div className="batch-progress-bar"><div className={`batch-progress-fill ${cfg.color}`} style={{ width: `${batch.progress}%` }} /></div>
                  <span className={`batch-status-label ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="planning-stats">
        <div className="card mini-stat"><strong>{batches.filter((b) => b.status === 'running').length}</strong><span>Running</span></div>
        <div className="card mini-stat"><strong>{batches.filter((b) => b.status === 'scheduled').length}</strong><span>Scheduled</span></div>
        <div className="card mini-stat"><strong>{batches.filter((b) => b.status === 'completed').length}</strong><span>Completed</span></div>
        <div className="card mini-stat"><strong>{batches.filter((b) => b.status === 'delayed').length}</strong><span>Delayed</span></div>
      </div>
    </>
  );
}