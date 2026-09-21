import { cn } from "@/lib/utils";
import { JOB_TYPE, type JobType } from "@/lib/status";

/** Job type as an OUTLINE chip — visually distinct from the filled StatusBadge. */
export function JobTypeChip({
  type,
  className,
}: {
  type: JobType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-text-secondary",
        className
      )}
    >
      {JOB_TYPE[type]}
    </span>
  );
}
