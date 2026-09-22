/**
 * DEMO DATA — NOT the real data layer.
 *
 * These fixtures let the dispatch board render before Supabase exists. When the
 * DB lands, a server component will fetch the equivalent shapes directly (per
 * CLAUDE.md: server components fetch, no client fetch) and this file is deleted.
 * Field names mirror the intended schema (docs/technical-design.md) so the swap
 * is a data-source change, not a component rewrite.
 */

import type { JobStatus, JobType } from "@/lib/status";

export type Criticality = "critical" | "high" | "standard";

export const CRITICALITY: Record<Criticality, string> = {
  critical: "Critical",
  high: "High",
  standard: "Standard",
};

export type Technician = {
  id: string;
  name: string;
  /** Active (non-terminal) jobs currently on this tech — the load-visibility read-model. */
  activeJobs: number;
};

export const TECHNICIANS: Technician[] = [
  { id: "t1", name: "Rajesh", activeJobs: 2 },
  { id: "t2", name: "Wei Ming", activeJobs: 1 },
  { id: "t3", name: "Suresh", activeJobs: 4 },
  { id: "t4", name: "Farid", activeJobs: 0 },
];

export type AssetOption = {
  id: string;
  label: string; // REI asset tag (mono in UI)
  customer: string;
  site: string;
  segment: string;
};

export const ASSETS: AssetOption[] = [
  { id: "a1", label: "REI-0417", customer: "FairPrice", site: "Bugis Junction", segment: "FROST" },
  { id: "a2", label: "REI-0312", customer: "Cold Storage", site: "Great World", segment: "FROST" },
  { id: "a3", label: "REI-0588", customer: "Sheng Siong", site: "Tampines Ave 4", segment: "Legacy" },
  { id: "a4", label: "REI-0129", customer: "Giant", site: "IMM Jurong", segment: "Legacy" },
  { id: "a5", label: "REI-0602", customer: "Marketplace", site: "Paragon", segment: "Enterprise" },
];

export type Contract = {
  id: string;
  name: string;
  responseWindowMin: number;
};

/** contract_id keyed to an asset (asset↔contract is many-to-many in the real schema). */
export const CONTRACTS_BY_ASSET: Record<string, Contract[]> = {
  a1: [{ id: "c1", name: "FairPrice FROST — 2025", responseWindowMin: 240 }],
  a2: [{ id: "c2", name: "Cold Storage PM+Reactive", responseWindowMin: 180 }],
  a3: [
    { id: "c3", name: "Sheng Siong Reactive", responseWindowMin: 480 },
    { id: "c3b", name: "Sheng Siong Enterprise Pilot", responseWindowMin: 120 },
  ],
  a4: [{ id: "c4", name: "Giant Legacy", responseWindowMin: 480 }],
  a5: [{ id: "c5", name: "Marketplace MNC SLA", responseWindowMin: 90 }],
};

export type Job = {
  id: string; // human ref, mono in UI
  status: JobStatus;
  type: JobType;
  criticality: Criticality;
  assetLabel: string;
  customer: string;
  site: string;
  assignedTo?: string; // technician name, undefined = unassigned
  /** Minutes to SLA response deadline; negative = breached. Undefined = no contract / no SLA. */
  slaMinutesRemaining?: number;
  /** ISO-ish display string for when it entered its current state. */
  updatedLabel: string;
};

export const JOBS: Job[] = [
  {
    id: "J-2041",
    status: "created",
    type: "alert",
    criticality: "critical",
    assetLabel: "REI-0417",
    customer: "FairPrice",
    site: "Bugis Junction",
    slaMinutesRemaining: 18,
    updatedLabel: "2m ago",
  },
  {
    id: "J-2040",
    status: "created",
    type: "ad_hoc",
    criticality: "standard",
    assetLabel: "REI-0588",
    customer: "Sheng Siong",
    site: "Tampines Ave 4",
    updatedLabel: "9m ago",
  },
  {
    id: "J-2039",
    status: "dispatched",
    type: "alert",
    criticality: "high",
    assetLabel: "REI-0602",
    customer: "Marketplace",
    site: "Paragon",
    assignedTo: "Wei Ming",
    slaMinutesRemaining: 62,
    updatedLabel: "14m ago",
  },
  {
    id: "J-2037",
    status: "accepted",
    type: "scheduled",
    criticality: "standard",
    assetLabel: "REI-0129",
    customer: "Giant",
    site: "IMM Jurong",
    assignedTo: "Rajesh",
    slaMinutesRemaining: 210,
    updatedLabel: "26m ago",
  },
  {
    id: "J-2035",
    status: "on_site",
    type: "alert",
    criticality: "critical",
    assetLabel: "REI-0312",
    customer: "Cold Storage",
    site: "Great World",
    assignedTo: "Suresh",
    slaMinutesRemaining: -24,
    updatedLabel: "41m ago",
  },
  {
    id: "J-2033",
    status: "resolved",
    type: "scheduled",
    criticality: "standard",
    assetLabel: "REI-0417",
    customer: "FairPrice",
    site: "Bugis Junction",
    assignedTo: "Rajesh",
    updatedLabel: "1h ago",
  },
  {
    id: "J-2031",
    status: "escalated",
    type: "alert",
    criticality: "critical",
    assetLabel: "REI-0602",
    customer: "Marketplace",
    site: "Paragon",
    assignedTo: "Suresh",
    slaMinutesRemaining: -95,
    updatedLabel: "1h ago",
  },
];
