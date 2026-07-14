import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ArrowLeft, ArrowRight, Plus, CheckCircle, Clock, Trash2, ArrowUpRight, ArrowDownRight, Wallet, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { profile, transactions, deleteTransaction, toggleTransactionStatus, openTransactionModal } = useFinance();
  
  // Base date for navigation
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date('2026-07-01T12:00:00');
  });
  

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 1. Calculate Active Balance (Valor na Conta)
  // Cumulative balance of all time: All Incomes - All Paid Expenses
  const allIncomesHistorical = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const allPaidExpensesHistorical = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const valorNaConta = allIncomesHistorical - allPaidExpensesHistorical;

  // Filter transactions for this month
  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date + 'T12:00:00');
    return tDate.getFullYear() === year && tDate.getMonth() === month;
  });

  // 2. Compute Card Values for the current month
  // Despesas Fixas: Moradia, Assinaturas, Dívidas, Saúde
  const despesasFixas = monthTransactions
    .filter(t => t.type === 'expense' && ['Moradia', 'Assinaturas', 'Dívidas', 'Saúde'].includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  // Contas a Pagar (Pending expenses)
  const contasAPagar = monthTransactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  // Gastos Variáveis (Other categories)
  const gastosVariaveis = monthTransactions
    .filter(t => t.type === 'expense' && !['Moradia', 'Assinaturas', 'Dívidas', 'Saúde'].includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  // Total Recebido
  const totalRecebido = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  // Total Gasto (paid + pending)
  const totalGasto = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const expensePercentage = totalRecebido > 0 ? (totalGasto / totalRecebido) * 100 : 0;

  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Filter list items for display
  const filteredList = monthTransactions.filter(t => {
    const searchNormalized = normalizeText(searchTerm);
    const matchesSearch = normalizeText(t.description).includes(searchNormalized) ||
                          normalizeText(t.category).includes(searchNormalized);
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Limit to the last 10 transactions
  const last10Transactions = [...filteredList]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  // Formatting helpers
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

  const getMonthName = (m: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[m];
  };

  const getProgressColor = (pct: number) => {
    if (pct < 70) return 'var(--color-green)';
    if (pct < 90) return 'var(--color-yellow)';
    return 'var(--color-red)';
  };

  // Unique categories in this month for filter dropdown
  const monthCategories = Array.from(new Set(monthTransactions.map(t => t.category)));

  return (
    <div className="animate-fade">
      {/* Header & Month controls */}
      <div className="content-header" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Olá, {profile.userName}!</h1>
          <p className="header-subtitle">Seu painel financeiro resumido</p>
        </div>

        <div className="month-selector">
          <button className="month-btn" onClick={handlePrevMonth} aria-label="Mês anterior">
            <ArrowLeft size={18} />
          </button>
          <span className="month-label">{getMonthName(month)} {year}</span>
          <button className="month-btn" onClick={handleNextMonth} aria-label="Próximo mês">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Prominent Valor na Conta Display (Header element, not a card) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '12px', 
        marginBottom: 'var(--spacing-lg)', 
        background: 'rgba(255, 255, 255, 0.02)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Valor na Conta:
        </span>
        <span style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {formatCurrency(valorNaConta)}
        </span>
      </div>

      {/* 3 Main Cards */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="glass-panel summary-card" style={{ borderLeft: '3px solid var(--color-purple)' }}>
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-purple)' }}>
            <Wallet size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Despesas Fixas</span>
            <span className="card-value">{formatCurrency(despesasFixas)}</span>
            <span className="card-subtext">Moradia, Contas, Saúde</span>
          </div>
        </div>

        <div className="glass-panel summary-card" style={{ borderLeft: '3px solid var(--color-yellow)' }}>
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-yellow)' }}>
            <Clock size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Contas a Pagar</span>
            <span className="card-value" style={{ color: 'var(--color-yellow)' }}>{formatCurrency(contasAPagar)}</span>
            <span className="card-subtext">Compromissos pendentes</span>
          </div>
        </div>

        <div className="glass-panel summary-card" style={{ borderLeft: '3px solid var(--color-blue)' }}>
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-blue)' }}>
            <Calendar size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Gastos Variáveis</span>
            <span className="card-value">{formatCurrency(gastosVariaveis)}</span>
            <span className="card-subtext">Lazer, Alimentação, Outros</span>
          </div>
        </div>
      </div>

      {/* 2 Smaller Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Recebido</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-green)', marginTop: '2px' }}>
              + {formatCurrency(totalRecebido)}
            </div>
          </div>
          <ArrowUpRight size={20} style={{ color: 'var(--color-green)' }} />
        </div>

        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Gasto</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-red)', marginTop: '2px' }}>
              - {formatCurrency(totalGasto)}
            </div>
          </div>
          <ArrowDownRight size={20} style={{ color: 'var(--color-red)' }} />
        </div>
      </div>

      {/* Progress Bar of Budget spent */}
      {totalRecebido > 0 && (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Porcentagem da Receita Comprometida</span>
            <span style={{ fontWeight: 600, color: getProgressColor(expensePercentage) }}>
              {expensePercentage.toFixed(1)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ 
              width: `${Math.min(100, expensePercentage)}%`, 
              height: '100%', 
              background: getProgressColor(expensePercentage),
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      )}

      {/* Last 10 Transactions Section */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Últimos Lançamentos</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exibindo até 10 transações deste mês</p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '130px', padding: '0.35rem var(--spacing-sm)', fontSize: '0.8rem' }}
            />

            <select
              className="form-control"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{ width: '120px', padding: '0.35rem var(--spacing-sm)', fontSize: '0.8rem' }}
            >
              <option value="all">Todas Cat.</option>
              {monthCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={() => openTransactionModal()} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              <Plus size={14} /> Novo
            </button>
          </div>
        </div>

        {last10Transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-secondary)' }}>
            Nenhum lançamento no mês de {getMonthName(month)}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {last10Transactions.map((t) => (
              <div 
                key={t.id} 
                className="glass-panel interactive"
                onClick={() => openTransactionModal(t)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: 'var(--radius-sm)',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-md)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleTransactionStatus(t.id); }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: t.status === 'paid' ? 'var(--color-green)' : 'var(--text-muted)',
                      display: 'flex'
                    }}
                  >
                    {t.status === 'paid' ? <CheckCircle size={18} /> : <Clock size={18} />}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.description}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginTop: '1px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>{formatDateStr(t.date)}</span>
                      <span>•</span>
                      <span className="badge badge-owner" style={{ fontSize: '0.6rem', padding: '0 3px' }}>{t.category}</span>
                      {t.installmentId && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--color-purple)' }}>{t.installmentNumber}/{t.totalInstallments}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: t.type === 'income' ? 'var(--color-blue)' : 'var(--text-primary)' }}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
