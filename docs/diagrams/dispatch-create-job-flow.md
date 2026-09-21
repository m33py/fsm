# Dispatch / Create-Job Flow

Canonical logic for how a job is born and dispatched — the ops_manager (Mervyn) path that
replaces WhatsApp. This is the front door to the state machine: it ends by handing a job to
[`job-lifecycle-fsm.md`](./job-lifecycle-fsm.md) at either **Created** or **Dispatched**.

Speed is a hard requirement here (PRD §5.4): this path must be at least as fast as WhatsApp,
or it gets bypassed under time pressure — which is exactly when the SLA timestamp matters most.

```mermaid
flowchart TD
    A1[Alert received<br/>call / FROST alert]:::trig --> N
    A2[Scheduled maintenance due<br/>maintenance_schedules · Phase 2/3]:::trig --> N
    A3[Ad-hoc issue reported]:::trig --> N

    N[OM opens New Job slide-over] --> JT[Pick job_type<br/>alert / scheduled / ad_hoc]
    JT --> AS{Asset already<br/>in system?}

    AS -- no --> MIN[Register minimal asset<br/>label · customer · site · segment<br/>admin completes profile later]
    AS -- yes --> SEL[Select asset · searchable]
    MIN --> SEL

    SEL --> AF[Auto-fill customer + site<br/>from asset current pointers]
    AF --> CT{Asset linked to<br/>how many contracts?}

    CT -- one --> SLA[Pull SLA params from contract<br/>response_cutoff · fulfillment_window]
    CT -- many --> PICK[OM picks applicable contract]
    CT -- none / ad-hoc --> NOSLA[No contract -> no SLA window<br/>contract_id = null]
    PICK --> SLA

    SLA --> CR
    NOSLA --> CR
    CR[Set criticality<br/>default from asset tier · editable] --> Q{Assign a<br/>technician now?}

    Q -- yes --> LOAD[Pick tech — with load visibility<br/>jobs-per-tech read-model]
    LOAD --> DISPATCH[Create &amp; Dispatch]
    Q -- no --> CREATE[Create unassigned]

    DISPATCH ==> FSMD[[FSM: Dispatched<br/>stamp alert_received_at<br/>+ response_dispatched_at]]
    CREATE ==> FSMC[[FSM: Created<br/>stamp alert_received_at]]
    FSMC -. assign later on board .-> FSMD

    classDef trig fill:#ffd8a8,stroke:#e8590c;
```

## The rules that make this data defensible

- **`alert_received_at` is stamped at creation, live** — not backfilled at end of day. This is
  the start of the SLA clock and the single most important timestamp for the enterprise-pitch
  dataset. It is system-set, never a form field (`schema-reviewer` rule).
- **`response_dispatched_at` is stamped when the tech is assigned + dispatched** (the "yes"
  branch). The second half of the [dual response clock](./job-lifecycle-fsm.md) —
  `response_acknowledged_at` — is stamped later by the technician, not here.
- **Creation writes a `job_events: created` row** (append-only).
- **Job types stay generic.** `alert` / `scheduled` / `ad_hoc` are lookup rows; contract
  parameters (not the job type, and never a named-customer conditional) determine SLA behavior
  — enforced by `scope-guard`.

## Decision points worth calling out

- **Asset not found → minimal register.** Reuses the field-discovery capability (PRD §5.1): a
  job should never be blocked because an asset profile is incomplete. Admin completes it later.
  (On the OM path this is the exception; the primary path is "asset exists.")
- **Asset ↔ contract is many-to-many.** If an asset sits on more than one contract, the OM
  must pick which one governs *this* job's SLA — the flow cannot silently guess.
- **Ad-hoc / no contract** is legal: `contract_id = null`, no SLA window. The job still tracks
  timestamps; it just isn't SLA-bound.
- **Assign-now vs create-unassigned** is the fork between entering the FSM at **Dispatched**
  vs **Created**. An unassigned job waits on the dispatch board and is assigned later — the
  same `Created → Dispatched` edge, just deferred.
- **Technician load visibility** at the assign step is the parked "measured bandwidth" item
  (`design-review.md` §3) — a jobs-per-tech read-model so assignment is informed, not blind.
  Not a scheduler; just visibility. Cheap, high-value, still to be confirmed for MVP.

## Future entry point (Phase 4, not now)

The whole sequence above is one structured `create_job` server action. The AI-readiness thesis
(`design-review.md` §5) adds a *second input* to that same action later: **conversational
dispatch** — Mervyn types/voices "chiller down at FairPrice Bugis, send Rajesh" and the LLM
fills the same validated fields, guarded by the same rules. Same destination, WhatsApp-speed
input. Fenced to Phase 4; noted here so the create action is designed to accept it without a
rewrite.
