import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPastEvents, getUpcomingEvents, type EventItem } from "@/lib/events";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Events",
  description: "Workshops, hackathons, and industry talks hosted by DataBiz.",
};

function EventRow({ event, past }: { event: EventItem; past?: boolean }) {
  return (
    <li>
      <Link
        href={`/events/${event.slug}`}
        className="group grid gap-2 py-6 transition-colors hover:bg-paper-elevated/80 sm:grid-cols-[9rem_1fr_auto] sm:gap-6 sm:px-2"
      >
        <time
          dateTime={event.startsAt}
          className="font-mono text-xs uppercase tracking-[0.12em] text-signal"
        >
          {formatDate(event.startsAt, { day: "2-digit", month: "short" })}
          <span className="block text-steel">
            {formatDate(event.startsAt, { year: "numeric", day: undefined, month: undefined })}
          </span>
        </time>
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight group-hover:text-signal">
            {event.title}
          </h3>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-steel">{event.summary}</p>
          <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-steel">
            {event.venue}
            {past ? " · Recap available" : ` · ${formatDateTime(event.startsAt)}`}
          </p>
        </div>
        <ArrowUpRight
          size={20}
          aria-hidden
          className="hidden text-ink/40 group-hover:text-signal sm:block"
        />
      </Link>
    </li>
  );
}

async function EventsContent() {
  await connection();
  const upcoming = await getUpcomingEvents();
  const past = await getPastEvents();

  return (
    <>
      <PageHero
        index="04"
        label="Events"
        title="Come to the room where it happens."
        description="Each event has its own page with details and RSVP. Past sessions keep a recap."
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Upcoming */}
          <div>
            <Reveal>
              <DeskLabel index="01">Upcoming</DeskLabel>
              <p className="mt-3 font-display text-6xl font-bold tracking-tighter">
                {String(upcoming.length).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm text-steel">
                {upcoming.length === 1 ? "event" : "events"} on the calendar
              </p>
            </Reveal>
            <div className="mt-8">
              {upcoming.length === 0 ? (
                <EmptyState
                  label="Calendar quiet"
                  title="No upcoming events right now."
                  body="The core announces events here first. Browse the past sessions, or read what we're writing in the meantime."
                  action={{ href: "/blog", label: "Read the blog" }}
                />
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {upcoming.map((event) => (
                    <EventRow key={event.slug} event={event} />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Past */}
          <div className="lg:border-l lg:border-line lg:pl-12">
            <Reveal>
              <DeskLabel index="02">Past</DeskLabel>
              <p className="mt-3 font-display text-6xl font-bold tracking-tighter text-steel">
                {String(past.length).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm text-steel">
                {past.length === 1 ? "session" : "sessions"} on record
              </p>
            </Reveal>
            <div className="mt-8">
              {past.length === 0 ? (
                <EmptyState
                  label="No archive yet"
                  title="Past events will be archived here."
                  body="Recaps and recordings appear after each session."
                />
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {past.map((event) => (
                    <EventRow key={event.slug} event={event} past />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<PageHero index="04" label="Events" title="Loading the calendar" />}>
      <EventsContent />
    </Suspense>
  );
}
