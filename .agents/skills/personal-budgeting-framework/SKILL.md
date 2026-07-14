---
name: personal-budgeting-framework
description: >-
  Frameworks and best practices for personal budgeting (50/30/20 rule, Zero-Based Budgeting,
  Envelope Method), debt payoff strategies (Snowball vs. Avalanche), and liquidity/emergency
  fund calculation. Use when coding dashboard metrics, budget goals, cash flow limits,
  or savings recommendations.
metadata:
  version: "1.0.0"
  category: finance
---

# Personal Budgeting Framework & Rules

This skill guides the agent in applying proven personal finance frameworks and budgeting principles directly to system design, calculations, and UI feedback.

---

## 📊 1. The 50/30/20 Budgeting Rule

Use this rule to categorise cash flow and display status bars/progress in the dashboard:

- **50% - Necessidades (Needs)**: Fixed expenses required for survival.
  - *Categories*: Moradia (Rent/Condo), Saúde (Insurance), Contas Fixas (Utilities), Mínimos de Dívidas.
  - *Constraint*: If Needs exceed 50% of Income, warn the user that fixed costs are too high.
- **30% - Desejos (Wants)**: Variable lifestyle expenses.
  - *Categories*: Lazer (Entertainment), Eletrônicos (Gadgets), Assinaturas, Alimentação fora.
- **20% - Poupança e Dívidas (Savings & Debt Amortization)**: Building future assets.
  - *Categories*: Investimentos, Aportes em Metas, Amortizações Extras.

---

## 🎯 2. Zero-Based Budgeting (Orçamento Base Zero)

Ensure the cash flow engine supports allocating every dollar of revenue:

- **Formula**: `Renda Mensal - (Despesas + Investimentos + Poupança) = 0`
- **Application**:
  - The system should encourage users to allocate any "Sobra Financeira" (Surplus) to either a Debt Payoff, a specific Goal/Fund, or an Investment.
  - A dashboard prompt should suggest: *"Você possui R$ X não alocados. Deseja investir ou enviar para a meta 'Reserva de Emergência'?"*

---

## 🛡️ 3. Emergency Fund (Reserva de Emergência)

Use this calculation to power the future "Planos & Metas" yield estimator:

- **Employed (CLT)**: 6 months of average fixed expenses (Needs).
- **Self-Employed (Autônomo/Freelance)**: 12 months of average fixed expenses (Needs).
- **Yield baseline**: Safe liquid assets (e.g. 100% CDI, Tesouro Selic).

---

## 💸 4. Debt Payoff Strategies (Snowball vs. Avalanche)

Compare these two strategies when designing payoff simulators:

### Avalanche Method (Foco Matemático)
- **Rule**: Pay off debts in order of **highest interest rate** first, regardless of the balance.
- **Benefit**: Mathematically superior. Minimises total interest paid over time.
- **System logic**: Order active debts descending by `interestRate`. Allocate surplus to the top item.

### Snowball Method (Foco Comportamental)
- **Rule**: Pay off debts in order of **smallest remaining balance** first, regardless of the interest rate.
- **Benefit**: Psychology-backed. Quick wins create positive feedback loop and build momentum.
- **System logic**: Order active debts ascending by `remainingAmount`. Allocate surplus to the top item.
