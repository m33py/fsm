"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REGISTER_CUSTOMERS,
  REGISTER_SEGMENTS,
  REGISTER_SITES,
} from "@/lib/mock/technician";

/**
 * Quick register — field discovery for a new asset (CLAUDE.md technician flow).
 * Minimal fields only; admin completes and verifies the profile later
 * (design-review §2.6: registrations land pending verification).
 */
export function RegisterAsset() {
  const [label, setLabel] = React.useState("");
  const [customer, setCustomer] = React.useState("");
  const [site, setSite] = React.useState("");
  const [segment, setSegment] = React.useState("");

  const canSubmit = label.trim() && customer && site && segment;

  function submit() {
    toast.success(`${label.trim()} registered — pending admin verification`);
    setLabel("");
    setCustomer("");
    setSite("");
    setSegment("");
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4">
      <div>
        <h1 className="text-base font-bold text-text">Quick register</h1>
        <p className="text-xs text-text-secondary">Admin completes the full profile later.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label">REI tracking label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="REI-XXXX"
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Customer</Label>
            <Select value={customer} onValueChange={setCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {REGISTER_CUSTOMERS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Site</Label>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger>
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {REGISTER_SITES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Segment</Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger>
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                {REGISTER_SEGMENTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="mt-2 h-12" disabled={!canSubmit} onClick={submit}>
            Register asset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
