"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  listMyApplications,
  listMyPathwayProgress,
  listMyRegistrations,
  listMyResources,
  type MyApplicationBundle,
  type MyRegistration,
  type MyResource,
} from "@/app/actions/account";
import type { PathwayProgressSummary } from "@/lib/pathways";
import { ApplicationCard } from "@/components/account/ApplicationCard";
import { canRunInterviews } from "@/lib/applications";
import { hasMinRole, type Role } from "@/lib/roles";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { AccountSkeleton } from "@/components/ui/PageLoader";
import { PageHero } from "@/components/ui/PageHero";
import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SignOutButton } from "@/components/account/SignOutButton";
import { Spinner } from "@/components/ui/Spinner";

export function AccountPanel() {
  const { data, isPending, error } = authClient.useSession();
  const [registrations, setRegistrations] = useState<MyRegistration[] | null>(
    null,
  );
  const [pathwayProgress, setPathwayProgress] = useState<
    PathwayProgressSummary[] | null
  >(null);
  const [applications, setApplications] = useState<MyApplicationBundle[] | null>(
    null,
  );
  const [resources, setResources] = useState<MyResource[] | null>(null);

  useEffect(() => {
    if (!data?.user) {
      setRegistrations(null);
      setPathwayProgress(null);
      setApplications(null);
      setResources(null);
      return;
    }
    let cancelled = false;
    void Promise.all([
      listMyRegistrations(),
      listMyPathwayProgress(),
      listMyApplications(),
      listMyResources(),
    ]).then(([regs, progress, apps, memberResources]) => {
      if (!cancelled) {
        setRegistrations(regs);
        setPathwayProgress(progress);
        setApplications(apps);
        setResources(memberResources);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [data?.user]);

  if (isPending) {
    return (
      <section className="py-12 sm:py-16">
        <Container className="max-w-5xl">
          <AccountSkeleton />
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <PageHero
        label="Account"
        title="Could not load session."
        description={error.message || "Try signing in again."}
      >
        <div className="mt-6">
          <Button href="/login?next=/account" variant="primary" size="md">
            Sign in
          </Button>
        </div>
      </PageHero>
    );
  }

  if (!data?.user) {
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
            <Button
              href="/login?mode=signup&next=/account"
              variant="ghost"
              size="md"
            >
              Sign up
            </Button>
            <Button href="/faq" variant="ghost" size="md">
              Read the FAQ
            </Button>
          </div>
        </PageHero>
      </>
    );
  }

  const user = data.user as {
    name?: string | null;
    email: string;
    rollNumber?: string | null;
    role?: string | null;
    year?: string | null;
    branch?: string | null;
    phone?: string | null;
  };

  return (
    <>
      <PageHero
        label="Account"
        title={user.name?.trim() || "Your account"}
        description="Change your password, edit your profile, and track RSVPs and pathways."
      >
        <div className="mt-6 flex flex-wrap gap-3">
          {hasMinRole((user.role as Role) || "applicant", "member") ? (
            <Button href="/admin" variant="ember" size="md">
              {user.role === "admin" ? "Open admin" : "Content desk"}
            </Button>
          ) : null}
          {canRunInterviews((user.role as Role) || "applicant") ? (
            <Button href="/interviews" variant="ghost" size="md">
              Interviews
            </Button>
          ) : null}
          <SignOutButton />
        </div>
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container className="grid max-w-5xl gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <DeskLabel>Identity</DeskLabel>
            <dl className="mt-5 divide-y divide-line border-y border-line">
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="eyebrow">Email</dt>
                <dd className="text-ink">{user.email}</dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="eyebrow">Roll number</dt>
                <dd className="font-mono text-ink">{user.rollNumber ?? "—"}</dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="eyebrow">Role</dt>
                <dd className="capitalize text-ink">{user.role ?? "applicant"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-mute">
              Email and roll number come from your MANIT address and can&apos;t
              be edited here. An admin sets role.
            </p>
          </div>

          <div>
            <DeskLabel>Profile</DeskLabel>
            <p className="mt-3 text-sm text-mute">
              Year, branch, and phone are used for event RSVPs and drive
              applications.
            </p>
            <div className="mt-6">
              <ProfileForm
                profile={{
                  name: user.name,
                  year: user.year,
                  branch: user.branch,
                  phone: user.phone,
                }}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <Container className="max-w-5xl">
          <DeskLabel>Sign-in</DeskLabel>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            Change password
          </h2>
          <div className="mt-8 max-w-md">
            <PasswordForm />
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <Container className="max-w-5xl">
          <DeskLabel>Hiring</DeskLabel>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            Applications
          </h2>
          <div className="mt-8 space-y-4">
            {applications === null ? (
              <ListLoading label="Loading applications…" />
            ) : applications.length === 0 ? (
              <p className="text-sm text-mute">
                No applications yet.{" "}
                <Link href="/join" className="text-ember hover:underline">
                  Check open drives
                </Link>
                .
              </p>
            ) : (
              applications.map(({ application, slots }) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  slots={slots}
                />
              ))
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <Container className="max-w-5xl">
          <DeskLabel>Your RSVPs</DeskLabel>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            Event registrations
          </h2>
          <div className="mt-8">
            {registrations === null ? (
              <ListLoading label="Loading registrations…" />
            ) : registrations.length === 0 ? (
              <p className="text-sm text-mute">
                No RSVPs yet.{" "}
                <Link href="/events" className="text-ember hover:underline">
                  Browse events
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {registrations.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-baseline justify-between gap-3 py-4"
                  >
                    <div>
                      <Link
                        href={`/events/${row.event.slug}`}
                        className="font-medium text-ink hover:text-ember"
                      >
                        {row.event.title}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-mute">
                        {formatDateTime(row.event.startsAt)} · {row.status}
                        {row.ticketCode ? ` · ${row.ticketCode}` : null}
                        {row.checkedInAt ? " · checked in" : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        href={`/account/tickets/${row.id}`}
                        variant="ember"
                        size="sm"
                      >
                        Virtual ID
                      </Button>
                      <Button
                        href={`/events/${row.event.slug}`}
                        variant="ghost"
                        size="sm"
                      >
                        Event
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>

      {hasMinRole((user.role as Role) || "applicant", "member") ? (
        <section className="border-t border-line py-16 sm:py-20">
          <Container className="max-w-5xl">
            <DeskLabel>Members</DeskLabel>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              Resources
            </h2>
            <div className="mt-8">
              {resources === null ? (
                <ListLoading label="Loading resources…" />
              ) : resources.length === 0 ? (
                <p className="text-sm text-mute">
                  No member resources published yet.
                </p>
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {resources.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-baseline justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="font-medium text-ink">{item.title}</p>
                        {item.description ? (
                          <p className="mt-1 text-sm text-mute">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      {item.href ? (
                        <Button href={item.href} external variant="ghost" size="sm">
                          Open
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-line py-16 sm:py-20">
        <Container className="max-w-5xl">
          <DeskLabel>Learn</DeskLabel>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            Pathway progress
          </h2>
          <div className="mt-8">
            {pathwayProgress === null ? (
              <ListLoading label="Loading pathway progress…" />
            ) : pathwayProgress.length === 0 ? (
              <p className="text-sm text-mute">
                Pathway tracking is for members. Browse{" "}
                <Link href="/learn" className="text-ember hover:underline">
                  /learn
                </Link>{" "}
                anytime; ask an admin if you need the member role.
              </p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {pathwayProgress.map((row) => (
                  <li
                    key={row.pathway.id}
                    className="flex flex-wrap items-baseline justify-between gap-3 py-4"
                  >
                    <div>
                      <Link
                        href={`/learn/${row.pathway.slug}`}
                        className="font-medium text-ink hover:text-ember"
                      >
                        {row.pathway.title}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-mute">
                        {row.completed}/{row.total} modules complete
                      </p>
                    </div>
                    <Button
                      href={`/learn/${row.pathway.slug}`}
                      variant="ghost"
                      size="sm"
                    >
                      Continue
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-8 text-sm text-mute">
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

function ListLoading({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-mute" aria-live="polite">
      <Spinner className="size-3.5" />
      {label}
    </p>
  );
}
