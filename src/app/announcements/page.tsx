import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { connection } from "next/server";
import { getPublishedAnnouncements } from "@/lib/announcements";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Markdown } from "@/components/ui/Markdown";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Official notices from the DataBiz core.",
};

async function AnnouncementList() {
  await connection();
  const items = await getPublishedAnnouncements();

  if (items.length === 0) {
    return (
      <EmptyState
        label="All quiet"
        title="No announcements right now."
        body="When the core has something to announce — a drive, a schedule change, a result — it will be listed here."
        action={{ href: "/events", label: "See events" }}
      />
    );
  }

  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <li key={item.id}>
          <Reveal
            y={10}
            delay={0.03 * i}
            className="grid gap-3 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8"
          >
            <time
              dateTime={item.publishedAt}
              className="font-mono text-xs uppercase tracking-[0.12em] text-signal"
            >
              {formatDate(item.publishedAt)}
            </time>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {item.title}
              </h2>
              <Markdown
                content={item.body}
                className="mt-2 max-w-2xl text-steel"
              />
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-signal hover:underline"
                >
                  Read more <ArrowUpRight size={16} aria-hidden />
                </a>
              ) : null}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export default function AnnouncementsPage() {
  return (
    <>
      <PageHero
        index="08"
        label="Announcements"
        title="Official notices, in order."
        description="Newest first. Anything that affects members is posted here before anywhere else."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <Suspense fallback={<p className="text-sm text-mute">Loading…</p>}>
            <AnnouncementList />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
