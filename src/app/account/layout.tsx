import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { AccountSkeleton } from "@/components/ui/PageLoader";
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
        <section className="py-12 sm:py-16">
          <Container className="max-w-5xl">
            <AccountSkeleton />
          </Container>
        </section>
      }
    >
      <AccountGate>{children}</AccountGate>
    </Suspense>
  );
}
