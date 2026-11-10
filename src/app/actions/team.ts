"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { teamMembers } from "@/db/schema";
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

const memberFields = z.object({
  name: z.string().trim().min(1, "Name is required."),
  roleTitle: z.string().trim().min(1, "Role title is required."),
  bio: z.string().trim().default(""),
  photoPublicId: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isCurrent: z.enum(["true", "false"]).default("true"),
  yearLabel: z.string().trim().optional(),
});

function parseMember(formData: FormData) {
  return memberFields.safeParse({
    name: formString(formData, "name"),
    roleTitle: formString(formData, "roleTitle"),
    bio: formString(formData, "bio"),
    photoPublicId: formString(formData, "photoPublicId") || undefined,
    sortOrder: formString(formData, "sortOrder") || "0",
    isCurrent: formString(formData, "isCurrent") === "false" ? "false" : "true",
    yearLabel: formString(formData, "yearLabel") || undefined,
  });
}

export async function createTeamMember(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = parseMember(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const id = crypto.randomUUID();
  await getDb()!.insert(teamMembers).values({
    id,
    name: parsed.data.name,
    roleTitle: parsed.data.roleTitle,
    bio: parsed.data.bio,
    photoPublicId: parsed.data.photoPublicId || null,
    sortOrder: parsed.data.sortOrder,
    isCurrent: parsed.data.isCurrent === "true",
    yearLabel: parsed.data.yearLabel || null,
  });

  revalidatePath("/team");
  revalidatePath("/admin/team");
  redirect(`/admin/team/${id}`);
}

export async function updateTeamMember(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  const parsed = parseMember(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  await getDb()!
    .update(teamMembers)
    .set({
      name: parsed.data.name,
      roleTitle: parsed.data.roleTitle,
      bio: parsed.data.bio,
      photoPublicId: parsed.data.photoPublicId || null,
      sortOrder: parsed.data.sortOrder,
      isCurrent: parsed.data.isCurrent === "true",
      yearLabel: parsed.data.yearLabel || null,
    })
    .where(eq(teamMembers.id, id));

  revalidatePath("/team");
  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${id}`);
  return { ok: true };
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireDb();
  if (blocked) return blocked;

  await getDb()!.delete(teamMembers).where(eq(teamMembers.id, id));
  revalidatePath("/team");
  revalidatePath("/admin/team");
  return { ok: true };
}
