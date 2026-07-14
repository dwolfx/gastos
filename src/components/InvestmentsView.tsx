import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Coins, Trash2, Plus, TrendingUp, TrendingDown, Calendar, Wallet, AlertCircle } from 'lucide-react';

export const InvestmentsView: React.FC = () => {
  const { profile, investments, addInvestment, deleteInvestment } = useFinance();

  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [dividendDay, setDividendDay] = useState('');
  const [dividendYield, setDividendYield] = useState('');
  const [type, setType] = useState<'cripto' | 'fii' | 'acao'>('fii');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !description || !quantity || !averagePrice || !currentPrice) return;

    const qty = parseFloat(quantity);
    const avg = parseFloat(averagePrice);
    const cur = parseFloat(currentPrice);
    
    if (isNaN(qty) || qty <= 0 || isNaN(avg) || avg < 0 || isNaN(cur) || cur < 0) return;

    addInvestment({
      symbol: symbol.toUpperCase(),
      description,
      quantity: qty,
      averagePrice: avg,
      currentPrice: cur,
      dividendDay: dividendDay ? parseInt(dividendDay, 10) : undefined,
      dividendYield: dividendYield ? parseFloat(dividendYield) : undefined,
      type
    });

    setSymbol('');
    setDescription('');
    setQuantity('');
    setAveragePrice('');
    setCurrentPrice('');
    setDividendDay('');
    setDividendYield('');
    setType('fii');
    setIsAdding(false);
  };

  // Calculations
  const totalInvested = investments.reduce((acc, inv) => acc + (inv.quantity * inv.averagePrice), 0);
  const currentTotalValue = investments.reduce((acc, inv) => acc + (inv.quantity * inv.currentPrice), 0);
  const totalProfitLoss = currentTotalValue - totalInvested;
  const totalProfitLossPct = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Estimated Monthly Dividends
  const estimatedMonthlyDividends = investments
    .filter(inv => inv.dividendYield !== undefined && inv.dividendYield > 0)
    .reduce((acc, inv) => acc + (inv.quantity * (inv.dividendYield || 0)), 0);

  // Dividend Map List
  const dividendPayingAssets = investments
    .filter(inv => inv.dividendDay !== undefined && inv.dividendYield !== undefined && inv.dividendYield > 0)
    .sort((a, b) => (a.dividendDay || 0) - (b.dividendDay || 0));

  const formatCurrency = (val: number) => {
    return val.toLocaleString(profile.currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: profile.currency
    });
  };

  // Type Color Configuration
  const getTypeColors = (t: 'cripto' | 'fii' | 'acao') => {
    switch (t) {
      case 'cripto':
        return {
          primary: 'var(--color-yellow)',
          bg: 'rgba(245, 158, 11, 0.06)',
          border: 'rgba(245, 158, 11, 0.25)',
          badgeClass: 'badge-pending'
        };
      case 'fii':
        return {
          primary: 'var(--color-purple)',
          bg: 'rgba(139, 92, 246, 0.06)',
          border: 'rgba(139, 92, 246, 0.25)',
          badgeClass: 'badge-owner' // purple/border
        };
      case 'acao':
        return {
          primary: 'var(--color-green)',
          bg: 'rgba(16, 185, 129, 0.06)',
          border: 'rgba(16, 185, 129, 0.25)',
          badgeClass: 'badge-paid'
        };
    }
  };

  const getTypeName = (t: 'cripto' | 'fii' | 'acao') => {
    switch (t) {
      case 'cripto': return 'Criptomoeda';
      case 'fii': return 'FII';
      case 'acao': return 'Ação / ETF';
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>
      {/* Header */}
      <div className="content-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Meus Investimentos</h1>
          <p className="header-subtitle">Monitore sua carteira de ativos, tokens e rendimentos</p>
        </div>
        {!isAdding && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Adicionar Ativo
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <div className="glass-panel summary-card">
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-purple)' }}>
            <Wallet size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Total Aplicado (Custo)</span>
            <span className="card-value">{formatCurrency(totalInvested)}</span>
          </div>
        </div>

        <div className="glass-panel summary-card">
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-blue)' }}>
            <Coins size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Patrimônio Atual</span>
            <span className="card-value" style={{ color: 'var(--color-blue)' }}>{formatCurrency(currentTotalValue)}</span>
          </div>
        </div>

        <div className="glass-panel summary-card">
          <div className="card-icon-wrapper" style={{ 
            backgroundColor: totalProfitLoss >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
            color: totalProfitLoss >= 0 ? 'var(--color-green)' : 'var(--color-red)' 
          }}>
            {totalProfitLoss >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <div className="card-info">
            <span className="card-label">Rentabilidade Total</span>
            <span className="card-value" style={{ color: totalProfitLoss >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
              {formatCurrency(totalProfitLoss)}
            </span>
            <span className="card-subtext" style={{ color: totalProfitLoss >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
              {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPct.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="glass-panel summary-card">
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-green)' }}>
            <Calendar size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Rendimentos Mensais Est.</span>
            <span className="card-value" style={{ color: 'var(--color-green)' }}>{formatCurrency(estimatedMonthlyDividends)}</span>
            <span className="card-subtext">Dividendos previstos</span>
          </div>
        </div>
      </div>

      {/* Add Asset Form */}
      {isAdding && (
        <div className="glass-panel animate-slide-up" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={18} style={{ color: 'var(--color-purple)' }} />
              Adicionar Novo Ativo
            </h3>
            <button className="btn btn-secondary" onClick={() => setIsAdding(false)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inv-symbol">Token / Código do Ativo</label>
                <input
                  id="inv-symbol"
                  type="text"
                  className="form-control"
                  placeholder="Ex: BTC, ETH, MXRF11, AAPL"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="inv-desc">Descrição / Nome</label>
                <input
                  id="inv-desc"
                  type="text"
                  className="form-control"
                  placeholder="Ex: Bitcoin, Maxi Renda FII, Apple Inc."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label htmlFor="inv-type">Tipo de Ativo</label>
                <select
                  id="inv-type"
                  className="form-control"
                  value={type}
                  onChange={e => setType(e.target.value as 'cripto' | 'fii' | 'acao')}
                >
                  <option value="fii">Fundo Imobiliário (FII)</option>
                  <option value="cripto">Criptomoeda / Token</option>
                  <option value="acao">Ação / ETF</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="inv-qty">Quantidade</label>
                <input
                  id="inv-qty"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  className="form-control"
                  placeholder="0,00"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="inv-avg">Preço Médio de Compra</label>
                <input
                  id="inv-avg"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0,00"
                  value={averagePrice}
                  onChange={e => setAveragePrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="inv-cur">Preço Atual</label>
                <input
                  id="inv-cur"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0,00"
                  value={currentPrice}
                  onChange={e => setCurrentPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                Rendimentos Mensais (Opcional)
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inv-divday">Dia do Pagamento</label>
                  <input
                    id="inv-divday"
                    type="number"
                    min="1"
                    max="31"
                    className="form-control"
                    placeholder="Dia do mês (ex: 15)"
                    value={dividendDay}
                    onChange={e => setDividendDay(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inv-divyield">Dividendo por Unidade (R$)</label>
                  <input
                    id="inv-divyield"
                    type="number"
                    step="0.0001"
                    min="0"
                    className="form-control"
                    placeholder="Ex: 0,10"
                    value={dividendYield}
                    onChange={e => setDividendYield(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Adicionar Ativo</button>
            </div>
          </form>
        </div>
      )}

      {/* Dividend Calendar / Dividend Map (Mapa do Dividendo) */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: 'var(--color-purple)' }} />
          Mapa de Dividendos (Mês Vigente)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Cronologia de recebimento de rendimentos estimados para o mês atual com base nas datas de pagamento cadastradas.
        </p>

        {dividendPayingAssets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-md) 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nenhum rendimento agendado para este mês. Cadastre o "Dia do Pagamento" e "Dividendo por Unidade" no ativo para visualizar aqui.
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)', 
            overflowX: 'auto', 
            paddingBottom: '8px', 
            scrollbarWidth: 'thin',
            msOverflowStyle: 'none'
          }}>
            {dividendPayingAssets.map(inv => {
              const divAmount = (inv.dividendYield || 0) * inv.quantity;
              const typeColor = getTypeColors(inv.type);
              return (
                <div 
                  key={`map-${inv.id}`} 
                  className="glass-panel" 
                  style={{ 
                    padding: 'var(--spacing-sm) var(--spacing-md)', 
                    minWidth: '165px', 
                    flexShrink: 0, 
                    borderTop: `3px solid ${typeColor.primary}`,
                    background: typeColor.bg
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: typeColor.primary }}>Dia {inv.dividendDay}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{inv.symbol}</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, margin: '4px 0 2px 0' }}>
                    {formatCurrency(divAmount)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {inv.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })} un • {formatCurrency(inv.dividendYield || 0)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* API integration note/TODO */}
        <div style={{ 
          marginTop: 'var(--spacing-md)', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '10px 14px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <AlertCircle size={16} style={{ color: 'var(--color-purple)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong>💡 TODO (Mapa do Dividendo):</strong> Estudo de integração automática de dividendos e relatórios em tempo real do mercado financeiro via scraping/API agendado no roteiro do projeto.
          </span>
        </div>
      </div>

      {/* Grid of Investments */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)' }}>Minha Carteira</h2>

        {investments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl) 0', color: 'var(--text-secondary)' }}>
            Nenhum ativo cadastrado.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
            {investments.map((inv) => {
              const investedVal = inv.quantity * inv.averagePrice;
              const currentVal = inv.quantity * inv.currentPrice;
              const profitLoss = currentVal - investedVal;
              const profitLossPct = investedVal > 0 ? (profitLoss / investedVal) * 100 : 0;
              const estimatedDiv = inv.dividendYield ? inv.quantity * inv.dividendYield : 0;
              const typeColor = getTypeColors(inv.type);

              return (
                <div 
                  key={inv.id}
                  className="glass-panel" 
                  style={{ 
                    padding: 'var(--spacing-md)',
                    background: typeColor.bg,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    borderColor: typeColor.border,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span 
                          className="badge" 
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            padding: '1px 5px',
                            backgroundColor: typeColor.primary + '15',
                            color: typeColor.primary
                          }}
                        >
                          {inv.symbol}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                          {getTypeName(inv.type)}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '5px' }}>{inv.description}</h4>
                    </div>
                    <button 
                      onClick={() => deleteInvestment(inv.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Qtd: {inv.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                      <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                        Médio: <strong>{formatCurrency(inv.averagePrice)}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        Cotação: <strong>{formatCurrency(inv.currentPrice)}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Patrimônio</span>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatCurrency(currentVal)}</div>
                      <div 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          color: profitLoss >= 0 ? 'var(--color-green)' : 'var(--color-red)' 
                        }}
                      >
                        {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)} ({profitLoss >= 0 ? '+' : ''}{profitLossPct.toFixed(1)}%)
                      </div>
                    </div>
                  </div>

                  {inv.dividendYield !== undefined && inv.dividendYield > 0 ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(16, 185, 129, 0.03)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '4px 8px',
                      fontSize: '0.75rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Dia {inv.dividendDay}: {formatCurrency(inv.dividendYield)}/un
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-green)' }}>
                        +{formatCurrency(estimatedDiv)}/mês
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                      Não paga proventos mensais.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
