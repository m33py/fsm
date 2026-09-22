"use client";

import * as React from "react";
import { Search, FileText, Building2 } from "lucide-react";
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
import {
  ContractStatusBadge,
  formatWindow,
} from "@/components/contracts/ContractStatusBadge";
import { ContractDetailSheet } from "@/components/contracts/ContractDetailSheet";
import { CONTRACTS, type Contract, type ContractStatus } from "@/lib/mock/contracts";

type StatusFilter = ContractStatus | "all";
const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expiring_soon", label: "Expiring soon" },
  { value: "expired", label: "Expired" },
];

export function ContractsBoard() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [detail, setDetail] = React.useState<Contract | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONTRACTS.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (!q) return true;
      return [c.name, c.customer, c.segment, c.coverage].join(" ").toLowerCase().includes(q);
    });
  }, [query, status]);

  const count = (s: StatusFilter) =>
    s === "all" ? CONTRACTS.length : CONTRACTS.filter((c) => c.status === s).length;

  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Contracts"
        description="Service contracts and their SLA parameters — response windows, coverage, terms."
      />

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contract, customer or coverage…"
            className="pl-9"
          />
        </div>
        <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label} <span className="text-text-muted">{count(t.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold text-text">
          {rows.length} {rows.length === 1 ? "contract" : "contracts"}
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<FileText className="size-6" />}
              title="No contracts match"
              description="Adjust the search or status filter."
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted/60">
                    <TableHead>Contract</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead>Ends</TableHead>
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
                      <TableCell className="text-sm font-medium text-text">{c.name}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{c.customer}</TableCell>
                      <TableCell className="text-xs text-text-secondary">{c.coverage}</TableCell>
                      <TableCell className="font-mono text-xs text-text-secondary">
                        {formatWindow(c.responseWindowMin)}
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">{c.assetsCovered}</TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">{c.endDate}</TableCell>
                      <TableCell>
                        <ContractStatusBadge status={c.status} />
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
                    <div className="text-sm font-semibold text-text">{c.name}</div>
                    <ContractStatusBadge status={c.status} />
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-text-secondary">
                    <Building2 className="size-3.5 text-text-muted" />
                    {c.customer} · {c.coverage}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="font-mono">Resp {formatWindow(c.responseWindowMin)}</span>
                    <span>{c.assetsCovered} assets</span>
                    <span className="font-mono">Ends {c.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <ContractDetailSheet contract={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
