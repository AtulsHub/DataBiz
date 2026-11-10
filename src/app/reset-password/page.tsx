import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { FormSkeleton } from "@/components/ui/PageLoader";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new DataBiz password.",
};

export default function ResetPasswordPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid max-w-xl gap-8">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Choose a new password
          </h1>
          <p className="mt-4 text-mute">
            After you save it, sign in with your college email and password —
            no magic link needed.
          </p>
        </div>
        <div className="border border-line bg-paper-elevated p-6 sm:p-8">
          <Suspense fallback={<FormSkeleton />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
        <p className="text-sm text-mute">
          Link expired?{" "}
          <Link href="/login" className="font-medium text-ember hover:underline">
            Request another from sign in
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
