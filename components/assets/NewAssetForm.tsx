"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AssetLifecycle, type AssetRecord } from "@/lib/mock/assets";

const STATUSES: { value: AssetLifecycle; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "in_repair", label: "In repair" },
  { value: "decommissioned", label: "Decommissioned" },
];

/** Admin: add an asset directly (verified on creation, unlike field registrations). */
export function NewAssetForm({
  onCreate,
  onCancel,
}: {
  onCreate: (a: AssetRecord) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [customer, setCustomer] = React.useState("");
  const [site, setSite] = React.useState("");
  const [status, setStatus] = React.useState<AssetLifecycle>("active");

  const canCreate = label.trim() && desc.trim() && customer.trim() && site.trim();

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="a-label">REI tracking label</Label>
          <Input id="a-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="REI-XXXX" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="a-desc">Asset type</Label>
          <Input id="a-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Display freezer" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="a-cust">Customer</Label>
          <Input id="a-cust" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="a-site">Site</Label>
          <Input id="a-site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as AssetLifecycle)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SheetFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!canCreate}
          onClick={() =>
            onCreate({
              id: `a-${Date.now()}`,
              label: label.trim(),
              desc: desc.trim(),
              customer: customer.trim(),
              site: site.trim(),
              status,
              verified: true,
              contracts: 0,
              lastService: "—",
              history: [
                { field: "Registered", detail: "Created", at: "just now", by: "Christine", source: "admin_edit" },
              ],
            })
          }
        >
          Create asset
        </Button>
      </SheetFooter>
    </>
  );
}
