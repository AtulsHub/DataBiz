import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  pathwayModules as modulesTable,
  pathwayProgress as progressTable,
  pathways as pathwaysTable,
} from "@/db/schema";
import {
  pathways as seedPathways,
  type Pathway,
  type PathwayModule,
} from "@/content/pathways";
import { hasMinRole, type Role } from "@/lib/roles";

export type { Pathway, PathwayModule };

export type PathwayModuleItem = PathwayModule & {
  id: string;
};

export type PathwayItem = Omit<Pathway, "modules"> & {
  id: string;
  modules: PathwayModuleItem[];
};

function seedPathwayId(slug: string) {
  return `seed-pathway-${slug}`;
}

function seedModuleId(pathwaySlug: string, index: number) {
  return `seed-module-${pathwaySlug}-${index}`;
}

function fromSeed(): PathwayItem[] {
  return seedPathways
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pathway) => ({
      id: seedPathwayId(pathway.slug),
      slug: pathway.slug,
      title: pathway.title,
      summary: pathway.summary,
      discipline: pathway.discipline,
      status: pathway.status,
      sortOrder: pathway.sortOrder,
      modules: pathway.modules.map((mod, index) => ({
        id: seedModuleId(pathway.slug, index),
        ...mod,
      })),
    }));
}

export function isPathwaysDbReady() {
  return isDatabaseConfigured();
}

export function canTrackPathwayProgress(role: Role | null | undefined) {
  return Boolean(role && hasMinRole(role, "member"));
}

export async function ensureSeedPathways() {
  const db = getDb();
  if (!db) return { inserted: false };

  const existing = await db
    .select({ id: pathwaysTable.id })
    .from(pathwaysTable)
    .limit(1);
  if (existing.length > 0) return { inserted: false };

  for (const pathway of seedPathways) {
    const pathwayId = seedPathwayId(pathway.slug);
    await db.insert(pathwaysTable).values({
      id: pathwayId,
      slug: pathway.slug,
      title: pathway.title,
      summary: pathway.summary,
      discipline: pathway.discipline,
      status: pathway.status,
      sortOrder: pathway.sortOrder,
    });
    if (pathway.modules.length === 0) continue;
    await db.insert(modulesTable).values(
      pathway.modules.map((mod, index) => ({
        id: seedModuleId(pathway.slug, index),
        pathwayId,
        title: mod.title,
        description: mod.description,
        url: mod.url,
        sortOrder: index + 1,
      })),
    );
  }

  return { inserted: true };
}

async function loadModulesForPathways(
  pathwayIds: string[],
): Promise<Map<string, PathwayModuleItem[]>> {
  const map = new Map<string, PathwayModuleItem[]>();
  if (pathwayIds.length === 0) return map;

  const db = getDb();
  if (!db) return map;

  const rows = await db
    .select()
    .from(modulesTable)
    .where(inArray(modulesTable.pathwayId, pathwayIds))
    .orderBy(asc(modulesTable.sortOrder));

  for (const row of rows) {
    const list = map.get(row.pathwayId) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      description: row.description,
      url: row.url,
    });
    map.set(row.pathwayId, list);
  }
  return map;
}

function mapPathway(
  row: typeof pathwaysTable.$inferSelect,
  modules: PathwayModuleItem[],
): PathwayItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    discipline: (row.discipline as Pathway["discipline"]) || "other",
    status: (row.status as Pathway["status"]) || "draft",
    sortOrder: row.sortOrder,
    modules,
  };
}

export async function listAdminPathways(): Promise<PathwayItem[]> {
  const db = getDb();
  if (!db) return fromSeed();

  await ensureSeedPathways();
  const rows = await db
    .select()
    .from(pathwaysTable)
    .orderBy(asc(pathwaysTable.sortOrder), asc(pathwaysTable.title));
  const modules = await loadModulesForPathways(rows.map((r) => r.id));
  return rows.map((row) => mapPathway(row, modules.get(row.id) ?? []));
}

export async function getAdminPathway(id: string): Promise<PathwayItem | null> {
  const db = getDb();
  if (!db) {
    return fromSeed().find((p) => p.id === id || p.slug === id) ?? null;
  }

  await ensureSeedPathways();
  const [row] = await db
    .select()
    .from(pathwaysTable)
    .where(eq(pathwaysTable.id, id))
    .limit(1);
  if (!row) return null;
  const modules = await loadModulesForPathways([row.id]);
  return mapPathway(row, modules.get(row.id) ?? []);
}

export async function getPublishedPathways(): Promise<PathwayItem[]> {
  const seed = fromSeed().filter((p) => p.status === "published");
  const db = getDb();
  if (!db) return seed;

  await ensureSeedPathways();
  const rows = await db
    .select()
    .from(pathwaysTable)
    .where(eq(pathwaysTable.status, "published"))
    .orderBy(asc(pathwaysTable.sortOrder), asc(pathwaysTable.title));
  if (rows.length === 0) return seed;

  const modules = await loadModulesForPathways(rows.map((r) => r.id));
  return rows.map((row) => mapPathway(row, modules.get(row.id) ?? []));
}

export async function getPathwayBySlug(
  slug: string,
): Promise<PathwayItem | null> {
  const seedMatch =
    fromSeed().find((p) => p.slug === slug && p.status === "published") ?? null;
  const db = getDb();
  if (!db) return seedMatch;

  await ensureSeedPathways();
  const [row] = await db
    .select()
    .from(pathwaysTable)
    .where(
      and(eq(pathwaysTable.slug, slug), eq(pathwaysTable.status, "published")),
    )
    .limit(1);
  if (!row) return seedMatch;
  const modules = await loadModulesForPathways([row.id]);
  return mapPathway(row, modules.get(row.id) ?? []);
}

export async function listPublicPathwaySlugs(): Promise<string[]> {
  const pathways = await getPublishedPathways();
  return pathways.map((p) => p.slug);
}

export async function listStaticPathwayParams() {
  const slugs = await listPublicPathwaySlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "no-pathways" }];
}

export async function getCompletedModuleIds(
  userId: string,
  moduleIds: string[],
): Promise<Set<string>> {
  const completed = new Set<string>();
  if (moduleIds.length === 0) return completed;

  const db = getDb();
  if (!db) return completed;

  const rows = await db
    .select({ moduleId: progressTable.moduleId })
    .from(progressTable)
    .where(
      and(
        eq(progressTable.userId, userId),
        inArray(progressTable.moduleId, moduleIds),
      ),
    );

  for (const row of rows) completed.add(row.moduleId);
  return completed;
}

export type PathwayProgressSummary = {
  pathway: { id: string; slug: string; title: string };
  completed: number;
  total: number;
  modules: {
    id: string;
    title: string;
    completedAt: string | null;
  }[];
};

export async function listUserPathwayProgress(
  userId: string,
): Promise<PathwayProgressSummary[]> {
  const pathways = await getPublishedPathways();
  if (pathways.length === 0) return [];

  const moduleIds = pathways.flatMap((p) => p.modules.map((m) => m.id));
  const completed = await getCompletedModuleIds(userId, moduleIds);

  const db = getDb();
  const completedAt = new Map<string, string>();
  if (db && moduleIds.length > 0) {
    const rows = await db
      .select({
        moduleId: progressTable.moduleId,
        completedAt: progressTable.completedAt,
      })
      .from(progressTable)
      .where(
        and(
          eq(progressTable.userId, userId),
          inArray(progressTable.moduleId, moduleIds),
        ),
      );
    for (const row of rows) {
      completedAt.set(row.moduleId, row.completedAt.toISOString());
    }
  }

  return pathways.map((pathway) => ({
    pathway: {
      id: pathway.id,
      slug: pathway.slug,
      title: pathway.title,
    },
    completed: pathway.modules.filter((m) => completed.has(m.id)).length,
    total: pathway.modules.length,
    modules: pathway.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      completedAt: completedAt.get(mod.id) ?? null,
    })),
  }));
}
