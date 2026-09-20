# REI Operations Platform

Custom field service management web/mobile app for REI, a Singapore refrigeration servicing company.
Manages refrigeration assets, servicing contracts, and job dispatch across FROST, Legacy/Shopfit, and future enterprise/MNC customer segments.

Full docs in `docs/`: `PRD.md`, `technical-design.md`, `roadmap.md`.

---

## Goals (in priority order)

1. **Kill WhatsApp as the operational system of record.** Every job — alert, scheduled maintenance, ad-hoc repair — is created, dispatched, and tracked in this system, not relayed through chat.
2. **Remove single points of failure.** No workflow should depend on one named person's availability or memory. Role-based, not person-based.
3. **Produce a defensible, timestamped dataset** usable as enterprise sales collateral (SLA compliance, response/resolution times, service history) — not just an internal efficiency tool.

## Non-goals (explicitly out of scope for this build)

- Parts/inventory management
- Customer-facing portal
- AutoCount integration beyond a CSV/data export function
- AI-augmented workflows (OCR, auto-drafted reports, etc.) — future phase, not MVP
- A general-purpose model/schema builder or rules engine (one narrow exception: see Notifications below)
- Configuring Jira/Monday/other off-the-shelf tools — this is a custom build

## What "good" looks like

- Mervyn (ops/dispatch) uses the system directly — no relaying updates through admin.
- Every completed job updates the system at the time of the event — no end-of-day backfill, no re-typing into Excel.
- SLA-relevant timestamps (alert received, response started, on-site, resolved) are captured live, not reconstructed from memory.
- System can report, on demand: response time, resolution time, preventive-vs-reactive ratio, SLA compliance rate, per-asset service history.
- No contract renewal or certification is missed due to lack of visibility.

---

## Stack

- **Framework**: Next.js (App Router, server actions — no API routes)
- **Database / Auth / Storage / Realtime**: Supabase
- **UI**: TailwindCSS + shadcn/ui (Radix primitives)
- **Forms**: React Hook Form + Zod (schemas shared client + server, never duplicated)
- **Data fetching**: TanStack Query (client components only; server components fetch directly)
- **Deployment**: Vercel + Supabase (managed cloud — chosen over self-hosting given no in-house IT capacity; revisit only if a specific data-residency or cost-at-scale reason emerges)

## Roles

| Role | Person(s) | Access |
|---|---|---|
| `admin` | Christine, Trassie | Full: asset/customer/contract database, verification, reporting |
| `ops_manager` | Mervyn | Direct write access to job creation, assignment, and status — no relay through admin |
| `technician` | Field team | Job-scoped: view assigned jobs, log outcome, photo, resolve/escalate |

Permissions are role-based, never hardcoded to a named user. Enforce at the database level (RLS), not just in UI — UI guards alone are not the security boundary.

---

## Data Model Principles

(Full schema lives in `docs/technical-design.md`. These are the standing rules for how it must be built.)

- **Job records are append-only.** A completed timestamp or outcome is never silently edited — a correction is a new logged entry with a reason. This is what makes the data audit-defensible.
- **Core Job timestamps are first-class, not derived**: `alert_received_at`, `response_started_at`, `on_site_at`, `resolved_at` / `escalated_at`. Capture at time of event.
- **Job types, contract types, asset segments, and criticality tiers are lookup-table rows, not hardcoded enums.** Adding a new type is a data insert, not a schema migration.
- **Contract ↔ Asset is many-to-many.** SLA parameters (cutoff time, response window, etc.) are admin-editable fields on Contract — configurable data, not hardcoded, and not a general rules engine.
- **Notifications/escalation get their own small, purpose-built rules structure** (trigger condition → wait window → action/channel), scoped only to that domain. This is the one deliberate exception to "no rules engine" — everything else stays fixed schema.
- **Asset location is tracked as history, not a static field** — assets relocate.
- **`custom_fields` (JSON) safety valve** on key entities for one-off attributes, so a one-time client need doesn't force an emergency migration.
- Escalation on a job reassigns within the same job record — it does not spawn a new job.

## MVP Scope

All three roles are live at launch — admin, ops_manager, and technician. Not staged by role.

- **In scope**: asset/customer/contract database, job creation/scheduling/dispatch, technician job updates, notifications/escalation.
- **Technician flow stays deliberately narrow**: select job → log arrival → log outcome (photo, short note, parts touched) → resolve or escalate. Must tolerate poor connectivity (queue-and-sync) — this is where adoption is won or lost.
- **Build sequencing**: job/dispatch is pulled forward, not gated behind a fully "finished" admin database. Historical failure mode to avoid: admin/data screens absorbing months of iteration while dispatch — the part that actually replaces WhatsApp — never ships.
- Bulk import handles one-time historical data migration; routine screens are not designed around that burden.

---

## UI/UX Principles

- **One adaptive system, not separate apps per role.** Shared design system and component library; navigation and screen composition change by role/device, layout paradigm does not.
- **One enforced interaction pattern per action type, everywhere** (e.g., one consistent pattern for create/edit — pick slide-over panel or modal, use it everywhere, document it). Inconsistent patterns across screens caused the prior build's "clunky" verdict — this is the direct fix.
- **Mobile is a primary target, not a derived breakpoint** — ops manager and technician work happens on phones.
- **Speed takes priority over polish where they'd conflict; both are expected otherwise.** Dense, fast, minimal decoration — but visually consistent enough to be shown in a client pitch.
- Maintain a single source of truth for approved components/patterns (e.g., a living style-guide route or Storybook) so a pattern only has one documented answer.

---

## Code Conventions

- Server components fetch data directly (no client fetch, no `useEffect` for initial load)
- All DB writes go through server actions
- Zod validation schemas are shared between the client form and the server action — never duplicated
- RLS is the real security boundary — UI route guards are a convenience, not protection

---

## Directory Reference (proposed — confirm in technical-design.md)

```
app/
  (app)/              — all authenticated roles, single shared layout
    admin/            — admin-only routes
    jobs/             — shared job routes (role-aware rendering)
  (auth)/login/
components/
  shared/             — PageHeader, StatusBadge, EmptyState, nav
  ui/                 — shadcn/ui base
  assets/ jobs/ customers/ contracts/ forms/
lib/
  supabase/           — client.ts, server.ts
  validations/        — Zod schemas, shared client+server
docs/
  PRD.md
  technical-design.md
  roadmap.md
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only — never expose to client
```
