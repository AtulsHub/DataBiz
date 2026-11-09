import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { canAccessAdmin, isRole, type Role } from "@/lib/roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  rollNumber?: string | null;
  year?: string | null;
  branch?: string | null;
  phone?: string | null;
  role: Role;
};

export async function getSession() {
  if (!isAuthConfigured()) return null;
  const auth = getAuth();
  if (!auth) return null;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const role = isRole(session.user.role) ? session.user.role : "applicant";

  return {
    ...session,
    user: {
      ...session.user,
      role,
    } as SessionUser & typeof session.user,
  };
}

export async function requireSession(callbackURL = "/account") {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(callbackURL)}`);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession("/admin");
  if (!canAccessAdmin(session.user.role)) {
    redirect("/account");
  }
  return session;
}
