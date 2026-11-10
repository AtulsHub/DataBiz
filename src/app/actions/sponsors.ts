"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { siteSettings, sponsors } from "@/db/schema";
import type { ActionResult } from "@/app/actions/events";
import { BROCHURE_SETTING_KEY } from "@/lib/sponsors";
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

export async function createSponsor(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = z
    .object({
      name: z.string().trim().min(1, "Name is required."),
      url: z.string().trim().optional(),
      blurb: z.string().trim().optional(),
      logoPublicId: z.string().trim().optional(),
      sortOrder: z.coerce.number().int().default(0),
    })
    .safeParse({
      name: formString(formData, "name"),
      url: formString(formData, "url") || undefined,
      blurb: formString(formData, "blurb") || undefined,
      logoPublicId: formString(formData, "logoPublicId") || undefined,
      sortOrder: formString(formData, "sortOrder") || "0",
    });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const id = crypto.randomUUID();
  await getDb()!.insert(sponsors).values({
    id,
    name: parsed.data.name,
    url: parsed.data.url || null,
    blurb: parsed.data.blurb || null,
    logoPublicId: parsed.data.logoPublicId || null,
    sortOrder: parsed.data.sortOrder,
  });

  revalidatePath("/sponsors");
  revalidatePath("/admin/sponsors");
  redirect(`/admin/sponsors/${id}`);
}

export async function updateSponsor(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = z
    .object({
      name: z.string().trim().min(1, "Name is required."),
      url: z.string().trim().optional(),
      blurb: z.string().trim().optional(),
      logoPublicId: z.string().trim().optional(),
      sortOrder: z.coerce.number().int().default(0),
    })
    .safeParse({
      name: formString(formData, "name"),
      url: formString(formData, "url") || undefined,
      blurb: formString(formData, "blurb") || undefined,
      logoPublicId: formString(formData, "logoPublicId") || undefined,
      sortOrder: formString(formData, "sortOrder") || "0",
    });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  await getDb()!
    .update(sponsors)
    .set({
      name: parsed.data.name,
      url: parsed.data.url || null,
      blurb: parsed.data.blurb || null,
      logoPublicId: parsed.data.logoPublicId || null,
      sortOrder: parsed.data.sortOrder,
    })
    .where(eq(sponsors.id, id));

  revalidatePath("/sponsors");
  revalidatePath("/admin/sponsors");
  revalidatePath(`/admin/sponsors/${id}`);
  return { ok: true };
}

export async function deleteSponsor(id: string): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;
  await getDb()!.delete(sponsors).where(eq(sponsors.id, id));
  revalidatePath("/sponsors");
  revalidatePath("/admin/sponsors");
  return { ok: true };
}

export async function saveBrochureSetting(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const publicId = formString(formData, "brochurePublicId").trim();
  const db = getDb()!;
  if (!publicId) {
    await db
      .delete(siteSettings)
      .where(eq(siteSettings.key, BROCHURE_SETTING_KEY));
  } else {
    await db
      .insert(siteSettings)
      .values({ key: BROCHURE_SETTING_KEY, value: publicId })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: publicId },
      });
  }

  revalidatePath("/sponsors");
  revalidatePath("/admin/sponsors");
  return { ok: true };
}
