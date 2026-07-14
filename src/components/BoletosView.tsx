import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { parseBoleto } from '../utils/boletoParser';
import { Copy, Check, FileText, Trash2, CheckCircle, Plus, Barcode, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export const BoletosView: React.FC = () => {
  const { profile, boletos, addBoleto, payBoleto, deleteBoleto } = useFinance();
  
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [parseMessage, setParseMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const getTodayStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayStr = getTodayStr();
  
  // Calculate date boundaries
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Group boletos
  const atrasados = boletos.filter(b => b.status === 'pending' && b.dueDate < todayStr);
  const desseMes = boletos.filter(b => b.status === 'pending' && b.dueDate >= todayStr && b.dueDate <= endOfMonth);
  const futuros = boletos.filter(b => b.status === 'pending' && b.dueDate > endOfMonth);
  const pagos = boletos.filter(b => b.status === 'paid');

  // Accordion state
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Initialize open section on load if not set
  useEffect(() => {
    if (openSection === null) {
      if (desseMes.length > 0) {
        setOpenSection('mes');
      } else if (futuros.length > 0) {
        setOpenSection('futuros');
      } else if (atrasados.length > 0) {
        setOpenSection('atrasados');
      } else {
        setOpenSection('pagos');
      }
    }
  }, [boletos]);

  // Trigger parsing when barcode changes
  useEffect(() => {
    if (!barcode) {
      setParseMessage(null);
      return;
    }

    const cleanCode = barcode.replace(/\D/g, '');
    if (cleanCode.length === 47 || cleanCode.length === 48) {
      const parsed = parseBoleto(barcode);
      if (parsed.type === 'invalido') {
        setParseMessage({ text: parsed.error || 'Código inválido', type: 'error' });
      } else {
        let msg = `Boleto detectado (${parsed.type === 'banco' ? 'Bancário' : 'Concessionária'})`;
        
        if (parsed.amount) {
          setAmount(parsed.amount.toString());
          msg += ` • Valor: R$ ${parsed.amount.toFixed(2)}`;
        }
        
        if (parsed.dueDate) {
          setDueDate(parsed.dueDate);
          msg += ` • Vencimento: ${parsed.dueDate.split('-').reverse().join('/')}`;
        }

        setParseMessage({ text: msg, type: 'success' });
      }
    } else if (cleanCode.length > 5) {
      setParseMessage({ text: 'Validando código...', type: 'info' });
    } else {
      setParseMessage(null);
    }
  }, [barcode]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !barcode || !amount || !dueDate) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addBoleto({
      description,
      barcode,
      amount: numAmount,
      dueDate
    });

    setDescription('');
    setBarcode('');
    setAmount('');
    setDueDate('');
    setParseMessage(null);
    setIsAdding(false);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
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

  // Render a list of cards for a given group of boletos
  const renderBoletoCards = (group: typeof boletos) => {
    if (group.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Nenhum boleto nesta seção.
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
        {group.map(b => {
          const isOverdue = b.status === 'pending' && b.dueDate < todayStr;
          return (
            <div 
              key={b.id} 
              className="glass-panel"
              style={{ 
                padding: 'var(--spacing-md)', 
                background: 'rgba(255,255,255,0.01)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                borderColor: b.status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-color)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-xs)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: b.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: b.status === 'paid' ? 'var(--color-green)' : isOverdue ? 'var(--color-red)' : 'var(--color-yellow)',
                    flexShrink: 0
                  }}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={b.description}>
                      {b.description}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--color-red)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                      Vence: {formatDateStr(b.dueDate)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{formatCurrency(b.amount)}</span>
                  <span className={`badge ${b.status === 'paid' ? 'badge-paid' : isOverdue ? 'badge-expense' : 'badge-pending'}`} style={{ fontSize: '0.6rem', padding: '0px 4px', marginTop: '2px' }}>
                    {b.status === 'paid' ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Barcode box */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-xs)',
                padding: '6px 10px',
                fontSize: '0.7rem'
              }}>
                <span style={{ 
                  fontFamily: 'monospace', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  color: 'var(--text-secondary)',
                  marginRight: '8px'
                }}>
                  {b.barcode}
                </span>
                <button 
                  onClick={() => handleCopy(b.id, b.barcode)}
                  className="btn"
                  style={{ 
                    padding: '3px 6px', 
                    fontSize: '0.65rem', 
                    borderRadius: 'var(--radius-xs)', 
                    flexShrink: 0,
                    backgroundColor: copiedId === b.id ? 'var(--color-green)' : 'var(--bg-tertiary)',
                    color: copiedId === b.id ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {copiedId === b.id ? <Check size={10} /> : <Copy size={10} />}
                </button>
              </div>

              {/* Actions footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <button 
                  onClick={() => deleteBoleto(b.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={13} /> Excluir
                </button>

                {b.status === 'pending' && (
                  <button 
                    onClick={() => payBoleto(b.id)}
                    className="btn btn-success"
                    style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <CheckCircle size={12} /> Pagar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>
      {/* Header */}
      <div className="content-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Boletos</h1>
          <p className="header-subtitle">Organize e copie linhas digitáveis para pagamento rápido</p>
        </div>
        {!isAdding && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Cadastrar Boleto
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="glass-panel animate-slide-up" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Barcode size={18} style={{ color: 'var(--color-purple)' }} />
              Novo Boleto
            </h3>
            <button className="btn btn-secondary" onClick={() => { setIsAdding(false); setBarcode(''); }} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
              Cancelar
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="boleto-barcode">Linha Digitável / Código de Barras</label>
              <textarea
                id="boleto-barcode"
                className="form-control"
                placeholder="Cole a linha digitável do boleto aqui..."
                rows={2}
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                style={{ resize: 'none' }}
                required
              />
              
              {parseMessage && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  marginTop: '4px', 
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: parseMessage.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : parseMessage.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                  color: parseMessage.type === 'success' ? 'var(--color-green)' : parseMessage.type === 'error' ? 'var(--color-red)' : 'var(--color-blue)',
                  border: `1px solid ${parseMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : parseMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                }}>
                  {parseMessage.text}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="boleto-desc">Descrição</label>
              <input
                id="boleto-desc"
                type="text"
                className="form-control"
                placeholder="Ex: Conta de Luz, Celular, Fatura Cartão"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="boleto-amount">Valor (R$)</label>
                <input
                  id="boleto-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  placeholder="0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="boleto-duedate">Vencimento</label>
                <input
                  id="boleto-duedate"
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Salvar Boleto</button>
            </div>
          </form>
        </div>
      )}

      {/* Accordion list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        
        {/* 1. Boletos desse Mês */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div 
            onClick={() => toggleSection('mes')}
            style={{ padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
          >
            <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Boletos desse Mês
              <span className="badge badge-pending" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{desseMes.length}</span>
            </span>
            {openSection === 'mes' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {openSection === 'mes' && (
            <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
              {renderBoletoCards(desseMes)}
            </div>
          )}
        </div>

        {/* 2. Boletos Futuros */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div 
            onClick={() => toggleSection('futuros')}
            style={{ padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
          >
            <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Boletos Futuros
              <span className="badge badge-income" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{futuros.length}</span>
            </span>
            {openSection === 'futuros' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {openSection === 'futuros' && (
            <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
              {renderBoletoCards(futuros)}
            </div>
          )}
        </div>

        {/* 3. Boletos Atrasados */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div 
            onClick={() => toggleSection('atrasados')}
            style={{ padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
          >
            <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: atrasados.length > 0 ? 'var(--color-red)' : 'inherit' }}>
              {atrasados.length > 0 && <AlertCircle size={16} />}
              Boletos Atrasados
              <span className="badge badge-expense" style={{ fontSize: '0.65rem', padding: '1px 5px', backgroundColor: atrasados.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.08)' }}>
                {atrasados.length}
              </span>
            </span>
            {openSection === 'atrasados' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {openSection === 'atrasados' && (
            <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
              {renderBoletoCards(atrasados)}
            </div>
          )}
        </div>

        {/* 4. Boletos Pagos */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div 
            onClick={() => toggleSection('pagos')}
            style={{ padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
          >
            <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Boletos Pagos (Histórico)
              <span className="badge badge-paid" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{pagos.length}</span>
            </span>
            {openSection === 'pagos' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {openSection === 'pagos' && (
            <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
              {renderBoletoCards(pagos)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
