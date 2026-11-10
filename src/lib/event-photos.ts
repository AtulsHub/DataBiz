import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { eventPhotos } from "@/db/schema";
import { mediaUrl } from "@/lib/media";

export type EventPhotoItem = {
  id: string;
  eventId: string;
  publicId: string;
  url?: string;
  caption: string;
  sortOrder: number;
};

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
