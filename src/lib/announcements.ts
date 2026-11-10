import { desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  announcements as announcementsTable,
  drives,
  episodes,
  events,
  posts,
} from "@/db/schema";
import {
  announcements as seedAnnouncements,
  type Announcement,
} from "@/content/announcements";

export type { Announcement };

export type AnnouncementItem = Announcement & {
  eventId?: string;
  postId?: string;
  driveId?: string;
  episodeId?: string;
};

export function isAnnouncementsDbReady() {
  return isDatabaseConfigured();
}

function withSeedIds(list: Announcement[]): AnnouncementItem[] {
  return list.map((item) => ({ ...item }));
}

async function resolveHref(row: typeof announcementsTable.$inferSelect) {
  const db = getDb();
  if (!db) return undefined;
  if (row.eventId) {
    const [event] = await db
      .select({ slug: events.slug })
      .from(events)
      .where(eq(events.id, row.eventId))
      .limit(1);
    if (event) return `/events/${event.slug}`;
  }
  if (row.postId) {
    const [post] = await db
      .select({ slug: posts.slug })
      .from(posts)
      .where(eq(posts.id, row.postId))
      .limit(1);
    if (post) return `/blog/${post.slug}`;
  }
  if (row.driveId) {
    const [drive] = await db
      .select({ slug: drives.slug })
      .from(drives)
      .where(eq(drives.id, row.driveId))
      .limit(1);
    if (drive) return `/join/${drive.slug}`;
  }
  if (row.episodeId) {
    const [episode] = await db
      .select({ slug: episodes.slug })
      .from(episodes)
      .where(eq(episodes.id, row.episodeId))
      .limit(1);
    if (episode) return `/show/${episode.slug}`;
  }
  return undefined;
}

function mapRow(
  row: typeof announcementsTable.$inferSelect,
  href?: string,
): AnnouncementItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
    status: (row.status as Announcement["status"]) || "draft",
    href,
    eventId: row.eventId ?? undefined,
    postId: row.postId ?? undefined,
    driveId: row.driveId ?? undefined,
    episodeId: row.episodeId ?? undefined,
  };
}

export async function listAdminAnnouncements(): Promise<AnnouncementItem[]> {
  const db = getDb();
  if (!db) return withSeedIds(seedAnnouncements);
  const rows = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.publishedAt));
  return Promise.all(
    rows.map(async (row) => mapRow(row, await resolveHref(row))),
  );
}

export async function getAdminAnnouncement(
  id: string,
): Promise<AnnouncementItem | null> {
  const db = getDb();
  if (!db) return withSeedIds(seedAnnouncements).find((a) => a.id === id) ?? null;
  const [row] = await db
    .select()
    .from(announcementsTable)
    .where(eq(announcementsTable.id, id))
    .limit(1);
  if (!row) return null;
  return mapRow(row, await resolveHref(row));
}

export async function getPublishedAnnouncements(): Promise<AnnouncementItem[]> {
  const seed = withSeedIds(seedAnnouncements)
    .filter((a) => a.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const db = getDb();
  if (!db) return seed;

  const rows = await db
    .select()
    .from(announcementsTable)
    .where(eq(announcementsTable.status, "published"))
    .orderBy(desc(announcementsTable.publishedAt));
  if (rows.length === 0) return seed;
  return Promise.all(
    rows.map(async (row) => mapRow(row, await resolveHref(row))),
  );
}

export async function getLatestAnnouncement(): Promise<AnnouncementItem | null> {
  const list = await getPublishedAnnouncements();
  return list[0] ?? null;
}
