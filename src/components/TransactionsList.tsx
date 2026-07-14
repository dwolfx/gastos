import React, { useState, useRef, useEffect } from 'react';
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
export const TransactionsList: React.FC = () => {
  const { profile, transactions, toggleTransactionStatus, openTransactionModal } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom states for filters, category summary, and export dropdown
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'income' | 'expense' | 'pending' | 'paid'>('all');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Focal month state representing the centered month in the carousel (YYYY-MM)
  const [focalMonth, setFocalMonth] = useState<string>(() => {
    // Default to July 2026 as per mock data
    return '2026-07';
  });

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 240;
      categoriesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Reset category filter when month or type filter changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [focalMonth, activeTypeFilter]);

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

  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Global Search Filter Results
  const globalSearchResults = transactions
    .filter(t => {
      const searchNormalized = normalizeText(searchTerm);
      return normalizeText(t.description).includes(searchNormalized) ||
             normalizeText(t.category).includes(searchNormalized);
    })
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

  // Helper to map category to colorful icons and background colors (Fintech UX style)
  const getCategoryIconAndColor = (cat: string) => {
    switch (cat) {
      case 'Alimentação': return { icon: '🍔', color: '#f59e0b' };
      case 'Moradia': return { icon: '🏠', color: '#3b82f6' };
      case 'Lazer': return { icon: '🎮', color: '#ec4899' };
      case 'Transporte': return { icon: '🚗', color: '#10b981' };
      case 'Saúde': return { icon: '❤️', color: '#ef4444' };
      case 'Eletrônicos': return { icon: '💻', color: '#8b5cf6' };
      case 'Assinaturas': return { icon: '📺', color: '#06b6d4' };
      case 'Dívidas': return { icon: '⚠️', color: '#f97316' };
      case 'Salário': return { icon: '💰', color: '#10b981' };
      case 'Investimentos': return { icon: '📈', color: '#3b82f6' };
      case 'Freelance': return { icon: '💼', color: '#8b5cf6' };
      default: return { icon: '📁', color: '#64748b' };
    }
  };

  // Calculate expenses sums for the categories grid
  const getCategoryTotals = () => {
    const totals: Record<string, number> = {};
    activeTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  };

  const categoryTotals = getCategoryTotals();

  // Apply quick filters to active focal month transactions
  const filteredActiveTransactions = activeTransactions.filter(t => {
    // Type/status filter
    let matchesType = true;
    if (activeTypeFilter === 'income') matchesType = t.type === 'income';
    else if (activeTypeFilter === 'expense') matchesType = t.type === 'expense';
    else if (activeTypeFilter === 'pending') matchesType = t.status === 'pending';
    else if (activeTypeFilter === 'paid') matchesType = t.status === 'paid';

    // Category filter
    let matchesCategory = true;
    if (selectedCategory) matchesCategory = t.category === selectedCategory;

    return matchesType && matchesCategory;
  });

  // Apply quick filters to search results
  const filteredGlobalSearchResults = globalSearchResults.filter(t => {
    if (activeTypeFilter === 'all') return true;
    if (activeTypeFilter === 'income') return t.type === 'income';
    if (activeTypeFilter === 'expense') return t.type === 'expense';
    if (activeTypeFilter === 'pending') return t.status === 'pending';
    if (activeTypeFilter === 'paid') return t.status === 'paid';
    return true;
  });

  // CSV Export script
  const exportTransactions = (scope: 'month' | 'all') => {
    const listToExport = scope === 'month' ? activeTransactions : transactions;
    if (listToExport.length === 0) {
      alert('Nenhum lançamento encontrado para exportar.');
      return;
    }
    
    // Header names matching user fields
    const headers = ['Data', 'Descricao', 'Tipo', 'Categoria', 'Valor', 'Status', 'Responsavel', 'Parcela'];
    const rows = listToExport.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'income' ? 'Receita' : 'Despesa',
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.status === 'paid' ? 'Pago' : 'Pendente',
      `"${(t.owner || profile.userName).replace(/"/g, '""')}"`,
      t.installmentId ? `${t.installmentNumber}/${t.totalInstallments}` : 'N/A'
    ]);

    // Format file (using BOM to support Excel UTF-8)
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gastos_lancamentos_${scope}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="content-header" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div>
          <h1>Lançamentos</h1>
          <p className="header-subtitle">Visualize e gerencie suas receitas e despesas por mês</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* CSV Export Popover */}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary" onClick={() => setShowExportDropdown(!showExportDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} style={{ transform: 'rotate(45deg)' }} /> Exportar
            </button>
            {showExportDropdown && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 140 }} 
                  onClick={() => setShowExportDropdown(false)}
                />
                <div 
                  className="glass-panel animate-fade" 
                  style={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: 'calc(100% + 6px)', 
                    width: '200px', 
                    zIndex: 150, 
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <button 
                    onClick={() => { exportTransactions('month'); setShowExportDropdown(false); }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      fontSize: '0.8rem', 
                      textAlign: 'left', 
                      cursor: 'pointer', 
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)',
                      width: '100%',
                      display: 'block'
                    }}
                    className="sidebar-link"
                  >
                    📅 Mês Selecionado ({getMonthName(focalMonth)})
                  </button>
                  <button 
                    onClick={() => { exportTransactions('all'); setShowExportDropdown(false); }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      fontSize: '0.8rem', 
                      textAlign: 'left', 
                      cursor: 'pointer', 
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)',
                      width: '100%',
                      display: 'block'
                    }}
                    className="sidebar-link"
                  >
                    🗄️ Todo o Histórico
                  </button>
                </div>
              </>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => openTransactionModal()}>
            <Plus size={16} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
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

      {/* Quick Filter Pills (Todos, Receitas, Despesas, Pendentes, Pagos) */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
        {[
          { id: 'all', label: 'Todos' },
          { id: 'income', label: 'Receitas' },
          { id: 'expense', label: 'Despesas' },
          { id: 'pending', label: 'Pendentes' },
          { id: 'paid', label: 'Pagos' }
        ].map(pill => (
          <button
            key={pill.id}
            onClick={() => setActiveTypeFilter(pill.id as any)}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-full)',
              background: activeTypeFilter === pill.id ? 'var(--gradient-accent)' : 'var(--bg-secondary)',
              color: activeTypeFilter === pill.id ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: activeTypeFilter === pill.id ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {pill.label}
          </button>
        ))}
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
              {filteredGlobalSearchResults.length} itens encontrados
            </span>
          </div>

          {filteredGlobalSearchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-secondary)' }}>
              Nenhum lançamento correspondente aos filtros.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {filteredGlobalSearchResults.map(t => {
                const color = getStatusColor(t);
                const text = getStatusText(t);
                return (
                  <div 
                    key={t.id}
                    className="glass-panel interactive"
                    onClick={() => openTransactionModal(t)}
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
                      className={`glass-panel interactive animate-fade ${isCenter ? 'active' : ''}`}
                      style={{ 
                        padding: '10px 12px', 
                        cursor: 'pointer',
                        border: getCardBorder(),
                        background: getCardBg(),
                        boxShadow: isCenter ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                        transition: 'all var(--transition-fast)',
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
                    onClick={() => openTransactionModal(t)}
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
              
              {/* List Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'capitalize', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  Detalhes de {getMonthName(focalMonth)} {focalMonth.split('-')[0]}
                  {selectedCategory && (
                    <span 
                      onClick={() => setSelectedCategory(null)}
                      title="Limpar filtro de categoria"
                      style={{ 
                        fontSize: '0.7rem', 
                        background: 'rgba(239, 68, 68, 0.15)', 
                        color: '#f87171', 
                        padding: '2px 8px', 
                        borderRadius: 'var(--radius-full)', 
                        cursor: 'pointer',
                        fontWeight: 600,
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Filtrado por: {selectedCategory} ✕
                    </span>
                  )}
                </h2>
              </div>

              {/* Category Summary Carousel */}
              {categoryTotals.length > 0 && (
                <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
                  {/* Scroll Left Button */}
                  <button
                    onClick={() => scrollCategories('left')}
                    className="btn btn-secondary"
                    style={{
                      position: 'absolute',
                      left: '-8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      width: '28px',
                      height: '28px',
                      padding: 0,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-md)',
                      opacity: 0.85
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Horizontal Scroll Area */}
                  <div 
                    ref={categoriesScrollRef}
                    className="carousel-grid"
                    style={{ 
                      display: 'flex',
                      gap: 'var(--spacing-sm)',
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      padding: '4px 20px',
                      margin: '0 10px'
                    }}
                  >
                    {categoryTotals.map(([cat, total]) => {
                      const { icon, color } = getCategoryIconAndColor(cat);
                      const isSelected = selectedCategory === cat;
                      return (
                        <div 
                          key={cat}
                          onClick={() => setSelectedCategory(isSelected ? null : cat)}
                          className="glass-panel"
                          style={{ 
                            padding: '10px 12px', 
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            background: isSelected ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255, 255, 255, 0.005)',
                            border: isSelected ? '1px solid #c084fc' : '1px solid var(--border-color)',
                            minWidth: '135px',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 0 12px rgba(139, 92, 246, 0.25)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ 
                              fontSize: '1rem', 
                              padding: '4px', 
                              borderRadius: '4px', 
                              backgroundColor: color + '15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>{icon}</span>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 600, 
                              color: isSelected ? '#e9d5ff' : 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>{cat}</span>
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 750, color: isSelected ? '#ffffff' : 'var(--text-primary)', marginTop: '4px' }}>
                            {formatCurrency(total)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scroll Right Button */}
                  <button
                    onClick={() => scrollCategories('right')}
                    className="btn btn-secondary"
                    style={{
                      position: 'absolute',
                      right: '-8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      width: '28px',
                      height: '28px',
                      padding: 0,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-md)',
                      opacity: 0.85
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {filteredActiveTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-secondary)' }}>
                  Nenhum lançamento correspondente aos filtros neste mês.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {filteredActiveTransactions.map(t => {
                    const color = getStatusColor(t);
                    const text = getStatusText(t);
                    return (
                      <div 
                        key={t.id}
                        className="glass-panel interactive"
                        onClick={() => openTransactionModal(t)}
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

    </div>
  );
};
