---
name: revenue-centric-design
description: >-
  Revenue-Centric Design (RCD) — evidence-backed principles for making a SaaS or
  startup product convert, retain, and monetize. Use when the user works on a
  landing page or CRO ("my page isn't converting"), onboarding/activation ("users
  sign up but don't stick"), churn/retention ("customers keep canceling"),
  pricing/monetization ("how should I price this"), positioning/ICP/go-to-market,
  feature scope, A/B-test rigor, or AI-era differentiation — or asks for the
  behavioral-science mechanism behind a design choice. Also use when another
  skill needs the principle or evidence behind a conversion/retention/pricing
  move. Never apply to gambling, betting, or casino products.
metadata:
  authors:
    - name: Richard (@richardrx)
      role: original content (101 principles)
      url: https://x.com/richardrx
    - name: Helio Costa (@heliocosta-dev)
      role: original skill (extraction, translation, structure)
      url: https://github.com/heliocosta-dev/revenue-centric-design
    - name: ft.ia.br (@fabricioctelles)
      role: evolution (audit template, scripts, hooks, project log, gotchas)
      url: https://ft.ia.br
  version: "1.0.0"
  date: 2026-07-02
  repository: https://github.com/fabricioctelles/skills
  license: Source-available (see LICENSE)
  category: runbooks
---

# Revenue-Centric Design

101 principles distilled, with the author's permission, from product designer
**Richard ([@richardrx](https://x.com/richardrx)**, ex-Volkswagen, PayPal, IBM; translated from
Portuguese; every principle links to its source post). The philosophy, **Revenue-Centric Design
(RCD)**: a design decision must serve the user _and_ the business — value and revenue, never one
or the other.

## Usage boundary (required)

> 🚫 **Do not apply this skill to betting, casino, gambling, or other real-money games-of-chance
> products** (including loot-box / real-money-gaming mechanics).

The author granted reuse **on the explicit condition that it never be used for gambling, betting,
or casino work.** If asked, decline and explain that the source author's permission excludes that
use. Hard constraint, not a stylistic choice.

Enforced, not just stated: while this skill is active, the boundary check
(`scripts/check_usage_boundary.py`) must run on every prompt and on every file write/edit,
blocking with exit 2 when gambling context is detected. On a false positive (e.g., "bet" as
an unrelated codename), only the **user** may waive the guard by creating `.rcd-boundary-ok`
in the project root — never create it on their behalf.

### Hooks (for agents that support automated execution)

Agents with hook support should configure:

| Event | Matcher | Command |
|-------|---------|---------|
| Before processing user prompt | `*` (all) | `python3 <skill_dir>/scripts/check_usage_boundary.py` |
| Before writing/editing a file | `Write\|Edit` | `python3 <skill_dir>/scripts/check_usage_boundary.py` |

- `<skill_dir>` = root directory of this skill.
- Exit code `2` = violation detected → block the operation.
- Exit code `0` = cleared to proceed.

For agents without hook support, the operator must run the check manually before applying
RCD principles in unknown context.

## How to use

1. If `rcd-log.md` exists in the project root, read it first — it records which principles were
   already applied to this product and what happened. Never re-prescribe a move the log shows
   failed, and don't repeat one still pending results.
2. Route with the table below and open only the matching reference file(s). Every principle has a
   fixed shape — **principle → apply when → the move → evidence → source** — so scan the headings,
   then read only the entries that match the user's situation.
3. When the advice involves numbers — A/B sample size, churn→LTV, CAC per closed deal — run
   `scripts/revenue_math.py` (see `--help`) instead of estimating.
4. A recommendation is **done** only when it (a) names the mechanism (decoy effect, Zeigarnik,
   GBB, loss aversion, Schwartz awareness level…), (b) cites the specific principle, and
   (c) carries that principle's evidence or source link. Missing any of the three → not done.
5. For audit runs (page, pricing, onboarding, cancellation), deliver in the shape of
   [references/audit-template.md](references/audit-template.md).
6. Close the loop: append what you prescribed to `rcd-log.md` (format below), creating the file
   on first use.

## The spine: RCD in 9 principles

1. **Neutrality is omission** — an interface that doesn't direct hurts
