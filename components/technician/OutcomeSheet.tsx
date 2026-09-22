"use client";

import * as React from "react";
import { Camera } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { RESOLUTION, type Outcome, type Resolution, type TechJob } from "@/lib/mock/technician";

const RESOLUTIONS = Object.keys(RESOLUTION) as Resolution[];

/**
 * Log & Resolve — the technician's outcome capture (CLAUDE.md: log outcome →
 * resolve or escalate). Bottom sheet on mobile. Resolution options are the
 * design-review §2.2 lookup. Escalation reassigns the same job, keeps history.
 */
export function OutcomeSheet({
  job,
  open,
  onOpenChange,
  onResolve,
  onEscalate,
}: {
  job: TechJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (outcome: Outcome) => void;
  onEscalate: () => void;
}) {
  const [note, setNote] = React.useState("");
  const [photoCount, setPhotoCount] = React.useState(0);
  const [parts, setParts] = React.useState("");
  const [resolution, setResolution] = React.useState<Resolution | null>(null);

  // Reset when the sheet closes.
  React.useEffect(() => {
    if (!open) {
      setNote("");
      setPhotoCount(0);
      setParts("");
      setResolution(null);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        title="Log & resolve"
        description={job ? `${job.id} · ${job.assetDesc}` : undefined}
      >
        <div className="flex flex-col gap-5 p-4 pb-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">What did you do?</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional — describe the work performed"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Photos</Label>
            <div className="flex gap-2">
              {Array.from({ length: Math.max(photoCount, 3) }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex size-16 items-center justify-center rounded-lg border-2 border-dashed",
                    i < photoCount
                      ? "border-primary bg-primary-tint"
                      : "border-border bg-surface-muted"
                  )}
                >
                  <Camera
                    className={cn("size-5", i < photoCount ? "text-primary" : "text-text-muted")}
                  />
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="h-10"
              disabled={photoCount >= 5}
              onClick={() => setPhotoCount((n) => Math.min(n + 1, 5))}
            >
              <Camera className="size-4" />
              Add photo
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label htmlFor="parts">Parts touched</Label>
            <Input
              id="parts"
              value={parts}
              onChange={(e) => setParts(e.target.value)}
              placeholder="e.g. compressor, coolant lines (comma-separated)"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>
              Resolution <span className="text-danger">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResolution(r)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-sm font-medium transition-colors",
                    resolution === r
                      ? "border-primary bg-primary-tint text-primary"
                      : "border-border bg-background text-text-secondary hover:border-text-muted"
                  )}
                >
                  {RESOLUTION[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              className="h-12"
              disabled={!resolution}
              onClick={() =>
                resolution &&
                onResolve({
                  note: note.trim(),
                  photoCount,
                  partsTouched: parts.split(",").map((p) => p.trim()).filter(Boolean),
                  resolution,
                })
              }
            >
              Resolve job
            </Button>
            <Button variant="outline" className="h-12" onClick={onEscalate}>
              Escalate instead
            </Button>
            <p className="px-2 text-center text-xs text-text-muted">
              Escalate reassigns this job and keeps its history.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
