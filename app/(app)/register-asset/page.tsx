import { AppShell } from "@/components/shared/AppShell";
import { RegisterAsset } from "@/components/technician/RegisterAsset";
import { FIELD } from "@/lib/demo";

/** Technician quick-register — field discovery for a new asset. */
export default function RegisterAssetPage() {
  return (
    <AppShell role={FIELD.role} active="Register Asset" user={FIELD.user}>
      <RegisterAsset />
    </AppShell>
  );
}
