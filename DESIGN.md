# Documentação de Design - Sistema de Controle de Gastos

Esta documentação descreve o sistema de design (Design System), variáveis, escolhas estéticas e responsividade aplicados no projeto **Gastos**.

---

## 🎨 Identidade Visual (Dark/Light Mode)

O design foi concebido com uma estética premium e minimalista, focando em alta fidelidade e interações suaves. Usamos um estilo de *glassmorphism* (efeitos de desfoque de fundo) nas bordas dos painéis e cards.

### Paleta de Cores (Tokens de Variáveis CSS)
As cores são gerenciadas de forma dinâmica no arquivo [variables.css](file:///c:/Sites/gastos/src/styles/variables.css):

- **Dark Mode (Padrão)**:
  - Fundo Principal (`--bg-primary`): `#0b0f19` (Cinza escuro azulado elegante).
  - Fundo Secundário / Cards (`--bg-secondary` / `--bg-card`): `#131a2c` com transparência e `backdrop-filter: blur(12px)`.
  - Bordas (`--border-color`): `rgba(255, 255, 255, 0.08)`.
  - Texto (`--text-primary` / `--text-secondary`): `#f8fafc` e `#94a3b8`.
- **Light Mode**:
  - Fundo Principal (`--bg-primary`): `#f8fafc` (Cinza claro suave).
  - Fundo Secundário / Cards (`--bg-secondary` / `--bg-card`): `#ffffff` com opacidade fina.
  - Bordas (`--border-color`): `rgba(15, 23, 42, 0.08)`.
  - Texto (`--text-primary` / `--text-secondary`): `#0f172a` e `#475569`.

### Tons de Ênfase (Acentos)
- **Gradiente Padrão**: Degradê roxo a azul: `linear-gradient(135deg, #8b5cf6, #3b82f6)`.
- **Sucesso / Receitas / Pago**: Verde Emerald (`#10b981`).
- **Perigo / Despesas / Atrasado**: Vermelho Coral (`#ef4444`).
- **Pendente / Atenção**: Amarelo / Dourado (`#f59e0b`).

---

## 🔤 Tipografia

Importamos do Google Fonts as famílias:
- **Outfit**: Utilizada para títulos e cabeçalhos em destaque devido às suas curvas elegantes e modernas.
- **Plus Jakarta Sans**: Utilizada para listagens, formulários e textos corridos devido à sua legibilidade em tamanhos pequenos.

---

## 📱 Responsividade (Layout Adaptável)

O layout foi arquitetado sem o uso de bibliotecas pesadas de terceiros (como Tailwind CSS), usando puramente recursos de Flexbox e CSS Grid no arquivo [index.css](file:///c:/Sites/gastos/src/index.css):

### Desktop (Larguras acima de 1024px)
- Menu de navegação lateral (Sidebar) fixo à esquerda com largura de `260px`.
- Área principal de conteúdo com margem esquerda de `260px` para evitar sobreposição.

### Mobile & Tablet (Larguras abaixo de 1024px)
- A barra lateral desktop é ocultada.
- Um cabeçalho compacto fixo (`mobile-header`) aparece no topo com altura de `60px`, exibindo o logotipo e o botão/avatar do perfil do usuário.
- Uma barra de abas inferior fixa (`mobile-nav`) de `64px` dá acesso rápido aos menus principais (Resumo, Lançamentos, Boletos, Investimentos, Dívidas).
- Menus extras de overlay (Sidebar móvel) abrem com efeito de transição lateral `slideInRight`.
- Grids de cards colapsam automaticamente para uma única coluna em telas menores de `480px`.

---

## ✨ Micro-Animações & Efeitos
- Transições de cores suaves (`transition: all 0.25s`) em todos os botões e links.
- Efeitos de aproximação (`transform: translateY(-1px)`) e elevação de sombra nos botões principais e cards do dashboard ao passar o mouse.
- Animação de entrada suave dos modais (`slideUp`) e mudança de telas (`fadeIn`).
- Feedback visual dinâmico (troca de ícones para o check e mudança de cor para verde) no botão de copiar a linha digitável dos boletos.
