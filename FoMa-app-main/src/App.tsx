import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CircleHelp,
  Factory,
  Grid2X2,
  HeartPulse,
  Menu,
  Package,
  Play,
  Settings,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { initialInventory, equipmentChecks, productionBatches, systemAlerts } from './data';
import type { InventoryItem, Notification } from './types';
import { DashboardView } from './views/DashboardView';
import { PlanningView } from './views/PlanningView';
import { InventoryView } from './views/InventoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsModal, type NotificationSettings } from './components/SettingsModal';
import { SupportModal } from './components/SupportModal';
import { EmergencyStopModal } from './components/EmergencyStopModal';

const navItems = [
  { label: 'Dashboard', icon: Grid2X2 },
  { label: 'Planning', icon: CalendarDays },
  { label: 'Inventory', icon: Package },
  { label: 'Analytics', icon: TrendingUp },
];

function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [query, setQuery] = useState('');
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [notice, setNotice] = useState('');
  const [openPanel, setOpenPanel] = useState<'none' | 'notifications' | 'safety'>('none');
  const [dismissedNotifications, setDismissedNotifications] = useState<number[]>([]);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    expiryWarnings: true,
    wastageAlerts: true,
    autoOrderReminders: true,
    equipmentWarnings: true,
    productionDelays: true,
  });

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];
    inventory.forEach((item) => {
      if (notifSettings.expiryWarnings && item.expiryTone === 'urgent') {
        items.push({ id: item.id * 10 + 1, title: `${item.material} expiring soon`, detail: `Only ${item.expiry} of shelf life remaining`, tone: 'urgent', time: '2m ago' });
      }
      if (notifSettings.wastageAlerts && parseFloat(item.wastage) >= 5) {
        items.push({ id: item.id * 10 + 2, title: `High wastage: ${item.material}`, detail: `Wastage rate at ${item.wastage} — above 5% threshold`, tone: 'warning', time: '15m ago' });
      }
      if (notifSettings.autoOrderReminders && !item.autoOrder && item.expiryTone === 'urgent') {
        items.push({ id: item.id * 10 + 3, title: `Auto-order disabled for ${item.material}`, detail: 'Stock is low and auto-order is off', tone: 'warning', time: '1h ago' });
      }
    });
    items.push({ id: 999, title: 'Daily waste report generated', detail: 'Week 4 wastage down 40% vs Week 1', tone: 'info', time: '3h ago' });
    return items.filter((n) => !dismissedNotifications.includes(n.id));
  }, [inventory, dismissedNotifications, notifSettings]);

  const unreadCount = notifications.length;

  function toggleOrder(id: number) {
    setInventory((items) => items.map((item) => item.id === id ? { ...item, autoOrder: !item.autoOrder } : item));
  }

  function handleAddStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const material = String(form.get('material') || '').trim();
    const stock = String(form.get('stock') || '').trim();
    if (!material || !stock) return;
    setInventory((items) => [...items, { id: Date.now(), material, stock, expiry: '12 Months', expiryTone: 'good', wastage: '0.0%', autoOrder: false }]);
    setIsAddModalOpen(false);
    setNotice(`${material} added to inventory`);
    window.setTimeout(() => setNotice(''), 3000);
  }

  function handleReport() {
    setNotice('Report ready to download');
    window.setTimeout(() => setNotice(''), 3000);
  }

  function dismissNotification(id: number) {
    setDismissedNotifications((ids) => [...ids, id]);
  }

  function clearAllNotifications() {
    setDismissedNotifications(notifications.map((n) => n.id));
  }

  function togglePanel(panel: 'notifications' | 'safety') {
    setOpenPanel((current) => (current === panel ? 'none' : panel));
  }

  function handleEmergencyConfirm() {
    setIsEmergencyActive(true);
    setIsEmergencyModalOpen(false);
    setNotice('Emergency stop activated — all production halted');
    window.setTimeout(() => setNotice(''), 4000);
  }

  function handleEmergencyResume() {
    setIsEmergencyActive(false);
    setNotice('Operations resumed — production schedule active');
    window.setTimeout(() => setNotice(''), 3000);
  }

  function navigate(page: string) {
    setActiveNav(page);
    setIsMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Factory size={23} /></div>
          <div><strong>FoMa Ops</strong><span>Facility 01 - {isEmergencyActive ? 'Halted' : 'Active'}</span></div>
        </div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => navigate(label)}>
              <Icon size={20} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className={`emergency-button ${isEmergencyActive ? 'engaged' : ''}`} onClick={() => isEmergencyActive ? handleEmergencyResume() : setIsEmergencyModalOpen(true)}>
            <AlertTriangle size={15} /> {isEmergencyActive ? 'Resume Operations' : 'Emergency Stop'}
          </button>
          <div className="utility-nav">
            <button className="nav-item" onClick={() => setIsSettingsOpen(true)}><Settings size={20} /><span>Settings</span></button>
            <button className="nav-item" onClick={() => setIsSupportOpen(true)}><CircleHelp size={20} /><span>Support</span></button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open navigation"><Menu size={22} /></button>
          <div className="mobile-brand">FoMa</div>
          <div className="top-actions">
            <div className="icon-wrapper">
              <button className={openPanel === 'safety' ? 'active-icon' : ''} onClick={() => togglePanel('safety')} aria-label="Safety center"><HeartPulse size={21} /></button>
              {openPanel === 'safety' && (
                <div className="dropdown-panel safety-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="panel-header">
                    <div><ShieldCheck size={18} /><h3>Safety Center</h3></div>
                    <button onClick={() => setOpenPanel('none')} aria-label="Close"><X size={16} /></button>
                  </div>
                  <div className="safety-summary">
                    <div className="safety-stat operational"><strong>{equipmentChecks.filter((e) => e.status === 'operational').length}</strong><span>Operational</span></div>
                    <div className="safety-stat warning"><strong>{equipmentChecks.filter((e) => e.status === 'warning').length}</strong><span>Warnings</span></div>
                    <div className="safety-stat offline"><strong>{equipmentChecks.filter((e) => e.status === 'offline').length}</strong><span>Offline</span></div>
                  </div>
                  <div className="panel-list">
                    {equipmentChecks.map((eq) => (
                      <div key={eq.id} className="safety-item">
                        <span className={`status-dot ${eq.status}`} />
                        <div><strong>{eq.name}</strong><p>{eq.detail}</p></div>
                        <span className={`status-label ${eq.status}`}>{eq.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="icon-wrapper">
              <button className={`notification ${openPanel === 'notifications' ? 'active-icon' : ''}`} onClick={() => togglePanel('notifications')} aria-label="Notifications"><Bell size={21} />{unreadCount > 0 && <span>{unreadCount}</span>}</button>
              {openPanel === 'notifications' && (
                <div className="dropdown-panel notifications-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="panel-header">
                    <div><Bell size={18} /><h3>Notifications</h3></div>
                    {notifications.length > 0 && <button className="clear-all" onClick={clearAllNotifications}>Clear all</button>}
                  </div>
                  <div className="panel-list">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications"><Check size={28} /><p>You're all caught up</p></div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`notification-item ${n.tone}`}>
                          <span className="notif-dot" />
                          <div className="notif-body"><strong>{n.title}</strong><p>{n.detail}</p><span className="notif-time">{n.time}</span></div>
                          <button className="notif-dismiss" onClick={() => dismissNotification(n.id)} aria-label="Dismiss"><X size={14} /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <img className="avatar" alt="Plant manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyxkVEHZxRm-BK7zr54xDb2z8c3ZrpcuEhFd-xhu6GaPQNOtZZqofJRWCZvvtcowUi9HWrT9KOxY_aQwpHcOronlDtQQeK-HSAwZ604zF-b4zGllVb_svxCiwL-vNKBsptWQwksHYkQG5O6eH6ZRnigQfq-3lPb83eccJamb40V2ta2HQnzC2udCLDgC3pkXNhbnP9GqJnmqwE3eC3FaeSBrGJQdMBsHlkC7xpTK8hOFLhPseBPY6P" />
          </div>
        </header>

        {isEmergencyActive && (
          <div className="emergency-banner">
            <AlertTriangle size={20} />
            <div><strong>Emergency Stop Active</strong><span>All production halted and equipment in safe standby. Resume when ready.</span></div>
            <button className="emergency-resume-btn" onClick={handleEmergencyResume}><Play size={15} /> Resume Operations</button>
          </div>
        )}

        <div className="page-content">
          {activeNav === 'Dashboard' && <DashboardView inventory={inventory} alerts={systemAlerts} batches={productionBatches} onNavigate={navigate} />}
          {activeNav === 'Planning' && <PlanningView batches={productionBatches} />}
          {activeNav === 'Inventory' && <InventoryView inventory={inventory} query={query} onQueryChange={setQuery} onToggleOrder={toggleOrder} onAddStock={() => setIsAddModalOpen(true)} onReport={handleReport} />}
          {activeNav === 'Analytics' && <AnalyticsView inventory={inventory} alerts={systemAlerts} />}
          <footer>© 2024 FoMa Industrial Systems. All rights reserved.</footer>
        </div>
      </main>

      {notice && <div className="toast"><Check size={16} /> {notice}</div>}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><h2>Add Stock</h2><p>Register a new raw material.</p></div><button onClick={() => setIsAddModalOpen(false)} aria-label="Close"><X size={18} /></button></div>
            <form onSubmit={handleAddStock}><label>Material name<input name="material" placeholder="e.g. Vanilla Extract" autoFocus required /></label><label>Current stock<input name="stock" placeholder="e.g. 500 kg" required /></label><button className="primary-button" type="submit">Add to inventory</button></form>
          </div>
        </div>
      )}
      {isSettingsOpen && <SettingsModal settings={notifSettings} onChange={setNotifSettings} onClose={() => setIsSettingsOpen(false)} />}
      {isSupportOpen && <SupportModal onClose={() => setIsSupportOpen(false)} />}
      {isEmergencyModalOpen && <EmergencyStopModal onConfirm={handleEmergencyConfirm} onClose={() => setIsEmergencyModalOpen(false)} />}
    </div>
  );
}

export default App;
