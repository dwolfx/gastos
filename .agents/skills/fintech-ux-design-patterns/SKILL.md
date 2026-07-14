---
name: fintech-ux-design-patterns
description: >-
  Fintech and personal finance dashboard UI/UX best practices, including trust design,
  data visualization rules, progressive disclosure, and cognitive load reduction.
  Use when refining layouts, charts, transaction histories, or form flows.
metadata:
  version: "1.0.0"
  category: design
---

# Fintech & Personal Finance UI/UX Design Patterns

This skill guides the agent in making design choices for financial interfaces, ensuring they are trustworthy, readable, and action-oriented.

---

## 🔒 1. Trust as a Core Design System (Trust-first UX)
Trust is built through design precision, not text disclaimers:
- **Visual Alignment**: Consistent padding (`8px` grid system), exact borders, and robust layouts. Misaligned components signal cheap/unsafe code to the user.
- **Color Consistency**: Limit color coding to strict meanings. Greens for gains/income, reds/oranges for expenses/warnings, and muted grays for metadata.
- **State Feedback**: Provide immediate tactile feedback (loading indicators, disabled buttons, or change confirmations) for every user input.

---

## 📊 2. Dashboard Information Hierarchy (The Control Room)
Place data in descending order of urgency and abstractness:
1. **The Hero Indicator (Total Balance)**: Real-time, large font, prominent. Keep it masked by default or support a quick eye-toggle icon ("tap to hide/reveal").
2. **Actionable Summaries**: Avoid just printing raw lists. Show computed progress (e.g. *% of budget spent*, *remaining income*, *overdue counts*).
3. **Visual Progress Charts**: Ensure charts compare data to a goal (e.g. current category vs budget limit). Avoid overly complex charts; prefer circular rings, linear gauges, or simple bar groups.

---

## 🧹 3. Clean Transaction Histories
- **Denoised Descriptions**: Strip out raw gateway transaction codes or card suffixes (e.g., change `PAG*NETFLIX 923984 XP` to a clean `Netflix`).
- **Dynamic Quick Filtering**: Provide inline search, quick category badges, and quick toggles rather than hiding search behind menus.
- **Micro-Actions**: Allow checking/unchecking statuses directly in lists (e.g. marking a boleto as paid) without forcing the user to open a detail modal, but ensure the list item itself can be expanded to view all metadata.

---

## 🧠 4. Cognitive Load Reduction & Progressive Disclosure
- **Never overwhelm**: Do not throw full transaction grids, detailed investments charts, and full account histories on the same page.
- **Masking Sensitive Data**: Mask card details, email addresses, and balance amounts on public displays.
- **Form Flows**:
  - Automatically format currency inputs while typing (e.g., typing `150` inputs `R$ 1,50`).
  - Validate field entries *after* user interaction (`:user-invalid`) to avoid premature error alerts.
