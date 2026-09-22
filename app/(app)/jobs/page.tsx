import { AppShell } from "@/components/shared/AppShell";
import { JobsBoard } from "@/components/jobs/JobsBoard";
import { BACKOFFICE } from "@/lib/demo";

/** Jobs — the full job record/history (all statuses), read-only lookup + reporting. */
export default function JobsPage() {
  return (
    <AppShell role={BACKOFFICE.role} active="Jobs" user={BACKOFFICE.user}>
      <JobsBoard />
    </AppShell>
  );
}
