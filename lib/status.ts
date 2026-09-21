/**
 * Status lookups — the single mapping from a status to its design tokens.
 *
 * These TS constants stand in for the future DB lookup tables (`job_statuses`,
 * `asset_statuses`). `StatusBadge` reads from here, so a status's color is
 * defined once (here + the CSS vars in globals.css), never inline per screen.
 */

type Tone = { label: string; bg: string; text: string; dot: string };

export type JobStatus =
  | "created"
  | "dispatched"
  | "accepted"
  | "on_site"
  | "resolved"
  | "escalated"
  | "closed";

export const JOB_STATUS: Record<JobStatus, Tone> = {
  created: { label: "Created", bg: "--status-created-bg", text: "--status-created-text", dot: "--status-created-dot" },
  dispatched: { label: "Dispatched", bg: "--status-dispatched-bg", text: "--status-dispatched-text", dot: "--status-dispatched-dot" },
  accepted: { label: "Accepted / En-route", bg: "--status-accepted-bg", text: "--status-accepted-text", dot: "--status-accepted-dot" },
  on_site: { label: "On-site", bg: "--status-onsite-bg", text: "--status-onsite-text", dot: "--status-onsite-dot" },
  resolved: { label: "Resolved", bg: "--status-resolved-bg", text: "--status-resolved-text", dot: "--status-resolved-dot" },
  escalated: { label: "Escalated", bg: "--status-escalated-bg", text: "--status-escalated-text", dot: "--status-escalated-dot" },
  closed: { label: "Verified / Closed", bg: "--status-closed-bg", text: "--status-closed-text", dot: "--status-closed-dot" },
};

export type AssetStatus = "active" | "in_repair" | "decommissioned" | "unverified";

export const ASSET_STATUS: Record<AssetStatus, Tone> = {
  active: { label: "Active", bg: "--asset-active-bg", text: "--asset-active-text", dot: "--asset-active-dot" },
  in_repair: { label: "In repair", bg: "--asset-repair-bg", text: "--asset-repair-text", dot: "--asset-repair-dot" },
  decommissioned: { label: "Decommissioned", bg: "--asset-decom-bg", text: "--asset-decom-text", dot: "--asset-decom-dot" },
  unverified: { label: "Unverified", bg: "--asset-unverified-bg", text: "--asset-unverified-text", dot: "--asset-unverified-dot" },
};

export type JobType = "alert" | "scheduled" | "ad_hoc";

export const JOB_TYPE: Record<JobType, string> = {
  alert: "Alert",
  scheduled: "Scheduled",
  ad_hoc: "Ad-hoc",
};

export type SlaState = "ok" | "at_risk" | "breached";

export const SLA_STATE: Record<SlaState, { bg: string; text: string }> = {
  ok: { bg: "--sla-ok-bg", text: "--sla-ok-text" },
  at_risk: { bg: "--sla-atrisk-bg", text: "--sla-atrisk-text" },
  breached: { bg: "--sla-breached-bg", text: "--sla-breached-text" },
};
