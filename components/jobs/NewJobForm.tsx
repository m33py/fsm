"use client";

import * as React from "react";
import { Building2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { JOB_TYPE, type JobType } from "@/lib/status";
import {
  ASSETS,
  CONTRACTS_BY_ASSET,
  CRITICALITY,
  TECHNICIANS,
  type Criticality,
  type Job,
} from "@/lib/mock/dispatch";

const JOB_TYPES = Object.keys(JOB_TYPE) as JobType[];
const CRITICALITIES = Object.keys(CRITICALITY) as Criticality[];

/** Label + control wrapper — keeps every form field spaced identically. */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text">{label}</label>
      {children}
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

/**
 * New Job — the create/dispatch flow (docs/diagrams/dispatch-create-job-flow.md).
 * UI only for now: no server action yet, so submit hands a built Job back to the
 * board. The field order and the assign-now fork match the canonical diagram so
 * the future create_job server action drops in without a layout change.
 */
export function NewJobForm({
  onCreate,
  onCancel,
}: {
  onCreate: (job: Job, dispatch: boolean) => void;
  onCancel: () => void;
}) {
  const [type, setType] = React.useState<JobType>("alert");
  const [assetId, setAssetId] = React.useState<string>("");
  const [contractId, setContractId] = React.useState<string>("");
  const [criticality, setCriticality] = React.useState<Criticality>("standard");
  const [assignNow, setAssignNow] = React.useState(false);
  const [technicianId, setTechnicianId] = React.useState<string>("");

  const asset = ASSETS.find((a) => a.id === assetId);
  const contracts = assetId ? CONTRACTS_BY_ASSET[assetId] ?? [] : [];

  // When the asset changes, reset the contract and default it if there's exactly one.
  React.useEffect(() => {
    setContractId(contracts.length === 1 ? contracts[0].id : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  const canCreate = Boolean(asset);
  const canDispatch = canCreate && assignNow && Boolean(technicianId);

  function build(dispatch: boolean): Job | null {
    if (!asset) return null;
    const contract = contracts.find((c) => c.id === contractId);
    const tech = TECHNICIANS.find((t) => t.id === technicianId);
    return {
      id: `J-${2042 + Math.floor(Math.random() * 900)}`,
      status: dispatch ? "dispatched" : "created",
      type,
      criticality,
      assetLabel: asset.label,
      customer: asset.customer,
      site: asset.site,
      assignedTo: dispatch ? tech?.name : undefined,
      slaMinutesRemaining: contract?.responseWindowMin,
      updatedLabel: "just now",
    };
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        {/* Job type — segmented */}
        <Field label="Job type">
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border p-1">
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "rounded-md py-1.5 text-sm font-medium transition-colors",
                  t === type
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-muted"
                )}
              >
                {JOB_TYPE[t]}
              </button>
            ))}
          </div>
        </Field>

        {/* Asset */}
        <Field label="Asset" hint="Not in the system? Register a minimal asset — admin completes it later.">
          <Select value={assetId} onValueChange={setAssetId}>
            <SelectTrigger>
              <SelectValue placeholder="Search asset by tag or site…" />
            </SelectTrigger>
            <SelectContent>
              {ASSETS.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label} — {a.customer}, {a.site}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Auto-filled customer + site (from the asset's current pointers) */}
        {asset && (
          <div className="flex items-start gap-2 rounded-lg bg-surface-muted p-3 text-sm">
            <Building2 className="mt-0.5 size-4 shrink-0 text-text-muted" />
            <div>
              <div className="font-medium text-text">{asset.customer}</div>
              <div className="text-text-secondary">
                {asset.site} · {asset.segment}
              </div>
            </div>
          </div>
        )}

        {/* Contract → SLA */}
        {asset && (
          <Field
            label="Contract"
            hint={
              contracts.length === 0
                ? "No contract on this asset — job is logged but not SLA-bound."
                : contracts.length > 1
                  ? "This asset sits on more than one contract — pick the one that governs this job."
                  : "SLA response window pulled from the contract."
            }
          >
            {contracts.length === 0 ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-text-muted">
                <Info className="size-3.5" />
                Ad-hoc — no SLA window
              </div>
            ) : (
              <Select value={contractId} onValueChange={setContractId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} · {c.responseWindowMin}m response
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
        )}

        {/* Criticality */}
        <Field label="Criticality" hint="Defaults from the asset tier — editable per job.">
          <Select value={criticality} onValueChange={(v) => setCriticality(v as Criticality)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRITICALITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CRITICALITY[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Assign-now fork */}
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-text">Assign a technician now</span>
            <input
              type="checkbox"
              checked={assignNow}
              onChange={(e) => setAssignNow(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
          </label>
          {assignNow && (
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick technician" />
              </SelectTrigger>
              <SelectContent>
                {TECHNICIANS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} · {t.activeJobs} active
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <SheetFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {assignNow ? (
          <Button
            disabled={!canDispatch}
            onClick={() => {
              const job = build(true);
              if (job) onCreate(job, true);
            }}
          >
            Create &amp; Dispatch
          </Button>
        ) : (
          <Button
            variant="secondary"
            disabled={!canCreate}
            onClick={() => {
              const job = build(false);
              if (job) onCreate(job, false);
            }}
          >
            Create unassigned
          </Button>
        )}
      </SheetFooter>
    </>
  );
}
