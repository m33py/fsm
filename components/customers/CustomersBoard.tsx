"use client";

import * as React from "react";
import { Search, MapPin, Package, FileText, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CustomerStatusBadge } from "@/components/customers/CustomerStatusBadge";
import { CustomerDetailSheet } from "@/components/customers/CustomerDetailSheet";
import {
  CUSTOMERS,
  CUSTOMER_SEGMENTS,
  type Customer,
  type CustomerSegment,
} from "@/lib/mock/customers";

type SegFilter = CustomerSegment | "all";

export function CustomersBoard() {
  const [query, setQuery] = React.useState("");
  const [seg, setSeg] = React.useState<SegFilter>("all");
  const [detail, setDetail] = React.useState<Customer | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return CUSTOMERS.filter((c) => {
      if (seg !== "all" && c.segment !== seg) return false;
      if (!q) return true;
      return [c.name, c.segment, c.contact.name, ...c.sites.map((s) => s.name)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, seg]);

  const segCount = (s: SegFilter) =>
    s === "all" ? CUSTOMERS.length : CUSTOMERS.filter((c) => c.segment === s).length;

  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Customers"
        description="Customer accounts — sites, assets, contracts, and contacts."
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, contact or site…"
            className="pl-9"
          />
        </div>
        <Tabs value={seg} onValueChange={(v) => setSeg(v as SegFilter)}>
          <TabsList>
            <TabsTrigger value="all">
              All <span className="text-text-muted">{segCount("all")}</span>
            </TabsTrigger>
            {CUSTOMER_SEGMENTS.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s} <span className="text-text-muted">{segCount(s)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold text-text">
          {rows.length} {rows.length === 1 ? "customer" : "customers"}
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Building2 className="size-6" />}
              title="No customers match"
              description="Adjust the search or segment filter."
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted/60">
                    <TableHead>Customer</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Sites</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead>Contracts</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow
                      key={c.id}
                      onClick={() => setDetail(c)}
                      className="cursor-pointer hover:bg-surface-muted/50"
                    >
                      <TableCell>
                        <div className="text-sm font-medium text-text">{c.name}</div>
                        <div className="text-xs text-text-muted">{c.contact.name}</div>
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">{c.segment}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{c.sites.length}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{c.assets}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{c.contracts.length}</TableCell>
                      <TableCell>
                        <CustomerStatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile list */}
            <div className="flex flex-col md:hidden">
              {rows.map((c) => (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetail(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetail(c);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-2 border-b border-border p-4 outline-none last:border-b-0 focus-visible:bg-surface-muted/60 active:bg-surface-muted/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-text">{c.name}</div>
                      <div className="text-xs text-text-muted">{c.contact.name}</div>
                    </div>
                    <CustomerStatusBadge status={c.status} />
                  </div>
                  <div className="text-xs text-text-secondary">{c.segment}</div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {c.sites.length} sites
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="size-3.5" />
                      {c.assets} assets
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3.5" />
                      {c.contracts.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <CustomerDetailSheet customer={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
