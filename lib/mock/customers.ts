/**
 * DEMO DATA — customers (admin). Stands in for the future Supabase fetch.
 * A customer has many sites; assets live at sites; contracts link many-to-many.
 * Shapes mirror the intended schema.
 */

export type CustomerSegment = "FROST" | "Legacy / Shopfit" | "Enterprise / MNC";
export type CustomerStatus = "active" | "prospect" | "inactive";

export const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: "Active", bg: "--asset-active-bg", text: "--asset-active-text", dot: "--asset-active-dot" },
  prospect: { label: "Prospect", bg: "--status-dispatched-bg", text: "--status-dispatched-text", dot: "--status-dispatched-dot" },
  inactive: { label: "Inactive", bg: "--asset-decom-bg", text: "--asset-decom-text", dot: "--asset-decom-dot" },
};

export type CustomerSite = { name: string; assets: number };
export type CustomerContract = { name: string; active: boolean };
export type Contact = { name: string; role: string; phone: string; email: string };

export type Customer = {
  id: string;
  name: string;
  segment: CustomerSegment;
  status: CustomerStatus;
  sites: CustomerSite[];
  assets: number;
  contracts: CustomerContract[];
  contact: Contact;
};

export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "FairPrice",
    segment: "FROST",
    status: "active",
    sites: [
      { name: "Bugis Junction", assets: 6 },
      { name: "VivoCity", assets: 4 },
      { name: "Junction 8", assets: 3 },
    ],
    assets: 13,
    contracts: [{ name: "FairPrice FROST — 2025", active: true }],
    contact: { name: "Serene Tan", role: "Facilities Lead", phone: "+65 8123 4567", email: "serene.tan@fairprice.com.sg" },
  },
  {
    id: "c2",
    name: "Cold Storage",
    segment: "FROST",
    status: "active",
    sites: [
      { name: "Great World", assets: 5 },
      { name: "Jurong Point", assets: 2 },
    ],
    assets: 7,
    contracts: [{ name: "Cold Storage PM+Reactive", active: true }],
    contact: { name: "Marcus Lee", role: "Ops Manager", phone: "+65 9876 5432", email: "marcus.lee@coldstorage.com.sg" },
  },
  {
    id: "c3",
    name: "Sheng Siong",
    segment: "Legacy / Shopfit",
    status: "active",
    sites: [{ name: "Tampines Ave 4", assets: 3 }],
    assets: 3,
    contracts: [
      { name: "Sheng Siong Reactive", active: true },
      { name: "Sheng Siong Enterprise Pilot", active: false },
    ],
    contact: { name: "Wei Ling Ng", role: "Store Ops", phone: "+65 8222 1133", email: "weiling@shengsiong.com.sg" },
  },
  {
    id: "c4",
    name: "Giant",
    segment: "Legacy / Shopfit",
    status: "active",
    sites: [{ name: "IMM Jurong", assets: 4 }],
    assets: 4,
    contracts: [{ name: "Giant Legacy", active: true }],
    contact: { name: "Rahmat Ismail", role: "Maintenance", phone: "+65 9012 3344", email: "rahmat.i@giant.com.sg" },
  },
  {
    id: "c5",
    name: "Marketplace",
    segment: "Enterprise / MNC",
    status: "active",
    sites: [{ name: "Paragon", assets: 5 }],
    assets: 5,
    contracts: [{ name: "Marketplace MNC SLA", active: true }],
    contact: { name: "Priya Menon", role: "Regional FM", phone: "+65 8455 6677", email: "priya.menon@marketplace.com" },
  },
  {
    id: "c6",
    name: "7-Eleven",
    segment: "Legacy / Shopfit",
    status: "inactive",
    sites: [{ name: "Clarke Quay", assets: 0 }],
    assets: 0,
    contracts: [],
    contact: { name: "Daniel Koh", role: "Procurement", phone: "+65 9111 2222", email: "daniel.koh@7eleven.com.sg" },
  },
  {
    id: "c7",
    name: "NTUC Foodfare",
    segment: "Enterprise / MNC",
    status: "prospect",
    sites: [],
    assets: 0,
    contracts: [],
    contact: { name: "Aisyah Rahman", role: "Group Facilities", phone: "+65 8700 9090", email: "aisyah.r@foodfare.com.sg" },
  },
];

export const CUSTOMER_SEGMENTS: CustomerSegment[] = ["FROST", "Legacy / Shopfit", "Enterprise / MNC"];
