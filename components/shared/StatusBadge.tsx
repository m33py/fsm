import { cn } from "@/lib/utils";
import {
  JOB_STATUS,
  ASSET_STATUS,
  type JobStatus,
  type AssetStatus,
} from "@/lib/status";

type Props =
  | { kind?: "job"; status: JobStatus; className?: string }
  | { kind: "asset"; status: AssetStatus; className?: string };

/**
 * The one status badge for the whole app. Color comes from the lookup in
 * lib/status.ts (which points at CSS tokens), never inline per screen.
 */
export function StatusBadge({ status, className, ...rest }: Props) {
  const kind = "kind" in rest && rest.kind === "asset" ? "asset" : "job";
  const tone =
    kind === "asset"
      ? ASSET_STATUS[status as AssetStatus]
      : JOB_STATUS[status as JobStatus];

  const dashed = kind === "asset" && status === "unverified";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        dashed && "border border-dashed",
        className
      )}
      style={{
        backgroundColor: `var(${tone.bg})`,
        color: `var(${tone.text})`,
        borderColor: dashed ? `var(${tone.dot})` : undefined,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: `var(${tone.dot})` }}
      />
      {tone.label}
    </span>
  );
}
