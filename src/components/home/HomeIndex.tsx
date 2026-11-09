import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EventItem } from "@/content/events";
import type { Post } from "@/content/posts";
import type { Episode } from "@/content/episodes";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";

type Props = {
  nextEvent: EventItem | null;
  latestPost: Post | null;
  latestEpisode: Episode | null;
  pastEvent: EventItem | null;
};

type Row = {
  kind: string;
  meta: string;
  title: string;
  body: string;
  href: string;
};

export function HomeIndex({
  nextEvent,
  latestPost,
  latestEpisode,
  pastEvent,
}: Props) {
  const rows: Row[] = [];

  if (nextEvent) {
    rows.push({
      kind: "Upcoming",
      meta: formatDate(nextEvent.startsAt),
      title: nextEvent.title,
      body: nextEvent.summary,
      href: `/events/${nextEvent.slug}`,
    });
  } else if (pastEvent) {
    rows.push({
      kind: "Recent event",
      meta: formatDate(pastEvent.startsAt),
      title: pastEvent.title,
      body: pastEvent.summary,
      href: `/events/${pastEvent.slug}`,
    });
  }

  if (latestPost) {
    rows.push({
      kind: "Writing",
      meta: formatDate(latestPost.publishedAt),
      title: latestPost.title,
      body: latestPost.excerpt,
      href: `/blog/${latestPost.slug}`,
    });
  }

  // Interview sessions live under events — not a separate nav product.
  if (latestEpisode) {
    rows.push({
      kind: "From events",
      meta: formatDate(latestEpisode.publishedAt),
      title: latestEpisode.title,
      body: "Interview session notes — part of the events programme.",
      href: latestEpisode.eventSlug
        ? `/events/${latestEpisode.eventSlug}`
        : `/show/${latestEpisode.slug}`,
    });
  }

  return (
    <section className="border-b border-line py-16 sm:py-20">
      <Container>
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Now</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
              What is moving through the society.
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-medium text-ember hover:underline"
          >
            All events <ArrowUpRight size={14} />
          </Link>
        </Reveal>

        {rows.length === 0 ? (
          <p className="mt-12 text-mute">Nothing published yet — check back soon.</p>
        ) : (
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {rows.map((row, i) => (
              <li key={row.href + row.kind}>
                <Reveal delay={0.04 * i}>
                  <Link
                    href={row.href}
                    className="group grid gap-3 py-8 transition-colors hover:bg-paper-elevated/70 sm:grid-cols-[8rem_1fr_auto] sm:gap-8 sm:px-2"
                  >
                    <div>
                      <p className="eyebrow text-ember">{row.kind}</p>
                      <p className="mt-2 font-mono text-[0.7rem] text-mute">
                        {row.meta}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold tracking-tight text-ink group-hover:text-ember sm:text-2xl text-balance">
                        {row.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mute line-clamp-2">
                        {row.body}
                      </p>
                    </div>
                    <span className="hidden items-center text-mute transition-colors group-hover:text-ember sm:inline-flex">
                      <ArrowUpRight size={18} />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
