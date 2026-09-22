import { AppShell } from "@/components/shared/AppShell";
import { RegisterAsset } from "@/components/technician/RegisterAsset";

/** Technician quick-register — field discovery for a new asset. */
export default function RegisterAssetPage() {
  return (
    <AppShell role="technician" active="Register Asset" user={{ name: "Rajesh", role: "Technician" }}>
      <RegisterAsset />
    </AppShell>
  );
}
