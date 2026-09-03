import { X } from 'lucide-react';

export type NotificationSettings = {
  expiryWarnings: boolean;
  wastageAlerts: boolean;
  autoOrderReminders: boolean;
  equipmentWarnings: boolean;
  productionDelays: boolean;
};

type Props = {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onClose: () => void;
};

const settingFields: { key: keyof NotificationSettings; label: string; description: string }[] = [
  { key: 'expiryWarnings', label: 'Expiry Warnings', description: 'Alert when materials are within 2 weeks of expiry' },
  { key: 'wastageAlerts', label: 'High Wastage Alerts', description: 'Notify when a material exceeds 5% wastage rate' },
  { key: 'autoOrderReminders', label: 'Auto-Order Reminders', description: 'Remind when auto-order is off for urgent stock' },
  { key: 'equipmentWarnings', label: 'Equipment Warnings', description: 'Alert on equipment vibration, temperature, or offline events' },
  { key: 'productionDelays', label: 'Production Delays', description: 'Notify when a batch falls behind schedule' },
];

export function SettingsModal({ settings, onChange, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div><h2>Settings</h2><p>Configure notification preferences and system behavior.</p></div>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="settings-section">
          <h3>Notifications</h3>
          <p>Choose which alerts you want to receive in the notification panel.</p>
        </div>
        <div className="settings-list">
          {settingFields.map((field) => (
            <div key={field.key} className="setting-row">
              <div><strong>{field.label}</strong><span>{field.description}</span></div>
              <button className={`toggle ${settings[field.key] ? 'on' : ''}`} onClick={() => onChange({ ...settings, [field.key]: !settings[field.key] })} aria-label={`Toggle ${field.label}`}><span /></button>
            </div>
          ))}
        </div>
        <div className="settings-section">
          <h3>System</h3>
        </div>
        <div className="settings-list">
          <div className="setting-row">
            <div><strong>Facility Name</strong><span>Displayed in the sidebar header</span></div>
            <input className="setting-input" defaultValue="Facility 01" />
          </div>
          <div className="setting-row">
            <div><strong>Wastage Threshold</strong><span>Percentage that triggers a high-wastage alert</span></div>
            <input className="setting-input" type="number" defaultValue={5} min={0} max={100} />
          </div>
        </div>
        <button className="primary-button settings-save" onClick={onClose}>Save Settings</button>
      </div>
    </div>
  );
}
