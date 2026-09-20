# PRD — REI Operations Platform

## 1. Problem Statement

REI services ~800+ refrigeration units across Singapore, with no centralized database for units, contracts, or customers. All work communication and tracking runs through WhatsApp — technicians report in once or twice a day, so job status is stale for most of the working day. Admin staff (Christine, Trassie) maintain customer/contract data manually across files and folders, with no interface to view contract end dates or renewal windows. Job prioritization is reactive: dispatch is based on the ops supervisor's (Mervyn's) memory of who's closest, not a systematic schedule or measured bandwidth. The business is a single point of failure on two to three individuals.

## 2. Vision & Goals

REI's stated ambition is to grow market share from ~1% to 10% by winning enterprise/MNC contracts (e.g., Dairy Farm, NTUC-scale), displacing incumbents like City Facilities. This platform serves two goals simultaneously, by design:

1. **Operational efficiency** — eliminate manual re-entry, single points of failure, and reactive dispatch.
2. **Enterprise sales enablement** — generate a timestamped, audit-defensible dataset (SLA compliance, response times, service history) that REI can present to prospective enterprise clients as evidence of operational maturity.

These are not competing priorities. Designing the data model to the enterprise-pitch standard (real timestamps, criticality tiers, typed contracts) is also what fixes REI's internal visibility problem — the same underlying data serves both.

## 3. Personas

| Persona | Role | Primary need |
|---|---|---|
| Christine / Trassie | Admin | Single source of truth for assets, customers, contracts; less manual re-entry; ability to verify/report without chasing people |
| Mervyn | Operations Manager | Fast, real-time dispatch and job status — must be at least as fast as WhatsApp or it won't be adopted |
| Field technician | Technician | Minimal-friction way to log arrival and outcome, tolerant of poor on-site connectivity |
| (Future) FROST / MNC client | Customer | Visibility into asset status and service history — explicitly deferred past MVP |

## 4. Scope

### In scope (MVP)
- Customer, site, asset, and contract database
- Job creation, scheduling, and dispatch (all three job types: alert-based/SLA response, scheduled maintenance, ad-hoc issue)
- Technician job updates: arrival, outcome, photo, parts touched, resolve/escalate
- Notification/escalation on overdue or SLA-risk jobs
- Role-based access (admin, ops_manager, technician)
- Bulk import for historical data migration

### Explicitly out of scope (this build)
- Parts/inventory management (deferred, not cut)
- Customer-facing portal (deferred to a future phase)
- AutoCount integration beyond CSV/data export
- AI-augmented workflows (OCR, auto-drafted reports)
- Any general-purpose rules/model builder (one narrow exception: a scoped notification-rules structure — see technical-design.md)
- Configuring an off-the-shelf tool (Jira/Monday) — this is a custom build, decided deliberately

### Out of scope (organizationally, per original discovery)
- Customer experience / client servicing processes themselves
- The project side of REI's business (separate from servicing/maintenance)

## 5. Functional Requirements

### 5.1 Asset Registry
- Assets have a current customer/site assignment, status (e.g. active/in repair/decommissioned), and a (many-to-many) contract link. Assignment and status are historized, not static pointers — an asset's location or status can change (e.g. FROST processes a D/O to move a unit; a unit goes into repair and back), and every past state must remain queryable, not overwritten. One generic asset-history mechanism should cover both, not a bespoke table per field
- Segment: FROST / Legacy(Shopfit), with FROST sub-segmented (e.g. HaegDaz, F&B/other) — segments are lookup values, not hardcoded
- Criticality tier (REI-defined, e.g. High/Medium/Low) — supports future SLA-tier pricing conversations
- Lookup key: REI-issued tracking label (confirmed to exist), not solely manufacturer serial
- Field-discoverable: a technician can register a minimal asset record on-site (serial/label, customer, site, segment); admin completes the full profile later

### 5.2 Contracts
- Many-to-many with Asset
- Typed: Servicing / Warranty / Calibration / Ad-hoc (extensible via lookup table)
- SLA parameters (response cutoff time, fulfillment window) are admin-editable fields on the contract record
- Renewal/expiry tracked with proactive notification (not discovered by asking around)

### 5.3 Jobs
- Generic job types — not customer-specific (a contract's parameters determine behavior, not the job type itself)
- Lifecycle: Created → Dispatched → On-site → Resolved (→ Verified/Closed) or Escalated (loops back to Dispatched with reassignment)
- Core timestamps captured live: `alert_received_at`, `response_started_at`, `on_site_at`, `resolved_at`/`escalated_at`
- Records are append-only; corrections are new entries, never silent edits
- Escalation reassigns within the same job — does not create a new job record

### 5.4 Dispatch
- Mervyn has direct write access — no relay through admin
- Dispatch through the system is REI's mandated process, not optional. Speed is still a hard design requirement alongside that mandate: a policy to use the system doesn't stop a slower tool from being bypassed in a genuine time-pressure moment (e.g. a spoilage-risk call), and that's exactly the moment the SLA-timestamp data matters most. Enforcement and speed solve different failure modes — non-compliance vs. compliant-but-bypassed-under-pressure — both are needed

### 5.5 Notifications / Escalation
- Rules are admin-configurable through the app itself — thresholds, tiers, and channels can be set up custom per REI's needs, no code deploy required to adjust (via a small, notification-scoped rules structure: trigger → wait window → action/channel)
- Trigger-based (time-past-due, not "someone noticed")
- Tiered escalation (assigned person first, then supervisor if unacknowledged within a defined window)
- Pre-breach warning for SLA-bound jobs, not just post-breach alerting

### 5.6 Access Control
- Role-based (admin, ops_manager, technician), enforced at the database level (RLS), not just in the UI

## 6. Success Metrics

- % of completed jobs with no manual Excel re-entry
- Time-to-detect for overdue/SLA-risk jobs (system-triggered vs. previously "someone noticing")
- Zero missed contract renewals due to lack of visibility
- System can produce, on demand: response time, resolution time, preventive-vs-reactive ratio, SLA compliance rate, per-asset service history

## 7. Risks / Open Items

- Infra decided as managed cloud (Vercel + Supabase) by default — revisit only if a specific reason emerges (data residency, cost at scale)
- Escalation thresholds (time/tier combinations) not yet defined — pending real usage data post-launch
- Digital-only record-keeping is expected to be audit-defensible if entries are locked/timestamped at creation, per general regulatory practice (FDA, SQF, GFSI) — not yet confirmed against FROST's specific compliance requirements; recommend REI confirm directly with FROST's compliance contact before fully retiring paper
- Visual/branding direction not yet finalized (color tokens, typography beyond "Inter, dense/fast" principle)

## 8. Out-of-the-box exclusions carried from original discovery

- Cost structure ($1/unit serviced) is a commercial arrangement for the engagement itself, not a product feature
