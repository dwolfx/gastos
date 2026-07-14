import { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Dashboard } from './components/Dashboard';
import { TransactionsList } from './components/TransactionsList';
import { BoletosView } from './components/BoletosView';
import { InvestmentsView } from './components/InvestmentsView';
import { DebtsView } from './components/DebtsView';
import { SettingsView } from './components/SettingsView';
import { 
  LayoutDashboard, 
  Receipt,
  Barcode, 
  Coins, 
  AlertTriangle, 
  Settings as SettingsIcon,
  PiggyBank,
  Menu,
  X
} from 'lucide-react';
import './index.css';

export type ViewType = 'dashboard' | 'transactions' | 'boletos' | 'investments' | 'debts' | 'settings';

function MainAppContent() {
  const { profile } = useFinance();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [settingsTab, setSettingsTab] = useState<'general' | 'profile' | 'categories'>('general');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionsList />;
      case 'boletos':
        return <BoletosView />;
      case 'investments':
        return <InvestmentsView />;
      case 'debts':
        return <DebtsView />;
      case 'settings':
        return <SettingsView defaultTab={settingsTab} setDefaultTab={setSettingsTab} />;
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Resumo Geral', icon: <LayoutDashboard size={20} /> },
    { id: 'transactions', label: 'Lançamentos', icon: <Receipt size={20} /> },
    { id: 'boletos', label: 'Boletos', icon: <Barcode size={20} /> },
    { id: 'investments', label: 'Investimentos', icon: <Coins size={20} /> },
    { id: 'debts', label: 'Dívidas', icon: <AlertTriangle size={20} /> },
  ] as const;

  const handleProfileClick = () => {
    setCurrentView('settings');
    setSettingsTab('profile');
    setMobileMenuOpen(false);
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
    setSettingsTab('general');
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <PiggyBank size={24} />
          <span>Gastos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User profile bubble */}
          <div 
            onClick={handleProfileClick}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: 'var(--radius-full)', 
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {profile.userName.substring(0, 1)}
          </div>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <PiggyBank size={28} />
          <span>Gastos</span>
        </div>
        <nav style={{ flexGrow: 1 }}>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentView(item.id)}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div 
            onClick={handleProfileClick}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: 'var(--radius-full)', 
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {profile.userName.substring(0, 1)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{profile.userName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Meu Perfil</div>
            </div>
          </div>

          <button
            onClick={handleSettingsClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: currentView === 'settings' ? 'var(--color-purple)' : 'var(--text-secondary)',
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Configurações"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay menu */}
      {mobileMenuOpen && (
        <div 
          className="modal-overlay animate-fade" 
          style={{ zIndex: 98, justifyContent: 'flex-start', padding: 0 }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="sidebar" 
            style={{ display: 'flex', width: '260px', height: '100vh', animation: 'slideInRight 0.25s forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sidebar-logo" style={{ marginTop: '50px' }}>
              <PiggyBank size={28} />
              <span>Gastos</span>
            </div>
            <nav style={{ flexGrow: 1 }}>
              <ul className="sidebar-menu">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div 
                onClick={handleProfileClick}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: 'var(--radius-full)', 
                  background: 'var(--gradient-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  {profile.userName.substring(0, 1)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{profile.userName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Meu Perfil</div>
                </div>
              </div>
              
              <button
                onClick={handleSettingsClick}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentView === 'settings' ? 'var(--color-purple)' : 'var(--text-secondary)',
                  padding: '6px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SettingsIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
            style={{ border: 'none', background: 'none' }}
          >
            {item.icon}
            <span>{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}

export default App;
