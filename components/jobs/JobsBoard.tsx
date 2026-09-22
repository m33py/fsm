"use client";

import * as React from "react";
import { Search, MapPin, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { JobTypeChip } from "@/components/shared/JobTypeChip";
import { JobDetailSheet } from "@/components/jobs/JobDetailSheet";
import { JOB_TYPE, type JobStatus, type JobType } from "@/lib/status";
import { JOBS_HISTORY } from "@/lib/mock/jobs";
import type { Job } from "@/lib/mock/dispatch";

type StatusFilter = "all" | "open" | "resolved" | "escalated" | "closed";
type TypeFilter = JobType | "all";

const OPEN_STATUSES: JobStatus[] = ["created", "dispatched", "accepted", "on_site"];
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
  { value: "closed", label: "Closed" },
];

function matchesStatus(job: Job, f: StatusFilter): boolean {
  if (f === "all") return true;
  if (f === "open") return OPEN_STATUSES.includes(job.status);
  return job.status === f;
}

export function JobsBoard() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [detail, setDetail] = React.useState<Job | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS_HISTORY.filter((j) => {
      if (!matchesStatus(j, statusFilter)) return false;
      if (typeFilter !== "all" && j.type !== typeFilter) return false;
      if (!q) return true;
      return [j.id, j.assetLabel, j.customer, j.site, j.assignedTo ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, statusFilter, typeFilter]);

  const count = (f: StatusFilter) => JOBS_HISTORY.filter((j) => matchesStatus(j, f)).length;

  return (
    <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Jobs"
        description="The full job record — every job, including resolved and closed, searchable for audit and reporting."
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search job, asset, customer, site or technician…"
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(Object.keys(JOB_TYPE) as JobType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {JOB_TYPE[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label} <span className="text-text-muted">{count(t.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold text-text">
          {rows.length} {rows.length === 1 ? "job" : "jobs"}
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<ClipboardList className="size-6" />}
              title="No jobs match"
              description="Adjust the search, status tab, or type filter."
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted/60">
                    <TableHead className="w-[150px]">Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Customer / site</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((j) => (
                    <TableRow
                      key={j.id}
                      onClick={() => setDetail(j)}
                      className="cursor-pointer hover:bg-surface-muted/50"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={j.status} />
                          <span className="font-mono text-[10px] text-text-muted">{j.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <JobTypeChip type={j.type} />
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs font-medium text-text">{j.assetLabel}</div>
                        <div className="text-xs text-text-muted">{j.assetDesc}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-text">{j.customer}</div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <MapPin className="size-3" />
                          {j.site}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        {j.assignedTo ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">
                        {j.updatedLabel}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile list */}
            <div className="flex flex-col md:hidden">
              {rows.map((j) => (
                <div
                  key={j.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetail(j)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetail(j);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-2 border-b border-border p-4 outline-none last:border-b-0 focus-visible:bg-surface-muted/60 active:bg-surface-muted/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={j.status} />
                      <JobTypeChip type={j.type} />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">{j.id}</span>
                  </div>
                  <div className="font-mono text-sm font-semibold text-text">
                    {j.assetLabel}{" "}
                    <span className="font-sans font-normal text-text-muted">· {j.assetDesc}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="size-3.5 text-text-muted" />
                    {j.customer} · {j.site}
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{j.assignedTo ?? "Unassigned"}</span>
                    <span className="font-mono">{j.updatedLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Read-only detail (no escalate/reassign here — that's Dispatch's job) */}
      <JobDetailSheet job={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
