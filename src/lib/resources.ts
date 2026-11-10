import { asc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { resources as resourcesTable } from "@/db/schema";
import { signedPrivateFileUrl, isCloudinaryConfigured } from "@/lib/cloudinary";

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  url?: string;
  publicId?: string;
  sortOrder: number;
};

export function isResourcesDbReady() {
  return isDatabaseConfigured();
}

function mapRow(row: typeof resourcesTable.$inferSelect): ResourceItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url ?? undefined,
    publicId: row.publicId ?? undefined,
    sortOrder: row.sortOrder,
  };
}

export async function listResources(): Promise<ResourceItem[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(resourcesTable)
    .orderBy(asc(resourcesTable.sortOrder), asc(resourcesTable.title));
  return rows.map(mapRow);
}

export async function getAdminResource(id: string): Promise<ResourceItem | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(resourcesTable)
    .where(eq(resourcesTable.id, id))
    .limit(1);
  return row ? mapRow(row) : null;
}

export function resourceHref(item: ResourceItem): string | undefined {
  if (item.url) return item.url;
  if (item.publicId) return `/api/resources/${item.id}`;
  return undefined;
}

export async function mintResourceFileUrl(publicId: string) {
  if (!isCloudinaryConfigured()) return null;
  try {
    return signedPrivateFileUrl(publicId, { expiresInSeconds: 60 * 15 });
  } catch {
    return null;
  }
}
