"use client";

import * as React from "react";
import { ArrowLeft, Cloud, CloudOff, MapPin, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobTypeChip } from "@/components/shared/JobTypeChip";
import { SlaChip, slaStateFromMinutes } from "@/components/shared/SlaChip";
import { OutcomeSheet } from "@/components/technician/OutcomeSheet";
import { cn } from "@/lib/utils";
import { RESOLUTION, TECH_JOBS, type Outcome, type TechJob } from "@/lib/mock/technician";

function nowLabel() {
  return new Date().toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
}

/** breached → at-risk → active → resolved */
function sortKey(j: TechJob): number {
  if (j.status === "resolved") return 3;
  const s = slaStateFromMinutes(j.slaMinutesRemaining);
  return s === "breached" ? 0 : s === "at_risk" ? 1 : 2;
}

type StepState = "complete" | "current" | "pending";

function TimelineStep({
  label,
  time,
  state,
  last,
}: {
  label: string;
  time?: string;
  state: StepState;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full border-2",
            state === "complete" && "border-success bg-success",
            state === "current" && "border-primary bg-primary",
            state === "pending" && "border-border bg-background"
          )}
        >
          {state === "complete" && <CheckCircle2 className="size-4 text-white" />}
          {state === "current" && <span className="size-2 rounded-full bg-white" />}
        </span>
        {!last && <span className="mt-1 h-8 w-0.5 bg-border" />}
      </div>
      <div className="pb-6">
        <p className={cn("text-sm font-medium", state === "pending" ? "text-text-muted" : "text-text")}>
          {label}
        </p>
        {time && <p className="font-mono text-xs text-text-muted">{time}</p>}
      </div>
    </div>
  );
}

export function MyJobs() {
  const [jobs, setJobs] = React.useState<TechJob[]>(TECH_JOBS);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState(true);
  const [queued, setQueued] = React.useState<string[]>([]);
  const [outcomeOpen, setOutcomeOpen] = React.useState(false);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;
  const sorted = React.useMemo(() => [...jobs].sort((a, b) => sortKey(a) - sortKey(b)), [jobs]);

  function patch(id: string, fn: (j: TechJob) => TechJob) {
    setJobs((prev) => prev.map((j) => (j.id === id ? fn(j) : j)));
  }

  /** Queue-and-sync: offline actions are recorded and flagged, not lost. */
  function record(id: string, action: string) {
    if (!online) {
      setQueued((q) => [...q, `${id}-${action}`]);
      toast.message("Queued — will sync when back online");
    }
  }

  function accept(job: TechJob) {
    patch(job.id, (j) => ({
      ...j,
      status: "accepted",
      timestamps: { ...j.timestamps, acknowledgedAt: nowLabel() },
    }));
    record(job.id, "accept");
    if (online) toast.success(`${job.id} accepted`);
  }

  function arrive(job: TechJob) {
    patch(job.id, (j) => ({
      ...j,
      status: "on_site",
      timestamps: { ...j.timestamps, onSiteAt: nowLabel() },
    }));
    record(job.id, "arrive");
    if (online) toast.success(`Arrived on-site · ${job.id}`);
  }

  function resolve(outcome: Outcome) {
    if (!selected) return;
    patch(selected.id, (j) => ({
      ...j,
      status: "resolved",
      timestamps: { ...j.timestamps, resolvedAt: nowLabel() },
      outcome,
    }));
    record(selected.id, "resolve");
    setOutcomeOpen(false);
    if (online) toast.success(`${selected.id} resolved · ${RESOLUTION[outcome.resolution]}`);
  }

  function escalate() {
    if (!selected) return;
    patch(selected.id, (j) => ({
      ...j,
      status: "escalated",
      timestamps: { ...j.timestamps, escalatedAt: nowLabel() },
    }));
    record(selected.id, "escalate");
    setOutcomeOpen(false);
    if (online) toast.warning(`${selected.id} escalated`);
  }

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      {/* Connectivity bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-2.5">
        <div className="text-sm">
          <span className="font-semibold text-text">My Jobs</span>
          <span className="ml-2 text-xs text-text-muted">Rajesh</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              online ? "bg-[var(--sla-ok-bg)] text-text-secondary" : "bg-[var(--sla-atrisk-bg)] text-warning"
            )}
            style={online ? undefined : { color: "var(--sla-atrisk-text)" }}
          >
            {online ? <Cloud className="size-3.5" /> : <CloudOff className="size-3.5" />}
            {online ? "Online" : `Offline · ${queued.length} queued`}
          </span>
          {/* Demo-only: real offline is auto-detected, never toggled by the tech. */}
          <button
            onClick={() => setOnline((o) => !o)}
            className="text-[11px] text-text-muted underline underline-offset-2"
            title="Demo control — simulates connectivity loss"
          >
            {online ? "Simulate offline" : "Go online"}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {selected ? (
          <JobDetail
            job={selected}
            onBack={() => setSelectedId(null)}
            onAccept={() => accept(selected)}
            onArrive={() => arrive(selected)}
            onLogResolve={() => setOutcomeOpen(true)}
            queued={queued.some((q) => q.startsWith(selected.id))}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Today&apos;s jobs</p>
            {sorted.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedId(job.id)}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-text-muted"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] text-text-muted">{job.id}</div>
                    <div className="text-sm font-semibold text-text">{job.assetDesc}</div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="flex items-center gap-2">
                  <JobTypeChip type={job.type} />
                  {job.status !== "resolved" && <SlaChip minutesRemaining={job.slaMinutesRemaining} />}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <MapPin className="size-3.5 text-text-muted" />
                  {job.customer} · {job.site}
                </div>
                {queued.some((q) => q.startsWith(job.id)) && (
                  <div className="inline-flex items-center gap-1.5 self-start rounded bg-[var(--sla-atrisk-bg)] px-2 py-1 text-xs font-medium text-warning">
                    <Zap className="size-3" />
                    Queued — will sync
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <OutcomeSheet
        job={selected}
        open={outcomeOpen}
        onOpenChange={setOutcomeOpen}
        onResolve={resolve}
        onEscalate={escalate}
      />
    </div>
  );
}

function JobDetail({
  job,
  onBack,
  onAccept,
  onArrive,
  onLogResolve,
  queued,
}: {
  job: TechJob;
  onBack: () => void;
  onAccept: () => void;
  onArrive: () => void;
  onLogResolve: () => void;
  queued: boolean;
}) {
  const t = job.timestamps;
  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 self-start text-xs font-medium text-text-secondary">
        <ArrowLeft className="size-3.5" />
        Back to jobs
      </button>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-mono text-[11px] text-text-muted">{job.id}</div>
            <div className="text-base font-bold text-text">{job.assetDesc}</div>
            <div className="font-mono text-xs text-text-secondary">{job.assetLabel}</div>
          </div>
          <StatusBadge status={job.status} />
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
          <MapPin className="size-3.5 text-text-muted" />
          {job.customer} · {job.site}
        </div>
      </div>

      {/* SLA timeline */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-4 text-xs font-bold text-text">SLA timeline</p>
        <TimelineStep label="Alert received" time={t.alertReceivedAt} state="complete" />
        <TimelineStep label="Dispatched" time={t.dispatchedAt} state="complete" />
        {t.acknowledgedAt ? (
          <TimelineStep label="Acknowledged" time={t.acknowledgedAt} state="complete" />
        ) : (
          <TimelineStep label="Acknowledge receipt" state={job.status === "dispatched" ? "current" : "pending"} />
        )}
        {t.onSiteAt ? (
          <TimelineStep label="Arrived on-site" time={t.onSiteAt} state="complete" />
        ) : (
          <TimelineStep label="Arrive on-site" state={job.status === "accepted" ? "current" : "pending"} />
        )}
        {t.escalatedAt ? (
          <TimelineStep label="Escalated" time={t.escalatedAt} state="complete" last />
        ) : t.resolvedAt ? (
          <TimelineStep label="Resolved" time={t.resolvedAt} state="complete" last />
        ) : (
          <TimelineStep label="Resolve" state={job.status === "on_site" ? "current" : "pending"} last />
        )}
      </div>

      {/* Resolved outcome preview */}
      {job.status === "resolved" && job.outcome && (
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: "var(--status-resolved-bg)", borderColor: "var(--status-resolved-dot)" }}
        >
          <p className="text-xs font-bold" style={{ color: "var(--status-resolved-text)" }}>
            Outcome: {RESOLUTION[job.outcome.resolution]}
          </p>
          {job.outcome.note && (
            <p className="mt-1 text-xs" style={{ color: "var(--status-resolved-text)" }}>
              {job.outcome.note}
            </p>
          )}
          {job.outcome.partsTouched.length > 0 && (
            <p className="mt-1 text-xs" style={{ color: "var(--status-resolved-text)" }}>
              Parts: {job.outcome.partsTouched.join(", ")}
            </p>
          )}
        </div>
      )}

      {queued && (
        <div className="inline-flex items-center gap-1.5 self-start rounded bg-[var(--sla-atrisk-bg)] px-2 py-1 text-xs font-medium text-warning">
          <Zap className="size-3" />
          Queued — will sync
        </div>
      )}

      {/* Status-driven primary action */}
      {job.status === "dispatched" && (
        <Button className="h-12" onClick={onAccept}>
          Accept / En-route
        </Button>
      )}
      {job.status === "accepted" && (
        <Button className="h-12" onClick={onArrive}>
          I&apos;ve arrived on-site
        </Button>
      )}
      {job.status === "on_site" && (
        <Button className="h-12" onClick={onLogResolve}>
          Log &amp; resolve
        </Button>
      )}
    </div>
  );
}
