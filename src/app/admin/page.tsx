import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Container } from "@/components/ui/Container";
import { isDatabaseConfigured } from "@/db";
import { getUpcomingEvents, isEventsDbReady } from "@/lib/events";

export const metadata: Metadata = {
  title: "Admin",
};

async function AdminHomeContent() {
  await connection();
  const upcoming = isEventsDbReady()
    ? await getUpcomingEvents(new Date())
    : [];

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {[
        {
          label: "Database",
          value: isDatabaseConfigured() ? "Connected" : "Not configured",
          href: undefined as string | undefined,
        },
        {
          label: "Open drive",
          value: "—",
          href: undefined,
        },
        {
          label: "Upcoming events",
          value: String(upcoming.length),
          href: "/admin/events",
        },
      ].map((card) => {
        const inner = (
          <>
            <p className="eyebrow">{card.label}</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
              {card.value}
            </p>
          </>
        );
        return card.href ? (
          <Link
            key={card.label}
            href={card.href}
            className="border border-line bg-paper-elevated px-5 py-6 transition-colors hover:border-ember/40"
          >
            {inner}
          </Link>
        ) : (
          <div
            key={card.label}
            className="border border-line bg-paper-elevated px-5 py-6"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Semester desk
      </h1>
      <p className="mt-3 max-w-2xl text-mute leading-relaxed">
        Publish events, posts, pathways, and run drives from here. Events and
        signed poster uploads are live; the other editors ship next.
      </p>
      <Suspense
        fallback={
          <p className="mt-10 text-sm text-mute">Loading desk counts…</p>
        }
      >
        <AdminHomeContent />
      </Suspense>
    </Container>
  );
}
