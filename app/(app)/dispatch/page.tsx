import { AppShell } from "@/components/shared/AppShell";
import { DispatchBoard } from "@/components/jobs/DispatchBoard";

/**
 * Dispatch board — the ops_manager's home screen for creating, assigning, and
 * tracking service jobs.
 *
 * Role/user are hardcoded for now (no auth yet). When Supabase auth lands, the
 * role comes from the session and the board's jobs are fetched in this server
 * component and passed down — the DispatchBoard client component stays as-is.
 */
export default function DispatchPage() {
  return (
    <AppShell
      role="ops_manager"
      active="Dispatch"
      user={{ name: "Mervyn", role: "Ops Manager" }}
    >
      <DispatchBoard />
    </AppShell>
  );
}
