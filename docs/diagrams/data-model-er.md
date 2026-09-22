# Data Model — Entity Relationships

Canonical picture of how the core entities relate, matching `technical-design.md §2`.
This is the reference the schema and every screen's data are built against.

```mermaid
erDiagram
    CUSTOMER ||--o{ CUSTOMER : "parent of (sub-brand)"
    CUSTOMER ||--o{ SITE : "has"
    CUSTOMER ||--o{ CONTRACT : "holds"
    SITE     ||--o{ ASSET : "current location of"
    CUSTOMER ||--o{ ASSET : "current owner of"

    ASSET    ||--o{ ASSET_CONTRACT : "on"
    CONTRACT ||--o{ ASSET_CONTRACT : "covers — explicit asset list"

    ASSET    ||--o{ JOB : "serviced in"
    CONTRACT |o--o{ JOB : "governs (nullable)"
    CUSTOMER ||--o{ JOB : "snapshot at creation"
    SITE     ||--o{ JOB : "snapshot at creation"

    ASSET    ||--o{ ASSET_HISTORY : "every tracked change"
    JOB      ||--o{ JOB_EVENT : "append-only log"
    JOB      ||--o| SERVICE_REPORT : "outcome"

    CUSTOMER {
      uuid id
      string name
      uuid parent_customer_id "null = top-level company"
    }
    ASSET {
      uuid id
      string label "REI tracking label"
      uuid current_customer_id "pointer; history in ASSET_HISTORY"
      uuid current_site_id "pointer; history in ASSET_HISTORY"
      uuid status_id "active / in_repair / decommissioned"
      date purchase_date
      date warranty_end "base +1yr; extensions push this"
    }
    CONTRACT {
      uuid id
      uuid customer_id "parent OR sub-brand"
      string contract_type "Servicing / Warranty / Calibration / Ad-hoc"
      set coverage "coverage_types line items"
      time response_cutoff_time
      int fulfillment_window_hours
    }
    ASSET_CONTRACT {
      uuid asset_id
      uuid contract_id
    }
    JOB {
      uuid id
      uuid asset_id
      uuid customer_id "snapshot"
      uuid site_id "snapshot"
      uuid contract_id "nullable — ad-hoc has none"
      uuid assigned_to "technician"
      uuid status_id
    }
```

## The relationships that matter (and why)

- **Customer → Customer (self-reference).** `parent_customer_id` models a parent company and its
  sub-brands (FROST → Häagen-Dazs / Laughing Cow / Chobani). Only FROST needs it today; a normal
  customer has `parent_customer_id = null`.
- **Contract → Customer (parent OR sub-brand).** A contract is signed by whichever level holds it.
- **Contract ↔ Asset is the coverage.** `ASSET_CONTRACT` is the explicit list of assets a contract
  applies to — coverage is per-asset, not "all of a customer's assets". A job may only cite a
  `contract_id` its asset is linked to here.
- **Warranty lives in two places by design.** The asset carries the current effective base warranty
  (`purchase_date` + `warranty_end`). A purchased **extension** is a `Warranty`-type CONTRACT whose
  term pushes that date — so extensions get contract dates, coverage, and history for free.
- **Job FKs are snapshots.** `customer_id` / `site_id` / `contract_id` are copied onto the job at
  creation, so the record stays correct even after the asset later relocates. The move itself is
  preserved in `ASSET_HISTORY`; cross-customer moves are allowed but rare.
