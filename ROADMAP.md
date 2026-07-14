# Roteiro de Próximos Passos (Roadmap) - Sistema de Controle de Gastos

Este documento detalha o planejamento das próximas fases do projeto, para que nenhum requisito ou ideia de integração futura seja esquecido.

---

## 📌 Próximos Passos (Checklist de Implementação)

### 🖥️ Fase 1: Deploy & Hosting
- [ ] Configurar repositório Git do projeto e vincular com a **Vercel** para deploy automático por push (CI/CD).
- [ ] Criar arquivo `vercel.json` na raiz configurado com SPA routing para evitar erros de 404 ao atualizar rotas dinâmicas.

### 🗄️ Fase 2: Conexão com o Supabase (Database & Autenticação)
- [ ] **Configuração do Projeto no Supabase**:
  - Criar tabelas reais a partir do script SQL correspondente às tabelas de `profiles`, `transactions`, `installments`, `debts`, `investments` e `boletos`.
  - Criar chaves estrangeiras (`FK`) e garantir deleção em cascata se necessário.
- [ ] **Row Level Security (RLS)**:
  - Ativar o RLS em todas as tabelas.
  - Criar políticas para permitir apenas leitura e escrita onde o `auth.uid() = user_id`.
- [ ] **Migração do Mock Data**:
  - Criar o cliente `@supabase/supabase-js`.
  - Adaptar o `FinanceContext.tsx` para realizar chamadas assíncronas do banco ao invés de ler do `localStorage`.
- [ ] **Telas de Acesso**:
  - Implementar tela de Login (E-mail / Senha) e Cadastro.
  - Configurar recuperação de senha.

### 💑 Fase 3: Modo Casal Integrado (Compartilhamento de Dados)
- [ ] **Adição de Segundo Usuário (Parceiro/a)**:
  - Registro de um segundo usuário vinculado por e-mail para gerenciamento compartilhado de despesas e receitas.
  - Implementação de flags individuais ("Victor", "Vanessa") e de uso conjunto ("Casal") nos lançamentos.
- [ ] **Link de Contas no Banco de Dados**:
  - Ao convidar um e-mail nas configurações, o Supabase registra a associação em uma tabela de mapeamento (`user_shares`).
  - O banco de dados passa a permitir que usuários associados leiam lançamentos compartilhados.
- [ ] Configuração de convites de email via Supabase Auth invites.

### 🪙 Fase 4: Recursos Avançados de Investimento, Multi-contas e Tags
- [ ] **Multi-contas e Cartões**:
  - Cadastro de múltiplas contas bancárias (Ex: Itaú, Nubank, Caixinha) e cartões de crédito.
  - Criação de tags correspondentes de conta para cada transação (sinalizando a origem/destino do dinheiro).
- [ ] **Mapa do Dividendo Dinâmico**:
  - Desenvolver o "Mapa do Dividendo" para buscar automaticamente proventos passados e futuros de FIIs e Ações brasileiras (sincronizando dados via scraping de StatusInvest/Fundamentus ou integrando APIs financeiras como BravoBI/Yahoo Finance).
- [ ] Atualização automática de cotizações/preços de criptoativos e tokens de forma assíncrona.

### 🎯 Fase 5: Aba de Planos & Metas (Economizar / Rendimentos)
- [ ] **Criação da Aba de Planos & Metas**:
  - Visualização dedicada para criar objetivos financeiros (Ex: "Viagem de Fim de Ano", "Reserva de Emergência").
  - Lançamento de aportes onde o dinheiro fica guardado ou alocado em fundos específicos.
  - Simulação de rendimentos/ganhos com base na taxa de juros do fundo configurado (Ex: CDI 100%).

### 📱 Fase 6: Conversão para App Mobile Nativo
- [ ] Integrar **Capacitor** da Ionic para compilar a aplicação React + Vite em pacotes oficiais para **Android** (.apk) e **iOS** (.ipa).
- [ ] Testar sensores de biometria locais e notificações push para alertas de boletos vencendo no dia.
