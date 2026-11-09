import { desc, eq, ne } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { posts as postsTable } from "@/db/schema";
import { posts as seedPosts, type Post } from "@/content/posts";
import { mediaUrl } from "@/lib/media";

export type { Post };

export type PostItem = Post & {
  id?: string;
  coverPublicId?: string;
  coverUrl?: string;
};

function withSeedIds(list: Post[]): PostItem[] {
  return list.map((post) => ({
    ...post,
    id: post.slug,
  }));
}

function mapRow(row: typeof postsTable.$inferSelect): PostItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    author: row.authorName || "DataBiz",
    tags: row.tags ?? [],
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    status: (row.status as Post["status"]) || "draft",
    coverPublicId: row.coverPublicId ?? undefined,
    coverUrl: mediaUrl(row.coverPublicId),
  };
}

export function isPostsDbReady() {
  return isDatabaseConfigured();
}

export async function listAdminPosts(): Promise<PostItem[]> {
  const db = getDb();
  if (!db) return withSeedIds(seedPosts);

  const rows = await db
    .select()
    .from(postsTable)
    .orderBy(desc(postsTable.updatedAt));
  return rows.map(mapRow);
}

export async function getAdminPost(id: string): Promise<PostItem | null> {
  const db = getDb();
  if (!db) {
    return withSeedIds(seedPosts).find((p) => p.id === id || p.slug === id) ?? null;
  }
  const [row] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, id))
    .limit(1);
  return row ? mapRow(row) : null;
}

export async function getPublishedPosts(): Promise<PostItem[]> {
  const seed = withSeedIds(seedPosts)
    .filter((p) => p.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const db = getDb();
  if (!db) return seed;

  const rows = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.status, "published"))
    .orderBy(desc(postsTable.publishedAt));
  const mapped = rows.map(mapRow);
  return mapped.length > 0 ? mapped : seed;
}

export async function getPostBySlug(slug: string): Promise<PostItem | null> {
  const seedMatch =
    withSeedIds(seedPosts).find(
      (p) => p.slug === slug && p.status === "published",
    ) ?? null;

  const db = getDb();
  if (!db) return seedMatch;

  const [row] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.slug, slug))
    .limit(1);

  if (!row || row.status === "draft") return seedMatch;
  return mapRow(row);
}

export async function listPublicPostSlugs() {
  const seedSlugs = seedPosts
    .filter((p) => p.status === "published")
    .map((p) => p.slug);

  const db = getDb();
  if (!db) return seedSlugs;

  const rows = await db
    .select({ slug: postsTable.slug })
    .from(postsTable)
    .where(ne(postsTable.status, "draft"));
  const dbSlugs = rows.map((r) => r.slug);
  return dbSlugs.length > 0 ? dbSlugs : seedSlugs;
}
