import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to DataBiz with your MANIT student email.",
};

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <Container className="relative grid gap-12 lg:grid-cols-[1fr_26rem] lg:items-center lg:gap-20">
        <div>
          <p className="eyebrow">Sign in</p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-balance">
            No password. Just a link.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-mute">
            Enter your{" "}
            <strong className="font-semibold text-ink">@stu.manit.ac.in</strong>{" "}
            address and we&apos;ll email a one-time sign-in link. Accounts are
            limited to MANIT students.
          </p>
          <p className="mt-4 text-sm text-mute">
            Not a MANIT student? You don&apos;t need an account to read the
            blog, join events, or contact us —{" "}
            <Link href="/contact" className="font-medium text-ember hover:underline">
              write to the core
            </Link>
            .
          </p>
        </div>
        <div className="border border-line bg-paper-elevated p-6 sm:p-8">
          <Suspense fallback={<div className="h-40 animate-pulse bg-line/40" />}>
            <LoginForm />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
