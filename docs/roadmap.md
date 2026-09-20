# Roadmap — REI Operations Platform

Companion to `PRD.md` and `technical-design.md`. Sequencing principle: **dispatch is pulled forward, not gated behind a "finished" admin database.** The prior build's stall came from admin/data screens absorbing months of iteration while dispatch — the part that actually replaces WhatsApp — never shipped. This roadmap is built explicitly against that failure mode.

---

## Phase 1 — Core Foundation + Dispatch (combined, not sequential)

Ship just enough of the data foundation to make dispatch real, not a fully polished admin suite first.

- Schema: `customers`, `sites`, `assets`, `contracts`, `asset_contracts`, lookup tables (`segments`, `criticality_tiers`, `asset_statuses`, `contract_types`, `job_types`, `job_statuses`), `roles`
- `asset_history` mechanism + trigger (status/assignment changes tracked from day one, not bolted on later)
- Minimal admin CRUD: enough to create/edit a customer, site, asset, contract — not every field, not every polish pass
- `jobs` + `job_events` (append-only) schema and core timestamp capture
- Operations Manager (Mervyn) dispatch view: create job, assign technician, see live status — **this must exist and be usable by end of Phase 1**, not deferred to a later phase
- Basic RBAC/RLS per technical-design §3
- Bulk import (CSV → staging → validated commit) for historical asset, customer, site, and contract data migration — see technical-design §5 for the staging/duplicate-matching approach

**Exit criteria**: Mervyn can create and dispatch a real job through the system, end to end, without relaying through admin.

## Phase 2 — Technician Flow + Notifications

- Technician mobile-first flow: view assigned jobs, log arrival, log outcome (photo, note, parts touched), resolve/escalate
- Offline tolerance: queue-and-sync for poor connectivity on-site
- `notification_rules` table + admin settings screen (trigger → wait window → action/channel)
- Escalation loop wired end to end (reassignment within the same job record, `escalation_count` tracked)

**Exit criteria**: a job can go from alert → dispatch → on-site → resolved/escalated, entirely inside the system, by all three roles, without WhatsApp.

## Phase 3 — Reporting + Refinement

- On-demand reporting: response time, resolution time, preventive-vs-reactive ratio, SLA compliance rate, per-asset service history (PRD §6, §5.6)
- Contract renewal/certification expiry alerts (proactive, not discovered by asking around)
- Internal QA: backfill-detection monitoring (technical-design §4) — verify timestamps are being captured live in practice, not just in schema
- Admin UI polish pass — this happens *after* the above ships, not before

**Exit criteria**: system can produce the PRD §6 success metrics on demand, from real usage data, not seed/test data.

## Phase 4 — Deferred / Future (not this build)

Explicitly out of scope per PRD §4, listed here only so they're not forgotten or accidentally started early:

- Parts/inventory management
- Customer-facing portal (FROST/MNC visibility)
- AutoCount live API integration (Phase 1–3 ship with CSV export only)
- AI-augmented workflows (OCR, auto-drafted reports)
- Dynamic access-control console (technical-design §3) — only if team growth genuinely requires it

---

## What's deliberately not phased by role

Phase 1 includes all three roles at a basic level (admin creates data, Mervyn dispatches) rather than shipping admin alone and adding roles later — this is the direct correction from the prior build, where "admin-only, add other roles later" is exactly what let the project stall.
