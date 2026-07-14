import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Trash2, Calendar, Info } from 'lucide-react';

export const TransactionModal: React.FC = () => {
  const { 
    profile, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    addInstallmentPlan,
    isTransactionModalOpen: isOpen,
    editingTransaction: editTransaction,
    closeTransactionModal: onClose
  } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Outros');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'paid' | 'pending'>('pending');
  const [owner, setOwner] = useState(profile.userName);
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('12');

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setDescription(editTransaction.description);
        setAmount(editTransaction.amount.toString());
        setType(editTransaction.type);
        setCategory(editTransaction.category);
        setDate(editTransaction.date);
        setStatus(editTransaction.status);
        setOwner(editTransaction.owner || profile.userName);
        setIsInstallment(false);
      } else {
        setDescription('');
        setAmount('');
        setType('expense');
        setCategory('Outros');
        setDate(new Date().toISOString().split('T')[0]);
        setStatus('pending');
        setOwner(profile.userName);
        setIsInstallment(false);
        setTotalInstallments('12');
      }
    }
  }, [isOpen, editTransaction, profile.userName]);

  const categories = type === 'income' 
    ? (profile.incomeCategories || ['Salário', 'Investimentos', 'Freelance', 'Outros'])
    : (profile.expenseCategories || ['Alimentação', 'Moradia', 'Lazer', 'Transporte', 'Saúde', 'Eletrônicos', 'Assinaturas', 'Dívidas', 'Outros']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (editTransaction) {
      // Edit mode: Update existing transaction
      updateTransaction(editTransaction.id, {
        description,
        amount: numAmount,
        type,
        category,
        date,
        status,
        owner: profile.sharedEmails.length > 0 ? owner : profile.userName
      });
    } else {
      // Creation mode: Add new transaction / installment
      if (isInstallment) {
        const numInstallments = parseInt(totalInstallments, 10);
        addInstallmentPlan({
          description,
          totalAmount: numAmount,
          totalInstallments: numInstallments,
          startDate: date,
          category,
          owner: profile.sharedEmails.length > 0 ? owner : profile.userName
        });
      } else {
        addTransaction({
          description,
          amount: numAmount,
          type,
          category,
          date,
          status,
          owner: profile.sharedEmails.length > 0 ? owner : profile.userName
        });
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (editTransaction) {
      if (confirm('Tem certeza que deseja excluir este lançamento?')) {
        deleteTransaction(editTransaction.id);
        onClose();
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2>{editTransaction ? 'Detalhes & Edição' : 'Novo Lançamento'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Metadata information block for linked details */}
            {editTransaction && (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '10px 14px', 
                marginBottom: '15px',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <Info size={14} style={{ color: 'var(--color-purple)' }} />
                  Informações Adicionais:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--text-muted)' }}>
                  <div>ID do Lançamento: <code style={{ fontSize: '0.7rem' }}>{editTransaction.id}</code></div>
                  <div>Responsável: <strong>{editTransaction.owner || 'Victor'}</strong></div>
                  
                  {editTransaction.installmentId && (
                    <div style={{ gridColumn: 'span 2', color: 'var(--color-purple)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      Faz parte de parcelamento: Parcela {editTransaction.installmentNumber} de {editTransaction.totalInstallments}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Tipo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => { setType('expense'); setCategory('Outros'); }}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setType('income'); setCategory('Outros'); }}
                >
                  Receita
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-description">Descrição</label>
              <input
                id="modal-description"
                type="text"
                className="form-control"
                placeholder="Ex: Supermercado, Salário, etc."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modal-amount">Valor (R$)</label>
                <input
                  id="modal-amount"
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
                <label htmlFor="modal-category">Categoria</label>
                <select
                  id="modal-category"
                  className="form-control"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-date">{isInstallment ? 'Data da 1ª Parcela' : 'Data'}</label>
              <input
                id="modal-date"
                type="date"
                className="form-control"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            {profile.sharedEmails.length > 0 && (
              <div className="form-group">
                <label htmlFor="modal-owner">Responsável</label>
                <select
                  id="modal-owner"
                  className="form-control"
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                >
                  <option value={profile.userName}>{profile.userName}</option>
                  {profile.sharedEmails.map(email => {
                    const name = email.split('@')[0];
                    return (
                      <option key={email} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
                    );
                  })}
                  <option value="Casal">Casal (Dividido)</option>
                </select>
              </div>
            )}

            {!isInstallment && (
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  id="modal-status"
                  type="checkbox"
                  checked={status === 'paid'}
                  onChange={e => setStatus(e.target.checked ? 'paid' : 'pending')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="modal-status" style={{ cursor: 'pointer', marginBottom: 0 }}>Marcar como pago/recebido</label>
              </div>
            )}

            {/* Only show installment option if creating a new transaction */}
            {!editTransaction && type === 'expense' && (
              <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    id="modal-isInstallment"
                    type="checkbox"
                    checked={isInstallment}
                    onChange={e => setIsInstallment(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="modal-isInstallment" style={{ cursor: 'pointer', marginBottom: 0 }}>Esta compra é parcelada</label>
                </div>

                {isInstallment && (
                  <div className="form-group animate-fade" style={{ marginTop: '10px' }}>
                    <label htmlFor="modal-totalInstallments">Quantidade de Parcelas</label>
                    <input
                      id="modal-totalInstallments"
                      type="number"
                      min="2"
                      max="120"
                      className="form-control"
                      value={totalInstallments}
                      onChange={e => setTotalInstallments(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={{ display: 'flex', justifyContent: editTransaction ? 'space-between' : 'flex-end', gap: 'var(--spacing-sm)' }}>
            {editTransaction && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
                style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Trash2 size={15} /> Excluir
              </button>
            )}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">{editTransaction ? 'Salvar' : 'Lançar'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
