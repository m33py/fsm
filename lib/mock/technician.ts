/**
 * DEMO DATA — technician "My Jobs" flow. Stands in for the future Supabase fetch
 * (server component). Shapes mirror the intended schema: first-class job
 * timestamps (design-review dual response clock) and the resolution_outcome
 * lookup (design-review §2.2).
 */

import type { JobStatus, JobType } from "@/lib/status";

export type Resolution = "fixed" | "temporary_fix" | "no_access" | "revisit_required";

export const RESOLUTION: Record<Resolution, string> = {
  fixed: "Fixed",
  temporary_fix: "Temporary fix",
  no_access: "No access",
  revisit_required: "Revisit required",
};

/** First-class event timestamps (never derived) — the SLA-defensible dataset. */
export type JobTimestamps = {
  alertReceivedAt?: string;
  dispatchedAt?: string;
  acknowledgedAt?: string; // response_acknowledged_at — the tech half of the dual clock
  onSiteAt?: string;
  resolvedAt?: string;
  escalatedAt?: string;
};

export type Outcome = {
  note: string;
  photoCount: number;
  partsTouched: string[];
  resolution: Resolution;
};

export type TechJob = {
  id: string;
  assetLabel: string;
  assetDesc: string;
  customer: string;
  site: string;
  type: JobType;
  status: JobStatus; // dispatched | accepted | on_site | resolved | escalated
  slaMinutesRemaining: number;
  timestamps: JobTimestamps;
  outcome?: Outcome;
};

export const TECH_JOBS: TechJob[] = [
  {
    id: "J-2039",
    assetLabel: "REI-0930",
    assetDesc: "Display freezer",
    customer: "Haagen-Dazs",
    site: "ION Orchard",
    type: "alert",
    status: "dispatched",
    slaMinutesRemaining: -8,
    timestamps: { alertReceivedAt: "10:00", dispatchedAt: "10:15" },
  },
  {
    id: "J-2041",
    assetLabel: "REI-0421",
    assetDesc: "2-door chiller",
    customer: "FairPrice Finest",
    site: "Bugis Junction",
    type: "alert",
    status: "accepted",
    slaMinutesRemaining: 22,
    timestamps: { alertReceivedAt: "10:50", dispatchedAt: "11:01", acknowledgedAt: "11:05" },
  },
  {
    id: "J-2037",
    assetLabel: "REI-1187",
    assetDesc: "Walk-in freezer",
    customer: "Cold Storage",
    site: "Great World",
    type: "scheduled",
    status: "on_site",
    slaMinutesRemaining: 240,
    timestamps: {
      alertReceivedAt: "09:15",
      dispatchedAt: "09:30",
      acknowledgedAt: "09:35",
      onSiteAt: "10:02",
    },
  },
  {
    id: "J-2033",
    assetLabel: "REI-2205",
    assetDesc: "Blast chiller",
    customer: "Swensen's",
    site: "Jurong Point",
    type: "scheduled",
    status: "dispatched",
    slaMinutesRemaining: 180,
    timestamps: { alertReceivedAt: "08:00", dispatchedAt: "12:30" },
  },
  {
    id: "J-2028",
    assetLabel: "REI-0088",
    assetDesc: "Ice cream cabinet",
    customer: "Ben & Jerry's",
    site: "VivoCity",
    type: "ad_hoc",
    status: "resolved",
    slaMinutesRemaining: 0,
    timestamps: {
      alertReceivedAt: "08:30",
      dispatchedAt: "08:45",
      acknowledgedAt: "08:50",
      onSiteAt: "09:10",
      resolvedAt: "10:30",
    },
    outcome: {
      note: "Replaced compressor. Unit running normally.",
      photoCount: 2,
      partsTouched: ["compressor", "coolant lines"],
      resolution: "fixed",
    },
  },
];

export const REGISTER_CUSTOMERS = ["Cold Storage", "FairPrice Finest", "Haagen-Dazs", "Giant"];
export const REGISTER_SITES = ["Great World", "Bugis Junction", "ION Orchard", "IMM Jurong"];
export const REGISTER_SEGMENTS = ["FROST", "Legacy / Shopfit", "Enterprise / MNC"];
