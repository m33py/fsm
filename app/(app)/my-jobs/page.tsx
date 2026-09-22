import { AppShell } from "@/components/shared/AppShell";
import { MyJobs } from "@/components/technician/MyJobs";
import { FIELD } from "@/lib/demo";

/**
 * Technician "My Jobs" — the field flow: select job → acknowledge → arrive →
 * log outcome → resolve or escalate, tolerant of poor connectivity.
 * Role/user hardcoded until auth lands.
 */
export default function MyJobsPage() {
  return (
    <AppShell role={FIELD.role} active="My Jobs" user={FIELD.user}>
      <MyJobs />
    </AppShell>
  );
}
