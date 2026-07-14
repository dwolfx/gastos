# Gastos | Controle de Finanças Pessoais

Aplicação desktop/mobile responsiva de controle e acompanhamento de finanças pessoais, projetada com uma interface premium e minimalista. Desenvolvida em React, Vite, TypeScript e Vanilla CSS, o sistema está pronto para ser conectado ao Supabase e publicado na Vercel.

---

## 🌟 Funcionalidades Principais

1. **Dashboard Consolidado**: Visualização instantânea do saldo acumulado ("Valor na Conta"), total recebido, total gasto, e despesas divididas em *Fixas*, *Variáveis* e *Contas a Pagar*.
2. **Lançamentos por Carrossel**: Navegação lateral rápida por cards mensais contendo o resumo financeiro de cada mês. Ao selecionar, a lista cronológica detalhada de transações é exibida abaixo.
3. **Semáforo de Status de Lançamento**: Alertas coloridos automáticos (Vermelho para despesas atrasadas, Amarelo para contas próximas e vencendo hoje, Verde para transações futuras).
4. **Lançamento Retroativo**: Criação inteligente de compras parceladas a partir de datas passadas (retroativas), distribuindo parcelas nos meses históricos e meses futuros correspondentes.
5. **Leitor de Boletos**: Parser em JavaScript que decodifica linhas digitáveis (bancárias ou concessionárias) ao colar, autopreenchendo o valor e a data de vencimento. Inclui cópia rápida do código com um clique.
6. **Mapa de Dividendos**: Calendário cronológico dos dividendos que serão creditados na sua conta no mês vigente de forma automática.
7. **Simulador de Quitação de Dívidas**: Simulador financeiro interativo que compara os métodos **Avalanche** (prioriza maiores juros) e **Bola de Neve** (prioriza menores saldos) com base na sua sobra de caixa real.
8. **Configurações Regionais & Aparência**: Chaveador instantâneo de **Dark/Light Mode**, moedas (R$ e $), formato de data e lista de e-mails para compartilhamento de conta.

---

## 📂 Documentações Detalhadas (na Raiz)

Para saber mais sobre áreas específicas do projeto, consulte:
- [Documentação Técnica (TECHNICAL.md)](file:///c:/Sites/gastos/TECHNICAL.md) - Arquitetura de código, fluxo de estado global e algoritmos de cálculo.
- [Guia de Design (DESIGN.md)](file:///c:/Sites/gastos/DESIGN.md) - Paletas de cores (Dark/Light mode), tipografia e regras de responsividade mobile.
- [Como Rodar Localmente (RUN.md)](file:///c:/Sites/gastos/RUN.md) - Passos para instalar dependências e rodar o servidor de desenvolvimento.
- [Próximos Passos (ROADMAP.md)](file:///c:/Sites/gastos/ROADMAP.md) - Planejamento para migração para o Supabase, deploy na Vercel e app mobile nativo.

---

## 🚀 Como Rodar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor local:
   ```bash
   npm run dev
   ```
3. Abra [http://localhost:5173/](http://localhost:5173/) no seu navegador.
