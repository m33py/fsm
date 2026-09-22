/**
 * DEMO DATA — contracts (admin). Stands in for the future Supabase fetch.
 * SLA parameters are admin-editable fields ON the contract (CLAUDE.md): response
 * window, cutoff time, fulfillment window. Contract ↔ asset is many-to-many.
 */

export type ContractStatus = "active" | "expiring_soon" | "expired";

export const CONTRACT_STATUS: Record<
  ContractStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  active: { label: "Active", bg: "--asset-active-bg", text: "--asset-active-text", dot: "--asset-active-dot" },
  expiring_soon: { label: "Expiring soon", bg: "--sla-atrisk-bg", text: "--sla-atrisk-text", dot: "--asset-repair-dot" },
  expired: { label: "Expired", bg: "--asset-decom-bg", text: "--asset-decom-text", dot: "--asset-decom-dot" },
};

export type Contract = {
  id: string;
  name: string;
  customer: string;
  status: ContractStatus;
  coverage: string; // "Preventive + Reactive", "Reactive only", …
  startDate: string;
  endDate: string;
  assetsCovered: number;
  // SLA parameters (editable fields on the contract)
  responseWindowMin: number;
  cutoffTime: string; // alerts after this roll to next day
  fulfillmentWindowHrs: number;
};

export const CONTRACTS: Contract[] = [
  {
    id: "ct1",
    name: "FairPrice FROST — 2025",
    customer: "FairPrice",
    status: "active",
    coverage: "Preventive + Reactive",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    assetsCovered: 13,
    responseWindowMin: 240,
    cutoffTime: "18:00",
    fulfillmentWindowHrs: 48,
  },
  {
    id: "ct2",
    name: "Cold Storage PM+Reactive",
    customer: "Cold Storage",
    status: "active",
    coverage: "Preventive + Reactive",
    startDate: "2024-07-01",
    endDate: "2025-06-30",
    assetsCovered: 7,
    responseWindowMin: 180,
    cutoffTime: "17:00",
    fulfillmentWindowHrs: 24,
  },
  {
    id: "ct3",
    name: "Sheng Siong Reactive",
    customer: "Sheng Siong",
    status: "expiring_soon",
    coverage: "Reactive only",
    startDate: "2024-11-01",
    endDate: "2025-10-31",
    assetsCovered: 3,
    responseWindowMin: 480,
    cutoffTime: "16:00",
    fulfillmentWindowHrs: 72,
  },
  {
    id: "ct4",
    name: "Giant Legacy",
    customer: "Giant",
    status: "active",
    coverage: "Reactive only",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    assetsCovered: 4,
    responseWindowMin: 480,
    cutoffTime: "17:30",
    fulfillmentWindowHrs: 72,
  },
  {
    id: "ct5",
    name: "Marketplace MNC SLA",
    customer: "Marketplace",
    status: "active",
    coverage: "Preventive + Reactive + Reporting",
    startDate: "2025-01-15",
    endDate: "2027-01-14",
    assetsCovered: 5,
    responseWindowMin: 90,
    cutoffTime: "20:00",
    fulfillmentWindowHrs: 12,
  },
  {
    id: "ct6",
    name: "Swensen's Ad-hoc (lapsed)",
    customer: "Swensen's",
    status: "expired",
    coverage: "Reactive only",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    assetsCovered: 0,
    responseWindowMin: 480,
    cutoffTime: "16:00",
    fulfillmentWindowHrs: 72,
  },
];

export const CONTRACT_COVERAGES = [
  "Preventive + Reactive",
  "Reactive only",
  "Preventive + Reactive + Reporting",
];
