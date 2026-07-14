import { useState, useEffect } from 'react';
import { useFinance, FinanceProvider } from './context/FinanceContext';
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
  X,
  LogOut
} from 'lucide-react';
import { TransactionModal } from './components/TransactionModal';
import { LandingPage } from './components/LandingPage';
import { APP_CONFIG } from './config/appConfig';
import './index.css';

export type ViewType = 'dashboard' | 'transactions' | 'boletos' | 'investments' | 'debts' | 'settings' | 'landing';

function MainAppContent() {
  const { profile } = useFinance();
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [settingsTab, setSettingsTab] = useState<'general' | 'profile' | 'categories'>('general');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = APP_CONFIG.titleName;
  }, []);

  // Helper function to animate view changes using View Transitions API
  const navigateTo = (view: ViewType, settingsTabOpt?: 'general' | 'profile' | 'categories') => {
    // Check if browser supports View Transitions API
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setCurrentView(view);
        if (settingsTabOpt) {
          setSettingsTab(settingsTabOpt);
        }
      });
    } else {
      setCurrentView(view);
      if (settingsTabOpt) {
        setSettingsTab(settingsTabOpt);
      }
    }
  };

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
    navigateTo('settings', 'profile');
    setMobileMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigateTo('settings', 'general');
    setMobileMenuOpen(false);
  };

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={() => navigateTo('dashboard')} />;
  }

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <PiggyBank size={24} />
          <span>{APP_CONFIG.titleName}</span>
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
          <span>{APP_CONFIG.titleName}</span>
        </div>
        <nav style={{ flexGrow: 1 }}>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => navigateTo(item.id)}
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

          <div style={{ display: 'flex', gap: '8px' }}>
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
            <button
              onClick={() => navigateTo('landing')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Sair"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <LogOut size={18} />
            </button>
          </div>
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
              <span>{APP_CONFIG.titleName}</span>
            </div>
            <nav style={{ flexGrow: 1 }}>
              <ul className="sidebar-menu">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
                      onClick={() => {
                        navigateTo(item.id);
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
      <main className="main-content content-transition-wrapper">
        {renderView()}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => navigateTo(item.id)}
            style={{ border: 'none', background: 'none' }}
          >
            {item.icon}
            <span>{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* Global Transaction Modal (Single Instance) */}
      <TransactionModal />
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
