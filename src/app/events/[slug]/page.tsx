import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  countRegistered,
  getEventBySlug,
  isEventsDbReady,
  listStaticEventParams,
  rsvpClosedReason,
  rsvpOpen,
} from "@/lib/events";
import { getEpisode } from "@/content/episodes";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { Markdown } from "@/components/ui/Markdown";
import { PageHero } from "@/components/ui/PageHero";
import { EventRsvpForm } from "@/components/forms/EventRsvpForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listStaticEventParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.summary };
}

async function EventContent({ slug }: { slug: string }) {
  await connection();
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const now = new Date();
  const isPast = event.status === "past";
  const registeredCount = event.id ? await countRegistered(event.id) : 0;
  const canRsvp = rsvpOpen(event, registeredCount, now);
  const closedReason = rsvpClosedReason(event, registeredCount, now);
  const episode = event.episodeSlug ? getEpisode(event.episodeSlug) : undefined;
  const session = await getSession();
  const databaseReady = isEventsDbReady();

  const nameParts = (session?.user.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const defaults = session
    ? {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: session.user.email,
        year: session.user.year ?? "",
        branch: session.user.branch ?? "",
      }
    : undefined;

  return (
    <>
      <PageHero
        index={isPast ? "Past" : "Upcoming"}
        label="Event"
        title={event.title}
        description={event.summary}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <article>
            {event.posterUrl ? (
              <Image
                src={event.posterUrl}
                alt={`Poster for ${event.title}`}
                width={1200}
                height={675}
                sizes="(min-width: 1024px) 44rem, 100vw"
                className="mb-10 h-auto w-full rounded-[var(--radius-lg)] border border-line"
              />
            ) : null}
            <Markdown content={event.body} />

            {isPast ? (
              <div className="mt-12 border-t border-line pt-10">
                <DeskLabel index="Recap">What happened</DeskLabel>
                {event.recapBody ? (
                  <Markdown content={event.recapBody} className="mt-5" />
                ) : (
                  <p className="mt-4 text-steel">
                    The recap hasn&apos;t been written yet.
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  {event.recordingUrl ? (
                    <Button href={event.recordingUrl} external variant="signal">
                      Watch recording
                    </Button>
                  ) : null}
                  {episode ? (
                    <Button href={`/show/${episode.slug}`} variant="primary">
                      Episode page
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </article>

          <aside
            className="space-y-8 lg:border-l lg:border-line lg:pl-8"
            aria-label="Event details"
          >
            <dl className="space-y-5">
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Starts
                </dt>
                <dd className="mt-1 font-medium">
                  <time dateTime={event.startsAt}>
                    {formatDateTime(event.startsAt)}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Ends
                </dt>
                <dd className="mt-1 font-medium">
                  <time dateTime={event.endsAt}>
                    {formatDateTime(event.endsAt)}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Venue
                </dt>
                <dd className="mt-1 font-medium">{event.venue || "TBA"}</dd>
              </div>
              {event.capacity != null ? (
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                    Seats
                  </dt>
                  <dd className="mt-1 font-medium">
                    {registeredCount} / {event.capacity} registered
                  </dd>
                </div>
              ) : null}
              {!isPast && event.meetingUrl ? (
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                    Meeting link
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={event.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-signal hover:underline"
                    >
                      Join online
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>

            {isPast || !canRsvp ? (
              <div className="border border-line bg-paper-elevated p-5">
                <DeskLabel>RSVP closed</DeskLabel>
                <p className="mt-2 text-sm leading-relaxed text-steel">
                  {isPast
                    ? `This session took place on ${formatDate(event.startsAt)}. Watch for the next one on the events page.`
                    : closedReason}
                </p>
                <div className="mt-4">
                  <Button href="/events" variant="ghost" size="sm">
                    All events
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-line bg-paper-elevated p-5">
                <DeskLabel tone="signal">RSVP</DeskLabel>
                <div className="mt-4">
                  <EventRsvpForm
                    eventId={event.id ?? event.slug}
                    eventTitle={event.title}
                    eventSlug={event.slug}
                    defaults={defaults}
                    databaseReady={databaseReady}
                  />
                </div>
              </div>
            )}
          </aside>
        </Container>
      </section>
    </>
  );
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <PageHero index="…" label="Event" title="Loading event details" />
      }
    >
      <EventContent slug={slug} />
    </Suspense>
  );
}
