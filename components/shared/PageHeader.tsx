import * as React from "react";
import { cn } from "@/lib/utils";

/** Consistent page title + optional action slot (e.g. a "+ New" button). */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold leading-tight text-text">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
