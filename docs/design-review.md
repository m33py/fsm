# Design Review — REI Operations Platform

Companion to `PRD.md`, `technical-design.md`, and `roadmap.md`.

**Purpose.** This is a model pressure-test, not a scope change. Before more UI gets
built on top of the data model, we stepped back to check the *model itself* against
field-service-management (FSM) industry practice and the project's own stated goals.
The findings below surfaced a handful of genuine gaps — not missing features — and four
were resolved into decisions. Those decisions **change schema and lifecycle, so they are
recorded here now**, but they are **not built now**: Phase 1 still ships dispatch first
(`roadmap.md`, `scope-guard`). When Phase-1 build begins, the "Schema/lifecycle
implications" checklist at the end is what gets folded into `technical-design.md`. This
document does not edit `technical-design.md`.

---

## 1. What's strong (and should not be touched)

The design is better-specified than most FSM builds. Worth naming so we don't "fix" it:

- **Append-only `job_events` + live-captured timestamps.** This is the whole thesis —
  an audit-defensible dataset as enterprise sales collateral — and it's correctly modeled
  as insert-only history, not editable fields.
- **Lookup tables, not enums.** Segments, criticality, job/contract/asset types, statuses
  are all rows. Adding a type is a data insert, not a migration.
- **Dispatch pulled forward.** The roadmap is explicitly built against the prior build's
  failure mode (admin screens absorbing months while dispatch never ships). Keep this.
- **Escalation as reassignment-in-place**, not a new job record. Correct.
- **Pre-existing review agents.** `scope-guard`, `schema-reviewer`, `rls-auditor`,
  `ui-consistency-reviewer`, `qa-workflow-tester`, `security-tester`, `migration-writer`
  already institutionalize the two failure modes (scope creep, UI inconsistency) and the
  prior build's real bug classes. The review discipline is real.

---

## 2. Gaps found & decisions

### 2.1 Scheduled-maintenance jobs have no point of origin — DECIDED

- **Gap.** `job_types` includes `scheduled_maintenance`, and contracts carry
  `fulfillment_window` / `renewal_date`, but nothing in the schema *generates* a recurring
  preventive-maintenance (PM) job. A quarterly servicing job is therefore born the same way
  it is today: someone remembers. That is the exact single-point-of-failure the system
  exists to remove, quietly surviving inside the "scheduled" job type.
- **Why it matters.** Undermines Goal #2 (remove single points of failure) and the
  preventive-vs-reactive ratio metric (PRD §6) — you can't measure preventive work that
  depends on human memory to exist.
- **Decision — design the seam now, build generation later.** Add a `maintenance_schedules`
  concept (or `next_due_at` on the asset/contract link) in Phase 1 so no emergency migration
  is needed later; defer the actual auto-generation job + admin UI to Phase 2/3. This is a
  recurrence that *emits a typed job* — **not** a generic workflow builder, so it stays
  outside the "one sanctioned rules engine" boundary that `scope-guard` protects.
- **Lands in:** schema seam Phase 1; generation Phase 2/3.

### 2.2 The FSM has no "couldn't finish" branch — DECIDED

- **Gap.** States are Created → Dispatched → On-site → Resolved / Escalated → Closed. Real
  refrigeration field reality: tech arrives and the site's closed, there's no access, a part
  is needed, or a revisit is required. Today those get crammed into "escalate" (wrong —
  escalation is about *unresponsiveness*, not *blocked work*) or faked as resolved (poisons
  the SLA dataset, i.e. the thing being sold).
- **Why it matters.** Directly corrupts SLA-compliance and resolution-time numbers — the
  enterprise-pitch data asset.
- **Decision — resolution outcome field, not new states.** Add `resolution_outcome` on the
  resolve transition: `fixed` / `temporary_fix` / `no_access` / `revisit_required`. Keeps
  the state count low, captures reality honestly. `revisit_required` is the seam a future
  revisit-scheduling feature hangs off. (Parts/inventory stays out of scope — this is a
  *lifecycle* fact, not an inventory feature.)
- **Lands in:** Phase 1 (technician resolve flow, Phase 2 build — but the field is defined now).

### 2.3 "response_started_at" is ambiguous, and it's a number you're selling — DECIDED

- **Gap.** Does the response clock stop when Mervyn *dispatches*, or when the technician
  *acknowledges / goes en-route*? Enterprise SLAs almost always mean the latter. Stamping it
  at dispatch measures the dispatcher's speed, not REI's field responsiveness — a
  sophisticated buyer will poke exactly there.
- **Why it matters.** Response time is a headline SLA metric; its definition must be
  defensible under scrutiny.
- **Decision — capture both.** Stamp `response_dispatched_at` (assign) **and**
  `response_acknowledged_at` (tech accepts / en-route). Reporting decides later which one
  "response time" means, and both are available if a contract defines it differently. This
  implies a light **Accepted / En-route** substate between Dispatched and On-site — which
  also gives escalation a concrete event to fire on ("dispatched but not acknowledged in N
  minutes").
- **Lands in:** Phase 1 timestamps; substate visible in technician flow (Phase 2).

### 2.4 Legal state transitions — where the rules live — DECIDED

- **Gap.** With transition logic scattered across each server action, the rules drift apart
  as the app grows — the "clunky"/inconsistent failure the prior build died of, one layer
  below the UI.
- **Decision — one shared rulebook.** A single transition definition (plain shared module;
  XState-style statechart optional) listing which `job_status → job_status` moves are legal
  and their guards, read by **both** client and server. Mirrors the existing "Zod schema
  shared client+server, never duplicated" rule. Near-zero cost in Phase 1. It is also the
  safe substrate a future AI layer drives (see §4).
- **Lands in:** Phase 1, alongside the `jobs` / `job_events` build.

---

## 3. Recorded, but not forced (lower priority)

Noted so they aren't lost; none pulled into MVP scope without a later deliberate call.

- **Technician load / bandwidth visibility.** PRD §1 names dispatch-by-memory and "measured
  bandwidth" as core pain, but the schema models only `assigned_to`. *Not* a scheduling
  optimizer (different product). Cheapest useful version: surface **jobs-per-technician load**
  on the dispatch board as a read-model / view — near-zero schema cost, and the difference
  between "digital WhatsApp" and "measurably better than WhatsApp."
- **Offline idempotency (defuse the Phase-2 landmine in Phase 1).** "Queue-and-sync" is the
  hardest thing in the build. Cheap insurance now: **client-generated UUIDs on `job_events`
  + idempotent server actions**, so a replayed offline mutation is a no-op, not a duplicate.
  Decide before the technician flow, not during it.
- **Proof-of-service sign-off.** For the enterprise-pitch goal specifically: `service_reports`
  captures photo/note/parts but no customer acknowledgement / "customer not present" state. A
  timestamped customer sign-off is table-stakes SLA-dispute collateral. Low effort, high
  credibility value.

---

## 4. Don't reinvent the wheel

The build-vs-buy-the-whole-product decision (custom over ServiceTitan / Jobber / Salesforce
FSM) is defensible and should stand: those tools are priced and shaped for a different market
and none of them hand REI a clean, *owned*, audit-defensible dataset as sales collateral —
which is the actual thesis. Validate that call; don't re-litigate it. But underneath it, buy
the solved parts instead of hand-rolling:

- **The state machine itself → the shared transition rulebook** (§2.4). We are literally
  building an FSM; there are mature patterns (XState / statecharts) whose entire job is "legal
  transitions, guards, one source of truth." Highest-leverage "don't reinvent" call here.
- **Auth → Supabase Auth.** Don't build sessions.
- **Offline sync → a proven local-first pattern** (e.g. PowerSync / WatermelonDB / TanStack
  Query persistence), not a bespoke queue.
- **Notification *delivery* → a provider**, not a maintained SMTP/WhatsApp integration. Note:
  `notification_rules.channel = 'whatsapp'` implies the **WhatsApp Business API** — real cost
  and approval lead time. Confirm early. This is the one place WhatsApp legitimately survives:
  as an *output channel*, never the system of record.

---

## 5. AI-readiness thesis (fenced to Phase 4 — not this build)

The thing that makes this system genuinely novel is already in the docs, and it's the state
machine. Most FSM products — and most "AI for field service" bolt-ons — sit on messy,
free-text data, so their AI is guessy. REI is building the rare exception: explicit states,
typed transitions, live timestamps, an append-only event log. **That discipline is the
cleanest possible substrate for an AI layer** — a consequence of choices already committed
to, not a feature to bolt on.

The architecture, when it comes, is **"AI proposes, the state machine disposes":** the LLM is
a natural-language front-end and reasoning layer; the shared transition rulebook (§2.4) is the
guardrail — an AI action can only ever drive a *legal* transition, writing the same typed
server action a human would. The near-term wedge (Phase 4, not now) is **conversational
dispatch**: Mervyn types or voices "chiller down at FairPrice Bugis, send Rajesh" → a
structured, validated job. That attacks the hardest requirement head-on — "must be faster than
WhatsApp" — by matching WhatsApp's conversational input speed while keeping the clean data
underneath.

**Discipline note.** `scope-guard` is *right* to fence AI out of the MVP, and that is exactly
why this won't stall like the last build. The failure mode of "pioneer a novel AI FSM" is the
vision eating Phase 1 so dispatch never ships. So the stance is architectural, not scope: ship
dispatch with zero AI, but make the two cheap Phase-1 decisions that keep the door open — the
shared rulebook (§2.4) and keeping `job_events` genuinely semantic. Then the entire AI layer is
an additive Phase-4 addition through the same server actions and guards — never a rewrite.

---

## 6. Schema / lifecycle implications to carry into build (checklist, not now)

For the future `schema-reviewer` / `migration-writer` pass. These update
`technical-design.md` when Phase-1 build starts; recorded here only.

- [ ] `jobs`: replace single `response_started_at` with **`response_dispatched_at`** +
      **`response_acknowledged_at`** (both system-set, non-editable).
- [ ] `jobs` or `service_reports`: **`resolution_outcome`** lookup
      (`fixed` / `temporary_fix` / `no_access` / `revisit_required`).
- [ ] `job_statuses`: add an **Accepted / En-route** substate between Dispatched and On-site.
- [ ] **`maintenance_schedules`** seam (recurrence → emits a typed `scheduled_maintenance`
      job); generation deferred to Phase 2/3.
- [ ] **Shared transition module** (legal `job_status` moves + guards), read client + server.
- [ ] **Client-generated UUIDs on `job_events`** + idempotent server actions (offline safety).
- [ ] (Optional, later) customer sign-off on `service_reports`; jobs-per-tech load view on
      the dispatch board.

None of the above is a new rules engine; `notification_rules` remains the single sanctioned
exception per `technical-design.md` §2 and `scope-guard`.
