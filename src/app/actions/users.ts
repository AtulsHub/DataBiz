"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { user } from "@/db/schema";
import type { ActionResult } from "@/app/actions/events";
import { ROLES, isRole } from "@/lib/roles";
import { requireAdmin } from "@/lib/session";

export async function setUserRole(
  userId: string,
  role: string,
): Promise<ActionResult> {
  await requireAdmin();

  if (!isDatabaseConfigured() || !getDb()) {
    return { ok: false, error: "DATABASE_URL is not set." };
  }

  const parsed = z.enum(ROLES).safeParse(role);
  if (!parsed.success || !isRole(parsed.data)) {
    return { ok: false, error: "Pick a valid role." };
  }

  await getDb()!
    .update(user)
    .set({ role: parsed.data })
    .where(eq(user.id, userId));

  revalidatePath("/admin/users");
  revalidatePath("/account");
  return { ok: true };
}
