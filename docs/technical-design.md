# Technical Design — REI Operations Platform

Companion to `PRD.md`. This document is the schema/architecture source of truth — where the PRD says *what* and *why*, this says *how it's structured*.

---

## 1. Architecture

- Next.js (App Router), server actions for all writes — no API routes
- Supabase: Postgres (schema below), Auth, Storage (photos), Realtime (jobs table only)
- Deployment: Vercel + Supabase managed cloud
- RLS (Row Level Security) is the enforced security boundary at the database level — UI role checks are a convenience layer only, never the sole guard

## 2. Core Schema

### Entity relationships (agreed)

```
Customer ──parent_customer_id──▶ Customer      (self-ref: parent company → sub-brand)
Customer ──1:*── Site ──1:*── Asset            (asset carries current pointer + history)
Customer ──1:*── Contract
Asset  ──*:*── Contract   (asset_contracts — a contract's coverage is an EXPLICIT asset list)
Job → Asset · Customer · Site · Contract(nullable)   (FKs snapshotted at creation)
```

- **Parent company → sub-brand** is modelled by a self-referencing `customers.parent_customer_id`
  (FROST is a parent customer; Häagen-Dazs / Laughing Cow / Chobani are sub-brand customers).
  A flat customer just has `parent_customer_id = null`. Only FROST needs this today.
- **A contract belongs to one customer — parent OR sub-brand** (whoever signed it), and covers an
  **explicit list of assets** via `asset_contracts`. A job's `contract_id` must be a contract that
  the job's asset is actually linked to.
- **Job FKs are point-in-time snapshots** (customer/site/contract copied at creation) so the record
  stays correct after an asset later relocates. Asset movement (incl. rare cross-customer) is
  preserved in `asset_history`.

### `customers`
- `id`, `name`, `created_at`
- `parent_customer_id` (FK → `customers`, nullable) — self-reference for parent company → sub-brand
- (No `segment` — removed; see §6.)

### `sites`
- `id`, `customer_id` (FK), `address`, `created_at`
- A customer can have multiple sites

### `assets`
- `id`, `label` (REI-issued tracking label — primary lookup key), `manufacturer_serial` (secondary, not sole key)
- `criticality_tier_id` (FK → `criticality_tiers` lookup)
- `current_customer_id`, `current_site_id` — **current pointer only**; historical assignments live in `asset_history`, not here
- `status_id` (FK → `asset_statuses` lookup, e.g. active/in_repair/decommissioned) — current value only; history in `asset_history`
- `purchase_date`, `warranty_end` — **base manufacturer warranty**: `warranty_end` defaults to
  `purchase_date + 1 year`; it is the current *effective* warranty end. A purchased **extension**
  is a `Warranty`-type contract (see `contracts`) that pushes this date forward. So warranty lives
  in two places by design: the per-unit base end on the asset, and extensions as contracts.
- `custom_fields` (jsonb) — safety valve for one-off attributes
- `created_at`

### `asset_history`
Generic event log — one mechanism covers status changes, location/assignment changes, and any future tracked field, rather than a bespoke history table per field.
- `id`, `asset_id` (FK)
- `field_changed` (text — e.g. `'status'`, `'site_id'`, `'customer_id'`)
- `old_value`, `new_value` (text — store as text, cast on read; keeps this table generic across field types)
- `changed_at` (timestamptz, system-set, not user-editable)
- `changed_by` (user id, nullable if system-triggered)
- `source` (e.g. `'admin_edit'`, `'job_completion'`, `'csv_import'`)

Writes to `assets.current_*` / `assets.status_id` must be accompanied by a row in `asset_history` in the same transaction (enforce via a Postgres trigger, not application-code discipline alone — a trigger can't be forgotten by a future code change).

### `contracts`
- `id`, `customer_id` (FK — may reference a **parent company or a sub-brand** customer)
- `contract_type_id` (FK → `contract_types` lookup: Servicing / Warranty / Calibration / Ad-hoc)
  - A **Warranty**-type contract is a purchased warranty *extension*; its term extends the covered
    asset's effective `warranty_end`.
- `coverage` (FK set → `coverage_types` lookup: Preventive maintenance / Reactive repair /
  Emergency callout / Reporting / Parts) — individually selectable line items, not preset bundles
- `response_cutoff_time`, `fulfillment_window_hours` — admin-editable SLA parameters, not hardcoded
- `start_date`, `end_date`, `renewal_date`
- `custom_fields` (jsonb)

### `asset_contracts` (join table — many-to-many)
- `asset_id` (FK), `contract_id` (FK)
- This join **is** a contract's coverage: the explicit set of assets it applies to. A job may only
  cite a `contract_id` that its asset is linked to here.

### `jobs`
- `id`, `asset_id` (FK), `customer_id` (FK), `site_id` (FK), `contract_id` (FK, nullable — ad-hoc jobs may not have one)
- `job_type_id` (FK → `job_types` lookup: alert_based / scheduled_maintenance / ad_hoc_issue) — generic, never customer-specific
- `assigned_to` (FK → users, the technician)
- `status_id` (FK → `job_statuses` lookup: created / dispatched / on_site / resolved / escalated / verified_closed)
- **Core timestamps** (all nullable until reached, all system-set at the moment of the associated action — not free-text/editable):
  - `alert_received_at`
  - `response_started_at`
  - `on_site_at`
  - `resolved_at`
  - `escalated_at`
- `escalation_count` (int, default 0) — increments on each escalation; escalation reassigns `assigned_to` on this same row, never creates a new job
- `created_at`, `created_by`

### `job_events` (append-only — this is what makes jobs audit-defensible)
- `id`, `job_id` (FK)
- `event_type` (e.g. `'status_change'`, `'note_added'`, `'correction'`)
- `payload` (jsonb — old/new status, note text, photo reference, etc.)
- `logged_at` (system-set)
- `logged_by`

**No `UPDATE` on `job_events` — insert-only, enforced via RLS policy (no `UPDATE` grant on this table for any role except a narrow admin-correction path, which itself inserts a `correction` event rather than modifying history).** A job's *current* state (in the `jobs` table) can update; the *record of what happened* cannot be silently rewritten.

### `service_reports`
- `id`, `job_id` (FK), `technician_id`, `notes`, `parts_used` (jsonb or separate table if parts scope expands later), `photo_urls` (text[]), `submitted_at`

### Lookup tables (rows, not enums — insertable without a schema migration)
`criticality_tiers`, `asset_statuses`, `contract_types`, `coverage_types`, `job_types`, `job_statuses`

### `notification_rules`
The one deliberate, scoped exception to "no rules engine" (see CLAUDE.md).
- `id`, `trigger_type` (e.g. `'job_overdue'`, `'sla_pre_breach'`, `'contract_expiring'`)
- `condition` (jsonb — e.g. `{"criticality_tier": "high", "threshold_minutes": 120}`)
- `wait_window_minutes`
- `action` (e.g. `'notify'`, `'escalate'`)
- `channel` (e.g. `'in_app'`, `'email'`, `'whatsapp'`)
- `recipient_role_id` (FK → roles, not a named user)
- Editable via an admin settings screen — this table's rows are the "customization," not application code

---

## 3. Access Control (RLS shape)

Roles: `admin`, `ops_manager`, `technician` — stored as rows in a `roles` lookup table (not a hardcoded enum/claim), read via a `current_user_role()` helper to avoid joins on every policy check. This means adding a role name (e.g. a future distinct "dispatcher" reporting to Operations Manager) is a data insert, consistent with the lookup-table pattern used elsewhere in this schema.

**Access control model — decision, not an oversight**: RLS *policies* (what each role can actually do) remain hardcoded per role for this phase, not driven by a dynamic permission-matrix table. A true admin-configurable "access control center" (define roles and permissions without a deploy) was considered and deferred — it carries real security risk (a bug in dynamic permission-check logic is an app-wide hole, not a cosmetic bug) for a system currently serving three roles and a handful of named users. Revisit only if REI's team grows enough to need genuinely custom per-person permission sets.

| Table | admin | ops_manager | technician |
|---|---|---|---|
| `customers`, `sites`, `contracts` | full CRUD | read | none |
| `assets` | full CRUD | read + status update | read (assigned jobs' asset only) |
| `jobs` | full CRUD | create, assign, update status | update status + timestamps on own assigned jobs only |
| `job_events` | insert (corrections), read all | insert, read all | insert (own jobs only), read own jobs |
| `asset_history` | read all | read all | none (system-written only) |
| `notification_rules` | full CRUD | read | none |

Operations Manager (Mervyn) has direct write on `jobs` — no relay-through-admin path exists at the schema/policy level, matching PRD 5.4.

## 4. Monitoring / Internal QA (not user-facing success metrics — see PRD §6 for those)

- **Backfill detection**: flag any job timestamp whose value differs from its row's `job_events` `logged_at` by more than a few minutes — surfaces jobs where a timestamp was likely reconstructed after the fact rather than captured live. Internal data-quality signal, not a business KPI.
- **Escalation loop sanity check**: alert if `escalation_count` on any job exceeds a threshold (e.g. 3) without resolution — likely indicates a data/process problem, not just a hard job.

## 5. Bulk Import

Covers assets, customers, sites, and contracts — all currently tracked manually (carbon paper, scattered Excel/folders) and all in scope for historical migration, not assets alone.

**Staging, not direct insert.** The prior build had a documented bug class here: CSV import auto-created duplicate sites when a fuzzy match should have applied instead (a duplicate site record, and stray auto-created "site 99/100" test artifacts from unclear matching behavior). To avoid repeating this:
- Import runs into a staging table first, never directly into `customers`/`sites`/`assets`/`contracts`
- Before commit, the importer surfaces: new records to be created, likely matches against existing records (e.g. same customer name, same site address) for the admin to confirm or reject, and rows that failed validation
- Nothing is auto-created on a fuzzy match without explicit admin confirmation — ambiguous matches block commit rather than silently resolving one way or the other
- Import is resumable/partial — REI's data will arrive in batches over time as it's cleaned up, not as one clean file

## 6. Open / Deferred

- Parts/inventory: no schema yet — deferred per PRD scope
- Customer portal: no schema yet — deferred
- AutoCount integration: export function only (CSV), no live API integration in this phase
- Exact `notification_rules` UI (how an admin edits these rows) — to be designed alongside dispatch UI, not before
- **Customer "account type" / segment**: removed. "FROST" turned out to be a customer (a
  multi-brand parent), not a category, so parent→sub-brand hierarchy replaces it. A single
  account-type tag on the customer (e.g. Cold-chain / Retail-shopfit / Enterprise) can be re-added
  later purely for filtering/reporting — nothing downstream depends on it. See `design-review.md`.
- **Interactive list controls (UX, not schema)**: dispatch/jobs/assets should share one filter
  system — clickable stat tiles that filter the list, SLA-at-risk as a filter chip (not a one-off
  toggle), and user-customisable/persisted columns ("filter bar + saved views" pattern). Deferred
  as a build item after the screens' data is real.
