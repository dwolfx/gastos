import React, { useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { 
  PiggyBank, 
  ArrowRight, 
  Check, 
  Shield, 
  RefreshCw, 
  Users, 
  LayoutDashboard, 
  Receipt, 
  Coins, 
  Barcode, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

type TabType = 'dashboard' | 'transactions' | 'investments' | 'boletos' | 'debts';

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const tabs = [
    { id: 'dashboard', label: 'Resumo Geral', icon: <LayoutDashboard size={16} /> },
    { id: 'transactions', label: 'Lançamentos', icon: <Receipt size={16} /> },
    { id: 'investments', label: 'Investimentos', icon: <Coins size={16} /> },
    { id: 'boletos', label: 'Boletos', icon: <Barcode size={16} /> },
    { id: 'debts', label: 'Dívidas', icon: <AlertTriangle size={16} /> },
  ] as const;

  const faqItems = [
    {
      question: 'O acesso vitalício é realmente de pagamento único?',
      answer: 'Sim, absolutamente! Ao adquirir a licença vitalícia por R$ 197, você tem acesso completo a todos os recursos atuais e futuros do gerenciador. Sem nenhuma assinatura, sem mensalidades e sem cobranças ocultas.'
    },
    {
      question: 'Como meus dados financeiros são protegidos?',
      answer: 'Nesta versão MVP, todos os seus dados são salvos localmente e criptografados de forma segura no próprio armazenamento do seu navegador (LocalStorage). Seus registros financeiros nunca saem do seu computador ou dispositivo.'
    },
    {
      question: 'A integração com bancos (Open Finance) será paga à parte?',
      answer: 'Não. Todas as melhorias planejadas em nosso roteiro de desenvolvimento — incluindo a importação automática via Open Finance e o modo multi-usuários/casal — estarão inclusas gratuitamente para todos os detentores do plano vitalício.'
    },
    {
      question: 'Como funciona a garantia de reembolso?',
      answer: `Oferecemos uma garantia incondicional de 7 dias. Se você começar a usar o ${APP_CONFIG.titleName} e achar que a ferramenta não simplificou seu controle financeiro, basta solicitar o reembolso que devolveremos 100% do seu dinheiro.`
    }
  ];

  // Helper to render mock dashboard preview in CSS
  const renderMockup = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top Cards Mock */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>VALOR EM CONTA</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>R$ 14.594,10</div>
              </div>
              <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>TOTAL RECEITAS</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>R$ 17.700,00</div>
              </div>
              <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>TOTAL DESPESAS</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>R$ 6.305,90</div>
              </div>
            </div>
            {/* Progress Metas Mock */}
            <div style={{ padding: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                <span>Metas de Poupança</span>
                <span style={{ color: '#a78bfa' }}>64% do objetivo</span>
              </div>
              <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Filter pills mock */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: '#8b5cf6', color: '#ffffff', borderRadius: '12px', fontWeight: 700 }}>Todos</span>
              <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '12px' }}>Receitas</span>
              <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '12px' }}>Despesas</span>
              <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '12px' }}>Pendentes</span>
            </div>
            {/* Row entries mock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💰</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Salário Principal</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Receitas • Pago</div>
                  </div>
                </div>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>+ R$ 8.500,00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏠</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Aluguel Mensal</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Moradia • Pago</div>
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>- R$ 3.200,00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🍔</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Supermercado</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Alimentação • Pago</div>
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>- R$ 1.200,00</span>
              </div>
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>PATRIMÔNIO EM ATIVOS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>R$ 23.490,00</div>
              </div>
              <span style={{ fontSize: '0.65rem', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>3 Ativos ativos</span>
            </div>
            {/* Asset cards grid mock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ padding: '8px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}>MXRF11</span>
                  <span style={{ color: '#64748b' }}>FII</span>
                </div>
                <div style={{ fontWeight: 600 }}>200 Cotas</div>
                <div style={{ fontSize: '0.6rem', color: '#34d399', marginTop: '2px' }}>Rend: R$ 0,10/cota</div>
              </div>
              <div style={{ padding: '8px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>BTC</span>
                  <span style={{ color: '#64748b' }}>Cripto</span>
                </div>
                <div style={{ fontWeight: 600 }}>0.045 BTC</div>
                <div style={{ fontSize: '0.6rem', color: '#34d399', marginTop: '2px' }}>Lucro: + 9.3%</div>
              </div>
            </div>
            {/* Map of Dividend payments */}
            <div style={{ padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🗓️ Agenda de Proventos Recorrentes
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.7rem', color: '#e2e8f0' }}>Dia 15 - MXRF11 (R$ 0,10 / cota)</span>
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>R$ 20,00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', marginTop: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#e2e8f0' }}>Previsão Mensal Recebida</span>
                <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700 }}>R$ 20,00/mês</span>
              </div>
            </div>
          </div>
        );
      case 'boletos':
        return (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              <span>Contas a Pagar</span>
              <span style={{ color: '#ef4444', fontSize: '0.65rem' }}>1 boleto pendente</span>
            </div>
            {/* Boleto mock item list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0f172a', border: '1px solid #10b981', borderLeft: '4px solid #10b981', borderRadius: '6px', fontSize: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Condomínio Julho</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Vencimento: 10/07/2026</div>
                </div>
                <span style={{ color: '#34d399', fontWeight: 700 }}>PAGO</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderLeft: '4px solid #f59e0b', borderRadius: '6px', fontSize: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Plano de Saúde</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Vencimento: 15/07/2026</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontWeight: 700 }}>R$ 650,00</span>
                  <span style={{ fontSize: '0.55rem', background: '#1e293b', border: '1px solid #334155', padding: '1px 4px', borderRadius: '2px', color: '#94a3b8' }}>Copiar Código</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'debts':
        return (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
              <span>Evolução de Amortizações</span>
              <span style={{ color: '#ef4444' }}>Total: R$ 22.200 pendente</span>
            </div>
            {/* Debts progress list mock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span>Reforma Apartamento</span>
                  <span>R$ 18.000 / R$ 25.000</span>
                </div>
                <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{ width: '28%', height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px' }}>Pago: R$ 7.000 (28% amortizado)</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span>Dívida Cartão Nubank</span>
                  <span>R$ 4.200 / R$ 8.500</span>
                </div>
                <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{ width: '50%', height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px' }}>Pago: R$ 4.300 (50% amortizado)</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#0f172a', // Premium Slate 900
      color: '#f8fafc', // Slate 50
      minHeight: '100vh', 
      fontFamily: 'var(--font-primary)',
      overflowX: 'hidden',
      position: 'relative'
    }} className="animate-fade">
      
      {/* Glow Effects */}
      <div className="landing-glow-purple" style={{ top: '5%', left: '-10%' }} />
      <div className="landing-glow-blue" style={{ top: '40%', right: '-15%' }} />
      <div className="landing-glow-purple" style={{ bottom: '10%', left: '10%' }} />
      
      {/* 1. Header (Simple & Clean Dark Mode) */}
      <header style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.25rem', color: '#f8fafc' }}>
          <PiggyBank size={24} style={{ color: '#a78bfa' }} />
          <span>{APP_CONFIG.titleName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="#features" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Recursos</a>
          <a href="#pricing" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Preço</a>
          <a href="#faq" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>FAQ</a>
          <button 
            onClick={onEnterApp}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#8b5cf6', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-sm)' }}
          >
            Entrar no App
          </button>
        </div>
      </header>

      {/* 2. Hero Section (Clean Hierarchy) */}
      <section style={{ 
        maxWidth: '800px', 
        minHeight: '75vh', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto', 
        textAlign: 'center', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }} className="animate-slide-up">
        <span style={{ 
          fontSize: '0.8rem', 
          fontWeight: 700, 
          letterSpacing: '1px', 
          color: '#a78bfa', 
          textTransform: 'uppercase',
          background: 'rgba(139, 92, 246, 0.15)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)'
        }}>
          💡 Controle Financeiro Inteligente
        </span>
        
        <h1 style={{ 
          fontSize: '2.8rem', 
          fontWeight: 800, 
          lineHeight: '1.15', 
          letterSpacing: '-1px', 
          color: '#ffffff',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          Gerencie seus recursos financeiros sem planilhas chatas
        </h1>
        
        <p style={{ 
          fontSize: '1.15rem', 
          color: '#94a3b8', 
          lineHeight: '1.6',
          maxWidth: '650px',
          margin: '0 auto 30px auto'
        }}>
          A ferramenta ideal para organizar seus gastos pessoais, planejar suas metas, acompanhar seus investimentos e sair das dívidas. Tudo centralizado em um só lugar.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={onEnterApp}
            className="btn btn-primary interactive"
            style={{ 
              padding: '14px 28px', 
              fontSize: '1.05rem', 
              background: '#8b5cf6', 
              color: '#ffffff', 
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none'
            }}
          >
            Quero Organizar Minhas Finanças <ArrowRight size={18} />
          </button>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            Pagamento único. Acesso vitalício. Sem mensalidades recorrentes.
          </span>
        </div>
      </section>

      {/* 3. Product Preview (Show before explaining - Carrossel Interativo - Marc Lou #10 & #25) */}
      <section style={{ 
        maxWidth: '900px', 
        margin: '0 auto 80px auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }} className="animate-fade">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px', color: '#ffffff' }}>
          Tudo o que você precisa em uma única tela
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          Explore as telas e recursos reais do nosso gerenciador inteligente clicando nas abas interativas abaixo.
        </p>

        {/* Tabs Headers */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }} className="carousel-grid">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`landing-tab ${activeTab === t.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        
        {/* Mockup Canvas */}
        <div style={{ 
          background: '#1e293b', // Slate 800
          border: '1px solid #334155',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          maxWidth: '750px',
          margin: '0 auto'
        }}>
          {/* Header Mock */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#0f172a', padding: '2px 30px', borderRadius: '4px', border: '1px solid #334155' }}>
              gastosapp.com/{activeTab}
            </span>
            <span style={{ width: '30px' }} />
          </div>

          {/* Active Canvas Body */}
          <div style={{ minHeight: '160px' }}>
            {renderMockup()}
          </div>
        </div>
      </section>

      {/* 5. Future Releases / Roadmap */}
      <section id="features" style={{ 
        maxWidth: '800px', 
        margin: '0 auto 80px auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px', letterSpacing: '-0.5px', color: '#ffffff' }}>
          O que vem por aí
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '40px' }}>
          Nosso roteiro de evolução contínua para o MVP se tornar a ferramenta mais completa do Brasil.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div style={{ border: '1px solid #334155', borderRadius: 'var(--radius-md)', padding: '24px', background: '#1e293b' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '16px' }}>
              <RefreshCw size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', marginBottom: '8px' }}>Open Finance</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Integração automática com seus bancos para importar lançamentos e faturas de cartão sem digitação manual.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ border: '1px solid #334155', borderRadius: 'var(--radius-md)', padding: '24px', background: '#1e293b' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '16px' }}>
              <Users size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', marginBottom: '8px' }}>Múltiplos Usuários</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Possibilidade de convidar familiares, sócios ou contadores para visualizar ou gerenciar os mesmos saldos.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ border: '1px solid #334155', borderRadius: 'var(--radius-md)', padding: '24px', background: '#1e293b' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '16px' }}>
              <Shield size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', marginBottom: '8px' }}>Modo Casal Dedicado</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Painéis compartilhados para gerenciar contas conjuntas sem expor totalmente seus investimentos pessoais.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Popcorn Pricing (Marc Lou #12 & #27) */}
      <section id="pricing" style={{ 
        maxWidth: '650px', 
        margin: '0 auto 80px auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px', color: '#ffffff' }}>
          Um único investimento, controle vitalício
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '40px', maxWidth: '500px', margin: '0 auto' }}>
          Sem mensalidades ou assinaturas ocultas. Pague uma vez e use todos os recursos para sempre.
        </p>

        <div style={{ 
          maxWidth: '500px',
          margin: '0 auto',
          border: '2px solid #8b5cf6', 
          borderRadius: 'var(--radius-lg)', 
          padding: '30px', 
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          background: '#1e293b' // Slate 800
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff' }}>Acesso Completo Vitalício</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>Pague uma vez. Use para sempre.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94a3b8' }}>R$</span>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-2px' }}>197</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', margin: '0 auto 25px auto', maxWidth: '280px', fontSize: '0.85rem', color: '#e2e8f0' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} style={{ color: '#34d399' }} />
              <span>Acesso completo ao Dashboard de Gestão</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} style={{ color: '#34d399' }} />
              <span>Calculadora de amortização de dívidas</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} style={{ color: '#34d399' }} />
              <span>Controle simplificado de boletos e ativos</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} style={{ color: '#34d399' }} />
              <span>Atualizações vitalícias gratuitas</span>
            </div>
          </div>

          <button 
            onClick={onEnterApp}
            className="btn btn-primary interactive"
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '1rem', 
              background: '#8b5cf6', 
              color: '#ffffff', 
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              border: 'none'
            }}
          >
            Começar Agora
          </button>
        </div>
      </section>

      {/* 7. FAQ Section (Accordion style) */}
      <section id="faq" style={{ 
        maxWidth: '800px', 
        margin: '0 auto 80px auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px', color: '#ffffff' }}>
          Perguntas Frequentes
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '40px' }}>
          Tire suas dúvidas rápidas sobre o licenciamento vitalício e o uso do sistema.
        </p>

        <div className="faq-container">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="faq-item">
                <button 
                  className="faq-question" 
                  onClick={() => toggleFaq(index)}
                >
                  <span>{item.question}</span>
                  {isOpen ? <ChevronUp size={18} style={{ color: '#8b5cf6' }} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Shareable Footer (Marc Lou #4) */}
      <footer style={{ 
        borderTop: '1px solid #334155', 
        padding: '40px 20px', 
        textAlign: 'center', 
        fontSize: '0.8rem', 
        color: '#94a3b8',
        background: '#0b0f19', // Dark Slate 950
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontStyle: 'italic', marginBottom: '16px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            "Controlar recursos financeiros não precisa ser complicado. Simplifique o seu controle pessoal hoje mesmo."
          </p>
          <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '24px' }}>— Victor, Desenvolvedor do {APP_CONFIG.titleName}</div>
          <p style={{ fontSize: '0.75rem' }}>
            Gostou da ferramenta? Compartilhe e ajude outras pessoas a organizarem seus recursos de forma inteligente! 🚀
          </p>
          <div style={{ marginTop: '16px', fontSize: '0.7rem', color: '#64748b' }}>
            © {new Date().getFullYear()} {APP_CONFIG.titleName}. Todos os direitos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
};
