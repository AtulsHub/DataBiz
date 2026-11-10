"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { announcements } from "@/db/schema";
import type { ActionResult } from "@/app/actions/events";
import { requireAdmin } from "@/lib/session";

function requireDb(): ActionResult | null {
  if (!isDatabaseConfigured() || !getDb()) {
    return {
      ok: false,
      error:
        "DATABASE_URL is not set. Add Neon credentials to .env.local and run pnpm db:push.",
    };
  }
  return null;
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function resolveStatus(formData: FormData): "draft" | "published" {
  const intent = formString(formData, "intent");
  if (intent === "publish") return "published";
  if (intent === "draft") return "draft";
  return formString(formData, "status") === "published" ? "published" : "draft";
}

const fields = z.object({
  title: z.string().trim().min(1, "Title is required."),
  body: z.string().trim().default(""),
  status: z.enum(["draft", "published"]),
  refType: z.enum(["none", "event", "post", "drive", "episode"]).default("none"),
  refId: z.string().trim().optional(),
});

function parseForm(formData: FormData) {
  return fields.safeParse({
    title: formString(formData, "title"),
    body: formString(formData, "body"),
    status: resolveStatus(formData),
    refType: formString(formData, "refType") || "none",
    refId: formString(formData, "refId") || undefined,
  });
}

function refsFromParsed(data: z.infer<typeof fields>) {
  const id = data.refId || null;
  return {
    eventId: data.refType === "event" ? id : null,
    postId: data.refType === "post" ? id : null,
    driveId: data.refType === "drive" ? id : null,
    episodeId: data.refType === "episode" ? id : null,
  };
}

export async function createAnnouncement(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const id = crypto.randomUUID();
  const refs = refsFromParsed(parsed.data);
  await getDb()!.insert(announcements).values({
    id,
    title: parsed.data.title,
    body: parsed.data.body,
    status: parsed.data.status,
    publishedAt: parsed.data.status === "published" ? new Date() : null,
    ...refs,
  });

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  redirect(`/admin/announcements/${id}`);
}

export async function updateAnnouncement(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const db = getDb()!;
  const [existing] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  if (!existing) return { ok: false, error: "Announcement not found." };

  const refs = refsFromParsed(parsed.data);
  await db
    .update(announcements)
    .set({
      title: parsed.data.title,
      body: parsed.data.body,
      status: parsed.data.status,
      publishedAt:
        parsed.data.status === "published"
          ? existing.publishedAt ?? new Date()
          : null,
      ...refs,
    })
    .where(eq(announcements.id, id));

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${id}`);
  return { ok: true };
}
