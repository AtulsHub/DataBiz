import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { userHasCredentialPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

async function AccountGate({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getSession();
  if (session && !(await userHasCredentialPassword(session.user.id))) {
    redirect("/set-password?next=%2Faccount");
  }
  return children;
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-16 text-sm text-mute">Loading account…</div>
      }
    >
      <AccountGate>{children}</AccountGate>
    </Suspense>
  );
}
