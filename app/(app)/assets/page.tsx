import { AppShell } from "@/components/shared/AppShell";
import { AssetsBoard } from "@/components/assets/AssetsBoard";
import { BACKOFFICE } from "@/lib/demo";

/**
 * Assets — the admin asset register: list → detail with append-only history,
 * plus verification of field-registered assets. Role/user hardcoded until auth.
 */
export default function AssetsPage() {
  return (
    <AppShell role={BACKOFFICE.role} active="Assets" user={BACKOFFICE.user}>
      <AssetsBoard />
    </AppShell>
  );
}
