/**
 * Demo personas — until Supabase auth lands, pages read the "current user" from
 * here instead of hardcoding a role each. One persona per app context keeps the
 * nav shell STABLE as you navigate (no role/nav flip mid-session).
 *
 * When auth lands: role + user come from the session, and these constants are
 * deleted. Back-office screens (dispatch/assets/…) render for whatever role the
 * signed-in user has; the technician screens for the field role.
 */

import type { Role } from "@/components/shared/AppShell";

type Persona = { role: Role; user: { name: string; role: string } };

/** Desktop back-office: admin sees the full nav (Dispatch, Assets, … all reachable). */
export const BACKOFFICE: Persona = {
  role: "admin",
  user: { name: "Christine", role: "Admin" },
};

/** Field app: technician sees My Jobs + Register only. */
export const FIELD: Persona = {
  role: "technician",
  user: { name: "Rajesh", role: "Technician" },
};
