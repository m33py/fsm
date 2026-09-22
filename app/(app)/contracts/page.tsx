import { AppShell } from "@/components/shared/AppShell";
import { ContractsBoard } from "@/components/contracts/ContractsBoard";
import { BACKOFFICE } from "@/lib/demo";

/** Contracts — admin: service contracts and their SLA parameters. */
export default function ContractsPage() {
  return (
    <AppShell role={BACKOFFICE.role} active="Contracts" user={BACKOFFICE.user}>
      <ContractsBoard />
    </AppShell>
  );
}
