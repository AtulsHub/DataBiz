import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getPublishedAnnouncements } from "@/content/announcements";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Official notices from the DataBiz core.",
};

export default function AnnouncementsPage() {
  const items = getPublishedAnnouncements();

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
          {items.length === 0 ? (
            <EmptyState
              label="All quiet"
              title="No announcements right now."
              body="When the core has something to announce — a drive, a schedule change, a result — it will be listed here."
              action={{ href: "/events", label: "See events" }}
            />
          ) : (
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
                      <h2 className="font-display text-2xl font-bold tracking-tight">{item.title}</h2>
                      <p className="mt-2 max-w-2xl leading-relaxed text-steel">{item.body}</p>
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
          )}
        </Container>
      </section>
    </>
  );
}
