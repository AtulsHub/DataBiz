import { asc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { siteSettings, sponsors as sponsorsTable } from "@/db/schema";
import { mediaUrl } from "@/lib/media";
import { signedPrivateFileUrl } from "@/lib/cloudinary";

export type SponsorItem = {
  id: string;
  name: string;
  logoPublicId?: string;
  logoUrl?: string;
  url?: string;
  blurb?: string;
  sortOrder: number;
};

export const BROCHURE_SETTING_KEY = "brochure_public_id";

export function isSponsorsDbReady() {
  return isDatabaseConfigured();
}

function mapSponsor(row: typeof sponsorsTable.$inferSelect): SponsorItem {
  return {
    id: row.id,
    name: row.name,
    logoPublicId: row.logoPublicId ?? undefined,
    logoUrl: mediaUrl(row.logoPublicId),
    url: row.url ?? undefined,
    blurb: row.blurb ?? undefined,
    sortOrder: row.sortOrder,
  };
}

export async function listSponsors(): Promise<SponsorItem[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(sponsorsTable)
    .orderBy(asc(sponsorsTable.sortOrder), asc(sponsorsTable.name));
  return rows.map(mapSponsor);
}

export async function getAdminSponsor(id: string): Promise<SponsorItem | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(sponsorsTable)
    .where(eq(sponsorsTable.id, id))
    .limit(1);
  return row ? mapSponsor(row) : null;
}

export async function getBrochurePublicId(): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, BROCHURE_SETTING_KEY))
    .limit(1);
  return row?.value?.trim() || null;
}

export async function getBrochureDownloadUrl(): Promise<string | undefined> {
  const publicId = await getBrochurePublicId();
  if (!publicId) return undefined;
  if (/^https?:\/\//i.test(publicId)) return publicId;
  try {
    return signedPrivateFileUrl(publicId, { expiresInSeconds: 60 * 30 });
  } catch {
    const cloud =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
      process.env.CLOUDINARY_CLOUD_NAME?.trim();
    if (!cloud) return undefined;
    return `https://res.cloudinary.com/${cloud}/raw/upload/${publicId}`;
  }
}
