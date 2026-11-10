"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { resources } from "@/db/schema";
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

const fields = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().default(""),
    url: z.string().trim().optional(),
    publicId: z.string().trim().optional(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .refine((data) => Boolean(data.url || data.publicId), {
    message: "Provide a URL or a Cloudinary public id.",
    path: ["url"],
  });

export async function createResource(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = fields.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    url: formString(formData, "url") || undefined,
    publicId: formString(formData, "publicId") || undefined,
    sortOrder: formString(formData, "sortOrder") || "0",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const id = crypto.randomUUID();
  await getDb()!.insert(resources).values({
    id,
    title: parsed.data.title,
    description: parsed.data.description,
    url: parsed.data.url || null,
    publicId: parsed.data.publicId || null,
    sortOrder: parsed.data.sortOrder,
  });

  revalidatePath("/account");
  revalidatePath("/admin/resources");
  redirect(`/admin/resources/${id}`);
}

export async function updateResource(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = fields.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    url: formString(formData, "url") || undefined,
    publicId: formString(formData, "publicId") || undefined,
    sortOrder: formString(formData, "sortOrder") || "0",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  await getDb()!
    .update(resources)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      url: parsed.data.url || null,
      publicId: parsed.data.publicId || null,
      sortOrder: parsed.data.sortOrder,
    })
    .where(eq(resources.id, id));

  revalidatePath("/account");
  revalidatePath("/admin/resources");
  revalidatePath(`/admin/resources/${id}`);
  return { ok: true };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;
  await getDb()!.delete(resources).where(eq(resources.id, id));
  revalidatePath("/account");
  revalidatePath("/admin/resources");
  return { ok: true };
}
