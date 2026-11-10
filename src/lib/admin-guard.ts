import { redirect } from "next/navigation";
import { canAccessAdmin } from "@/lib/roles";
import { requireDesk } from "@/lib/session";

/** Use on pages that only admins may open (users, team, drives, …). */
export async function requireAdminPage() {
  const session = await requireDesk();
  if (!canAccessAdmin(session.user.role)) {
    redirect("/admin");
  }
  return session;
}
