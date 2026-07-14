import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { Transaction } from '../context/FinanceContext';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { TransactionModal } from './TransactionModal';

export const TransactionsList: React.FC = () => {
  const { profile, transactions, toggleTransactionStatus } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Focal month state representing the centered month in the carousel (YYYY-MM)
  const [focalMonth, setFocalMonth] = useState<string>(() => {
    // Default to July 2026 as per mock data
    return '2026-07';
  });

  const getTodayStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayStr = getTodayStr();

  // Helper to shift months
  const getMonthOffset = (baseMonthStr: string, offset: number) => {
    const [year, month] = baseMonthStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    date.setMonth(date.getMonth() + offset);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  // Generate the 5 months for the carousel window centered around focalMonth
  const carouselMonths = [
    getMonthOffset(focalMonth, -2),
    getMonthOffset(focalMonth, -1),
    getMonthOffset(focalMonth, 0), // Center
    getMonthOffset(focalMonth, 1),
    getMonthOffset(focalMonth, 2)
  ];

  const handlePrevMonth = () => {
    setFocalMonth(prev => getMonthOffset(prev, -1));
  };

  const handleNextMonth = () => {
    setFocalMonth(prev => getMonthOffset(prev, 1));
  };

  // Helper: check transaction status color
  const getStatusColor = (t: Transaction) => {
    if (t.status === 'paid') return 'var(--color-green)'; // already settled
    
    if (t.type === 'expense') {
      if (t.date < todayStr) return 'var(--color-red)'; // overdue unpaid
      if (t.date === todayStr) return 'var(--color-yellow)'; // due today
      
      const tTime = new Date(t.date + 'T12:00:00').getTime();
      const todayTime = new Date(todayStr + 'T12:00:00').getTime();
      const diffDays = (tTime - todayTime) / (1000 * 60 * 60 * 24);
      if (diffDays <= 3) return 'var(--color-yellow)'; // due soon
    }
    
    return 'var(--color-green)'; // future green
  };

  const getStatusText = (t: Transaction) => {
    if (t.status === 'paid') return 'Pago';
    if (t.type === 'expense') {
      if (t.date < todayStr) return 'Atrasado';
      if (t.date === todayStr) return 'Vence Hoje';
      
      const tTime = new Date(t.date + 'T12:00:00').getTime();
      const todayTime = new Date(todayStr + 'T12:00:00').getTime();
      const diffDays = (tTime - todayTime) / (1000 * 60 * 60 * 24);
      if (diffDays <= 3) return 'Vence em Breve';
    }
    return 'Pendente';
  };

  // Group transactions by month-year YYYY-MM
  const getMonthsData = () => {
    const monthMap: Record<string, { income: number; expense: number; txs: Transaction[] }> = {};
    
    transactions.forEach(t => {
      const parts = t.date.split('-');
      const monthKey = `${parts[0]}-${parts[1]}`; // YYYY-MM
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { income: 0, expense: 0, txs: [] };
      }
      monthMap[monthKey].txs.push(t);
      if (t.type === 'income') {
        monthMap[monthKey].income += t.amount;
      } else {
        monthMap[monthKey].expense += t.amount;
      }
    });

    return monthMap;
  };

  const monthsData = getMonthsData();

  // Get active month transactions
  const activeMonthData = monthsData[focalMonth] || { income: 0, expense: 0, txs: [] };
  
  // Sort transactions chronologically
  const activeTransactions = [...activeMonthData.txs].sort((a, b) => b.date.localeCompare(a.date));

  // Global Search Filter Results
  const globalSearchResults = transactions
    .filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  // Identify Today's Transactions
  const todayTransactions = transactions
    .filter(t => t.date === todayStr)
    .sort((a, b) => {
      const aIsPriority = a.category === 'Boletos' || a.category === 'Dívidas';
      const bIsPriority = b.category === 'Boletos' || b.category === 'Dívidas';
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      return 0;
    });

  const getMonthName = (monthKey: string) => {
    const [, monthStr] = monthKey.split('-');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[parseInt(monthStr, 10) - 1];
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString(profile.currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: profile.currency
    });
  };

  const formatDateStr = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return profile.dateFormat === 'DD/MM/YYYY' ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="content-header" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div>
          <h1>Lançamentos</h1>
          <p className="header-subtitle">Visualize e gerencie suas receitas e despesas por mês</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Buscar lançamentos por descrição ou categoria... (ex: condomínio, aluguel, Nubank)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ 
            paddingLeft: '40px', 
            paddingRight: searchTerm ? '40px' : '14px',
            height: '44px',
            borderRadius: 'var(--radius-sm)'
          }}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            style={{ 
              position: 'absolute', 
              right: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--text-muted)', 
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Conditional Rendering: If Searching globally */}
      {searchTerm ? (
        /* Global Search Results List */
        <div className="glass-panel animate-slide-up" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Resultados da Busca para "{searchTerm}"
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
              {globalSearchResults.length} itens encontrados
            </span>
          </div>

          {globalSearchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-secondary)' }}>
              Nenhum lançamento correspondente à busca.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {globalSearchResults.map(t => {
                const color = getStatusColor(t);
                const text = getStatusText(t);
                return (
                  <div 
                    key={t.id}
                    className="glass-panel"
                    onClick={() => {
                      setEditingTransaction(t);
                      setIsModalOpen(true);
                    }}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      background: 'rgba(255, 255, 255, 0.005)',
                      borderRadius: 'var(--radius-sm)',
                      flexWrap: 'wrap',
                      gap: 'var(--spacing-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTransactionStatus(t.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.status === 'paid' ? 'var(--color-green)' : 'var(--text-muted)', display: 'flex' }}
                      >
                        {t.status === 'paid' ? <CheckCircle size={18} /> : <Clock size={18} />}
                      </button>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>{t.description}</span>
                          {t.status === 'pending' && (
                            <span 
                              style={{ 
                                fontSize: '0.65rem', 
                                padding: '1px 5px', 
                                borderRadius: 'var(--radius-xs)', 
                                backgroundColor: color + '12',
                                color: color,
                                fontWeight: 700
                              }}
                            >
                              {text}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>{formatDateStr(t.date)}</span>
                          <span>•</span>
                          <span className="badge badge-owner" style={{ padding: '0 4px', fontSize: '0.65rem' }}>{t.category}</span>
                          {t.installmentId && (
                            <>
                              <span>•</span>
                              <span style={{ color: 'var(--color-purple)', fontWeight: 600 }}>
                                Parcela {t.installmentNumber}/{t.totalInstallments}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: t.type === 'income' ? 'var(--color-blue)' : 'var(--text-primary)' }}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Normal Mode: Carousel & Month Details */
        <>
          {/* Carousel Container */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Selecione o Mês
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              {/* Left Navigation Arrow */}
              <button 
                className="month-btn glass-panel" 
                onClick={handlePrevMonth}
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: 'var(--radius-full)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Carousel Cards Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: 'var(--spacing-sm)',
                flexGrow: 1,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '8px 4px'
              }} className="carousel-grid">
                {carouselMonths.map((key, index) => {
                  const data = monthsData[key] || { income: 0, expense: 0, txs: [] };
                  const isCenter = index === 2; // Center month card (focalMonth)
                  const isCurrentRealMonth = key === todayStr.substring(0, 7); // Today's month YYYY-MM
                  const [yearStr] = key.split('-');
                  const balance = data.income - data.expense;

                  const getCardBorder = () => {
                    if (isCenter) return '2px solid var(--color-purple)';
                    if (isCurrentRealMonth) return '1px solid var(--color-green)';
                    return '1px solid var(--border-color)';
                  };

                  const getCardBg = () => {
                    if (isCenter) {
                      return isCurrentRealMonth 
                        ? 'rgba(139, 92, 246, 0.14)' 
                        : 'rgba(139, 92, 246, 0.08)';
                    }
                    if (isCurrentRealMonth) {
                      return 'rgba(16, 185, 129, 0.08)';
                    }
                    return balance >= 0 
                      ? 'rgba(59, 130, 246, 0.02)' 
                      : 'rgba(239, 68, 68, 0.07)';
                  };

                  const getBalanceColor = () => {
                    if (isCenter) return 'var(--color-purple)';
                    return balance >= 0 ? 'var(--color-blue)' : 'var(--color-red)';
                  };

                  return (
                    <div 
                      key={`carousel-${key}`}
                      onClick={() => setFocalMonth(key)}
                      className="glass-panel animate-fade"
                      style={{ 
                        padding: '10px 12px', 
                        cursor: 'pointer',
                        border: getCardBorder(),
                        background: getCardBg(),
                        boxShadow: isCenter ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                        transition: 'all var(--transition-fast)',
                        transform: isCenter ? 'scale(1.03)' : 'scale(1)',
                        zIndex: isCenter ? 2 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {getMonthName(key)} {yearStr.substring(2)}
                        </span>
                        {isCurrentRealMonth && (
                          <span style={{ 
                            fontSize: '0.55rem', 
                            padding: '1px 4px', 
                            borderRadius: '3px', 
                            backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                            color: 'var(--color-green)',
                            fontWeight: 850,
                            letterSpacing: '0.2px'
                          }}>
                            HOJE
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.7rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span style={{ fontSize: '0.65rem' }}>Rec:</span>
                          <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{formatCurrency(data.income)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span style={{ fontSize: '0.65rem' }}>Desp:</span>
                          <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>{formatCurrency(data.expense)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '3px', marginTop: '2px', fontWeight: 700 }}>
                          <span style={{ fontSize: '0.65rem' }}>Saldo:</span>
                          <span style={{ color: getBalanceColor() }}>
                            {formatCurrency(balance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Navigation Arrow */}
              <button 
                className="month-btn glass-panel" 
                onClick={handleNextMonth}
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: 'var(--radius-full)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Today's priority section */}
          {todayTransactions.length > 0 && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: 'var(--spacing-md) var(--spacing-lg)', 
                marginBottom: 'var(--spacing-xl)', 
                borderLeft: '4px solid var(--color-yellow)',
                background: 'rgba(245, 158, 11, 0.02)'
              }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-yellow)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-sm)' }}>
                <AlertCircle size={16} />
                Lançamentos de Hoje
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                {todayTransactions.map(t => (
                  <div 
                    key={`today-t-${t.id}`}
                    onClick={() => {
                      setEditingTransaction(t);
                      setIsModalOpen(true);
                    }}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '6px 10px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTransactionStatus(t.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.status === 'paid' ? 'var(--color-green)' : 'var(--color-yellow)', display: 'flex' }}
                      >
                        {t.status === 'paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                      </button>
                      <span style={{ fontWeight: 600 }}>{t.description}</span>
                      <span className="badge badge-owner" style={{ padding: '0 4px', fontSize: '0.65rem' }}>{t.category}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--color-blue)' : 'var(--text-primary)' }}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Month Transactions List */}
          {focalMonth && (
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)', textTransform: 'capitalize' }}>
                Detalhes de {getMonthName(focalMonth)} {focalMonth.split('-')[0]}
              </h2>

              {activeTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-secondary)' }}>
                  Nenhum lançamento cadastrado neste mês.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {activeTransactions.map(t => {
                    const color = getStatusColor(t);
                    const text = getStatusText(t);
                    return (
                      <div 
                        key={t.id}
                        className="glass-panel"
                        onClick={() => {
                          setEditingTransaction(t);
                          setIsModalOpen(true);
                        }}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          background: 'rgba(255, 255, 255, 0.005)',
                          borderRadius: 'var(--radius-sm)',
                          flexWrap: 'wrap',
                          gap: 'var(--spacing-md)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTransactionStatus(t.id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.status === 'paid' ? 'var(--color-green)' : 'var(--text-muted)', display: 'flex' }}
                          >
                            {t.status === 'paid' ? <CheckCircle size={18} /> : <Clock size={18} />}
                          </button>
                          
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>{t.description}</span>
                              {t.status === 'pending' && (
                                <span 
                                  style={{ 
                                    fontSize: '0.65rem', 
                                    padding: '1px 5px', 
                                    borderRadius: 'var(--radius-xs)', 
                                    backgroundColor: color + '12',
                                    color: color,
                                    fontWeight: 700
                                  }}
                                >
                                  {text}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span>{formatDateStr(t.date)}</span>
                              <span>•</span>
                              <span className="badge badge-owner" style={{ padding: '0 4px', fontSize: '0.65rem' }}>{t.category}</span>
                              {t.installmentId && (
                                <>
                                  <span>•</span>
                                  <span style={{ color: 'var(--color-purple)', fontWeight: 600 }}>
                                    Parcela {t.installmentNumber}/{t.totalInstallments}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: t.type === 'income' ? 'var(--color-blue)' : 'var(--text-primary)' }}>
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} 
        editTransaction={editingTransaction}
      />
    </div>
  );
};
