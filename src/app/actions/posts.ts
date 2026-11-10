"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { posts } from "@/db/schema";
import { clampToDraftIfNeeded } from "@/lib/publish";
import { requireDesk } from "@/lib/session";
import { slugify } from "@/lib/slug";
import type { ActionResult } from "@/app/actions/events";

const postFields = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().default(""),
  body: z.string().trim().default(""),
  authorName: z.string().trim().min(1, "Author is required."),
  tags: z.string().trim().default(""),
  status: z.enum(["draft", "published"]),
  coverPublicId: z.string().trim().optional(),
});

function requirePostsDb(): ActionResult | null {
  if (!isDatabaseConfigured() || !getDb()) {
    return {
      ok: false,
      error:
        "DATABASE_URL is not set. Add Neon credentials to .env.local and run pnpm db:push.",
    };
  }
  return null;
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Prefer the clicked submit button (`intent`) over the status <select>. */
function resolvePostStatus(formData: FormData): "draft" | "published" {
  const intent = formString(formData, "intent");
  if (intent === "publish") return "published";
  if (intent === "draft") return "draft";
  const status = formString(formData, "status");
  return status === "published" ? "published" : "draft";
}

function parsePostForm(formData: FormData) {
  return postFields.safeParse({
    title: formString(formData, "title"),
    slug: formString(formData, "slug") || undefined,
    excerpt: formString(formData, "excerpt"),
    body: formString(formData, "body"),
    authorName: formString(formData, "authorName"),
    tags: formString(formData, "tags"),
    status: resolvePostStatus(formData),
    coverPublicId: formString(formData, "coverPublicId") || undefined,
  });
}

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function uniqueSlug(base: string, excludeId?: string) {
  const db = getDb()!;
  let candidate = slugify(base) || `post-${Date.now()}`;
  let attempt = 0;
  while (attempt < 20) {
    const [existing] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, candidate))
      .limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    attempt += 1;
    candidate = `${slugify(base) || "post"}-${attempt + 1}`;
  }
  return `${candidate}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createPost(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireDesk();
  const blocked = requirePostsDb();
  if (blocked) return blocked;

  const parsed = parsePostForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const status = clampToDraftIfNeeded(
    session.user.role,
    parsed.data.status,
    "draft",
  );

  let id: string;
  try {
    const db = getDb()!;
    const slug = await uniqueSlug(
      parsed.data.slug?.trim() || parsed.data.title,
    );
    id = crypto.randomUUID();
    await db.insert(posts).values({
      id,
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      authorName: parsed.data.authorName,
      tags: parseTags(parsed.data.tags),
      status,
      coverPublicId: parsed.data.coverPublicId || null,
      publishedAt: status === "published" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create post.",
    };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${id}`);
}

export async function updatePost(
  postId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireDesk();
  const blocked = requirePostsDb();
  if (blocked) return blocked;

  const parsed = parsePostForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const status = clampToDraftIfNeeded(
    session.user.role,
    parsed.data.status,
    "draft",
  );

  try {
    const db = getDb()!;
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!existing) return { ok: false, error: "Post not found." };

    const requestedSlug = parsed.data.slug?.trim();
    const slug =
      requestedSlug && requestedSlug !== existing.slug
        ? await uniqueSlug(requestedSlug, postId)
        : existing.slug;

    await db
      .update(posts)
      .set({
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt,
        body: parsed.data.body,
        authorName: parsed.data.authorName,
        tags: parseTags(parsed.data.tags),
        status,
        coverPublicId: parsed.data.coverPublicId || null,
        publishedAt:
          status === "published" ? existing.publishedAt ?? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    if (existing.slug !== slug) revalidatePath(`/blog/${existing.slug}`);
    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${postId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update post.",
    };
  }
}
