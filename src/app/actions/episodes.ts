"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { episodeGuests, episodes } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/slug";
import type { ActionResult } from "@/app/actions/events";

const episodeFields = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().default(""),
  showNotes: z.string().trim().default(""),
  status: z.enum(["draft", "published"]),
  provider: z.enum(["youtube", "spotify", "other"]),
  embedUrl: z.string().trim().optional(),
  externalUrl: z.string().trim().optional(),
  coverPublicId: z.string().trim().optional(),
  eventId: z.string().trim().optional(),
});

function requireEpisodesDb(): ActionResult | null {
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

function resolveStatus(formData: FormData): "draft" | "published" {
  const intent = formString(formData, "intent");
  if (intent === "publish") return "published";
  if (intent === "draft") return "draft";
  const status = formString(formData, "status");
  return status === "published" ? "published" : "draft";
}

function parseEpisodeForm(formData: FormData) {
  return episodeFields.safeParse({
    title: formString(formData, "title"),
    slug: formString(formData, "slug") || undefined,
    summary: formString(formData, "summary"),
    showNotes: formString(formData, "showNotes"),
    status: resolveStatus(formData),
    provider: formString(formData, "provider") || "youtube",
    embedUrl: formString(formData, "embedUrl") || undefined,
    externalUrl: formString(formData, "externalUrl") || undefined,
    coverPublicId: formString(formData, "coverPublicId") || undefined,
    eventId: formString(formData, "eventId") || undefined,
  });
}

function parseGuests(formData: FormData) {
  const names = formData.getAll("guestName").map((v) => String(v).trim());
  const titles = formData.getAll("guestTitle").map((v) => String(v).trim());
  const orgs = formData
    .getAll("guestOrganization")
    .map((v) => String(v).trim());

  const guests: {
    name: string;
    title: string;
    organization: string;
    sortOrder: number;
  }[] = [];

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    if (!name) continue;
    guests.push({
      name,
      title: titles[i] ?? "",
      organization: orgs[i] ?? "",
      sortOrder: guests.length,
    });
  }
  return guests;
}

async function uniqueSlug(base: string, excludeId?: string) {
  const db = getDb()!;
  let candidate = slugify(base) || `episode-${Date.now()}`;
  let attempt = 0;
  while (attempt < 20) {
    const [existing] = await db
      .select({ id: episodes.id })
      .from(episodes)
      .where(eq(episodes.slug, candidate))
      .limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    attempt += 1;
    candidate = `${slugify(base) || "episode"}-${attempt + 1}`;
  }
  return `${candidate}-${crypto.randomUUID().slice(0, 8)}`;
}

async function replaceGuests(
  episodeId: string,
  guests: ReturnType<typeof parseGuests>,
) {
  const db = getDb()!;
  await db.delete(episodeGuests).where(eq(episodeGuests.episodeId, episodeId));
  if (guests.length === 0) return;
  await db.insert(episodeGuests).values(
    guests.map((guest) => ({
      id: crypto.randomUUID(),
      episodeId,
      name: guest.name,
      title: guest.title,
      organization: guest.organization,
      sortOrder: guest.sortOrder,
    })),
  );
}

function revalidateEpisodePaths(slug: string, previousSlug?: string) {
  revalidatePath("/show");
  revalidatePath(`/show/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/show/${previousSlug}`);
  }
  revalidatePath("/");
  revalidatePath("/admin/show");
  revalidatePath("/events");
}

export async function createEpisode(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireEpisodesDb();
  if (blocked) return blocked;

  const parsed = parseEpisodeForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const guests = parseGuests(formData);
  let id: string;
  let slug: string;
  try {
    const db = getDb()!;
    slug = await uniqueSlug(parsed.data.slug?.trim() || parsed.data.title);
    id = crypto.randomUUID();
    await db.insert(episodes).values({
      id,
      title: parsed.data.title,
      slug,
      summary: parsed.data.summary,
      showNotes: parsed.data.showNotes,
      status: parsed.data.status,
      provider: parsed.data.provider,
      embedUrl: parsed.data.embedUrl || null,
      externalUrl: parsed.data.externalUrl || null,
      coverPublicId: parsed.data.coverPublicId || null,
      eventId: parsed.data.eventId || null,
      publishedAt: parsed.data.status === "published" ? new Date() : null,
    });
    await replaceGuests(id, guests);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not create episode.",
    };
  }

  revalidateEpisodePaths(slug);
  revalidatePath(`/admin/show/${id}`);
  redirect(`/admin/show/${id}`);
}

export async function updateEpisode(
  episodeId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireEpisodesDb();
  if (blocked) return blocked;

  const parsed = parseEpisodeForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const guests = parseGuests(formData);

  try {
    const db = getDb()!;
    const [existing] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, episodeId))
      .limit(1);
    if (!existing) return { ok: false, error: "Episode not found." };

    const requestedSlug = parsed.data.slug?.trim();
    const slug =
      requestedSlug && requestedSlug !== existing.slug
        ? await uniqueSlug(requestedSlug, episodeId)
        : existing.slug;

    await db
      .update(episodes)
      .set({
        title: parsed.data.title,
        slug,
        summary: parsed.data.summary,
        showNotes: parsed.data.showNotes,
        status: parsed.data.status,
        provider: parsed.data.provider,
        embedUrl: parsed.data.embedUrl || null,
        externalUrl: parsed.data.externalUrl || null,
        coverPublicId: parsed.data.coverPublicId || null,
        eventId: parsed.data.eventId || null,
        publishedAt:
          parsed.data.status === "published"
            ? existing.publishedAt ?? new Date()
            : null,
      })
      .where(eq(episodes.id, episodeId));

    await replaceGuests(episodeId, guests);

    revalidateEpisodePaths(slug, existing.slug);
    revalidatePath(`/admin/show/${episodeId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not update episode.",
    };
  }
}
