# Documentação Técnica - Sistema de Controle de Gastos

Esta documentação detalha a arquitetura técnica, fluxo de dados e organização de código do projeto **Gastos**.

---

## 🛠️ Tecnologias Utilizadas

1. **Vite**: Bundler para empacotamento rápido e Hot Module Replacement (HMR).
2. **React + TypeScript**: Biblioteca frontend com tipagem estática robusta para maior previsibilidade de dados.
3. **Lucide React**: Biblioteca leve de ícones SVG.
4. **Vanilla CSS**: Estilização baseada em variáveis nativas do CSS.

---

## 📂 Organização de Pastas

```
gastos/
├── public/                 # Recursos estáticos
├── src/
│   ├── assets/             # Logo e vetores
│   ├── components/         # Componentes das telas (Dashboard, Lançamentos, etc.)
│   │   ├── Dashboard.tsx
│   │   ├── TransactionsList.tsx
│   │   ├── BoletosView.tsx
│   │   ├── InvestmentsView.tsx
│   │   ├── DebtsView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── LandingPage.tsx     # Nova Landing Page institucional
│   │   └── TransactionModal.tsx
│   ├── config/             # Configurações globais do projeto
│   │   └── appConfig.ts        # Nome dinâmico e variáveis do aplicativo
│   ├── context/            # Motor de Estado Global (FinanceContext)
│   │   └── FinanceContext.tsx
│   ├── styles/             # Variáveis globais CSS
│   │   └── variables.css
│   ├── utils/              # Funções utilitárias (Parser de boleto)
│   │   └── boletoParser.ts
│   ├── App.tsx             # Layout base, sincronização de URL e navegação
│   ├── index.css           # Estilização global do app
│   └── main.tsx            # Ponto de entrada do React
├── index.html              # HTML Principal
├── tsconfig.json           # Configuração TypeScript
├── vercel.json             # Configuração de rotas SPA na Vercel
└── package.json            # Dependências e scripts
```

---

## ⚡ Motor de Estado (`FinanceContext.tsx`)

O estado global da aplicação é controlado usando a Context API do React e persistido no `localStorage`. Isso simula um banco de dados local robusto (mockado) que prepara o app para a integração direta com o Supabase.

### Estruturas de Dados (Interfaces):
- **`Profile`**: Preferências de visualização (Tema escuro/claro, Moeda [BRL/USD], Formato de data) e controle de compartilhamento de perfil por e-mails.
- **`Transaction`**: Lançamentos financeiros (Receitas e despesas). Suporta parcelamentos marcados com `installmentId`.
- **`Boleto`**: Estrutura contendo linha digitável, valor, vencimento e vínculo com transação do fluxo de caixa.
- **`Investment`**: Ativos de investimentos (Tokens Cripto, FIIs ou Ações), quantidades, preços médios e dividendos cadastrados.
- **`Debt`**: Dívidas ativas e progresso de amortização.

### Ações Principais Exportadas pelo Contexto:
- `addTransaction(tx)`
- `deleteTransaction(id)`
- `toggleTransactionStatus(id)` (marca despesas como pagas)
- `addInstallmentPlan(plan)` (gera as N parcelas de forma retroativa ou futura)
- `addBoleto(boleto)` (cadastra boleto e cria transação pendente equivalente)
- `payBoleto(id)` (marca boleto e lançamento vinculado como pagos)
- `addDebt(debt)` / `payDebt(id, amount)` (registra despesa de amortização e reduz o saldo devedor)
- `addInvestment(inv)` / `deleteInvestment(id)`
- `addSharedEmail(email)` / `removeSharedEmail(email)` (gerenciamento de compartilhamento de perfil)

---

## 📑 Algoritmos Importantes

### 1. Parcelamento Retroativo
Ao criar um parcelamento, o contexto calcula as datas das próximas parcelas adicionando meses de forma indexada à data inicial:
```typescript
const getNextMonthDate = (startDateStr: string, index: number) => {
  const date = new Date(startDateStr + 'T12:00:00');
  date.setMonth(date.getMonth() + index);
  return date.toISOString().split('T')[0];
};
```
Isso gera parcelas passadas (que aparecem nos históricos de meses anteriores) e parcelas futuras automaticamente.

### 2. Validador de Boletos (`boletoParser.ts`)
Decodifica a linha digitável inserida para extrair dados automáticos:
- Se tamanho for **47 dígitos** (Boleto Bancário):
  - Fator de vencimento (extraído das posições 33 a 37, calcula os dias após a data base de 07/10/1997).
  - Valor nominal (extraído dos últimos 10 dígitos).
- Se tamanho for **48 dígitos** (Contas de concessionárias):
  - Valor nominal (extraído das posições 4 a 15).

### 3. Simuladores Avalanche vs. Bola de Neve (`DebtsView.tsx`)
Algoritmos matemáticos que projetam a quitação de dívidas mês a mês acumulando juros e aplicando a sobra de orçamento (`surplus`) conforme a estratégia escolhida ( Avalanche prioriza maiores juros; Bola de Neve prioriza menores saldos devedores).
