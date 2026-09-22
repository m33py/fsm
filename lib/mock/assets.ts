/**
 * DEMO DATA — asset register (admin). Stands in for the future Supabase fetch.
 * Shapes mirror the intended schema: status is a lookup value, verification is a
 * SEPARATE flag from status (design-review §2.6), and every tracked change is an
 * append-only asset_history row (asset-lifecycle-history.md).
 */

// Status here is the lifecycle value only (active | in_repair | decommissioned).
// "unverified" is NOT a status — it's the `verified` flag below.
export type AssetLifecycle = "active" | "in_repair" | "decommissioned";

export type HistorySource = "admin_edit" | "job_completion" | "csv_import" | "field_register";

export const HISTORY_SOURCE: Record<HistorySource, string> = {
  admin_edit: "Admin edit",
  job_completion: "Job completion",
  csv_import: "CSV import",
  field_register: "Field register",
};

export type AssetHistoryEvent = {
  field: "Registered" | "Status" | "Location" | "Verified" | "Serviced";
  detail: string; // e.g. "active → in_repair", "Bugis Junction → Great World"
  at: string; // display timestamp
  by: string;
  source: HistorySource;
};

export type AssetRecord = {
  id: string;
  label: string; // REI-XXXX, mono
  desc: string; // "2-door chiller"
  customer: string;
  site: string;
  status: AssetLifecycle;
  verified: boolean;
  contracts: number;
  lastService: string; // display label, "—" if none
  history: AssetHistoryEvent[];
};

export const ASSET_RECORDS: AssetRecord[] = [
  {
    id: "as1",
    label: "REI-0417",
    desc: "Display freezer",
    customer: "FairPrice",
    site: "Bugis Junction",
    status: "active",
    verified: true,
    contracts: 1,
    lastService: "2h ago",
    history: [
      { field: "Registered", detail: "Created", at: "2024-11-02 09:14", by: "Christine", source: "admin_edit" },
      { field: "Verified", detail: "Marked verified", at: "2024-11-02 09:40", by: "Christine", source: "admin_edit" },
      { field: "Serviced", detail: "Thermostat replaced (J-2033)", at: "Today 11:08", by: "Rajesh", source: "job_completion" },
    ],
  },
  {
    id: "as2",
    label: "REI-0312",
    desc: "2-door chiller",
    customer: "Cold Storage",
    site: "Great World",
    status: "in_repair",
    verified: true,
    contracts: 1,
    lastService: "41m ago",
    history: [
      { field: "Registered", detail: "Created", at: "2024-09-18 14:20", by: "Christine", source: "admin_edit" },
      { field: "Location", detail: "Tampines → Great World", at: "2025-03-10 10:05", by: "Trassie", source: "admin_edit" },
      { field: "Status", detail: "active → in_repair", at: "Today 12:38", by: "Suresh", source: "job_completion" },
    ],
  },
  {
    id: "as3",
    label: "REI-0588",
    desc: "Door seal (chiller)",
    customer: "Sheng Siong",
    site: "Tampines Ave 4",
    status: "active",
    verified: false,
    contracts: 0,
    lastService: "—",
    history: [
      { field: "Registered", detail: "Field register (minimal)", at: "Today 12:49", by: "Farid", source: "field_register" },
    ],
  },
  {
    id: "as4",
    label: "REI-0129",
    desc: "Blast chiller",
    customer: "Giant",
    site: "IMM Jurong",
    status: "active",
    verified: true,
    contracts: 1,
    lastService: "26m ago",
    history: [
      { field: "Registered", detail: "CSV import (historical)", at: "2024-06-01 00:00", by: "System", source: "csv_import" },
      { field: "Verified", detail: "Marked verified", at: "2024-06-14 16:22", by: "Christine", source: "admin_edit" },
    ],
  },
  {
    id: "as5",
    label: "REI-0602",
    desc: "Walk-in freezer",
    customer: "Marketplace",
    site: "Paragon",
    status: "active",
    verified: true,
    contracts: 1,
    lastService: "1h ago",
    history: [
      { field: "Registered", detail: "Created", at: "2025-01-20 11:00", by: "Trassie", source: "admin_edit" },
      { field: "Verified", detail: "Marked verified", at: "2025-01-20 11:15", by: "Trassie", source: "admin_edit" },
    ],
  },
  {
    id: "as6",
    label: "REI-0221",
    desc: "Ice cream cabinet",
    customer: "7-Eleven",
    site: "Clarke Quay",
    status: "decommissioned",
    verified: true,
    contracts: 0,
    lastService: "—",
    history: [
      { field: "Registered", detail: "CSV import (historical)", at: "2024-06-01 00:00", by: "System", source: "csv_import" },
      { field: "Status", detail: "active → decommissioned", at: "2025-08-30 09:00", by: "Christine", source: "admin_edit" },
    ],
  },
  {
    id: "as7",
    label: "REI-0733",
    desc: "Prep counter chiller",
    customer: "Cold Storage",
    site: "Jurong Point",
    status: "active",
    verified: false,
    contracts: 0,
    lastService: "—",
    history: [
      { field: "Registered", detail: "Field register (minimal)", at: "Yesterday 15:32", by: "Wei Ming", source: "field_register" },
    ],
  },
];

