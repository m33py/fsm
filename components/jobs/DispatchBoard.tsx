"use client";

import * as React from "react";
import {
  Plus,
  Search,
  AlertTriangle,
  MapPin,
  ClipboardList,
  Gauge,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobTypeChip } from "@/components/shared/JobTypeChip";
import { SlaChip, slaStateFromMinutes } from "@/components/shared/SlaChip";
import { NewJobForm } from "@/components/jobs/NewJobForm";
import { JobDetailSheet } from "@/components/jobs/JobDetailSheet";
import { JOB_TYPE, type JobType } from "@/lib/status";
import { JOBS, TECHNICIANS, type Job } from "@/lib/mock/dispatch";
import { cn } from "@/lib/utils";

type TypeFilter = JobType | "all";

/** SLA-urgency sort key: breached first, then at-risk, then by minutes remaining. */
function urgencyRank(j: Job): number {
  if (j.slaMinutesRemaining === undefined) return 3;
  const s = slaStateFromMinutes(j.slaMinutesRemaining);
  return s === "breached" ? 0 : s === "at_risk" ? 1 : 2;
}

export function DispatchBoard() {
  const [jobs, setJobs] = React.useState<Job[]>(JOBS);
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [riskOnly, setRiskOnly] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [detailJob, setDetailJob] = React.useState<Job | null>(null);
  const [assignJob, setAssignJob] = React.useState<Job | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => {
        if (typeFilter !== "all" && j.type !== typeFilter) return false;
        if (riskOnly) {
          if (j.slaMinutesRemaining === undefined) return false;
          if (slaStateFromMinutes(j.slaMinutesRemaining) === "ok") return false;
        }
        if (!q) return true;
        return [j.id, j.assetLabel, j.customer, j.site, j.assignedTo ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        const r = urgencyRank(a) - urgencyRank(b);
        if (r !== 0) return r;
        return (a.slaMinutesRemaining ?? 1e9) - (b.slaMinutesRemaining ?? 1e9);
      });
  }, [jobs, query, typeFilter, riskOnly]);

  const stats = React.useMemo(() => {
    const open = jobs.filter((j) => !["resolved", "closed"].includes(j.status)).length;
    const onSite = jobs.filter((j) => j.status === "on_site").length;
    let atRisk = 0;
    for (const j of jobs) {
      if (j.slaMinutesRemaining === undefined) continue;
      if (slaStateFromMinutes(j.slaMinutesRemaining) !== "ok") atRisk++;
    }
    const activeTechs = new Set(jobs.filter((j) => j.assignedTo).map((j) => j.assignedTo)).size;
    return { open, onSite, atRisk, activeTechs };
  }, [jobs]);

  const typeCount = (t: TypeFilter) =>
    t === "all" ? jobs.length : jobs.filter((j) => j.type === t).length;

  function handleCreate(job: Job, dispatch: boolean) {
    setJobs((prev) => [job, ...prev]);
    setNewOpen(false);
    toast.success(
      dispatch
        ? `${job.id} created & dispatched to ${job.assignedTo}`
        : `${job.id} created — waiting in the queue`
    );
  }

  function confirmAssign(techName: string) {
    if (!assignJob) return;
    const id = assignJob.id;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: "dispatched", assignedTo: techName, updatedLabel: "just now" }
          : j
      )
    );
    toast.success(`${id} dispatched to ${techName}`);
    setAssignJob(null);
  }

  function handleEscalate(job: Job) {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: "escalated" } : j))
    );
    toast.warning(`${job.id} escalated`);
    setDetailJob(null);
  }

  return (
    <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Dispatch"
        description="Track, assign, and dispatch service jobs — sorted by SLA urgency."
        action={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            New Job
          </Button>
        }
      />

      {/* Toolbar: search · SLA-at-risk toggle · job-type tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, assets, sites or technicians…"
              className="pl-9"
            />
          </div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3">
            <Switch checked={riskOnly} onCheckedChange={setRiskOnly} />
            <span className="whitespace-nowrap text-xs font-medium text-text-secondary">
              SLA at risk
            </span>
          </label>
        </div>
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <TabsList>
            <TabsTrigger value="all">
              All <span className="text-text-muted">{typeCount("all")}</span>
            </TabsTrigger>
            {(Object.keys(JOB_TYPE) as JobType[]).map((t) => (
              <TabsTrigger key={t} value={t}>
                {JOB_TYPE[t]} <span className="text-text-muted">{typeCount(t)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open jobs" value={stats.open} icon={<ClipboardList className="size-4" />} />
        <StatCard
          label="At risk"
          value={stats.atRisk}
          icon={<AlertTriangle className="size-4" />}
          tone={stats.atRisk > 0 ? "danger" : undefined}
        />
        <StatCard label="On-site" value={stats.onSite} icon={<MapPin className="size-4" />} />
        <StatCard
          label="Techs active"
          value={stats.activeTechs}
          suffix={` / ${TECHNICIANS.length}`}
          icon={<Gauge className="size-4" />}
        />
      </div>

      {/* Live job queue */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-text">Live job queue</div>
            <div className="mt-0.5 text-xs text-text-muted">
              {rows.length} {rows.length === 1 ? "job" : "jobs"} · sorted by SLA urgency
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Search className="size-6" />}
              title="No jobs match"
              description="Adjust the search, type tab, or the SLA-at-risk toggle."
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
                    <TableHead>SLA countdown</TableHead>
                    <TableHead>Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((job) => {
                    const atRisk =
                      job.slaMinutesRemaining !== undefined &&
                      slaStateFromMinutes(job.slaMinutesRemaining) !== "ok";
                    return (
                      <TableRow
                        key={job.id}
                        onClick={() => setDetailJob(job)}
                        className={cn(
                          "cursor-pointer hover:bg-surface-muted/50",
                          atRisk && "bg-[var(--sla-breached-bg)]/30"
                        )}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={job.status} />
                            <span className="font-mono text-[10px] text-text-muted">{job.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <JobTypeChip type={job.type} />
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs font-medium text-text">
                            {job.assetLabel}
                          </div>
                          <div className="text-xs text-text-muted">{job.assetDesc}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px] text-sm font-medium text-text">
                            {job.customer}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <MapPin className="size-3" />
                            {job.site}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TechCell job={job} onAssign={() => setAssignJob(job)} />
                        </TableCell>
                        <TableCell>
                          {job.slaMinutesRemaining !== undefined ? (
                            <SlaChip minutesRemaining={job.slaMinutesRemaining} />
                          ) : (
                            <span className="text-xs text-text-muted">No SLA</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-text-muted">{job.age}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile stacked list */}
            <div className="flex flex-col md:hidden">
              {rows.map((job) => (
                <div
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailJob(job)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailJob(job);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-3 border-b border-border p-4 text-left outline-none last:border-b-0 focus-visible:bg-surface-muted/60 active:bg-surface-muted/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      <JobTypeChip type={job.type} />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">{job.id}</span>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold text-text">
                      {job.assetLabel}{" "}
                      <span className="font-sans font-normal text-text-muted">· {job.assetDesc}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                      <MapPin className="size-3.5" />
                      {job.customer} — {job.site}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <TechCell job={job} onAssign={() => setAssignJob(job)} />
                    <div className="flex flex-col items-end gap-1">
                      {job.slaMinutesRemaining !== undefined ? (
                        <SlaChip minutesRemaining={job.slaMinutesRemaining} />
                      ) : (
                        <span className="text-[11px] text-text-muted">No SLA</span>
                      )}
                      <span className="font-mono text-[10px] text-text-muted">Age {job.age}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* New Job slide-over */}
      <Sheet open={newOpen} onOpenChange={setNewOpen}>
        <SheetContent
          side="right"
          title="New Job"
          description="Create a job and hand it to the queue or a technician."
          className="sm:max-w-md"
        >
          <NewJobForm onCreate={handleCreate} onCancel={() => setNewOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Job detail */}
      <JobDetailSheet
        job={detailJob}
        onOpenChange={(o) => !o && setDetailJob(null)}
        onEscalate={handleEscalate}
        onReassign={(j) => {
          setDetailJob(null);
          setAssignJob(j);
        }}
      />

      {/* Assign / reassign technician */}
      <Sheet open={assignJob !== null} onOpenChange={(o) => !o && setAssignJob(null)}>
        <SheetContent
          side="right"
          title={assignJob ? `Assign ${assignJob.id}` : "Assign"}
          description="Select a technician to dispatch. Current job load is shown for each."
          className="sm:max-w-sm"
        >
          <div className="flex flex-col gap-1.5 p-4">
            {TECHNICIANS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => confirmAssign(t.name)}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-left transition-colors hover:border-primary hover:bg-primary-tint/40"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary">
                    {t.name.slice(0, 1)}
                  </span>
                  <span className="text-sm font-medium text-text">{t.name}</span>
                </span>
                <span className="text-xs text-text-muted">{t.activeJobs} active</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TechCell({ job, onAssign }: { job: Job; onAssign: () => void }) {
  if (job.assignedTo) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-text">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary-tint text-[10px] font-semibold text-primary">
          {job.assignedTo.slice(0, 1)}
        </span>
        <span className="whitespace-nowrap">{job.assignedTo}</span>
      </span>
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onAssign();
      }}
    >
      <UserPlus className="size-3.5" />
      Assign
    </Button>
  );
}

function StatCard({
  label,
  value,
  icon,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
  tone?: "danger";
}) {
  const color = tone === "danger" ? "var(--danger)" : undefined;
  return (
    <Card
      className={cn(tone === "danger" && value > 0 && "border-[var(--danger)]/40")}
      style={tone === "danger" && value > 0 ? { backgroundColor: "var(--sla-breached-bg)" } : undefined}
    >
      <CardContent className="p-3 pt-3">
        <div
          className="flex items-center justify-between text-xs font-medium text-text-secondary"
          style={color ? { color } : undefined}
        >
          <span>{label}</span>
          {icon}
        </div>
        <div className="mt-1 text-2xl font-semibold text-text" style={color ? { color } : undefined}>
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-text-muted">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
