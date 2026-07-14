import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Moon, Sun, Shield, Mail, Trash2, Plus, User, Edit, Check, X, FolderKanban } from 'lucide-react';

interface SettingsViewProps {
  defaultTab?: 'general' | 'profile' | 'categories';
  setDefaultTab?: (tab: 'general' | 'profile' | 'categories') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ defaultTab = 'general', setDefaultTab }) => {
  const { 
    profile, 
    updateProfile, 
    addSharedEmail, 
    removeSharedEmail,
    addCategory,
    renameCategory,
    deleteCategory
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'categories'>(defaultTab);
  const [userName, setUserName] = useState(profile.userName);
  const [partnerName, setPartnerName] = useState(profile.partnerName);
  const [inviteEmail, setInviteEmail] = useState('');

  // Categories editing state
  const [editingCat, setEditingCat] = useState<{ type: 'income' | 'expense'; name: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');

  // Sync tab with external triggers
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (tab: 'general' | 'profile' | 'categories') => {
    setActiveTab(tab);
    if (setDefaultTab) {
      setDefaultTab(tab);
    }
  };

  const handleToggleTheme = () => {
    updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleSaveNames = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ userName, partnerName });
    alert('Perfil atualizado com sucesso!');
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    addSharedEmail(inviteEmail.trim());
    setInviteEmail('');
  };

  // Categories Actions
  const handleAddCategorySubmit = (e: React.FormEvent, type: 'income' | 'expense') => {
    e.preventDefault();
    const name = type === 'income' ? newIncomeCat : newExpenseCat;
    if (!name.trim()) return;
    addCategory(type, name);
    if (type === 'income') setNewIncomeCat('');
    else setNewExpenseCat('');
  };

  const handleStartEdit = (type: 'income' | 'expense', name: string) => {
    setEditingCat({ type, name });
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (!editingCat || !editName.trim()) return;
    renameCategory(editingCat.type, editingCat.name, editName);
    setEditingCat(null);
    setEditName('');
  };

  const handleDeleteCategoryClick = (type: 'income' | 'expense', name: string) => {
    if (name === 'Outros') {
      alert('A categoria "Outros" é padrão do sistema e não pode ser deletada.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir a categoria "${name}"? Os lançamentos vinculados a ela serão redirecionados para "Outros".`)) {
      deleteCategory(type, name);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)' }}>
      {/* Header */}
      <div className="content-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Configurações</h1>
          <p className="header-subtitle">Ajuste suas preferências, perfil, conexões e categorias</p>
        </div>
      </div>

      {/* Custom Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--border-color)', 
        marginBottom: 'var(--spacing-md)', 
        gap: 'var(--spacing-md)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <button
          onClick={() => handleTabChange('general')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            color: activeTab === 'general' ? 'var(--color-purple)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'general' ? '2px solid var(--color-purple)' : 'none',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap'
          }}
        >
          Geral & Aparência
        </button>
        <button
          onClick={() => handleTabChange('profile')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            color: activeTab === 'profile' ? 'var(--color-purple)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'profile' ? '2px solid var(--color-purple)' : 'none',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap'
          }}
        >
          Meu Perfil & Compartilhamento
        </button>
        <button
          onClick={() => handleTabChange('categories')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            color: activeTab === 'categories' ? 'var(--color-purple)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'categories' ? '2px solid var(--color-purple)' : 'none',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap'
          }}
        >
          Gerenciar Categorias
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)' }}>
        
        {/* Tab 1: General Preferences */}
        {activeTab === 'general' && (
          <div className="glass-panel animate-slide-up" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--color-purple)' }} />
              Configurações do Sistema
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              {/* Theme */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Tema do Site</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Defina se deseja usar o modo claro ou escuro</div>
                </div>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleToggleTheme}
                  style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  {profile.theme === 'dark' ? (
                    <>
                      <Sun size={15} style={{ color: 'var(--color-yellow)' }} /> Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon size={15} style={{ color: 'var(--color-purple)' }} /> Modo Escuro
                    </>
                  )}
                </button>
              </div>

              {/* Currency */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Moeda de Exibição</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Formatador de valores da conta</div>
                </div>
                <select 
                  className="form-control"
                  value={profile.currency}
                  onChange={e => updateProfile({ currency: e.target.value as 'BRL' | 'USD' })}
                  style={{ width: '120px', padding: '6px 10px', fontSize: '0.85rem' }}
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                </select>
              </div>

              {/* Date Format */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Formato de Datas</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Definição de calendários e listas</div>
                </div>
                <select 
                  className="form-control"
                  value={profile.dateFormat}
                  onChange={e => updateProfile({ dateFormat: e.target.value as 'DD/MM/YYYY' | 'MM/DD/YYYY' })}
                  style={{ width: '120px', padding: '6px 10px', fontSize: '0.85rem' }}
                >
                  <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile & Shared Users */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }} className="animate-slide-up">
            
            {/* Profile Editing Form */}
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--color-purple)' }} />
                Editar Perfil
              </h3>

              <form onSubmit={handleSaveNames}>
                <div className="form-group">
                  <label htmlFor="settings-username">Seu Nome</label>
                  <input
                    id="settings-username"
                    type="text"
                    className="form-control"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <label htmlFor="settings-couplemode" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Modo Casal (Finanças Conjuntas)</label>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ativar flag de lançamentos duplos</div>
                    </div>
                    <input 
                      id="settings-couplemode"
                      type="checkbox"
                      checked={profile.coupleMode}
                      onChange={e => updateProfile({ coupleMode: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                  
                  {profile.coupleMode && (
                    <div className="form-group animate-fade" style={{ marginTop: '10px' }}>
                      <label htmlFor="settings-partner">Nome do Parceiro/a</label>
                      <input
                        id="settings-partner"
                        type="text"
                        className="form-control"
                        value={partnerName}
                        onChange={e => setPartnerName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.85rem', marginTop: '12px' }}>
                  Salvar Perfil
                </button>
              </form>
            </div>

            {/* Sharing (Invite by Email) Card */}
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} style={{ color: 'var(--color-purple)' }} />
                Compartilhamento
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                Adicione pessoas por e-mail para compartilhar as suas finanças. Elas receberão acesso sincronizado ao banco de dados Supabase na próxima fase.
              </p>

              {/* Add email form */}
              <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: '6px', marginBottom: 'var(--spacing-lg)' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="parceiro@email.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px var(--spacing-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Convidar
                </button>
              </form>

              {/* List of shared emails */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Membros Vinculados:</div>
                
                {/* Default user */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 500 }}>{profile.userName} (Você)</span>
                  <span className="badge badge-paid" style={{ fontSize: '0.6rem', padding: '0 4px' }}>Dono</span>
                </div>

                {/* Invited emails */}
                {profile.sharedEmails.length === 0 ? (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '8px' }}>
                    Nenhum e-mail vinculado ainda.
                  </div>
                ) : (
                  profile.sharedEmails.map(email => (
                    <div 
                      key={email}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '6px 10px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-xs)', 
                        border: '1px solid var(--border-color)', 
                        fontSize: '0.8rem' 
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{email}</span>
                      <button 
                        onClick={() => removeSharedEmail(email)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Remover convite"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Categories Management */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }} className="animate-slide-up">
            
            {/* Income Categories */}
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderKanban size={18} style={{ color: 'var(--color-purple)' }} />
                Categorias de Receitas (Entradas)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
                Gerencie as opções exibidas ao adicionar uma nova receita no app.
              </p>

              {/* Add Income Category */}
              <form onSubmit={(e) => handleAddCategorySubmit(e, 'income')} style={{ display: 'flex', gap: '6px', marginBottom: 'var(--spacing-md)' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nova categoria (ex: Bônus)"
                  value={newIncomeCat}
                  onChange={e => setNewIncomeCat(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px var(--spacing-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Adicionar
                </button>
              </form>

              {/* Income Categories List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {profile.incomeCategories.map(cat => {
                  const isEditingThis = editingCat?.type === 'income' && editingCat?.name === cat;
                  
                  return (
                    <div 
                      key={`cat-income-${cat}`}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '6px 10px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-xs)', 
                        border: '1px solid var(--border-color)', 
                        fontSize: '0.85rem' 
                      }}
                    >
                      {isEditingThis ? (
                        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                          <input
                            type="text"
                            className="form-control"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{ padding: '2px 6px', fontSize: '0.8rem', flexGrow: 1 }}
                            required
                            autoFocus
                          />
                          <button type="button" className="btn btn-success" onClick={handleSaveEdit} style={{ padding: '2px 6px', display: 'flex' }}>
                            <Check size={12} />
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingCat(null)} style={{ padding: '2px 6px', display: 'flex' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span style={{ fontWeight: 500 }}>{cat}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleStartEdit('income', cat)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-purple)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Renomear categoria"
                            >
                              <Edit size={13} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategoryClick('income', cat)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-red)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Excluir categoria"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderKanban size={18} style={{ color: 'var(--color-purple)' }} />
                Categorias de Despesas (Saídas)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
                Gerencie as opções exibidas ao adicionar uma nova despesa no app.
              </p>

              {/* Add Expense Category */}
              <form onSubmit={(e) => handleAddCategorySubmit(e, 'expense')} style={{ display: 'flex', gap: '6px', marginBottom: 'var(--spacing-md)' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nova categoria (ex: Cursos)"
                  value={newExpenseCat}
                  onChange={e => setNewExpenseCat(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px var(--spacing-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Adicionar
                </button>
              </form>

              {/* Expense Categories List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {profile.expenseCategories.map(cat => {
                  const isEditingThis = editingCat?.type === 'expense' && editingCat?.name === cat;
                  
                  return (
                    <div 
                      key={`cat-expense-${cat}`}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '6px 10px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-xs)', 
                        border: '1px solid var(--border-color)', 
                        fontSize: '0.85rem' 
                      }}
                    >
                      {isEditingThis ? (
                        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                          <input
                            type="text"
                            className="form-control"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{ padding: '2px 6px', fontSize: '0.8rem', flexGrow: 1 }}
                            required
                            autoFocus
                          />
                          <button type="button" className="btn btn-success" onClick={handleSaveEdit} style={{ padding: '2px 6px', display: 'flex' }}>
                            <Check size={12} />
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingCat(null)} style={{ padding: '2px 6px', display: 'flex' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span style={{ fontWeight: 500 }}>{cat}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleStartEdit('expense', cat)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-purple)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Renomear categoria"
                            >
                              <Edit size={13} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategoryClick('expense', cat)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-red)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Excluir categoria"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
