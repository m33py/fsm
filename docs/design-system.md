# Design System — REI Operations Platform

The single source of truth for how the app looks and behaves. Every screen conforms to this;
nothing is invented per-screen. This exists to prevent the prior build's "clunky" verdict,
which came from inconsistent patterns across screens (`ui-consistency-reviewer`, CLAUDE.md
UI/UX principles).

Status: **proposed baseline.** PRD §7 notes branding isn't finalized; these are concrete,
sensible defaults tuned to the stated direction ("Inter, dense, fast, operations tooling").
Swap specific hex values when REI branding lands — the token *names* stay stable.

> When this and a screen disagree, this document wins. New components get added here first,
> then used — never the reverse.

---

## 1. Design principles (from CLAUDE.md)

- **One adaptive system, not apps per role.** Same design language everywhere; only navigation
  and screen composition change by role/device.
- **One enforced interaction pattern per action type.** Create/edit is *always* a slide-over.
  A modal where a slide-over belongs is a defect, even if it looks fine alone.
- **Mobile is a primary target**, designed at 375px as the base case — not a desktop layout
  with breakpoints bolted on.
- **Speed over decoration where they conflict.** Dense, fast, minimal chrome — but visually
  consistent enough to show in a client pitch.

---

## 2. Color tokens

Defined as semantic tokens (name → value). Reference the **token**, never a raw hex, in
components. Dark mode values in parentheses.

### Neutrals (surfaces, borders, text)
| Token | Light | Dark |
|---|---|---|
| `bg` | `#ffffff` | `#0b1220` |
| `surface` | `#f8fafc` | `#111a2e` |
| `surface-muted` | `#f1f5f9` | `#1e293b` |
| `border` | `#e2e8f0` | `#243049` |
| `text` | `#0f172a` | `#e2e8f0` |
| `text-secondary` | `#475569` | `#94a3b8` |
| `text-muted` | `#94a3b8` | `#64748b` |

### Brand / action
| Token | Value | Use |
|---|---|---|
| `primary` | `#2563eb` | primary buttons, active nav, links |
| `primary-hover` | `#1d4ed8` | hover/pressed |
| `primary-tint` | `#dbeafe` | selected rows, subtle primary fills |
| `focus-ring` | `#3b82f6` | keyboard focus outline (always visible) |

### Semantic
| Token | Value |
|---|---|
| `success` | `#16a34a` |
| `warning` | `#d97706` |
| `danger` | `#dc2626` |
| `info` | `#2563eb` |

---

## 3. Status colors (the StatusBadge contract)

**One `StatusBadge` component**, driven by the `job_statuses` / `asset_statuses` lookup rows.
Color mapping is defined **once, here** — never inline per screen. Each badge = tinted
background + darker text + a leading dot.

### Job status
| Status | Tint bg | Text | Dot |
|---|---|---|---|
| Created | `#f1f5f9` | `#475569` | `#64748b` |
| Dispatched | `#dbeafe` | `#1d4ed8` | `#2563eb` |
| Accepted / En-route | `#cffafe` | `#0e7490` | `#06b6d4` |
| On-site | `#ede9fe` | `#6d28d9` | `#7c3aed` |
| Resolved | `#dcfce7` | `#15803d` | `#22c55e` |
| Escalated | `#fee2e2` | `#b91c1c` | `#ef4444` |
| Verified / Closed | `#e2e8f0` | `#334155` | `#475569` |

### Asset status
| Status | Tint bg | Text | Dot |
|---|---|---|---|
| Active | `#dcfce7` | `#15803d` | `#22c55e` |
| In repair | `#fef3c7` | `#b45309` | `#f59e0b` |
| Decommissioned | `#e2e8f0` | `#475569` | `#64748b` |
| Unverified (pending) | `#f5f3ff` | `#6d28d9` | dashed `#7c3aed` outline |

### SLA countdown chip
| State | Trigger | Tint bg | Text |
|---|---|---|---|
| OK | > 30 min to deadline | `#f1f5f9` | `#475569` |
| At risk | ≤ 30 min | `#fef3c7` | `#b45309` |
| Breached | past deadline | `#fee2e2` | `#b91c1c` |

Job **type** chips (Alert / Scheduled / Ad-hoc) are **outline** style (border + text, no fill),
to stay visually distinct from status badges.

---

## 4. Typography

- **UI font:** `Inter` (weights 400 / 500 / 600).
- **Mono font:** `ui-monospace` / `JetBrains Mono` — used for **REI asset labels** (`REI-0421`)
  and **timestamps**, so identifiers scan as data. This is a rule, not decoration.

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 28 / 34 | 600 | rare page hero |
| `h1` | 22 / 28 | 600 | page title |
| `h2` | 18 / 24 | 600 | section |
| `h3` | 15 / 20 | 600 | card title |
| `body` | 14 / 20 | 400 | default |
| `small` | 13 / 18 | 400 | secondary |
| `micro` | 11 / 14 | 500 | badge/label caps |

---

## 5. Spacing, radius, elevation, density

- **Spacing scale (4px base):** 2, 4, 8, 12, 16, 24, 32, 48. Use tokens, not arbitrary px.
- **Radius:** `sm` 6px (chips, badges), `md` 8px (cards, inputs, buttons), `lg` 12px
  (slide-over/sheet), `full` (pills, avatars).
- **Elevation:** flat by default; one soft shadow for overlays (`0 8px 24px rgba(2,6,23,.12)`).
  No decorative shadows on cards — borders instead.
- **Density:** desktop table row ≈ 40px. **Mobile tap targets ≥ 44px** (non-negotiable — this
  is the technician in gloves in a cold room).

---

## 6. Interaction patterns (one answer each — enforced)

| Action type | The one pattern | Notes |
|---|---|---|
| **Create / edit** | **Slide-over panel** (shadcn `Sheet`) | right side on desktop; full-height bottom sheet on mobile. Never a modal for create/edit. |
| **List → detail** | dense **table** (desktop) / stacked **cards** (mobile) | both open the same detail route. |
| **Destructive / confirm** | **Dialog** (`AlertDialog`) | short, explicit; the only place a modal is correct. |
| **Primary action per screen** | exactly **one** primary button | especially technician screens — one clear next step, never a form to fill before acting. |
| **Transient feedback** | **toast** | e.g. "Queued — will sync"; never a blocking alert. |

---

## 7. Navigation (adaptive shell)

- **Desktop:** left sidebar, role-filtered items, `REI` wordmark top, user chip bottom.
- **Mobile:** bottom tab bar (thumb reach), max ~4 items per role.
- **Same routes both**; only composition changes. Role decides which items appear — never a
  separate app per role.

---

## 8. Shared component inventory (`components/shared/`)

Build once, reuse everywhere. A screen reinventing one of these is a `ui-consistency-reviewer`
fail.

- `AppShell` (sidebar/tab-bar adaptive nav)
- `PageHeader` (title + primary action slot)
- `StatusBadge` (job + asset, lookup-driven — §3)
- `JobTypeChip`, `SLACountdownChip`
- `SlideOver` (the create/edit wrapper — §6)
- `DataTable` / `CardList` (the list primitives — §6)
- `EmptyState`, `TechAvatar`, `Timeline` (job event/timestamp rail)
- `OfflineIndicator` (connectivity pill + queued count)

`components/ui/` stays shadcn/ui base primitives; `shared/` is our composed layer on top.

---

## 9. Accessibility & color use

- Text on any tint must meet WCAG AA (the text values in §3 are chosen for this on their tints).
- **Never encode meaning by color alone** — status badges always pair color with a label/dot;
  SLA state pairs color with the countdown text.
- Focus is always visible (`focus-ring`), keyboard nav works on dispatch (Mervyn works fast on
  desktop).

---

## 10. How this is used

- **Prototypes (v0):** every screen is generated/regenerated against these tokens and patterns
  so they read as one app. The current dispatch board and technician flow predate this doc and
  will be reconciled to it.
- **Real build:** these become Tailwind theme tokens + the `components/shared/` library, with a
  living **style-guide route** (CLAUDE.md) rendering every component in one place as the visual
  source of truth.
