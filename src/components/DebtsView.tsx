import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Landmark, Plus, TrendingDown, Sliders, AlertTriangle, Play, Check } from 'lucide-react';

export const DebtsView: React.FC = () => {
  const { profile, debts, addDebt, payDebt, transactions } = useFinance();

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paying' | 'waiting'>('paying');
  const [isAdding, setIsAdding] = useState(false);

  // Amortization State
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Simulator State
  const [customSurplus, setCustomSurplus] = useState('1000');
  const [simulated, setSimulated] = useState(false);
  const [simResults, setSimResults] = useState<{
    snowballMonths: number;
    avalancheMonths: number;
    totalInterestSnowball: number;
    totalInterestAvalanche: number;
  } | null>(null);

  // Calculate stats
  const activeDebts = debts.filter(d => d.status === 'active');
  
  const totalRemainingDebt = activeDebts
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const totalOriginalDebt = debts.reduce((acc, d) => acc + d.totalAmount, 0);
  const totalPaidDebt = totalOriginalDebt - totalRemainingDebt;
  const debtProgressPct = totalOriginalDebt > 0 ? (totalPaidDebt / totalOriginalDebt) * 100 : 0;

  // Calculate historical monthly surplus based on transactions
  const monthlyIncomes = transactions
    .filter(t => t.type === 'income' && t.date.startsWith('2026-07'))
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith('2026-07'))
    .reduce((acc, t) => acc + t.amount, 0);

  const realSurplus = Math.max(0, monthlyIncomes - monthlyExpenses);

  const formatCurrency = (val: number) => {
    return val.toLocaleString(profile.currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: profile.currency
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !totalAmount || !interestRate) return;

    const total = parseFloat(totalAmount);
    const rate = parseFloat(interestRate);

    if (isNaN(total) || total <= 0 || isNaN(rate) || rate < 0) return;

    addDebt({
      description,
      totalAmount: total,
      interestRate: rate,
      dueDate: dueDate || undefined,
      paymentStatus
    });

    setDescription('');
    setTotalAmount('');
    setInterestRate('');
    setDueDate('');
    setPaymentStatus('paying');
    setIsAdding(false);
  };

  const handlePayDebtSubmit = (e: React.FormEvent, debtId: string) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    payDebt(debtId, amount);
    setPayingDebtId(null);
    setPayAmount('');
  };

  // Debt payoff simulation engine (Snowball vs Avalanche)
  const runSimulation = () => {
    const surplusVal = parseFloat(customSurplus);
    if (isNaN(surplusVal) || surplusVal <= 0 || activeDebts.length === 0) return;

    // Clone active debts for simulation
    const simulatedDebts = activeDebts.map(d => ({ ...d }));

    // 1. Snowball (Menor valor primeiro)
    const snowballDebts = simulatedDebts.map(d => ({ ...d }));
    let snowballMonths = 0;
    let totalInterestSnowball = 0;

    while (snowballDebts.some(d => d.remainingAmount > 0) && snowballMonths < 240) {
      snowballMonths++;
      // Apply interest
      snowballDebts.forEach(d => {
        if (d.remainingAmount > 0) {
          const interest = d.remainingAmount * (d.interestRate / 100);
          totalInterestSnowball += interest;
          d.remainingAmount += interest;
        }
      });

      // Sort by remaining value ascending (smallest first)
      const sorted = snowballDebts
        .filter(d => d.remainingAmount > 0)
        .sort((a, b) => a.remainingAmount - b.remainingAmount);

      let availablePayment = surplusVal;
      for (const d of sorted) {
        if (availablePayment <= 0) break;
        const payment = Math.min(d.remainingAmount, availablePayment);
        d.remainingAmount -= payment;
        availablePayment -= payment;
      }
    }

    // 2. Avalanche (Maior taxa de juros primeiro)
    const avalancheDebts = simulatedDebts.map(d => ({ ...d }));
    let avalancheMonths = 0;
    let totalInterestAvalanche = 0;

    while (avalancheDebts.some(d => d.remainingAmount > 0) && avalancheMonths < 240) {
      avalancheMonths++;
      // Apply interest
      avalancheDebts.forEach(d => {
        if (d.remainingAmount > 0) {
          const interest = d.remainingAmount * (d.interestRate / 100);
          totalInterestAvalanche += interest;
          d.remainingAmount += interest;
        }
      });

      // Sort by interest rate descending (highest first)
      const sorted = avalancheDebts
        .filter(d => d.remainingAmount > 0)
        .sort((a, b) => b.interestRate - a.interestRate);

      let availablePayment = surplusVal;
      for (const d of sorted) {
        if (availablePayment <= 0) break;
        const payment = Math.min(d.remainingAmount, availablePayment);
        d.remainingAmount -= payment;
        availablePayment -= payment;
      }
    }

    setSimResults({
      snowballMonths: snowballMonths >= 240 ? -1 : snowballMonths,
      avalancheMonths: avalancheMonths >= 240 ? -1 : avalancheMonths,
      totalInterestSnowball,
      totalInterestAvalanche
    });
    setSimulated(true);
  };

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>
      {/* Header */}
      <div className="content-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Controle de Dívidas</h1>
          <p className="header-subtitle">Monitore e planeje a quitação de suas obrigações de longo prazo</p>
        </div>
        {!isAdding && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Cadastrar Dívida
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <div className="glass-panel summary-card" style={{ borderLeft: '4px solid var(--color-red)' }}>
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-red)' }}>
            <Landmark size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Saldo Devedor Restante</span>
            <span className="card-value" style={{ color: 'var(--color-red)' }}>{formatCurrency(totalRemainingDebt)}</span>
          </div>
        </div>

        <div className="glass-panel summary-card">
          <div className="card-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-green)' }}>
            <Check size={20} />
          </div>
          <div className="card-info">
            <span className="card-label">Total Amortizado (Pago)</span>
            <span className="card-value" style={{ color: 'var(--color-green)' }}>{formatCurrency(totalPaidDebt)}</span>
          </div>
        </div>

        <div className="glass-panel summary-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-info" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Progresso da Quitação</span>
              <span style={{ fontWeight: 600, color: 'var(--color-green)' }}>{debtProgressPct.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ 
                width: `${debtProgressPct}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-purple), var(--color-green))',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Debt Form */}
      {isAdding && (
        <div className="glass-panel animate-slide-up" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontWeight: 600 }}>Cadastrar Nova Dívida</h3>
            <button className="btn btn-secondary" onClick={() => setIsAdding(false)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="debt-desc">Descrição / Credor</label>
                <input
                  id="debt-desc"
                  type="text"
                  className="form-control"
                  placeholder="Ex: Empréstimo do Banco, Cheque Especial, Fatura Atrasada"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label htmlFor="debt-total">Valor Total Devido (R$)</label>
                <input
                  id="debt-total"
                  type="number"
                  step="0.01"
                  min="0.1"
                  className="form-control"
                  placeholder="0,00"
                  value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="debt-rate">Taxa de Juros Mensal (%)</label>
                <input
                  id="debt-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="Ex: 1,5"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="debt-status-action">Planejamento de Ação</label>
                <select
                  id="debt-status-action"
                  className="form-control"
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value as 'paying' | 'waiting')}
                >
                  <option value="paying">Em Pagamento (Agendado)</option>
                  <option value="waiting">Aguardando Início</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="debt-due">Vencimento (Opcional)</label>
                <input
                  id="debt-due"
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Salvar Dívida</button>
            </div>
          </form>
        </div>
      )}

      {/* List of Debts */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)' }}>Minhas Dívidas Ativas</h2>

        {debts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl) 0', color: 'var(--text-secondary)' }}>
            Parabéns! Nenhuma dívida ativa cadastrada. 🎉
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-md)' }}>
            {debts.map((d) => {
              const paidAmount = d.totalAmount - d.remainingAmount;
              const progress = (paidAmount / d.totalAmount) * 100;
              const isPaying = payingDebtId === d.id;

              return (
                <div 
                  key={d.id}
                  className="glass-panel"
                  style={{ 
                    padding: 'var(--spacing-md)', 
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-sm)',
                    borderColor: d.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)',
                    borderLeft: d.status === 'paid' 
                      ? '4px solid var(--color-green)' 
                      : d.paymentStatus === 'paying' 
                        ? '4px solid var(--color-blue)' 
                        : '4px solid var(--color-yellow)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{d.description}</h4>
                      <span className={`badge ${d.status === 'paid' ? 'badge-paid' : d.paymentStatus === 'paying' ? 'badge-income' : 'badge-pending'}`} style={{ fontSize: '0.6rem', padding: '1px 5px', flexShrink: 0 }}>
                        {d.status === 'paid' ? 'Quitada' : d.paymentStatus === 'paying' ? 'Em Pagamento' : 'Aguardando'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      <span>Juros: {d.interestRate}% am</span>
                      {d.dueDate && <span>Vence em: {d.dueDate.split('-').reverse().join('/')}</span>}
                    </div>

                    {/* Progress details */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                        <span>Pago: {formatCurrency(paidAmount)}</span>
                        <span>Falta: {formatCurrency(d.remainingAmount)}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${progress}%`, 
                          height: '100%', 
                          background: d.status === 'paid' ? 'var(--color-green)' : d.paymentStatus === 'paying' ? 'var(--color-blue)' : 'var(--color-yellow)',
                          borderRadius: 'var(--radius-full)'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Amortization Action */}
                  {d.status === 'active' && (
                    <div style={{ marginTop: '10px' }}>
                      {!isPaying ? (
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setPayingDebtId(d.id)}
                          style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <TrendingDown size={14} /> Amortizar / Pagar
                        </button>
                      ) : (
                        <form onSubmit={(e) => handlePayDebtSubmit(e, d.id)} className="animate-fade">
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0.1"
                              max={d.remainingAmount}
                              className="form-control"
                              placeholder="Valor do Pagamento"
                              value={payAmount}
                              onChange={e => setPayAmount(e.target.value)}
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              required
                              autoFocus
                            />
                            <button type="submit" className="btn btn-success" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                              Ok
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              onClick={() => setPayingDebtId(null)}
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            >
                              Voltar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saving and Debt Payoff Strategy helper */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} style={{ color: 'var(--color-purple)' }} />
          Simulador de Quitação Inteligente (Economizar para Pagar)
        </h2>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          De acordo com o fluxo do mês atual, sua sobra financeira estimada é de <strong>{formatCurrency(realSurplus)}</strong>. 
          Use o simulador abaixo para projetar o tempo total para quitar todas as suas dívidas com base no valor extra que você consegue poupar mensalmente.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-xl)' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label htmlFor="sim-surplus">Valor Mensal para Amortização (R$)</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <input
                  id="sim-surplus"
                  type="number"
                  min="50"
                  step="50"
                  className="form-control"
                  value={customSurplus}
                  onChange={e => setCustomSurplus(e.target.value)}
                />
                <button className="btn btn-primary" onClick={runSimulation} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Play size={14} /> Simular
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => setCustomSurplus(Math.max(100, Math.floor(realSurplus * 0.5)).toString())}>
                  Sugerido (50% da sobra): {formatCurrency(realSurplus * 0.5)}
                </span>
                <span style={{ cursor: 'pointer' }} onClick={() => setCustomSurplus(Math.max(100, Math.floor(realSurplus)).toString())}>
                  Máximo (100% da sobra): {formatCurrency(realSurplus)}
                </span>
              </div>
            </div>

            {activeDebts.some(d => d.interestRate > 4) && (
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                background: 'rgba(245, 158, 11, 0.05)', 
                border: '1px solid rgba(245, 158, 11, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '0.8rem',
                color: 'var(--color-yellow)'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>Você tem dívidas com juros altos (acima de 4% am). O simulador vai te ajudar a ver como pagar menos juros totais!</span>
              </div>
            )}
          </div>

          {/* Simulation Output Comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!simulated ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-lg)' }}>
                Defina o valor mensal e clique em <strong>Simular</strong> para calcular o plano de pagamento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }} className="animate-fade">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  
                  {/* Avalanche */}
                  <div className="glass-panel" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderTop: '3px solid var(--color-purple)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Método Avalanche</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Maior taxa de juros primeiro</div>
                    
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0', color: 'var(--color-purple)' }}>
                      {simResults?.avalancheMonths === -1 ? 'Inviável' : `${simResults?.avalancheMonths} meses`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Total de juros pagos: <br /><strong>{formatCurrency(simResults?.totalInterestAvalanche || 0)}</strong>
                    </div>
                  </div>

                  {/* Snowball */}
                  <div className="glass-panel" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderTop: '3px solid var(--color-blue)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Método Bola de Neve</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Menor saldo devedor primeiro</div>
                    
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0', color: 'var(--color-blue)' }}>
                      {simResults?.snowballMonths === -1 ? 'Inviável' : `${simResults?.snowballMonths} meses`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Total de juros pagos: <br /><strong>{formatCurrency(simResults?.totalInterestSnowball || 0)}</strong>
                    </div>
                  </div>

                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  {simResults && simResults.avalancheMonths !== -1 && (
                    <span>
                      💡 <strong>Dica da Maya:</strong> 
                      {simResults.totalInterestAvalanche < simResults.totalInterestSnowball ? (
                        ` O Método Avalanche economiza cerca de ${formatCurrency(simResults.totalInterestSnowball - simResults.totalInterestAvalanche)} em juros. Dê prioridade a pagar as maiores taxas!`
                      ) : (
                        " Ambos os métodos têm desempenhos parecidos. Escolha o Bola de Neve para quitar pequenas contas rápido e ter alívio mental!"
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
