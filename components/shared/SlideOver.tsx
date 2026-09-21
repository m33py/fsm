import * as React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";

/**
 * The ONE create/edit pattern for the whole app (design-system §6).
 * A right-side panel on desktop; pass side="bottom" for a mobile bottom sheet.
 * Never use a modal/dialog for create-edit — that belongs to confirmations only.
 */
export function SlideOver({
  trigger,
  title,
  description,
  side = "right",
  children,
  footer,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  side?: "right" | "bottom";
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} title={title} description={description}>
        <div className="p-4">{children}</div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
