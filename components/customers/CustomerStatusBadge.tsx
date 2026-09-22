import { cn } from "@/lib/utils";
import { CUSTOMER_STATUS, type CustomerStatus } from "@/lib/mock/customers";

/** Small status badge for a customer (tokens from CUSTOMER_STATUS). */
export function CustomerStatusBadge({ status, className }: { status: CustomerStatus; className?: string }) {
  const tone = CUSTOMER_STATUS[status];
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
