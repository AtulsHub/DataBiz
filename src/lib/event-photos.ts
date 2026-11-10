import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { eventPhotos, events } from "@/db/schema";
import { mediaUrl } from "@/lib/media";

export type EventPhotoItem = {
  id: string;
  eventId: string;
  publicId: string;
  url?: string;
  caption: string;
  sortOrder: number;
};

export type GalleryPhotoItem = EventPhotoItem & {
  eventSlug: string;
  eventTitle: string;
  eventStartsAt: string;
};

export type GalleryEventSection = {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventStartsAt: string;
  photos: GalleryPhotoItem[];
};

/** Group flat gallery photos into event sections (newest event first). */
export function groupGalleryByEvent(
  photos: GalleryPhotoItem[],
): GalleryEventSection[] {
  const sections = new Map<string, GalleryEventSection>();

  for (const photo of photos) {
    const existing = sections.get(photo.eventId);
    if (existing) {
      existing.photos.push(photo);
      continue;
    }
    sections.set(photo.eventId, {
      eventId: photo.eventId,
      eventSlug: photo.eventSlug,
      eventTitle: photo.eventTitle,
      eventStartsAt: photo.eventStartsAt,
      photos: [photo],
    });
  }

  return [...sections.values()].sort(
    (a, b) =>
      new Date(b.eventStartsAt).getTime() - new Date(a.eventStartsAt).getTime(),
  );
}

function mapRow(row: typeof eventPhotos.$inferSelect): EventPhotoItem {
  return {
    id: row.id,
    eventId: row.eventId,
    publicId: row.publicId,
    url: mediaUrl(row.publicId),
    caption: row.caption,
    sortOrder: row.sortOrder,
  };
}

export async function listEventPhotos(
  eventId: string,
): Promise<EventPhotoItem[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(eventPhotos)
    .where(eq(eventPhotos.eventId, eventId))
    .orderBy(asc(eventPhotos.sortOrder));
  return rows.map(mapRow);
}

/** Admin gallery: all event photos, newest events first. */
export async function listAdminGalleryPhotos(): Promise<GalleryPhotoItem[]> {
  const db = getDb();
  if (!db) return [];

  const allEvents = await db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      startsAt: events.startsAt,
    })
    .from(events)
    .orderBy(desc(events.startsAt));

  if (allEvents.length === 0) return [];

  const eventMap = new Map(allEvents.map((e) => [e.id, e]));
  const rows = await db
    .select()
    .from(eventPhotos)
    .where(
      inArray(
        eventPhotos.eventId,
        allEvents.map((e) => e.id),
      ),
    )
    .orderBy(asc(eventPhotos.sortOrder));

  const items: GalleryPhotoItem[] = [];
  for (const row of rows) {
    const event = eventMap.get(row.eventId);
    if (!event) continue;
    items.push({
      ...mapRow(row),
      eventSlug: event.slug,
      eventTitle: event.title,
      eventStartsAt: event.startsAt.toISOString(),
    });
  }

  items.sort((a, b) => {
    const byEvent =
      new Date(b.eventStartsAt).getTime() - new Date(a.eventStartsAt).getTime();
    if (byEvent !== 0) return byEvent;
    return a.sortOrder - b.sortOrder;
  });

  return items;
}

/** Public gallery: photos from non-draft events, newest events first. */
export async function listGalleryPhotos(): Promise<GalleryPhotoItem[]> {
  const db = getDb();
  if (!db) return [];

  const publicEvents = await db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      startsAt: events.startsAt,
    })
    .from(events)
    .where(inArray(events.status, ["past", "published"]))
    .orderBy(desc(events.startsAt));

  if (publicEvents.length === 0) return [];

  const eventMap = new Map(publicEvents.map((e) => [e.id, e]));
  const rows = await db
    .select()
    .from(eventPhotos)
    .where(
      inArray(
        eventPhotos.eventId,
        publicEvents.map((e) => e.id),
      ),
    )
    .orderBy(asc(eventPhotos.sortOrder));

  const items: GalleryPhotoItem[] = [];
  for (const row of rows) {
    const event = eventMap.get(row.eventId);
    if (!event) continue;
    items.push({
      ...mapRow(row),
      eventSlug: event.slug,
      eventTitle: event.title,
      eventStartsAt: event.startsAt.toISOString(),
    });
  }

  // Keep photos grouped by event order (newest event first).
  items.sort((a, b) => {
    const byEvent =
      new Date(b.eventStartsAt).getTime() - new Date(a.eventStartsAt).getTime();
    if (byEvent !== 0) return byEvent;
    return a.sortOrder - b.sortOrder;
  });

  return items;
}
