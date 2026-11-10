import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import {
  canAccessAdmin,
  canAccessDesk,
  isRole,
  type Role,
} from "@/lib/roles";

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

  // Touch cookies() so Cache Components treats this as request-time auth.
  const cookieStore = await cookies();
  const headerStore = await headers();
  const requestHeaders = new Headers(headerStore);
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
  if (!requestHeaders.get("cookie") && cookieHeader) {
    requestHeaders.set("cookie", cookieHeader);
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
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

/** Content desk: members, interviewers, and admins. */
export async function requireDesk() {
  const session = await requireSession("/admin");
  if (!canAccessDesk(session.user.role)) {
    redirect("/account");
  }
  return session;
}

/** Sensitive ops: publish, send mail, roles, hiring, roster. */
export async function requireAdmin() {
  const session = await requireSession("/admin");
  if (!canAccessAdmin(session.user.role)) {
    redirect("/account");
  }
  return session;
}
