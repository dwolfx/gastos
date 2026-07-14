import React, { createContext, useContext, useState, useEffect } from 'react';

// Types Definitions
export interface Profile {
  theme: 'dark' | 'light';
  currency: 'BRL' | 'USD';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  coupleMode: boolean;
  userName: string;
  partnerName: string;
  sharedEmails: string[];
  incomeCategories: string[];
  expenseCategories: string[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  status: 'paid' | 'pending';
  owner?: string; // userName, partnerName, or "Casal"
  installmentId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
}

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  startDate: string; // YYYY-MM-DD
  category: string;
  owner?: string;
}

export interface Investment {
  id: string;
  symbol: string;
  description: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  dividendDay?: number;
  dividendYield?: number;
  type: 'fii' | 'acao' | 'cripto';
}

export interface DebtPayment {
  date: string;
  amount: number;
}

export interface Debt {
  id: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number; // monthly %
  dueDate: string; // YYYY-MM-DD
  status: 'active' | 'paid';
  payments: DebtPayment[];
  paymentStatus: 'paying' | 'waiting'; // paying (Em Amortização) or waiting (Aguardando Início)
}

export interface Boleto {
  id: string;
  description: string;
  barcode: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'paid';
  transactionId?: string;
}

interface FinanceContextType {
  profile: Profile;
  transactions: Transaction[];
  installments: Installment[];
  debts: Debt[];
  investments: Investment[];
  boletos: Boleto[];
  updateProfile: (newProfile: Partial<Profile>) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;
  addInstallmentPlan: (plan: Omit<Installment, 'id' | 'installmentAmount'>) => void;
  addBoleto: (boleto: Omit<Boleto, 'id' | 'status'>) => void;
  payBoleto: (id: string) => void;
  deleteBoleto: (id: string) => void;
  addDebt: (debt: Omit<Debt, 'id' | 'status' | 'remainingAmount' | 'payments'>) => void;
  payDebt: (id: string, amount: number) => void;
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  deleteInvestment: (id: string) => void;
  addSharedEmail: (email: string) => void;
  removeSharedEmail: (email: string) => void;
  addCategory: (type: 'income' | 'expense', name: string) => void;
  renameCategory: (type: 'income' | 'expense', oldName: string, newName: string) => void;
  deleteCategory: (type: 'income' | 'expense', name: string) => void;
  
  // Global Transaction Modal State
  isTransactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  openTransactionModal: (tx?: Transaction | null) => void;
  closeTransactionModal: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper for generating dates monthly
const getNextMonthDate = (startDateStr: string, index: number) => {
  const date = new Date(startDateStr + 'T12:00:00');
  date.setMonth(date.getMonth() + index);
  return date.toISOString().split('T')[0];
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Profile State
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('gastos_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.sharedEmails) parsed.sharedEmails = [];
      if (!parsed.incomeCategories) {
        parsed.incomeCategories = ['Salário', 'Investimentos', 'Freelance', 'Outros'];
      }
      if (!parsed.expenseCategories) {
        parsed.expenseCategories = ['Alimentação', 'Moradia', 'Lazer', 'Transporte', 'Saúde', 'Eletrônicos', 'Assinaturas', 'Dívidas', 'Outros'];
      }
      return parsed;
    }
    return {
      theme: 'dark',
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
      coupleMode: false,
      userName: 'Victor',
      partnerName: 'Vanessa',
      sharedEmails: [],
      incomeCategories: ['Salário', 'Investimentos', 'Freelance', 'Outros'],
      expenseCategories: ['Alimentação', 'Moradia', 'Lazer', 'Transporte', 'Saúde', 'Eletrônicos', 'Assinaturas', 'Dívidas', 'Outros']
    };
  });

  // Global Modal State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const openTransactionModal = (tx?: Transaction | null) => {
    setEditingTransaction(tx || null);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  // 2. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const hasShared = profile.sharedEmails.length > 0;
    const activeUser = profile.userName;

    const saved = localStorage.getItem('gastos_transactions');
    if (saved) {
      const parsed = JSON.parse(saved) as Transaction[];
      if (!hasShared) {
        // Clean up legacy Vanessa or Casal entries in local storage
        return parsed.map(t => {
          let cleanDesc = t.description;
          if (t.description.includes('Vanessa')) {
            cleanDesc = t.description.replace('Vanessa', 'Freelance');
          }
          if (t.owner === 'Vanessa' || t.owner === 'Casal') {
            return { ...t, description: cleanDesc, owner: activeUser };
          }
          return t;
        });
      }
      return parsed;
    }

    // Default Seed Data
    const seedTransactions: Transaction[] = [
      // Incomes
      { id: '1', description: 'Salário Victor', amount: 8500, type: 'income', category: 'Salário', date: '2026-07-05', status: 'paid', owner: 'Victor' },
      { id: '2', description: 'Salário Freelance', amount: 9200, type: 'income', category: 'Salário', date: '2026-07-05', status: 'paid', owner: 'Victor' },
      
      // Regular Expenses
      { id: '3', description: 'Aluguel & Condomínio', amount: 3200, type: 'expense', category: 'Moradia', date: '2026-07-10', status: 'paid', owner: 'Victor' },
      { id: '4', description: 'Supermercado Mensal', amount: 1200, type: 'expense', category: 'Alimentação', date: '2026-07-12', status: 'paid', owner: 'Victor' },
      { id: '5', description: 'Restaurante Fim de Semana', amount: 350, type: 'expense', category: 'Lazer', date: '2026-07-11', status: 'paid', owner: 'Victor' },
      { id: '6', description: 'Assinatura Netflix', amount: 55.90, type: 'expense', category: 'Assinaturas', date: '2026-07-15', status: 'pending', owner: 'Victor' },

      // Previous Months data for calculations (historical seed)
      { id: 'h1', description: 'Salário Victor', amount: 8500, type: 'income', category: 'Salário', date: '2026-06-05', status: 'paid', owner: 'Victor' },
      { id: 'h2', description: 'Salário Freelance', amount: 9200, type: 'income', category: 'Salário', date: '2026-06-05', status: 'paid', owner: 'Victor' },
      { id: 'h3', description: 'Aluguel & Condomínio', amount: 3200, type: 'expense', category: 'Moradia', date: '2026-06-10', status: 'paid', owner: 'Victor' },
      { id: 'h4', description: 'Supermercado Mensal', amount: 1450, type: 'expense', category: 'Alimentação', date: '2026-06-12', status: 'paid', owner: 'Victor' },
      { id: 'h5', description: 'Manutenção Carro', amount: 890, type: 'expense', category: 'Transporte', date: '2026-06-18', status: 'paid', owner: 'Victor' },
    ];

    // Seed an installment: "Notebook Gamer" in 10x of R$ 500, starting in March 2026 (July is installment 5)
    const instId = 'inst-seed-1';
    for (let i = 0; i < 10; i++) {
      const date = getNextMonthDate('2026-03-10', i);
      const isPast = new Date(date) < new Date('2026-07-13');
      seedTransactions.push({
        id: `t-inst-${instId}-${i + 1}`,
        description: `Notebook Gamer (Parcela ${i + 1}/10)`,
        amount: 500,
        type: 'expense',
        category: 'Eletrônicos',
        date: date,
        status: isPast ? 'paid' : 'pending',
        owner: 'Victor',
        installmentId: instId,
        installmentNumber: i + 1,
        totalInstallments: 10
      });
    }

    // Map seed owners based on hasShared
    return seedTransactions.map(t => {
      if (!hasShared) {
        let cleanDesc = t.description;
        if (t.description.includes('Vanessa')) {
          cleanDesc = t.description.replace('Vanessa', 'Freelance');
        }
        return {
          ...t,
          description: cleanDesc,
          owner: activeUser
        };
      }
      return t;
    });
  });

  // 3. Installments State
  const [installments, setInstallments] = useState<Installment[]>(() => {
    const saved = localStorage.getItem('gastos_installments');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'inst-seed-1',
        description: 'Notebook Gamer',
        totalAmount: 5000,
        installmentAmount: 500,
        totalInstallments: 10,
        startDate: '2026-03-10',
        category: 'Eletrônicos',
        owner: 'Victor'
      }
    ];
  });

  // 4. Debts State
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('gastos_debts');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'debt-1',
        description: 'Empréstimo Reforma Apartamento',
        totalAmount: 25000,
        remainingAmount: 18000,
        interestRate: 1.5,
        dueDate: '2027-12-10',
        status: 'active',
        payments: [
          { date: '2026-05-10', amount: 1000 },
          { date: '2026-06-10', amount: 1000 },
          { date: '2026-07-10', amount: 1000 }
        ],
        paymentStatus: 'paying'
      },
      {
        id: 'debt-2',
        description: 'Dívida Cartão Nubank',
        totalAmount: 8500,
        remainingAmount: 4200,
        interestRate: 4.9,
        dueDate: '2026-11-15',
        status: 'active',
        payments: [
          { date: '2026-06-15', amount: 1500 },
          { date: '2026-07-15', amount: 1500 }
        ],
        paymentStatus: 'waiting'
      }
    ];
  });

  // 5. Investments State
  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('gastos_investments');
    if (saved) return JSON.parse(saved);

    return [
      { id: 'inv-1', symbol: 'MXRF11', description: 'FII Maxi Renda', quantity: 200, averagePrice: 9.80, currentPrice: 10.15, dividendDay: 15, dividendYield: 0.10, type: 'fii' },
      { id: 'inv-2', symbol: 'BTC', description: 'Bitcoin', quantity: 0.045, averagePrice: 320000, currentPrice: 350000, dividendDay: undefined, dividendYield: undefined, type: 'cripto' },
      { id: 'inv-3', symbol: 'IVVB11', description: 'S&P 500 ETF', quantity: 15, averagePrice: 285, currentPrice: 312, dividendDay: undefined, dividendYield: undefined, type: 'acao' }
    ];
  });

  // 6. Boletos State
  const [boletos, setBoletos] = useState<Boleto[]>(() => {
    const saved = localStorage.getItem('gastos_boletos');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'bol-1',
        description: 'Boleto Condomínio Julho',
        barcode: '23793.38128 60000.000004 00000.290002 9 97830000120000',
        amount: 1200,
        dueDate: '2026-07-10',
        status: 'paid',
        transactionId: '3'
      },
      {
        id: 'bol-2',
        description: 'Boleto Plano de Saúde',
        barcode: '00190.00009 02718.730007 00000.000000 1 97880000065000',
        amount: 650,
        dueDate: '2026-07-15',
        status: 'pending'
      }
    ];
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('gastos_profile', JSON.stringify(profile));
    // Apply theme class to body
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('gastos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('gastos_installments', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem('gastos_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('gastos_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('gastos_boletos', JSON.stringify(boletos));
  }, [boletos]);

  // Actions
  const updateProfile = (newProfile: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updatedTx: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedTx } : t));
    if (updatedTx.status) {
      setBoletos(prev => prev.map(b => b.transactionId === id ? { ...b, status: updatedTx.status as 'paid' | 'pending' } : b));
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    // If it's a boleto transaction, unlink it
    setBoletos(prev => prev.map(b => b.transactionId === id ? { ...b, status: 'pending', transactionId: undefined } : b));
  };

  const toggleTransactionStatus = (id: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'paid' ? 'pending' : 'paid';
        // Also update linked boleto if applicable
        setBoletos(prevBols => prevBols.map(b => 
          b.transactionId === id ? { ...b, status: nextStatus } : b
        ));
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const addInstallmentPlan = (plan: Omit<Installment, 'id' | 'installmentAmount'>) => {
    const instId = `inst-${Date.now()}`;
    const instAmount = parseFloat((plan.totalAmount / plan.totalInstallments).toFixed(2));
    const hasShared = profile.sharedEmails.length > 0;
    
    const newPlan: Installment = {
      ...plan,
      id: instId,
      installmentAmount: instAmount
    };

    const newTxs: Transaction[] = [];
    for (let i = 0; i < plan.totalInstallments; i++) {
      const date = getNextMonthDate(plan.startDate, i);
      const isPast = new Date(date) < new Date();
      newTxs.push({
        id: `t-inst-${instId}-${i + 1}`,
        description: `${plan.description} (Parcela ${i + 1}/${plan.totalInstallments})`,
        amount: instAmount,
        type: 'expense',
        category: plan.category,
        date: date,
        status: isPast ? 'paid' : 'pending',
        owner: plan.owner || (hasShared ? 'Casal' : profile.userName),
        installmentId: instId,
        installmentNumber: i + 1,
        totalInstallments: plan.totalInstallments
      });
    }

    setInstallments(prev => [...prev, newPlan]);
    setTransactions(prev => [...newTxs, ...prev]);
  };

  const addBoleto = (boleto: Omit<Boleto, 'id' | 'status'>) => {
    const boletoId = `bol-${Date.now()}`;
    const txId = `tx-bol-${Date.now()}`;
    const hasShared = profile.sharedEmails.length > 0;
    
    // Create corresponding transaction
    const newTx: Transaction = {
      id: txId,
      description: boleto.description,
      amount: boleto.amount,
      type: 'expense',
      category: 'Boletos',
      date: boleto.dueDate,
      status: 'pending',
      owner: hasShared ? 'Casal' : profile.userName,
    };

    const newBoleto: Boleto = {
      ...boleto,
      id: boletoId,
      status: 'pending',
      transactionId: txId
    };

    setTransactions(prev => [newTx, ...prev]);
    setBoletos(prev => [newBoleto, ...prev]);
  };

  const payBoleto = (id: string) => {
    setBoletos(prev => prev.map(b => {
      if (b.id === id) {
        // Update linked transaction
        if (b.transactionId) {
          setTransactions(prevTxs => prevTxs.map(t => 
            t.id === b.transactionId ? { ...t, status: 'paid' } : t
          ));
        }
        return { ...b, status: 'paid' };
      }
      return b;
    }));
  };

  const deleteBoleto = (id: string) => {
    setBoletos(prev => prev.filter(b => b.id !== id));
  };

  const addDebt = (debt: Omit<Debt, 'id' | 'status' | 'remainingAmount' | 'payments'>) => {
    const newDebt: Debt = {
      ...debt,
      id: `debt-${Date.now()}`,
      remainingAmount: debt.totalAmount,
      status: 'active',
      payments: []
    };
    setDebts(prev => [newDebt, ...prev]);
  };

  const payDebt = (id: string, amount: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const nextRemaining = Math.max(0, d.remainingAmount - amount);
        
        // Add transaction for the payment
        addTransaction({
          description: `Amortização: ${d.description}`,
          amount: amount,
          type: 'expense',
          category: 'Dívidas',
          date: todayStr,
          status: 'paid',
          owner: profile.sharedEmails.length > 0 ? 'Casal' : profile.userName
        });

        return {
          ...d,
          remainingAmount: nextRemaining,
          status: nextRemaining === 0 ? 'paid' : 'active',
          payments: [...d.payments, { date: todayStr, amount }]
        };
      }
      return d;
    }));
  };

  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    const newInv: Investment = {
      ...inv,
      id: `inv-${Date.now()}`
    };
    setInvestments(prev => [...prev, newInv]);
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const addSharedEmail = (email: string) => {
    if (!email || profile.sharedEmails.includes(email)) return;
    updateProfile({ sharedEmails: [...profile.sharedEmails, email] });
  };

  const removeSharedEmail = (email: string) => {
    updateProfile({ sharedEmails: profile.sharedEmails.filter(e => e !== email) });
  };

  const addCategory = (type: 'income' | 'expense', name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (type === 'income') {
      if (profile.incomeCategories.includes(trimmed)) return;
      updateProfile({ incomeCategories: [...profile.incomeCategories, trimmed] });
    } else {
      if (profile.expenseCategories.includes(trimmed)) return;
      updateProfile({ expenseCategories: [...profile.expenseCategories, trimmed] });
    }
  };

  const renameCategory = (type: 'income' | 'expense', oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew) return;
    
    if (type === 'income') {
      updateProfile({
        incomeCategories: profile.incomeCategories.map(c => c === oldName ? trimmedNew : c)
      });
    } else {
      updateProfile({
        expenseCategories: profile.expenseCategories.map(c => c === oldName ? trimmedNew : c)
      });
    }

    setTransactions(prev => prev.map(t => t.category === oldName && t.type === type ? { ...t, category: trimmedNew } : t));
    setInstallments(prev => prev.map(i => i.category === oldName ? { ...i, category: trimmedNew } : i));
  };

  const deleteCategory = (type: 'income' | 'expense', name: string) => {
    if (type === 'income') {
      updateProfile({
        incomeCategories: profile.incomeCategories.filter(c => c !== name)
      });
    } else {
      updateProfile({
        expenseCategories: profile.expenseCategories.filter(c => c !== name)
      });
    }

    setTransactions(prev => prev.map(t => t.category === name && t.type === type ? { ...t, category: 'Outros' } : t));
    setInstallments(prev => prev.map(i => i.category === name ? { ...i, category: 'Outros' } : i));
  };

  return (
    <FinanceContext.Provider value={{
      profile,
      transactions,
      installments,
      debts,
      investments,
      boletos,
      updateProfile,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      toggleTransactionStatus,
      addInstallmentPlan,
      addBoleto,
      payBoleto,
      deleteBoleto,
      addDebt,
      payDebt,
      addInvestment,
      deleteInvestment,
      addSharedEmail,
      removeSharedEmail,
      addCategory,
      renameCategory,
      deleteCategory,
      
      // Global Modal exports
      isTransactionModalOpen,
      editingTransaction,
      openTransactionModal,
      closeTransactionModal
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
