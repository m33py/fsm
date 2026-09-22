"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Building2,
  FileText,
  BarChart3,
  Settings,
  ClipboardCheck,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type Role = "admin" | "ops_manager" | "technician";

type NavItem = { label: string; icon: LucideIcon; roles: Role[]; href: string };

const NAV: NavItem[] = [
  { label: "Dispatch", icon: LayoutDashboard, roles: ["admin", "ops_manager"], href: "/dispatch" },
  { label: "Jobs", icon: ClipboardList, roles: ["admin", "ops_manager"], href: "#" },
  { label: "My Jobs", icon: ClipboardCheck, roles: ["technician"], href: "/my-jobs" },
  { label: "Assets", icon: Package, roles: ["admin", "ops_manager"], href: "/assets" },
  { label: "Register Asset", icon: PlusCircle, roles: ["technician"], href: "/register-asset" },
  { label: "Customers", icon: Building2, roles: ["admin"], href: "#" },
  { label: "Contracts", icon: FileText, roles: ["admin"], href: "#" },
  { label: "Reports", icon: BarChart3, roles: ["admin"], href: "#" },
  { label: "Settings", icon: Settings, roles: ["admin"], href: "#" },
];

/**
 * One adaptive shell for all roles (design-system §7): left sidebar on desktop,
 * bottom tab bar on mobile. Nav items are filtered by role — never a separate app.
 */
export function AppShell({
  role = "admin",
  active,
  user,
  children,
}: {
  role?: Role;
  active?: string;
  user?: { name: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = NAV.filter((i) => i.roles.includes(role));
  // mobile keeps at most 4 items for thumb reach
  const mobileItems = items.slice(0, 4);
  const isActive = (item: NavItem) =>
    item.href !== "#" && pathname ? pathname === item.href : item.label === active;

  return (
    <div className="flex min-h-dvh bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center px-4">
          <span className="text-lg font-semibold tracking-tight text-primary">REI</span>
          <span className="ml-1 text-lg font-semibold tracking-tight text-text">Ops</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {items.map((item) => {
            const current = isActive(item);
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  current
                    ? "bg-primary-tint text-primary"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text"
                )}
                style={
                  current
                    ? { backgroundColor: "var(--primary-tint)", color: "var(--primary)" }
                    : undefined
                }
              >
                <Icon className="size-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
        {user && (
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary">
                {user.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-text">{user.name}</div>
                <div className="truncate text-xs text-text-muted">{user.role}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden">
          {mobileItems.map((item) => {
            const current = isActive(item);
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  current ? "text-primary" : "text-text-muted"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
