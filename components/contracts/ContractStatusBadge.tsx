import { cn } from "@/lib/utils";
import { CONTRACT_STATUS, type ContractStatus } from "@/lib/mock/contracts";

/** Small status badge for a contract (tokens from CONTRACT_STATUS). */
export function ContractStatusBadge({
  status,
  className,
}: {
  status: ContractStatus;
  className?: string;
}) {
  const tone = CONTRACT_STATUS[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", className)}
      style={{ backgroundColor: `var(${tone.bg})`, color: `var(${tone.text})` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: `var(${tone.dot})` }} />
      {tone.label}
    </span>
  );
}

/** "4h 0m" from minutes. */
export function formatWindow(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
