"use client";

import * as React from "react";
import { Plus, Search, AlertTriangle, Timer, Inbox, Activity } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { JobCard } from "@/components/jobs/JobCard";
import { NewJobForm } from "@/components/jobs/NewJobForm";
import { slaStateFromMinutes } from "@/components/shared/SlaChip";
import { JOB_STATUS, JOB_TYPE, type JobStatus, type JobType } from "@/lib/status";
import { JOBS, TECHNICIANS, type Job } from "@/lib/mock/dispatch";

/** Board lanes = the operational slice of the FSM (terminal "closed" lives off-board). */
const LANES: { status: JobStatus; title: string }[] = [
  { status: "created", title: "Unassigned" },
  { status: "dispatched", title: "Dispatched" },
  { status: "accepted", title: "Accepted / En-route" },
  { status: "on_site", title: "On-site" },
  { status: "resolved", title: "Resolved" },
  { status: "escalated", title: "Escalated" },
];

type TypeFilter = JobType | "all";

export function DispatchBoard() {
  const [jobs, setJobs] = React.useState<Job[]>(JOBS);
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [newOpen, setNewOpen] = React.useState(false);
  const [assignJob, setAssignJob] = React.useState<Job | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (typeFilter !== "all" && j.type !== typeFilter) return false;
      if (!q) return true;
      return [j.id, j.customer, j.site, j.assetLabel]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [jobs, query, typeFilter]);

  const stats = React.useMemo(() => {
    const unassigned = jobs.filter((j) => j.status === "created").length;
    const inProgress = jobs.filter((j) =>
      ["dispatched", "accepted", "on_site"].includes(j.status)
    ).length;
    let atRisk = 0;
    let breached = 0;
    for (const j of jobs) {
      if (j.slaMinutesRemaining === undefined) continue;
      const s = slaStateFromMinutes(j.slaMinutesRemaining);
      if (s === "at_risk") atRisk++;
      if (s === "breached") breached++;
    }
    return { unassigned, inProgress, atRisk, breached };
  }, [jobs]);

  function handleCreate(job: Job, dispatch: boolean) {
    setJobs((prev) => [job, ...prev]);
    setNewOpen(false);
    toast.success(
      dispatch
        ? `${job.id} created & dispatched to ${job.assignedTo}`
        : `${job.id} created — waiting on the board`
    );
  }

  function handleAssign(job: Job) {
    setAssignJob(job);
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

  return (
    <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Dispatch board"
        description="Every job, live — created, dispatched, and tracked here. Not in WhatsApp."
        action={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            New Job
          </Button>
        }
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Inbox className="size-4" />} label="Unassigned" value={stats.unassigned} />
        <StatTile icon={<Activity className="size-4" />} label="In progress" value={stats.inProgress} />
        <StatTile
          icon={<Timer className="size-4" />}
          label="SLA at risk"
          value={stats.atRisk}
          tone={stats.atRisk > 0 ? "warning" : undefined}
        />
        <StatTile
          icon={<AlertTriangle className="size-4" />}
          label="Breached"
          value={stats.breached}
          tone={stats.breached > 0 ? "danger" : undefined}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search job, customer, site, or asset tag…"
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

      {/* Lanes — horizontal scroll-snap board */}
      <div className="flex flex-1 gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_proximity]">
        {LANES.map((lane) => {
          const laneJobs = filtered.filter((j) => j.status === lane.status);
          const dot = JOB_STATUS[lane.status].dot;
          return (
            <section
              key={lane.status}
              className="flex w-72 shrink-0 flex-col gap-2 [scroll-snap-align:start]"
            >
              <div className="flex items-center gap-2 px-1">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: `var(${dot})` }}
                />
                <h2 className="text-sm font-semibold text-text">{lane.title}</h2>
                <span className="rounded-full bg-surface-muted px-1.5 text-xs font-medium text-text-secondary">
                  {laneJobs.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-surface-muted/50 p-2">
                {laneJobs.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-text-muted">Nothing here</p>
                ) : (
                  laneJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onAssign={lane.status === "created" ? handleAssign : undefined}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Search className="size-6" />}
          title="No jobs match your filters"
          description="Clear the search or type filter to see the full board."
        />
      )}

      {/* New Job slide-over (the one create/edit pattern) */}
      <Sheet open={newOpen} onOpenChange={setNewOpen}>
        <SheetContent
          side="right"
          title="New Job"
          description="Create a job and hand it to the board or a technician."
          className="sm:max-w-md"
        >
          <NewJobForm onCreate={handleCreate} onCancel={() => setNewOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Assign technician */}
      <Sheet open={assignJob !== null} onOpenChange={(o) => !o && setAssignJob(null)}>
        <SheetContent
          side="right"
          title={assignJob ? `Assign ${assignJob.id}` : "Assign"}
          description="Dispatch to a technician. Load shown so assignment is informed, not blind."
          className="sm:max-w-sm"
        >
          <div className="flex flex-col gap-1.5 p-4">
            {TECHNICIANS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => confirmAssign(t.name)}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-primary-tint/40"
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

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "warning" | "danger";
}) {
  const color =
    tone === "danger" ? "var(--danger)" : tone === "warning" ? "var(--warning)" : undefined;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
        <span style={color ? { color } : undefined}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
