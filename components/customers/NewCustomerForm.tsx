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
import { CUSTOMER_STATUS, type Customer, type CustomerStatus } from "@/lib/mock/customers";

const STATUSES = Object.keys(CUSTOMER_STATUS) as CustomerStatus[];

/** Admin: add a customer account. Sites/contracts are linked later. */
export function NewCustomerForm({
  onCreate,
  onCancel,
}: {
  onCreate: (c: Customer) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<CustomerStatus>("active");
  const [contactName, setContactName] = React.useState("");
  const [contactRole, setContactRole] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  const canCreate = name.trim() && contactName.trim();

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cust-name">Customer name</Label>
          <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FairPrice" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CustomerStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{CUSTOMER_STATUS[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Primary contact</div>
          <div className="flex flex-col gap-3">
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" />
            <Input value={contactRole} onChange={(e) => setContactRole(e.target.value)} placeholder="Role (e.g. Facilities Lead)" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
          </div>
        </div>
      </div>

      <SheetFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!canCreate}
          onClick={() =>
            onCreate({
              id: `c-${Date.now()}`,
              name: name.trim(),
              status,
              sites: [],
              assets: 0,
              contracts: [],
              contact: {
                name: contactName.trim(),
                role: contactRole.trim() || "—",
                phone: phone.trim() || "—",
                email: email.trim() || "—",
              },
            })
          }
        >
          Create customer
        </Button>
      </SheetFooter>
    </>
  );
}
