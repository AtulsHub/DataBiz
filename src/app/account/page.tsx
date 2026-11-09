import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SignOutButton } from "@/components/account/SignOutButton";
import { getSession } from "@/lib/session";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Account",
  description: "Your DataBiz account after you sign in.",
};

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    return (
      <>
        <PageHero
          label="Account"
          title="You're not signed in."
          description="Your account is a private page for MANIT students. Sign in with your college email to see applications, RSVPs, and pathway progress."
        >
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/login?next=/account" variant="primary" size="md">
              Sign in
            </Button>
            <Button href="/faq" variant="ghost" size="md">
              Read the FAQ
            </Button>
          </div>
        </PageHero>
        <section className="py-12">
          <Container>
            <p className="max-w-xl text-sm text-mute">
              Auth backend:{" "}
              {isAuthConfigured()
                ? "configured — request a magic link from the sign-in page."
                : "not configured yet. Add Neon + Better Auth env vars from .env.example."}
            </p>
          </Container>
        </section>
      </>
    );
  }

  const { user } = session;

  return (
    <>
      <PageHero
        label="Account"
        title={user.name || "Your account"}
        description="Profile, applications, and event registrations will expand here as those features ship."
      >
        <div className="mt-6 flex flex-wrap gap-3">
          {user.role === "admin" ? (
            <Button href="/admin" variant="ember" size="md">
              Open admin
            </Button>
          ) : null}
          <SignOutButton />
        </div>
      </PageHero>
      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl space-y-8">
          <dl className="divide-y divide-line border-y border-line">
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="eyebrow">Email</dt>
              <dd className="text-ink">{user.email}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="eyebrow">Roll number</dt>
              <dd className="font-mono text-ink">{user.rollNumber ?? "—"}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="eyebrow">Role</dt>
              <dd className="capitalize text-ink">{user.role}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="eyebrow">Year</dt>
              <dd className="text-ink">{user.year ?? "Not set"}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="eyebrow">Branch</dt>
              <dd className="text-ink">{user.branch ?? "Not set"}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="eyebrow">Phone</dt>
              <dd className="text-ink">{user.phone ?? "Not set"}</dd>
            </div>
          </dl>
          <p className="text-sm text-mute">
            Hiring stages, RSVPs, and pathway toggles land in the next milestones.
            See{" "}
            <Link href="/privacy" className="text-ember hover:underline">
              privacy
            </Link>{" "}
            for what the society stores.
          </p>
        </Container>
      </section>
    </>
  );
}
