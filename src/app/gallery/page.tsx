import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { listGalleryPhotos } from "@/lib/event-photos";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from DataBiz events and sessions at NIT Bhopal.",
};

async function GalleryGrid() {
  await connection();
  const photos = await listGalleryPhotos();

  if (photos.length === 0) {
    return (
      <EmptyState
        label="Gallery"
        title="No photos published yet."
        body="After a session, the core adds photos on the event page. They show up here for everyone."
        action={{ href: "/events", label: "See events" }}
      />
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo, i) => (
        <li key={photo.id}>
          <Reveal y={12} delay={0.03 * Math.min(i, 8)}>
            <Link
              href={`/events/${photo.eventSlug}`}
              className="group block overflow-hidden rounded-[var(--radius)] border border-line bg-paper-elevated transition-colors hover:border-ink"
            >
              {photo.url ? (
                <Image
                  src={photo.url}
                  alt={photo.caption || photo.eventTitle}
                  width={800}
                  height={500}
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-panel" aria-hidden />
              )}
              <div className="space-y-1 p-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">
                  {formatDate(photo.eventStartsAt)}
                </p>
                <p className="font-medium text-ink group-hover:text-ember">
                  {photo.eventTitle}
                </p>
                {photo.caption ? (
                  <p className="text-sm text-steel">{photo.caption}</p>
                ) : null}
              </div>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export default function GalleryPage() {
  return (
    <>
      <PageHero
        index="07"
        label="Gallery"
        title="What the room looked like."
        description="Photos from workshops, talks, and DataBrew sessions — open to everyone, linked back to each event."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <Suspense fallback={<p className="text-sm text-mute">Loading gallery…</p>}>
            <GalleryGrid />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
