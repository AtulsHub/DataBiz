"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { eventPhotos, events } from "@/db/schema";
import type { ActionResult } from "@/app/actions/events";
import { canPublish } from "@/lib/roles";
import { requireDesk } from "@/lib/session";

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

export async function addEventPhoto(
  eventId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireDesk();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = z
    .object({
      publicId: z.string().trim().min(1, "Upload a photo first."),
      caption: z.string().trim().default(""),
    })
    .safeParse({
      publicId: formString(formData, "publicId"),
      caption: formString(formData, "caption"),
    });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const db = getDb()!;
  const [event] = await db
    .select({ id: events.id, slug: events.slug, status: events.status })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) return { ok: false, error: "Event not found." };

  // Members may only attach photos to draft events; admin publishes the event.
  if (!canPublish(session.user.role) && event.status !== "draft") {
    return {
      ok: false,
      error:
        "Members can upload gallery photos only on draft events. Ask an admin to attach photos to a live event, or keep the event in draft until approved.",
    };
  }

  await db.insert(eventPhotos).values({
    id: crypto.randomUUID(),
    eventId,
    publicId: parsed.data.publicId,
    caption: parsed.data.caption,
    sortOrder: Date.now() % 100000,
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath(`/events/${event.slug}`);
  return { ok: true };
}

export async function deleteEventPhoto(
  photoId: string,
  eventId: string,
): Promise<ActionResult> {
  await requireDesk();
  const blocked = requireDb();
  if (blocked) return blocked;

  const db = getDb()!;
  const [event] = await db
    .select({ slug: events.slug })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  await db.delete(eventPhotos).where(eq(eventPhotos.id, photoId));
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  if (event) revalidatePath(`/events/${event.slug}`);
  return { ok: true };
}

export async function addGalleryPhoto(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const eventId = formString(formData, "eventId").trim();
  if (!eventId) {
    return { ok: false, error: "Pick an event for this photo." };
  }

  return addEventPhoto(eventId, undefined, formData);
}
