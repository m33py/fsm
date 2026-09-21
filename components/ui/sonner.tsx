"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-lg border border-border bg-card text-card-foreground shadow-lg",
          description: "text-text-secondary",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-surface-muted text-text-secondary",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
