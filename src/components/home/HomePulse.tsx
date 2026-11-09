import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EventItem } from "@/lib/events";
import type { Post } from "@/content/posts";
import type { Episode } from "@/content/episodes";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";

type Props = {
  nextEvent: EventItem | null;
  latestPost: Post | null;
  latestEpisode: Episode | null;
};

export function HomePulse({ nextEvent, latestPost, latestEpisode }: Props) {
  return (
    <section className="border-b border-line py-16 sm:py-20">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <DeskLabel index="01">Live desk</DeskLabel>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl text-balance">
                What the society is publishing right now.
              </h2>
            </div>
            <p className="max-w-xs font-mono text-[0.7rem] uppercase leading-relaxed tracking-[0.14em] text-steel">
              Assembled from events, posts, and DataBrew — not hardcoded blocks.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <PulseCell
            className="lg:col-span-4"
            label="Next event"
            emptyTitle="No upcoming events right now"
            emptyBody="Browse past sessions and check back for the next announcement."
            emptyHref="/events"
            item={
              nextEvent
                ? {
                    meta: formatDate(nextEvent.startsAt),
                    title: nextEvent.title,
                    body: nextEvent.summary,
                    href: `/events/${nextEvent.slug}`,
                  }
                : null
            }
          />
          <PulseCell
            className="lg:col-span-5"
            featured
            label="Latest post"
            emptyTitle="Fresh ideas are on the way"
            emptyBody="Explore the full collection when a new article ships."
            emptyHref="/blog"
            item={
              latestPost
                ? {
                    meta: formatDate(latestPost.publishedAt),
                    title: latestPost.title,
                    body: latestPost.excerpt,
                    href: `/blog/${latestPost.slug}`,
                  }
                : null
            }
          />
          <PulseCell
            className="lg:col-span-3"
            label="DataBrew"
            emptyTitle="No episode yet"
            emptyBody="Interviews land here after each recording."
            emptyHref="/show"
            item={
              latestEpisode
                ? {
                    meta: formatDate(latestEpisode.publishedAt),
                    title: latestEpisode.title,
                    body: latestEpisode.summary,
                    href: `/show/${latestEpisode.slug}`,
                  }
                : null
            }
          />
        </div>
      </Container>
    </section>
  );
}

function PulseCell({
  label,
  item,
  emptyTitle,
  emptyBody,
  emptyHref,
  className,
  featured,
}: {
  label: string;
  item: { meta: string; title: string; body: string; href: string } | null;
  emptyTitle: string;
  emptyBody: string;
  emptyHref: string;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Reveal
      className={`group relative flex min-h-[19rem] flex-col overflow-hidden border border-line bg-paper-elevated p-6 transition-colors hover:border-signal/50 sm:p-7 ${featured ? "bg-[linear-gradient(160deg,var(--paper-elevated),color-mix(in_srgb,var(--signal-soft)_55%,var(--paper-elevated)))]" : ""} ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="absolute right-4 top-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel/70"
      >
        signal
      </span>
      <DeskLabel>{label}</DeskLabel>
      {item ? (
        <>
          <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-signal">
            {item.meta}
          </p>
          <h3
            className={`mt-3 font-display font-bold leading-snug tracking-tight text-ink ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}
          >
            <Link href={item.href} className="transition-colors hover:text-signal">
              {item.title}
            </Link>
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-steel line-clamp-4">
            {item.body}
          </p>
          <Link
            href={item.href}
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-signal transition-transform group-hover:translate-x-0.5"
          >
            Open <ArrowUpRight size={14} />
          </Link>
        </>
      ) : (
        <>
          <h3 className="mt-8 font-display text-xl font-bold tracking-tight text-ink">
            {emptyTitle}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
            {emptyBody}
          </p>
          <Link
            href={emptyHref}
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-signal"
          >
            View section <ArrowUpRight size={14} />
          </Link>
        </>
      )}
    </Reveal>
  );
}
