import { AppShell } from "@/components/shared/AppShell";
import { AssetsBoard } from "@/components/assets/AssetsBoard";

/**
 * Assets — the admin asset register: list → detail with append-only history,
 * plus verification of field-registered assets. Role/user hardcoded until auth.
 */
export default function AssetsPage() {
  return (
    <AppShell role="admin" active="Assets" user={{ name: "Christine", role: "Admin" }}>
      <AssetsBoard />
    </AppShell>
  );
}
