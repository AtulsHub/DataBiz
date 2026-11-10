import { asc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { teamMembers as teamTable } from "@/db/schema";
import {
  teamMembers as seedTeam,
  type TeamMember,
} from "@/content/team";
import { mediaUrl } from "@/lib/media";

export type { TeamMember };

export type TeamMemberItem = TeamMember & {
  id: string;
  photoPublicId?: string;
  userId?: string;
};

function mapRow(row: typeof teamTable.$inferSelect): TeamMemberItem {
  return {
    id: row.id,
    name: row.name,
    roleTitle: row.roleTitle,
    bio: row.bio,
    photoPublicId: row.photoPublicId ?? undefined,
    photoUrl: mediaUrl(row.photoPublicId),
    sortOrder: row.sortOrder,
    isCurrent: row.isCurrent,
    yearLabel: row.yearLabel ?? undefined,
    userId: row.userId ?? undefined,
  };
}

export function isTeamDbReady() {
  return isDatabaseConfigured();
}

export async function getCurrentTeam(): Promise<TeamMemberItem[]> {
  const seed = seedTeam
    .filter((m) => m.isCurrent)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m, index) => ({
      id: `seed-team-${index}`,
      ...m,
    }));

  const db = getDb();
  if (!db) return seed;

  const rows = await db
    .select()
    .from(teamTable)
    .where(eq(teamTable.isCurrent, true))
    .orderBy(asc(teamTable.sortOrder), asc(teamTable.name));

  return rows.length > 0 ? rows.map(mapRow) : seed;
}

export async function listAdminTeam(): Promise<TeamMemberItem[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(teamTable)
    .orderBy(asc(teamTable.sortOrder), asc(teamTable.name));
  return rows.map(mapRow);
}

export async function getAdminTeamMember(
  id: string,
): Promise<TeamMemberItem | null> {
  const db = getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(teamTable)
    .where(eq(teamTable.id, id))
    .limit(1);
  return row ? mapRow(row) : null;
}
