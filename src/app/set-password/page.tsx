import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageLoader } from "@/components/ui/PageLoader";
import { SetPasswordForm } from "@/components/forms/SetPasswordForm";
import { SignOutButton } from "@/components/account/SignOutButton";
import { userHasCredentialPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create password",
  description: "Create a DataBiz password after verifying your college email.",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

async function SetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const nextPath = params.next?.trim() || "/account";
  const safeNext = nextPath.startsWith("/") ? nextPath : "/account";

  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/set-password?next=${safeNext}`)}`);
  }

  if (await userHasCredentialPassword(session.user.id)) {
    redirect(safeNext);
  }

  return (
    <section className="py-16 sm:py-24">
      <Container className="grid max-w-xl gap-8">
        <div>
          <p className="eyebrow">Almost done</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Create your password
          </h1>
          <p className="mt-4 text-mute">
            Your email is verified. Set a password now — required before you can
            use your account. From then on, sign in with{" "}
            <strong className="font-semibold text-ink">{session.user.email}</strong>{" "}
            and this password.
          </p>
        </div>
        <div className="border border-line bg-paper-elevated p-6 sm:p-8">
          <SetPasswordForm />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-mute">
          <span>Wrong account?</span>
          <SignOutButton />
        </div>
      </Container>
    </section>
  );
}

export default function SetPasswordPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PageLoader label="Preparing password setup…" />}>
      <SetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
