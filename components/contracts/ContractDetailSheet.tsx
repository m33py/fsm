"use client";

import { X, Building2, Package, Timer, Clock, CalendarDays } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ContractStatusBadge, formatWindow } from "@/components/contracts/ContractStatusBadge";
import type { Contract } from "@/lib/mock/contracts";

/** Contract detail — the SLA parameters, coverage, dates, and linked assets. */
export function ContractDetailSheet({
  contract,
  onOpenChange,
}: {
  contract: Contract | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={contract !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        {contract && (
          <>
            <div className="border-b border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-base font-semibold text-text">{contract.name}</div>
                <SheetClose className="-mr-1 rounded-md p-1.5 text-text-muted outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="size-5" />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ContractStatusBadge status={contract.status} />
                <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                  <Building2 className="size-3.5" />
                  {contract.customer}
                </span>
                <span className="text-xs text-text-muted">{contract.segment}</span>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-4">
              {/* SLA parameters */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  SLA parameters
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <SlaRow
                    icon={<Timer className="size-3.5" />}
                    label="Response window"
                    value={formatWindow(contract.responseWindowMin)}
                  />
                  <Separator className="my-2.5" />
                  <SlaRow
                    icon={<Clock className="size-3.5" />}
                    label="Daily cutoff"
                    value={`${contract.cutoffTime} — later alerts roll to next day`}
                  />
                  <Separator className="my-2.5" />
                  <SlaRow
                    icon={<CalendarDays className="size-3.5" />}
                    label="Fulfillment window"
                    value={`${contract.fulfillmentWindowHrs}h`}
                  />
                </div>
              </div>

              {/* Coverage + assets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-[11px] text-text-muted">Coverage</div>
                  <div className="mt-0.5 text-sm font-medium text-text">{contract.coverage}</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-[11px] text-text-muted">Assets covered</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-text">
                    <Package className="size-3.5 text-text-muted" />
                    {contract.assetsCovered}
                  </div>
                </div>
              </div>

              {/* Term */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Term
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <span className="font-mono text-text">{contract.startDate}</span>
                  <span className="text-text-muted">→</span>
                  <span className="font-mono text-text">{contract.endDate}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SlaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-1.5 text-text-muted">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium text-text">{value}</span>
    </div>
  );
}
