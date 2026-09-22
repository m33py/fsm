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
import { CONTRACT_COVERAGES, type Contract } from "@/lib/mock/contracts";

/** Admin: add a service contract with its SLA parameters. */
export function NewContractForm({
  onCreate,
  onCancel,
}: {
  onCreate: (c: Contract) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [customer, setCustomer] = React.useState("");
  const [coverage, setCoverage] = React.useState(CONTRACT_COVERAGES[0]);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [responseWindowMin, setResponseWindowMin] = React.useState("240");
  const [cutoffTime, setCutoffTime] = React.useState("18:00");
  const [fulfillmentWindowHrs, setFulfillmentWindowHrs] = React.useState("48");

  const canCreate = name.trim() && customer.trim() && startDate && endDate;

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ct-name">Contract name</Label>
          <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FairPrice FROST — 2025" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ct-cust">Customer</Label>
          <Input id="ct-cust" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Coverage</Label>
          <Select value={coverage} onValueChange={setCoverage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTRACT_COVERAGES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ct-start">Start</Label>
            <Input id="ct-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ct-end">End</Label>
            <Input id="ct-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">SLA parameters</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ct-resp">Response (min)</Label>
              <Input id="ct-resp" type="number" value={responseWindowMin} onChange={(e) => setResponseWindowMin(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ct-cutoff">Daily cutoff</Label>
              <Input id="ct-cutoff" type="time" value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ct-fulfil">Fulfillment (hrs)</Label>
              <Input id="ct-fulfil" type="number" value={fulfillmentWindowHrs} onChange={(e) => setFulfillmentWindowHrs(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <SheetFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!canCreate}
          onClick={() =>
            onCreate({
              id: `ct-${Date.now()}`,
              name: name.trim(),
              customer: customer.trim(),
              status: "active",
              coverage,
              startDate,
              endDate,
              assetsCovered: 0,
              responseWindowMin: Number(responseWindowMin) || 0,
              cutoffTime,
              fulfillmentWindowHrs: Number(fulfillmentWindowHrs) || 0,
            })
          }
        >
          Create contract
        </Button>
      </SheetFooter>
    </>
  );
}
