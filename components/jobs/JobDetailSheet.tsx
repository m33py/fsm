"use client";

import { AlertTriangle, Users, MapPin, X } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobTypeChip } from "@/components/shared/JobTypeChip";
import { SlaChip } from "@/components/shared/SlaChip";
import { cn } from "@/lib/utils";
import { CRITICALITY, type Job } from "@/lib/mock/dispatch";

/**
 * Job detail — opened by clicking a row on the board. Shows the append-only SLA
 * timeline (the audit-defensible timestamps) and the escalate/reassign actions.
 * Escalation reassigns within the same job record (never spawns a new job).
 */
export function JobDetailSheet({
  job,
  onOpenChange,
  onEscalate,
  onReassign,
}: {
  job: Job | null;
  onOpenChange: (open: boolean) => void;
  onEscalate?: (job: Job) => void;
  onReassign?: (job: Job) => void;
}) {
  return (
    <Sheet open={job !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        {job && (
          <>
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-base font-semibold text-text">{job.id}</div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={job.status} />
                  <SheetClose className="-mr-1 rounded-md p-1.5 text-text-muted outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring">
                    <X className="size-5" />
                    <span className="sr-only">Close</span>
                  </SheetClose>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                <MapPin className="size-3.5" />
                {job.customer} — {job.site}
              </div>
            </div>

            <div className="flex flex-col gap-6 p-4">
              {/* Asset */}
              <div className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-sm font-semibold text-text">{job.assetLabel}</div>
                  <JobTypeChip type={job.type} />
                </div>
                <div className="mt-1 text-sm text-text-secondary">{job.assetDesc}</div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Criticality</span>
                  <span
                    className={cn(
                      "font-medium",
                      job.criticality === "critical" && "text-danger",
                      job.criticality === "high" && "text-warning",
                      job.criticality === "standard" && "text-text"
                    )}
                  >
                    {CRITICALITY[job.criticality]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-text-muted">SLA</span>
                  {job.slaMinutesRemaining !== undefined ? (
                    <SlaChip minutesRemaining={job.slaMinutesRemaining} />
                  ) : (
                    <span className="text-text-muted">No SLA window</span>
                  )}
                </div>
              </div>

              {job.note && (
                <p className="rounded-lg border border-border p-3 text-sm text-text-secondary">
                  {job.note}
                </p>
              )}

              {/* SLA timeline */}
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  SLA timeline
                </div>
                <div className="flex flex-col">
                  {job.events.map((event, i) => {
                    const reached = Boolean(event.time);
                    return (
                      <div key={event.label} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "mt-1.5 size-2.5 rounded-full border-2",
                              reached ? "border-primary bg-primary" : "border-border bg-background"
                            )}
                          />
                          {i < job.events.length - 1 && (
                            <span
                              className={cn("h-9 w-px", reached ? "bg-primary/40" : "bg-border")}
                            />
                          )}
                        </div>
                        <div className="flex flex-1 items-center justify-between pb-4">
                          <span className={cn("text-sm", !reached && "text-text-muted")}>
                            {event.label}
                          </span>
                          <span className="font-mono text-xs text-text-muted">
                            {event.time ?? "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-[var(--warning)] text-warning hover:bg-[var(--sla-atrisk-bg)]"
                  onClick={() => onEscalate?.(job)}
                >
                  <AlertTriangle className="size-4" />
                  Escalate
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => onReassign?.(job)}>
                  <Users className="size-4" />
                  Reassign
                </Button>
              </div>

              {/* Assigned tech */}
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Assigned technician
                </div>
                <div className="mt-3">
                  {job.assignedTo ? (
                    <span className="inline-flex items-center gap-2 text-sm text-text">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary">
                        {job.assignedTo.slice(0, 1)}
                      </span>
                      {job.assignedTo}
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
