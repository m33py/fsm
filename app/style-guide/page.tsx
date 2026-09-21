"use client";

import * as React from "react";
import { toast } from "sonner";
import { Moon, Sun, Plus, Snowflake } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { JobTypeChip } from "@/components/shared/JobTypeChip";
import { SlaChip } from "@/components/shared/SlaChip";
import { SlideOver } from "@/components/shared/SlideOver";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { SheetClose } from "@/components/ui/sheet";
import {
  JOB_STATUS,
  ASSET_STATUS,
  type JobStatus,
  type AssetStatus,
} from "@/lib/status";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h2>
      <div className="rounded-lg border border-border bg-background p-4">{children}</div>
    </section>
  );
}

function Swatch({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-12 w-full rounded-md border border-border"
        style={{ background: `var(${name})` }}
      />
      <code className="font-mono text-[11px] text-text-muted">{name}</code>
    </div>
  );
}

const NEUTRALS = ["--bg", "--surface", "--surface-muted", "--border"];
const BRAND = ["--primary", "--primary-hover", "--primary-tint"];
const SEMANTIC = ["--success", "--warning", "--danger"];

export default function StyleGuide() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <AppShell
      role="admin"
      active="Settings"
      user={{ name: "Christine", role: "Admin" }}
    >
      <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-6">
        <PageHeader
          title="Style Guide"
          description="The living source of truth for REI Ops. Every screen inherits these tokens and patterns."
          action={
            <Button variant="secondary" size="sm" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun /> : <Moon />}
              {dark ? "Light" : "Dark"}
            </Button>
          }
        />

        {/* Typography */}
        <Section title="Typography — Inter (UI) · JetBrains Mono (labels & times)">
          <div className="space-y-2">
            <p className="text-[28px] font-semibold leading-tight">Display 28</p>
            <p className="text-[22px] font-semibold leading-tight">Heading 22</p>
            <p className="text-lg font-semibold">Subhead 18</p>
            <p className="text-sm">Body 14 — dense, fast, operations tooling.</p>
            <p className="text-[13px] text-text-secondary">Small 13 — secondary text.</p>
            <p className="font-mono text-sm">
              REI-0421 <span className="text-text-muted">·</span> 09:48 SGT
            </p>
          </div>
        </Section>

        {/* Colors */}
        <Section title="Color tokens">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-text-secondary">Neutrals</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {NEUTRALS.map((n) => (
                  <Swatch key={n} name={n} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-text-secondary">Brand / action</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {BRAND.map((n) => (
                  <Swatch key={n} name={n} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-text-secondary">Semantic</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SEMANTIC.map((n) => (
                  <Swatch key={n} name={n} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Status badges */}
        <Section title="Status badges — one lookup-driven component">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(JOB_STATUS) as JobStatus[]).map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ASSET_STATUS) as AssetStatus[]).map((s) => (
                <StatusBadge key={s} kind="asset" status={s} />
              ))}
            </div>
          </div>
        </Section>

        {/* SLA + job type chips */}
        <Section title="SLA chips & job-type chips">
          <div className="flex flex-wrap items-center gap-2">
            <SlaChip minutesRemaining={95} />
            <SlaChip minutesRemaining={22} />
            <SlaChip minutesRemaining={-14} />
            <span className="mx-2 h-4 w-px bg-border" />
            <JobTypeChip type="alert" />
            <JobTypeChip type="scheduled" />
            <JobTypeChip type="ad_hoc" />
          </div>
        </Section>

        {/* Controls */}
        <Section title="Buttons, inputs, select">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add">
                <Plus />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Search assets…" />
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>FairPrice Finest — Bugis Junction</option>
                <option>Cold Storage — Great World</option>
                <option>Haagen-Dazs — ION Orchard</option>
              </select>
            </div>
            <Badge>Badge</Badge>{" "}
            <Badge variant="outline">Outline</Badge>{" "}
            <Badge variant="muted">Muted</Badge>
          </div>
        </Section>

        {/* Card + table */}
        <Section title="Card & table (list primitives)">
          <div className="space-y-4">
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle className="font-mono">REI-1187 · walk-in freezer</CardTitle>
                <CardDescription>Cold Storage — Great World</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <StatusBadge status="on_site" />
                <SlaChip minutesRemaining={41} />
              </CardContent>
            </Card>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs text-text-secondary">
                  <tr>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Asset</th>
                    <th className="px-3 py-2 font-medium">Customer</th>
                    <th className="px-3 py-2 font-medium">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { s: "dispatched", a: "REI-0930 · display freezer", c: "Haagen-Dazs — ION", m: -14 },
                    { s: "accepted", a: "REI-0421 · 2-door chiller", c: "FairPrice — Bugis", m: 22 },
                    { s: "resolved", a: "REI-0088 · ice cream cabinet", c: "Ben & Jerry's — VivoCity", m: 180 },
                  ].map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2">
                        <StatusBadge status={r.s as JobStatus} />
                      </td>
                      <td className="px-3 py-2 font-mono text-[13px]">{r.a}</td>
                      <td className="px-3 py-2 text-text-secondary">{r.c}</td>
                      <td className="px-3 py-2">
                        <SlaChip minutesRemaining={r.m} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Overlays */}
        <Section title="Overlays — slide-over (create/edit), dialog (confirm), toast">
          <div className="flex flex-wrap gap-2">
            <SlideOver
              trigger={
                <Button>
                  <Plus /> New Job
                </Button>
              }
              title="New Job"
              description="The one create/edit pattern — a slide-over, never a modal."
              footer={
                <>
                  <SheetClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button onClick={() => toast("Job created & dispatched")}>
                      Create &amp; Dispatch
                    </Button>
                  </SheetClose>
                </>
              }
            >
              <div className="space-y-3">
                <label className="block text-sm font-medium">Asset</label>
                <Input placeholder="Search REI label…" />
                <label className="block text-sm font-medium">Note</label>
                <Input placeholder="Optional" />
              </div>
            </SlideOver>

            <SlideOver
              side="bottom"
              trigger={<Button variant="outline">Bottom sheet (mobile)</Button>}
              title="Log Outcome"
              description="Bottom sheet variant for mobile."
            >
              <p className="text-sm text-text-secondary">
                Same pattern, bottom-anchored for thumb reach.
              </p>
            </SlideOver>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Confirm dialog</Button>
              </DialogTrigger>
              <DialogContent
                title="Escalate job?"
                description="Reassigns this job to another technician. It keeps the same record and history."
              >
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={() => toast("Escalated")}>
                      Escalate
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="secondary" onClick={() => toast("Queued — will sync")}>
              Fire toast
            </Button>
          </div>
        </Section>

        {/* Empty state */}
        <Section title="Empty state">
          <EmptyState
            icon={<Snowflake className="size-6" />}
            title="No jobs yet"
            description="Dispatched jobs will appear here."
            action={
              <Button size="sm">
                <Plus /> New Job
              </Button>
            }
          />
        </Section>
      </div>
    </AppShell>
  );
}
