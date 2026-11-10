import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/forms/LoginForm";
import { userHasCredentialPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in / Sign up",
  description:
    "Sign in with email and password, or sign up with your MANIT student email.",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const nextPath = params.next?.trim() || "/account";
  const safeNext = nextPath.startsWith("/") ? nextPath : "/account";
  const session = await getSession();
  if (session) {
    if (!(await userHasCredentialPassword(session.user.id))) {
      redirect(`/set-password?next=${encodeURIComponent(safeNext)}`);
    }
    redirect(safeNext);
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <Container className="relative grid gap-12 lg:grid-cols-[1fr_26rem] lg:items-center lg:gap-20">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-balance">
            Sign in or sign up
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-mute">
            <strong className="font-semibold text-ink">Sign up</strong> once with
            your{" "}
            <strong className="font-semibold text-ink">
              @stu.manit.ac.in
            </strong>{" "}
            address, create a password, then{" "}
            <strong className="font-semibold text-ink">Sign in</strong> with
            email and password every time after. Forgot password? Reset from the
            form.
          </p>
          <p className="mt-4 text-sm text-mute">
            Not a MANIT student? You don&apos;t need an account to read the
            blog, join events, or contact us —{" "}
            <Link
              href="/contact"
              className="font-medium text-ember hover:underline"
            >
              write to the core
            </Link>
            .
          </p>
        </div>
        <div className="border border-line bg-paper-elevated p-6 sm:p-8">
          <LoginForm />
        </div>
      </Container>
    </section>
  );
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <section className="py-16 sm:py-24">
          <Container className="text-sm text-mute">Checking session…</Container>
        </section>
      }
    >
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
