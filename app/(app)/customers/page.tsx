import { AppShell } from "@/components/shared/AppShell";
import { CustomersBoard } from "@/components/customers/CustomersBoard";
import { BACKOFFICE } from "@/lib/demo";

/** Customers — admin account directory: list → detail (sites, assets, contracts, contact). */
export default function CustomersPage() {
  return (
    <AppShell role={BACKOFFICE.role} active="Customers" user={BACKOFFICE.user}>
      <CustomersBoard />
    </AppShell>
  );
}
