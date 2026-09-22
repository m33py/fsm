"use client";

import * as React from "react";
import { Search, MapPin, Package, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AssetDetailSheet } from "@/components/assets/AssetDetailSheet";
import { ASSET_RECORDS, type AssetLifecycle, type AssetRecord } from "@/lib/mock/assets";

type StatusFilter = AssetLifecycle | "all";
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "in_repair", label: "In repair" },
  { value: "decommissioned", label: "Decommissioned" },
];

export function AssetsBoard() {
  const [assets, setAssets] = React.useState<AssetRecord[]>(ASSET_RECORDS);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [unverifiedOnly, setUnverifiedOnly] = React.useState(false);
  const [detail, setDetail] = React.useState<AssetRecord | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (unverifiedOnly && a.verified) return false;
      if (!q) return true;
      return [a.label, a.desc, a.customer, a.site]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [assets, query, statusFilter, unverifiedOnly]);

  const unverifiedCount = assets.filter((a) => !a.verified).length;

  function verify(asset: AssetRecord) {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === asset.id
          ? {
              ...a,
              verified: true,
              history: [
                ...a.history,
                { field: "Verified" as const, detail: "Marked verified", at: "just now", by: "Christine", source: "admin_edit" as const },
              ],
            }
          : a
      )
    );
    setDetail((d) => (d && d.id === asset.id ? { ...d, verified: true } : d));
    toast.success(`${asset.label} verified`);
  }

  const statusCount = (s: StatusFilter) =>
    s === "all" ? assets.length : assets.filter((a) => a.status === s).length;

  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Assets"
        description="The refrigeration asset register — status, location, contracts, and full history."
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search label, type, customer or site…"
              className="pl-9"
            />
          </div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3">
            <Switch checked={unverifiedOnly} onCheckedChange={setUnverifiedOnly} />
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-text-secondary">
              <ShieldAlert className="size-3.5" />
              Unverified{unverifiedCount > 0 ? ` (${unverifiedCount})` : ""}
            </span>
          </label>
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label} <span className="text-text-muted">{statusCount(t.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold text-text">
          {rows.length} {rows.length === 1 ? "asset" : "assets"}
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Package className="size-6" />}
              title="No assets match"
              description="Adjust the search, status tab, or the unverified filter."
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted/60">
                    <TableHead>Asset</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow
                      key={a.id}
                      onClick={() => setDetail(a)}
                      className="cursor-pointer hover:bg-surface-muted/50"
                    >
                      <TableCell>
                        <div className="font-mono text-xs font-medium text-text">{a.label}</div>
                        <div className="text-xs text-text-muted">{a.desc}</div>
                      </TableCell>
                      <TableCell className="text-sm text-text">{a.customer}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                          <MapPin className="size-3 text-text-muted" />
                          {a.site}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <StatusBadge kind="asset" status={a.status} />
                          {!a.verified && <StatusBadge kind="asset" status="unverified" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">{a.lastService}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile list */}
            <div className="flex flex-col md:hidden">
              {rows.map((a) => (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetail(a)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetail(a);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-2 border-b border-border p-4 outline-none last:border-b-0 focus-visible:bg-surface-muted/60 active:bg-surface-muted/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-sm font-semibold text-text">{a.label}</div>
                      <div className="text-xs text-text-muted">{a.desc}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge kind="asset" status={a.status} />
                      {!a.verified && <StatusBadge kind="asset" status="unverified" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="size-3.5 text-text-muted" />
                    {a.customer} · {a.site}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <AssetDetailSheet asset={detail} onOpenChange={(o) => !o && setDetail(null)} onVerify={verify} />
    </div>
  );
}
