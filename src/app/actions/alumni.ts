"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { alumniProfiles } from "@/db/schema";
import { sendTransactionalEmail, isEmailConfigured } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/slug";
import type { ActionResult } from "@/app/actions/events";

const submitFields = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  batch: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Use a four-digit batch year, for example 2024."),
  email: z.string().trim().email("Enter a valid email address."),
  branch: z.string().trim().default(""),
  societyRole: z.string().trim().default(""),
  currentTitle: z.string().trim().default(""),
  organization: z.string().trim().min(1, "Where are you now?"),
  linkedinUrl: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function submitAlumniUpdate(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  if (!isDatabaseConfigured() || !getDb()) {
    return {
      ok: false,
      error:
        "Alumni submissions need Neon connected. Write to the core inbox for now.",
    };
  }

  const linkedinRaw = String(formData.get("linkedin") ?? "").trim();
  const parsed = submitFields.safeParse({
    name: formData.get("name"),
    batch: formData.get("batch"),
    email: formData.get("email"),
    branch: formData.get("branch") ?? "",
    societyRole: formData.get("societyRole") ?? "",
    currentTitle: formData.get("title") ?? "",
    organization: formData.get("organization"),
    linkedinUrl: linkedinRaw || undefined,
    note: String(formData.get("note") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  if (
    parsed.data.linkedinUrl &&
    !/^https?:\/\//i.test(parsed.data.linkedinUrl)
  ) {
    return {
      ok: false,
      fieldErrors: { linkedinUrl: "Start the link with https://" },
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(`alumni:${ip}`, 5, 60_000)) {
    return { ok: false, error: "Too many submissions. Try again in a minute." };
  }

  try {
    const db = getDb()!;
    const baseSlug = slugify(`${parsed.data.name}-${parsed.data.batch}`) || "alumni";
    let slug = baseSlug;
    let attempt = 0;
    while (attempt < 20) {
      const [existing] = await db
        .select({ id: alumniProfiles.id })
        .from(alumniProfiles)
        .where(eq(alumniProfiles.slug, slug))
        .limit(1);
      if (!existing) break;
      attempt += 1;
      slug = `${baseSlug}-${attempt + 1}`;
    }

    await db.insert(alumniProfiles).values({
      id: crypto.randomUUID(),
      slug,
      name: parsed.data.name,
      batch: Number(parsed.data.batch),
      branch: parsed.data.branch,
      societyRole: parsed.data.societyRole,
      currentTitle: parsed.data.currentTitle,
      organization: parsed.data.organization,
      linkedinUrl: parsed.data.linkedinUrl || null,
      note: parsed.data.note || null,
      status: "pending",
      sortOrder: 0,
    });

    const inbox = process.env.CONTACT_INBOX?.trim();
    if (inbox && isEmailConfigured()) {
      await sendTransactionalEmail({
        to: inbox,
        subject: `Alumni update: ${parsed.data.name} (batch ${parsed.data.batch})`,
        html: `
          <p>New alumni update pending review.</p>
          <ul>
            <li><strong>Name:</strong> ${parsed.data.name}</li>
            <li><strong>Batch:</strong> ${parsed.data.batch}</li>
            <li><strong>Email:</strong> ${parsed.data.email}</li>
            <li><strong>Organization:</strong> ${parsed.data.organization}</li>
          </ul>
          <p>Approve in admin → Alumni.</p>
        `,
        replyTo: parsed.data.email,
      });
    }

    revalidatePath("/admin/alumni");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save your update.",
    };
  }
}

export async function setAlumniStatus(
  id: string,
  status: "pending" | "published",
): Promise<ActionResult> {
  await requireAdmin();
  if (!isDatabaseConfigured() || !getDb()) {
    return { ok: false, error: "DATABASE_URL is not set." };
  }

  const db = getDb()!;
  await db
    .update(alumniProfiles)
    .set({ status })
    .where(eq(alumniProfiles.id, id));

  revalidatePath("/alumni");
  revalidatePath("/admin/alumni");
  return { ok: true };
}

export async function updateAlumniProfile(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  if (!isDatabaseConfigured() || !getDb()) {
    return { ok: false, error: "DATABASE_URL is not set." };
  }

  const parsed = z
    .object({
      name: z.string().trim().min(1),
      batch: z.string().regex(/^\d{4}$/),
      branch: z.string().trim().default(""),
      societyRole: z.string().trim().default(""),
      currentTitle: z.string().trim().default(""),
      organization: z.string().trim().min(1),
      linkedinUrl: z.string().trim().optional(),
      note: z.string().trim().optional(),
      status: z.enum(["pending", "published"]),
      sortOrder: z.string().optional(),
    })
    .safeParse({
      name: formData.get("name"),
      batch: formData.get("batch"),
      branch: formData.get("branch") ?? "",
      societyRole: formData.get("societyRole") ?? "",
      currentTitle: formData.get("currentTitle") ?? "",
      organization: formData.get("organization"),
      linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim() || undefined,
      note: String(formData.get("note") ?? "").trim() || undefined,
      status: formData.get("status"),
      sortOrder: String(formData.get("sortOrder") ?? ""),
    });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const db = getDb()!;
  await db
    .update(alumniProfiles)
    .set({
      name: parsed.data.name,
      batch: Number(parsed.data.batch),
      branch: parsed.data.branch,
      societyRole: parsed.data.societyRole,
      currentTitle: parsed.data.currentTitle,
      organization: parsed.data.organization,
      linkedinUrl: parsed.data.linkedinUrl || null,
      note: parsed.data.note || null,
      status: parsed.data.status,
      sortOrder: Number(parsed.data.sortOrder || 0) || 0,
    })
    .where(eq(alumniProfiles.id, id));

  revalidatePath("/alumni");
  revalidatePath("/admin/alumni");
  revalidatePath(`/admin/alumni/${id}`);
  return { ok: true };
}
