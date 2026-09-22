"use client";

import { X, Phone, Mail, MapPin, Package, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CustomerStatusBadge } from "@/components/customers/CustomerStatusBadge";
import type { Customer } from "@/lib/mock/customers";

/** Customer detail — profile, contact, sites (with asset counts), contracts. */
export function CustomerDetailSheet({
  customer,
  onOpenChange,
}: {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={customer !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        {customer && (
          <>
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-text">{customer.name}</div>
                <SheetClose className="-mr-1 rounded-md p-1.5 text-text-muted outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="size-5" />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CustomerStatusBadge status={customer.status} />
                <span className="text-xs text-text-secondary">{customer.segment}</span>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Sites" value={customer.sites.length} />
                <Stat label="Assets" value={customer.assets} />
                <Stat label="Contracts" value={customer.contracts.length} />
              </div>

              {/* Contact */}
              <div className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Primary contact
                </div>
                <div className="mt-2 text-sm font-medium text-text">{customer.contact.name}</div>
                <div className="text-xs text-text-secondary">{customer.contact.role}</div>
                <Separator className="my-3" />
                <a
                  href={`tel:${customer.contact.phone}`}
                  className="flex items-center gap-2 text-sm text-text hover:text-primary"
                >
                  <Phone className="size-3.5 text-text-muted" />
                  {customer.contact.phone}
                </a>
                <a
                  href={`mailto:${customer.contact.email}`}
                  className="mt-1.5 flex items-center gap-2 text-sm text-text hover:text-primary"
                >
                  <Mail className="size-3.5 text-text-muted" />
                  <span className="truncate">{customer.contact.email}</span>
                </a>
              </div>

              {/* Sites */}
              <Section icon={<MapPin className="size-3.5" />} title={`Sites (${customer.sites.length})`}>
                {customer.sites.length === 0 ? (
                  <Empty>No sites yet.</Empty>
                ) : (
                  customer.sites.map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-text">{s.name}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                        <Package className="size-3.5" />
                        {s.assets} {s.assets === 1 ? "asset" : "assets"}
                      </span>
                    </div>
                  ))
                )}
              </Section>

              {/* Contracts */}
              <Section icon={<FileText className="size-3.5" />} title={`Contracts (${customer.contracts.length})`}>
                {customer.contracts.length === 0 ? (
                  <Empty>No contracts.</Empty>
                ) : (
                  customer.contracts.map((c) => (
                    <div key={c.name} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-text">{c.name}</span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: c.active ? "var(--asset-active-bg)" : "var(--asset-decom-bg)",
                          color: c.active ? "var(--asset-active-text)" : "var(--asset-decom-text)",
                        }}
                      >
                        {c.active ? "Active" : "Expired"}
                      </span>
                    </div>
                  ))
                )}
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <div className="text-xl font-semibold text-text">{value}</div>
      <div className="text-[11px] text-text-muted">{label}</div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {icon}
        {title}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-sm text-text-muted">{children}</p>;
}
