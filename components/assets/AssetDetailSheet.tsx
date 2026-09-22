"use client";

import { MapPin, ShieldCheck, FileText, Wrench, History, X } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { HISTORY_SOURCE, type AssetRecord } from "@/lib/mock/assets";

/**
 * Asset detail — the record plus its append-only history (asset_history:
 * status/location/verification/service changes). Admin can verify a
 * field-registered asset here (design-review §2.6).
 */
export function AssetDetailSheet({
  asset,
  onOpenChange,
  onVerify,
}: {
  asset: AssetRecord | null;
  onOpenChange: (open: boolean) => void;
  onVerify?: (asset: AssetRecord) => void;
}) {
  return (
    <Sheet open={asset !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        {asset && (
          <>
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-base font-semibold text-text">{asset.label}</div>
                <SheetClose className="-mr-1 rounded-md p-1.5 text-text-muted outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="size-5" />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>
              <div className="mt-0.5 text-sm text-text-secondary">{asset.desc}</div>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <StatusBadge kind="asset" status={asset.status} />
                {!asset.verified && <StatusBadge kind="asset" status="unverified" />}
              </div>
            </div>

            <div className="flex flex-col gap-6 p-4">
              {/* Record */}
              <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
                <Row label="Customer" value={asset.customer} />
                <Separator className="my-2.5" />
                <Row label="Site" value={asset.site} icon={<MapPin className="size-3.5" />} />
                <Separator className="my-2.5" />
                <Row label="Segment" value={asset.segment} />
                <Separator className="my-2.5" />
                <Row
                  label="Contracts"
                  value={asset.contracts > 0 ? `${asset.contracts} linked` : "None"}
                  icon={<FileText className="size-3.5" />}
                />
                <Separator className="my-2.5" />
                <Row
                  label="Last service"
                  value={asset.lastService}
                  icon={<Wrench className="size-3.5" />}
                />
              </div>

              {/* Verify (unverified only) */}
              {!asset.verified && (
                <div className="flex flex-col gap-2 rounded-lg border border-dashed border-[var(--asset-unverified-dot)] p-3">
                  <p className="text-sm text-text-secondary">
                    Field-registered — profile pending admin verification.
                  </p>
                  <Button onClick={() => onVerify?.(asset)}>
                    <ShieldCheck className="size-4" />
                    Verify asset
                  </Button>
                </div>
              )}

              {/* History */}
              <div>
                <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <History className="size-3.5" />
                  History
                </div>
                <div className="flex flex-col">
                  {asset.history
                    .slice()
                    .reverse()
                    .map((e, i, arr) => (
                      <div key={`${e.at}-${e.field}`} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="mt-1.5 size-2.5 rounded-full border-2 border-primary bg-primary" />
                          {i < arr.length - 1 && <span className="h-full min-h-8 w-px bg-border" />}
                        </div>
                        <div className="flex flex-1 flex-col pb-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-text">{e.field}</span>
                            <span className="font-mono text-xs text-text-muted">{e.at}</span>
                          </div>
                          <span className="text-sm text-text-secondary">{e.detail}</span>
                          <span className="mt-0.5 text-xs text-text-muted">
                            {e.by} · {HISTORY_SOURCE[e.source]}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-text-muted">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-medium text-text">
        {icon && <span className="text-text-muted">{icon}</span>}
        {value}
      </span>
    </div>
  );
}
