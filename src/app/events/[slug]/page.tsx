import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { events, getEvent } from "@/content/events";
import { getEpisode } from "@/content/episodes";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { Markdown } from "@/components/ui/Markdown";
import { PageHero } from "@/components/ui/PageHero";
import { EventRsvpForm } from "@/components/forms/EventRsvpForm";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return events.filter((e) => e.status !== "draft").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.summary };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const isPast = event.status === "past";
  const episode = event.episodeSlug ? getEpisode(event.episodeSlug) : undefined;

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
                  <p className="mt-4 text-steel">The recap hasn&apos;t been written yet.</p>
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

          <aside className="space-y-8 lg:border-l lg:border-line lg:pl-8" aria-label="Event details">
            <dl className="space-y-5">
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Starts
                </dt>
                <dd className="mt-1 font-medium">
                  <time dateTime={event.startsAt}>{formatDateTime(event.startsAt)}</time>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Ends
                </dt>
                <dd className="mt-1 font-medium">
                  <time dateTime={event.endsAt}>{formatDateTime(event.endsAt)}</time>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Venue
                </dt>
                <dd className="mt-1 font-medium">{event.venue}</dd>
              </div>
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

            {isPast ? (
              <div className="border border-line bg-paper-elevated p-5">
                <DeskLabel>RSVP closed</DeskLabel>
                <p className="mt-2 text-sm leading-relaxed text-steel">
                  This session took place on {formatDate(event.startsAt)}. Watch for the next one on the events page.
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
                  <EventRsvpForm eventTitle={event.title} eventSlug={event.slug} />
                </div>
              </div>
            )}
          </aside>
        </Container>
      </section>
    </>
  );
}
