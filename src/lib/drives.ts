import { and, asc, desc, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { drives as drivesTable } from "@/db/schema";
import { driveRoles } from "@/db/schema/hiring";
import type { Drive as SeedDrive } from "@/content/drives";
import { drives as seedDrives } from "@/content/drives";

export type OaMode = "quiz" | "upload" | "quiz_and_upload" | "live_quiz";

export type DriveRoleItem = {
  id: string;
  name: string;
  description: string;
  oaMode: OaMode;
  oaDeadline?: string;
  liveStartsAt?: string;
  liveEndsAt?: string;
  quizMinutes?: number | null;
  sortOrder: number;
};

export type DriveItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  opensAt: string;
  closesAt: string;
  status: "draft" | "open" | "closed";
  resultsPublishedAt?: string | null;
  roles: DriveRoleItem[];
};

export function isDrivesDbReady() {
  return isDatabaseConfigured();
}

function mapRole(row: typeof driveRoles.$inferSelect): DriveRoleItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    oaMode: (row.oaMode as OaMode) || "quiz",
    oaDeadline: row.oaDeadline?.toISOString(),
    liveStartsAt: row.liveStartsAt?.toISOString(),
    liveEndsAt: row.liveEndsAt?.toISOString(),
    quizMinutes: row.quizMinutes,
    sortOrder: row.sortOrder,
  };
}

function mapDrive(
  row: typeof drivesTable.$inferSelect,
  roles: DriveRoleItem[],
): DriveItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    opensAt: row.opensAt.toISOString(),
    closesAt: row.closesAt.toISOString(),
    status: (row.status as DriveItem["status"]) || "draft",
    resultsPublishedAt: row.resultsPublishedAt?.toISOString() ?? null,
    roles,
  };
}

function fromSeed(seed: SeedDrive): DriveItem {
  return {
    id: `seed-drive-${seed.slug}`,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    opensAt: seed.opensAt,
    closesAt: seed.closesAt,
    status: seed.status,
    roles: seed.roles.map((role, index) => ({
      id: `seed-role-${seed.slug}-${index}`,
      name: role.name,
      description: role.description,
      oaMode: "quiz" as const,
      sortOrder: index + 1,
    })),
  };
}

export function isDriveAcceptingApplications(
  drive: Pick<DriveItem, "status" | "opensAt" | "closesAt">,
  now = new Date(),
) {
  return (
    drive.status === "open" &&
    new Date(drive.opensAt) <= now &&
    new Date(drive.closesAt) >= now
  );
}

async function loadRolesForDrives(driveIds: string[]) {
  const map = new Map<string, DriveRoleItem[]>();
  if (driveIds.length === 0) return map;
  const db = getDb();
  if (!db) return map;

  const rows = await db
    .select()
    .from(driveRoles)
    .where(inArray(driveRoles.driveId, driveIds))
    .orderBy(asc(driveRoles.sortOrder), asc(driveRoles.name));

  for (const row of rows) {
    const list = map.get(row.driveId) ?? [];
    list.push(mapRole(row));
    map.set(row.driveId, list);
  }
  return map;
}

export async function listAdminDrives(): Promise<DriveItem[]> {
  const db = getDb();
  if (!db) return seedDrives.map(fromSeed);

  const rows = await db
    .select()
    .from(drivesTable)
    .orderBy(desc(drivesTable.opensAt));
  const roles = await loadRolesForDrives(rows.map((r) => r.id));
  return rows.map((row) => mapDrive(row, roles.get(row.id) ?? []));
}

export async function getAdminDrive(id: string): Promise<DriveItem | null> {
  const db = getDb();
  if (!db) {
    return (
      seedDrives.map(fromSeed).find((d) => d.id === id || d.slug === id) ?? null
    );
  }
  const [row] = await db
    .select()
    .from(drivesTable)
    .where(eq(drivesTable.id, id))
    .limit(1);
  if (!row) return null;
  const roles = await loadRolesForDrives([row.id]);
  return mapDrive(row, roles.get(row.id) ?? []);
}

export async function getPublicDriveBySlug(
  slug: string,
): Promise<DriveItem | null> {
  const seed =
    seedDrives
      .map(fromSeed)
      .find((d) => d.slug === slug && d.status !== "draft") ?? null;

  const db = getDb();
  if (!db) return seed;

  const [row] = await db
    .select()
    .from(drivesTable)
    .where(and(eq(drivesTable.slug, slug), ne(drivesTable.status, "draft")))
    .limit(1);
  if (!row) return seed;
  const roles = await loadRolesForDrives([row.id]);
  return mapDrive(row, roles.get(row.id) ?? []);
}

export async function getOpenDrive(now = new Date()): Promise<DriveItem | null> {
  const db = getDb();
  if (!db) {
    return (
      seedDrives
        .map(fromSeed)
        .find((d) => isDriveAcceptingApplications(d, now)) ?? null
    );
  }

  const rows = await db
    .select()
    .from(drivesTable)
    .where(
      and(
        eq(drivesTable.status, "open"),
        lte(drivesTable.opensAt, now),
        gte(drivesTable.closesAt, now),
      ),
    )
    .orderBy(desc(drivesTable.opensAt))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0]!;
  const roles = await loadRolesForDrives([row.id]);
  return mapDrive(row, roles.get(row.id) ?? []);
}

export async function listStaticDriveParams() {
  const db = getDb();
  if (!db) {
    const params = seedDrives
      .filter((d) => d.status !== "draft")
      .map((d) => ({ slug: d.slug }));
    return params.length > 0 ? params : [{ slug: "no-drive" }];
  }

  const rows = await db
    .select({ slug: drivesTable.slug })
    .from(drivesTable)
    .where(ne(drivesTable.status, "draft"));
  const params = rows.map((r) => ({ slug: r.slug }));
  return params.length > 0 ? params : [{ slug: "no-drive" }];
}

export async function countOpenDrives(now = new Date()) {
  const open = await getOpenDrive(now);
  return open ? 1 : 0;
}
