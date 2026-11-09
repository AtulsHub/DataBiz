import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  getEpisodeBySlug,
  listStaticEpisodeParams,
} from "@/lib/episodes";
import { getEventBySlug } from "@/lib/events";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Markdown } from "@/components/ui/Markdown";
import { PageHero } from "@/components/ui/PageHero";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listStaticEpisodeParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);
  if (!episode) return { title: "Episode not found" };
  return { title: episode.title, description: episode.summary };
}

async function RelatedEvent({ eventSlug }: { eventSlug: string }) {
  const event = await getEventBySlug(eventSlug);
  if (!event) return null;

  return (
    <section aria-labelledby="event-heading">
      <DeskLabel>
        <span id="event-heading">Recorded live at</span>
      </DeskLabel>
      <p className="mt-3 font-medium">{event.title}</p>
      <div className="mt-4">
        <Button href={`/events/${event.slug}`} variant="ghost" size="sm">
          Event page
        </Button>
      </div>
    </section>
  );
}

async function EpisodeContent({ slug }: { slug: string }) {
  await connection();
  const episode = await getEpisodeBySlug(slug);
  if (!episode) notFound();

  return (
    <>
      <PageHero
        index={formatDate(episode.publishedAt, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
        label="DataBrew episode"
        title={episode.title}
        description={episode.summary}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            {episode.embedUrl ? (
              <div className="aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-line bg-panel">
                <iframe
                  src={episode.embedUrl}
                  title={`${episode.title} — recording`}
                  className="h-full w-full"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <EmptyState
                label="Recording"
                title="The embed isn't published yet."
                body="The core will add the YouTube or Spotify recording here. Until then, the notes below cover the conversation."
                action={
                  episode.externalUrl
                    ? {
                        href: episode.externalUrl,
                        label: "Open on the platform",
                      }
                    : undefined
                }
              />
            )}

            <div className="mt-12">
              <DeskLabel index="Notes">Show notes</DeskLabel>
              <Markdown content={episode.showNotes} className="mt-4" />
            </div>
          </div>

          <aside
            className="space-y-10 lg:border-l lg:border-line lg:pl-8"
            aria-label="Episode details"
          >
            <section aria-labelledby="guests-heading">
              <DeskLabel>
                <span id="guests-heading">
                  {episode.guests.length === 1 ? "Guest" : "Guests"}
                </span>
              </DeskLabel>
              {episode.guests.length === 0 ? (
                <p className="mt-3 text-sm text-steel">No guests listed.</p>
              ) : (
                <ul className="mt-4 space-y-5">
                  {episode.guests.map((guest) => (
                    <li key={`${guest.name}-${guest.organization}`}>
                      <p className="font-display text-xl font-bold tracking-tight">
                        {guest.name}
                      </p>
                      <p className="text-sm text-steel">
                        {[guest.title, guest.organization]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {episode.eventSlug ? (
              <Suspense fallback={null}>
                <RelatedEvent eventSlug={episode.eventSlug} />
              </Suspense>
            ) : null}

            <Button href="/show" variant="link">
              ← All episodes
            </Button>
          </aside>
        </Container>
      </section>
    </>
  );
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-[50vh]" aria-hidden />}>
      <EpisodeContent slug={slug} />
    </Suspense>
  );
}
