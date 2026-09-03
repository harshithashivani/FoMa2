import { AlertTriangle, X } from 'lucide-react';

type Props = {
  onConfirm: () => void;
  onClose: () => void;
};

export function EmergencyStopModal({ onConfirm, onClose }: Props) {
  return (
    <div className="modal-backdrop emergency-backdrop" onClick={onClose}>
      <div className="modal emergency-modal" onClick={(e) => e.stopPropagation()}>
        <div className="emergency-modal-icon"><AlertTriangle size={40} /></div>
        <h2>Emergency Stop</h2>
        <p className="emergency-warning">This will immediately halt all running production batches and bring equipment to a safe standby state. Scheduled batches will be paused until operations are manually resumed.</p>
        <div className="emergency-actions">
          <button className="secondary-button emergency-cancel" onClick={onClose}>Cancel</button>
          <button className="emergency-confirm" onClick={onConfirm}><AlertTriangle size={15} /> Confirm Emergency Stop</button>
        </div>
      </div>
    </div>
  );
}
