"use client";

import { MapPin, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobTypeChip } from "@/components/shared/JobTypeChip";
import { SlaChip } from "@/components/shared/SlaChip";
import { cn } from "@/lib/utils";
import { CRITICALITY, type Criticality, type Job } from "@/lib/mock/dispatch";

/** Left-edge accent by criticality — the at-a-glance triage signal on a dense board. */
const CRIT_ACCENT: Record<Criticality, string> = {
  critical: "var(--danger)",
  high: "var(--warning)",
  standard: "var(--border)",
};

export function JobCard({
  job,
  onAssign,
}: {
  job: Job;
  onAssign?: (job: Job) => void;
}) {
  return (
    <article
      className="rounded-lg border border-border bg-card shadow-sm"
      style={{ borderLeft: `3px solid ${CRIT_ACCENT[job.criticality]}` }}
    >
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-muted">{job.id}</span>
            <JobTypeChip type={job.type} />
          </div>
          {job.slaMinutesRemaining !== undefined ? (
            <SlaChip minutesRemaining={job.slaMinutesRemaining} />
          ) : (
            <span className="text-[11px] text-text-muted">No SLA</span>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold text-text">{job.customer}</div>
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{job.site}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-text-secondary">{job.assetLabel}</span>
          <span
            className={cn(
              "font-medium",
              job.criticality === "critical" && "text-danger",
              job.criticality === "high" && "text-warning",
              job.criticality === "standard" && "text-text-muted"
            )}
          >
            {CRITICALITY[job.criticality]}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          {job.assignedTo ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-tint text-[10px] font-semibold text-primary">
                {job.assignedTo.slice(0, 1)}
              </span>
              {job.assignedTo}
            </span>
          ) : onAssign ? (
            <Button size="sm" variant="secondary" onClick={() => onAssign(job)}>
              <UserPlus className="size-3.5" />
              Assign
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <User className="size-3.5" />
              Unassigned
            </span>
          )}
          <span className="text-[11px] text-text-muted">{job.updatedLabel}</span>
        </div>
      </div>
    </article>
  );
}
