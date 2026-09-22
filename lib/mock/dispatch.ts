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
  desc: string; // asset type, e.g. "Display freezer"
  customer: string;
  site: string;
};

export const ASSETS: AssetOption[] = [
  { id: "a1", label: "REI-0417", desc: "Display freezer", customer: "FairPrice", site: "Bugis Junction" },
  { id: "a2", label: "REI-0312", desc: "2-door chiller", customer: "Cold Storage", site: "Great World" },
  { id: "a3", label: "REI-0588", desc: "Door seal (chiller)", customer: "Sheng Siong", site: "Tampines Ave 4" },
  { id: "a4", label: "REI-0129", desc: "Blast chiller", customer: "Giant", site: "IMM Jurong" },
  { id: "a5", label: "REI-0602", desc: "Walk-in freezer", customer: "Marketplace", site: "Paragon" },
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

/** One row of the SLA timeline in the job-detail sheet. `time` undefined = not reached yet. */
export type JobEvent = { label: string; time?: string };

export type Job = {
  id: string; // human ref, mono in UI
  status: JobStatus;
  type: JobType;
  criticality: Criticality;
  assetLabel: string;
  assetDesc: string; // e.g. "2-door chiller"
  customer: string;
  site: string;
  assignedTo?: string; // technician name, undefined = unassigned
  /** Minutes to SLA response deadline; negative = breached. Undefined = no contract / no SLA. */
  slaMinutesRemaining?: number;
  /** Time in current state, for the Age column. */
  age: string;
  /** ISO-ish display string for when it entered its current state. */
  updatedLabel: string;
  note: string;
  /** Append-only SLA timeline (maps to alert_received_at → resolved_at). */
  events: JobEvent[];
};

export const JOBS: Job[] = [
  {
    id: "J-2031",
    status: "escalated",
    type: "alert",
    criticality: "critical",
    assetLabel: "REI-0602",
    assetDesc: "Walk-in freezer",
    customer: "Marketplace",
    site: "Paragon",
    assignedTo: "Suresh",
    slaMinutesRemaining: -95,
    age: "1h 42m",
    updatedLabel: "1h ago",
    note: "Compressor cycling irregularly; customer called twice.",
    events: [
      { label: "Alert received", time: "11:16" },
      { label: "Response dispatched", time: "11:22" },
      { label: "On-site", time: "11:58" },
      { label: "Resolved" },
    ],
  },
  {
    id: "J-2035",
    status: "on_site",
    type: "alert",
    criticality: "critical",
    assetLabel: "REI-0312",
    assetDesc: "2-door chiller",
    customer: "Cold Storage",
    site: "Great World",
    assignedTo: "Suresh",
    slaMinutesRemaining: -24,
    age: "54m",
    updatedLabel: "41m ago",
    note: "Temperature spike above 8°C sustained; on-site diagnosing.",
    events: [
      { label: "Alert received", time: "12:04" },
      { label: "Response dispatched", time: "12:10" },
      { label: "On-site", time: "12:38" },
      { label: "Resolved" },
    ],
  },
  {
    id: "J-2041",
    status: "created",
    type: "alert",
    criticality: "critical",
    assetLabel: "REI-0417",
    assetDesc: "Display freezer",
    customer: "FairPrice",
    site: "Bugis Junction",
    slaMinutesRemaining: 18,
    age: "8m",
    updatedLabel: "2m ago",
    note: "Chiller alarm active after power reset. No technician assigned yet.",
    events: [
      { label: "Alert received", time: "12:50" },
      { label: "Response dispatched" },
      { label: "On-site" },
      { label: "Resolved" },
    ],
  },
  {
    id: "J-2039",
    status: "dispatched",
    type: "alert",
    criticality: "high",
    assetLabel: "REI-0602",
    assetDesc: "Ice cream cabinet",
    customer: "Marketplace",
    site: "Paragon",
    assignedTo: "Wei Ming",
    slaMinutesRemaining: 62,
    age: "26m",
    updatedLabel: "14m ago",
    note: "Cabinet not holding setpoint; en route.",
    events: [
      { label: "Alert received", time: "12:32" },
      { label: "Response dispatched", time: "12:36" },
      { label: "On-site" },
      { label: "Resolved" },
    ],
  },
  {
    id: "J-2037",
    status: "accepted",
    type: "scheduled",
    criticality: "standard",
    assetLabel: "REI-0129",
    assetDesc: "Blast chiller",
    customer: "Giant",
    site: "IMM Jurong",
    assignedTo: "Rajesh",
    slaMinutesRemaining: 210,
    age: "32m",
    updatedLabel: "26m ago",
    note: "Quarterly preventive maintenance. Technician acknowledged.",
    events: [
      { label: "Scheduled", time: "13:00" },
      { label: "Response dispatched", time: "13:04" },
      { label: "On-site" },
      { label: "Resolved" },
    ],
  },
  {
    id: "J-2040",
    status: "created",
    type: "ad_hoc",
    criticality: "standard",
    assetLabel: "REI-0588",
    assetDesc: "Door seal (chiller)",
    customer: "Sheng Siong",
    site: "Tampines Ave 4",
    age: "9m",
    updatedLabel: "9m ago",
    note: "Door seal replacement requested by site manager. Ad-hoc, no contract.",
    events: [
      { label: "Reported", time: "12:49" },
      { label: "Response dispatched" },
      { label: "On-site" },
      { label: "Resolved" },
    ],
  },
  {
    id: "J-2033",
    status: "resolved",
    type: "scheduled",
    criticality: "standard",
    assetLabel: "REI-0417",
    assetDesc: "Display freezer",
    customer: "FairPrice",
    site: "Bugis Junction",
    assignedTo: "Rajesh",
    age: "2h 14m",
    updatedLabel: "1h ago",
    note: "Thermostat replaced and tested. Awaiting admin verification.",
    events: [
      { label: "Alert received", time: "10:02" },
      { label: "Response dispatched", time: "10:14" },
      { label: "On-site", time: "10:42" },
      { label: "Resolved", time: "11:08" },
    ],
  },
];
