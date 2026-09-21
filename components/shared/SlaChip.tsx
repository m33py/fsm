import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SLA_STATE, type SlaState } from "@/lib/status";

/** Derive the SLA state from minutes remaining to the deadline. */
export function slaStateFromMinutes(minutesRemaining: number): SlaState {
  if (minutesRemaining < 0) return "breached";
  if (minutesRemaining <= 30) return "at_risk";
  return "ok";
}

function formatRemaining(minutesRemaining: number): string {
  if (minutesRemaining < 0) {
    const over = Math.abs(minutesRemaining);
    return over >= 60 ? `${Math.floor(over / 60)}h ${over % 60}m over` : `${over}m over`;
  }
  return minutesRemaining >= 60
    ? `${Math.floor(minutesRemaining / 60)}h ${minutesRemaining % 60}m`
    : `${minutesRemaining}m`;
}

export function SlaChip({
  minutesRemaining,
  className,
}: {
  minutesRemaining: number;
  className?: string;
}) {
  const state = slaStateFromMinutes(minutesRemaining);
  const tone = SLA_STATE[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-medium",
        className
      )}
      style={{ backgroundColor: `var(${tone.bg})`, color: `var(${tone.text})` }}
    >
      <Clock className="size-3" />
      {formatRemaining(minutesRemaining)}
    </span>
  );
}
