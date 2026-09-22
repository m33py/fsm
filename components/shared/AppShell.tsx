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
  Eye,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type Role = "admin" | "ops_manager" | "technician";

type NavItem = { label: string; icon: LucideIcon; roles: Role[]; href: string };

const NAV: NavItem[] = [
  { label: "Dispatch", icon: LayoutDashboard, roles: ["admin", "ops_manager"], href: "/dispatch" },
  { label: "Jobs", icon: ClipboardList, roles: ["admin", "ops_manager"], href: "#" },
  { label: "My Jobs", icon: ClipboardCheck, roles: ["technician"], href: "/my-jobs" },
  { label: "Assets", icon: Package, roles: ["admin", "ops_manager"], href: "/assets" },
  { label: "Register Asset", icon: PlusCircle, roles: ["technician"], href: "/register-asset" },
  { label: "Customers", icon: Building2, roles: ["admin"], href: "/customers" },
  { label: "Contracts", icon: FileText, roles: ["admin"], href: "/contracts" },
  { label: "Reports", icon: BarChart3, roles: ["admin"], href: "#" },
  { label: "Settings", icon: Settings, roles: ["admin"], href: "#" },
];

// Demo personas + where each role lands. Removed when Supabase auth provides the
// real session (role from auth, not a switcher).
const ROLE_USER: Record<Role, { name: string; role: string }> = {
  admin: { name: "Christine", role: "Admin" },
  ops_manager: { name: "Mervyn", role: "Ops Manager" },
  technician: { name: "Rajesh", role: "Technician" },
};
const ROLE_HOME: Record<Role, string> = {
  admin: "/dispatch",
  ops_manager: "/dispatch",
  technician: "/my-jobs",
};
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "ops_manager", label: "Ops Manager" },
  { value: "technician", label: "Technician" },
];
const STORAGE_KEY = "rei-demo-role";

/**
 * One adaptive shell for all roles (design-system §7): left sidebar on desktop,
 * bottom tab bar on mobile. Nav items are filtered by role — never a separate app.
 *
 * Until auth lands, a "View as" switcher (clearly a demo control) lets you preview
 * every role without logging in/out. The selected role persists across navigation
 * so the nav shell stays stable.
 */
export function AppShell({
  role = "admin",
  active,
  children,
}: {
  role?: Role;
  active?: string;
  /** Deprecated: the user chip now derives from the active demo role. */
  user?: { name: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [viewRole, setViewRole] = React.useState<Role>(role);

  // Load a previously-picked demo role (client only) so it survives navigation.
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Role | null;
      if (saved && saved in ROLE_USER) setViewRole(saved);
    } catch {
      /* storage unavailable — keep the page default */
    }
  }, []);

  function switchRole(next: Role) {
    setViewRole(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    router.push(ROLE_HOME[next]);
  }

  const items = NAV.filter((i) => i.roles.includes(viewRole));
  const mobileItems = items.slice(0, 4); // mobile keeps at most 4 for thumb reach
  const chip = ROLE_USER[viewRole];
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
            // Not-yet-built routes render disabled with a "Soon" tag — never a
            // live-looking link that dead-ends.
            if (item.href === "#") {
              return (
                <div
                  key={item.label}
                  aria-disabled="true"
                  title="Not built yet"
                  className="flex cursor-default select-none items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-text-muted/60"
                >
                  <Icon className="size-4" />
                  {item.label}
                  <span className="ml-auto rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                    Soon
                  </span>
                </div>
              );
            }
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

        {/* View-as (demo) + user chip */}
        <div className="border-t border-border p-3">
          <RoleSwitcher value={viewRole} onChange={switchRole} />
          <div className="mt-3 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary">
              {chip.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-text">{chip.name}</div>
              <div className="truncate text-xs text-text-muted">{chip.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile "View as" — floating demo control (real role comes from auth later) */}
        <div className="fixed right-3 top-3 z-50 md:hidden">
          <RoleSwitcher value={viewRole} onChange={switchRole} compact />
        </div>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden">
          {mobileItems.map((item) => {
            const current = isActive(item);
            const Icon = item.icon;
            if (item.href === "#") {
              return (
                <div
                  key={item.label}
                  aria-disabled="true"
                  className="flex flex-1 cursor-default flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-text-muted/40"
                >
                  <Icon className="size-5" />
                  {item.label}
                </div>
              );
            }
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

/** Demo-only role preview control. A native select keeps it dependency-free. */
function RoleSwitcher({
  value,
  onChange,
  compact,
}: {
  value: Role;
  onChange: (r: Role) => void;
  compact?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border bg-background text-text-secondary shadow-sm",
        compact ? "px-2 py-1" : "px-2.5 py-1.5"
      )}
      title="Preview the app as another role (demo — no login needed)"
    >
      <Eye className="size-3.5 shrink-0 text-text-muted" />
      {!compact && <span className="text-[11px] font-medium text-text-muted">View as</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Role)}
        className="cursor-pointer bg-transparent text-xs font-medium text-text outline-none"
        aria-label="View as role"
      >
        {ROLE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
