import { and, asc, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { alumniProfiles as alumniTable } from "@/db/schema";
import {
  alumniProfiles as seedAlumni,
  type AlumniProfile,
} from "@/content/alumni";
import { mediaUrl } from "@/lib/media";

export type { AlumniProfile };

export type AlumniItem = AlumniProfile & {
  id?: string;
  photoPublicId?: string;
  photoUrl?: string;
};

function mapRow(row: typeof alumniTable.$inferSelect): AlumniItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    batch: row.batch,
    branch: row.branch,
    societyRole: row.societyRole,
    currentTitle: row.currentTitle,
    organization: row.organization,
    linkedinUrl: row.linkedinUrl ?? undefined,
    note: row.note ?? undefined,
    status: (row.status as AlumniProfile["status"]) || "pending",
    sortOrder: row.sortOrder,
    photoPublicId: row.photoPublicId ?? undefined,
    photoUrl: mediaUrl(row.photoPublicId),
  };
}

export function isAlumniDbReady() {
  return isDatabaseConfigured();
}

export async function getPublishedAlumni(batch?: number): Promise<AlumniItem[]> {
  const seed = seedAlumni
    .filter((a) => a.status === "published")
    .filter((a) => (batch ? a.batch === batch : true))
    .sort((a, b) => b.batch - a.batch || a.sortOrder - b.sortOrder);

  const db = getDb();
  if (!db) return seed;

  const rows = await db
    .select()
    .from(alumniTable)
    .where(
      batch
        ? and(eq(alumniTable.status, "published"), eq(alumniTable.batch, batch))
        : eq(alumniTable.status, "published"),
    )
    .orderBy(desc(alumniTable.batch), asc(alumniTable.sortOrder));

  const mapped = rows.map(mapRow);
  return mapped.length > 0 ? mapped : seed;
}

export async function listAdminAlumni(): Promise<AlumniItem[]> {
  const db = getDb();
  if (!db) return seedAlumni;

  const rows = await db
    .select()
    .from(alumniTable)
    .orderBy(desc(alumniTable.batch), asc(alumniTable.sortOrder));
  return rows.map(mapRow);
}

export async function getAdminAlumni(id: string): Promise<AlumniItem | null> {
  const db = getDb();
  if (!db) return seedAlumni.find((a) => a.slug === id) ?? null;

  const [row] = await db
    .select()
    .from(alumniTable)
    .where(eq(alumniTable.id, id))
    .limit(1);
  return row ? mapRow(row) : null;
}

export async function countPendingAlumni() {
  const db = getDb();
  if (!db) return 0;
  const rows = await db
    .select()
    .from(alumniTable)
    .where(eq(alumniTable.status, "pending"));
  return rows.length;
}
