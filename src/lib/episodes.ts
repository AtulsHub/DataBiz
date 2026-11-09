import { asc, desc, eq, inArray, ne } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  episodeGuests as guestsTable,
  episodes as episodesTable,
  events as eventsTable,
} from "@/db/schema";
import {
  episodes as seedEpisodes,
  type Episode,
  type EpisodeGuest,
} from "@/content/episodes";
import { mediaUrl } from "@/lib/media";

export type { Episode, EpisodeGuest };

export type EpisodeItem = Episode & {
  id?: string;
  coverPublicId?: string;
  eventId?: string;
};

export function isEpisodesDbReady() {
  return isDatabaseConfigured();
}

function withSeedIds(list: Episode[]): EpisodeItem[] {
  return list.map((episode) => ({
    ...episode,
    id: episode.slug,
  }));
}

async function loadGuests(
  episodeIds: string[],
): Promise<Map<string, EpisodeGuest[]>> {
  const map = new Map<string, EpisodeGuest[]>();
  if (episodeIds.length === 0) return map;

  const db = getDb();
  if (!db) return map;

  const rows = await db
    .select()
    .from(guestsTable)
    .where(inArray(guestsTable.episodeId, episodeIds))
    .orderBy(asc(guestsTable.sortOrder));

  for (const row of rows) {
    const list = map.get(row.episodeId) ?? [];
    list.push({
      name: row.name,
      title: row.title,
      organization: row.organization,
    });
    map.set(row.episodeId, list);
  }
  return map;
}

async function loadEventSlugs(
  eventIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(eventIds.filter(Boolean))];
  if (unique.length === 0) return map;

  const db = getDb();
  if (!db) return map;

  const rows = await db
    .select({ id: eventsTable.id, slug: eventsTable.slug })
    .from(eventsTable)
    .where(inArray(eventsTable.id, unique));

  for (const row of rows) map.set(row.id, row.slug);
  return map;
}

function mapRow(
  row: typeof episodesTable.$inferSelect,
  guests: EpisodeGuest[],
  eventSlug?: string,
): EpisodeItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    showNotes: row.showNotes,
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
    status: (row.status as Episode["status"]) || "draft",
    provider: (row.provider as Episode["provider"]) || "youtube",
    embedUrl: row.embedUrl ?? undefined,
    externalUrl: row.externalUrl ?? undefined,
    eventId: row.eventId ?? undefined,
    eventSlug,
    coverPublicId: row.coverPublicId ?? undefined,
    coverUrl: mediaUrl(row.coverPublicId),
    guests,
  };
}

export async function listAdminEpisodes(): Promise<EpisodeItem[]> {
  const db = getDb();
  if (!db) return withSeedIds(seedEpisodes);

  const rows = await db
    .select()
    .from(episodesTable)
    .orderBy(desc(episodesTable.publishedAt), desc(episodesTable.title));
  const guests = await loadGuests(rows.map((r) => r.id));
  const eventSlugs = await loadEventSlugs(
    rows.map((r) => r.eventId).filter((id): id is string => Boolean(id)),
  );
  return rows.map((row) =>
    mapRow(
      row,
      guests.get(row.id) ?? [],
      row.eventId ? eventSlugs.get(row.eventId) : undefined,
    ),
  );
}

export async function getAdminEpisode(id: string): Promise<EpisodeItem | null> {
  const db = getDb();
  if (!db) {
    return (
      withSeedIds(seedEpisodes).find((e) => e.id === id || e.slug === id) ??
      null
    );
  }

  const [row] = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.id, id))
    .limit(1);
  if (!row) return null;

  const guests = await loadGuests([row.id]);
  const eventSlugs = await loadEventSlugs(row.eventId ? [row.eventId] : []);
  return mapRow(
    row,
    guests.get(row.id) ?? [],
    row.eventId ? eventSlugs.get(row.eventId) : undefined,
  );
}

export async function getPublishedEpisodes(): Promise<EpisodeItem[]> {
  const seed = withSeedIds(seedEpisodes)
    .filter((e) => e.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const db = getDb();
  if (!db) return seed;

  const rows = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.status, "published"))
    .orderBy(desc(episodesTable.publishedAt));
  if (rows.length === 0) return seed;

  const guests = await loadGuests(rows.map((r) => r.id));
  const eventSlugs = await loadEventSlugs(
    rows.map((r) => r.eventId).filter((id): id is string => Boolean(id)),
  );
  return rows.map((row) =>
    mapRow(
      row,
      guests.get(row.id) ?? [],
      row.eventId ? eventSlugs.get(row.eventId) : undefined,
    ),
  );
}

export async function getEpisodeBySlug(
  slug: string,
): Promise<EpisodeItem | null> {
  const seedMatch =
    withSeedIds(seedEpisodes).find(
      (e) => e.slug === slug && e.status === "published",
    ) ?? null;

  const db = getDb();
  if (!db) return seedMatch;

  const [row] = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.slug, slug))
    .limit(1);

  if (!row || row.status === "draft") return seedMatch;

  const guests = await loadGuests([row.id]);
  const eventSlugs = await loadEventSlugs(row.eventId ? [row.eventId] : []);
  return mapRow(
    row,
    guests.get(row.id) ?? [],
    row.eventId ? eventSlugs.get(row.eventId) : undefined,
  );
}

export async function getPublishedEpisodeByEventId(
  eventId: string,
): Promise<EpisodeItem | null> {
  if (!eventId) return null;

  const db = getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(episodesTable)
    .where(
      // Prefer the newest published episode linked to this event.
      eq(episodesTable.eventId, eventId),
    )
    .orderBy(desc(episodesTable.publishedAt))
    .limit(1);

  if (!row || row.status !== "published") return null;

  const guests = await loadGuests([row.id]);
  const eventSlugs = await loadEventSlugs([eventId]);
  return mapRow(row, guests.get(row.id) ?? [], eventSlugs.get(eventId));
}

export async function getLatestEpisode(): Promise<EpisodeItem | null> {
  const list = await getPublishedEpisodes();
  return list[0] ?? null;
}

export async function listPublicEpisodeSlugs() {
  const seedSlugs = seedEpisodes
    .filter((e) => e.status === "published")
    .map((e) => e.slug);

  const db = getDb();
  if (!db) return seedSlugs;

  const rows = await db
    .select({ slug: episodesTable.slug })
    .from(episodesTable)
    .where(ne(episodesTable.status, "draft"));
  const dbSlugs = rows.map((r) => r.slug);
  return dbSlugs.length > 0 ? dbSlugs : seedSlugs;
}

/** Cache Components requires at least one static param. */
export async function listStaticEpisodeParams() {
  const slugs = await listPublicEpisodeSlugs();
  return slugs.length > 0
    ? slugs.map((slug) => ({ slug }))
    : [{ slug: "no-episodes" }];
}

export async function listEventsForEpisodeLink(): Promise<
  { id: string; title: string; slug: string; status: string }[]
> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      slug: eventsTable.slug,
      status: eventsTable.status,
    })
    .from(eventsTable)
    .where(ne(eventsTable.status, "draft"))
    .orderBy(desc(eventsTable.startsAt));
  return rows;
}
