"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { subscribers } from "@/db/schema";
import { sendTransactionalEmail } from "@/lib/email";
import {
  confirmUrl,
  countConfirmedSubscribers,
  isNewsletterDbReady,
  listEventsDueForReminder,
  newConfirmToken,
  normalizeSubscriberEmail,
  sendEventReminder,
  sendNewsletterToConfirmed,
} from "@/lib/newsletter";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/session";

export type NewsletterActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
  already?: boolean;
  fieldErrors?: Record<string, string>;
};

function requireNewsletterDb(): NewsletterActionResult | null {
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

export async function subscribeNewsletter(
  _prev: NewsletterActionResult | undefined,
  formData: FormData,
): Promise<NewsletterActionResult> {
  const blocked = requireNewsletterDb();
  if (blocked) return blocked;

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`newsletter:${ip}`, 8, 60_000)) {
    return { ok: false, error: "Too many attempts. Try again in a minute." };
  }

  const parsed = z
    .object({
      email: z.string().trim().email("Enter a valid email address."),
    })
    .safeParse({ email: formString(formData, "email") });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Enter a valid email address.",
      fieldErrors: { email: parsed.error.issues[0]?.message || "Invalid email" },
    };
  }

  const email = normalizeSubscriberEmail(parsed.data.email);
  const db = getDb()!;
  const [existing] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);

  if (existing?.status === "confirmed") {
    return {
      ok: true,
      already: true,
      message: "You are already subscribed.",
    };
  }

  const token = newConfirmToken();
  try {
    if (existing) {
      await db
        .update(subscribers)
        .set({
          status: "pending",
          confirmToken: token,
          confirmedAt: null,
          unsubscribedAt: null,
        })
        .where(eq(subscribers.id, existing.id));
    } else {
      await db.insert(subscribers).values({
        id: crypto.randomUUID(),
        email,
        status: "pending",
        confirmToken: token,
        createdAt: new Date(),
      });
    }

    await sendTransactionalEmail({
      to: email,
      subject: "Confirm your DataBiz newsletter subscription",
      html: `
        <p>Confirm you want occasional notes from DataBiz at NIT Bhopal.</p>
        <p><a href="${confirmUrl(token)}">Confirm subscription</a></p>
        <p>If you did not request this, ignore the email.</p>
      `,
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not start the subscription.",
    };
  }
}

export async function confirmNewsletterToken(
  token: string,
): Promise<NewsletterActionResult> {
  const blocked = requireNewsletterDb();
  if (blocked) return blocked;
  if (!token.trim()) return { ok: false, error: "Missing confirmation token." };

  const db = getDb()!;
  const [row] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.confirmToken, token.trim()))
    .limit(1);

  if (!row) return { ok: false, error: "That confirm link is invalid or expired." };

  if (row.status === "confirmed") return { ok: true };

  await db
    .update(subscribers)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      unsubscribedAt: null,
    })
    .where(eq(subscribers.id, row.id));

  return { ok: true };
}

export async function unsubscribeNewsletterToken(
  token: string,
): Promise<NewsletterActionResult> {
  const blocked = requireNewsletterDb();
  if (blocked) return blocked;
  if (!token.trim()) return { ok: false, error: "Missing unsubscribe token." };

  const db = getDb()!;
  const [row] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.confirmToken, token.trim()))
    .limit(1);

  if (!row) return { ok: false, error: "That unsubscribe link is invalid." };

  await db
    .update(subscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    })
    .where(eq(subscribers.id, row.id));

  return { ok: true };
}

export async function sendNewsletter(
  _prev: NewsletterActionResult | undefined,
  formData: FormData,
): Promise<NewsletterActionResult> {
  await requireAdmin();
  if (!isNewsletterDbReady()) {
    return requireNewsletterDb()!;
  }

  const subject = formString(formData, "subject").trim();
  const body = formString(formData, "body").trim();
  const sourceType = formString(formData, "sourceType").trim() || undefined;
  const sourceId = formString(formData, "sourceId").trim() || undefined;

  if (!subject) {
    return {
      ok: false,
      error: "Subject is required.",
      fieldErrors: { subject: "Required" },
    };
  }
  if (!body) {
    return {
      ok: false,
      error: "Body is required.",
      fieldErrors: { body: "Required" },
    };
  }

  const result = await sendNewsletterToConfirmed({
    subject,
    body,
    sourceType,
    sourceId,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/newsletter");
  return {
    ok: true,
    message: `Sent to ${result.recipientCount} subscriber${result.recipientCount === 1 ? "" : "s"}.`,
  };
}

export async function sendDueEventReminders(): Promise<NewsletterActionResult> {
  await requireAdmin();
  if (!isNewsletterDbReady()) {
    return requireNewsletterDb()!;
  }

  const due = await listEventsDueForReminder();
  if (due.length === 0) {
    return {
      ok: true,
      message: "No published events in the next 36 hours need a reminder.",
    };
  }

  let total = 0;
  const errors: string[] = [];
  for (const event of due) {
    const result = await sendEventReminder(event.id);
    if (result.ok) total += result.recipientCount;
    else errors.push(`${event.title}: ${result.error}`);
  }

  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/events");

  if (total === 0) {
    return { ok: false, error: errors[0] || "No reminders were sent." };
  }

  return {
    ok: true,
    message: `Reminded ${total} registrant${total === 1 ? "" : "s"} across ${due.length} event${due.length === 1 ? "" : "s"}.${errors.length ? ` Some skipped: ${errors.join(" · ")}` : ""}`,
  };
}

export async function sendEventReminderNow(
  eventId: string,
  force = false,
): Promise<NewsletterActionResult> {
  await requireAdmin();
  if (!isNewsletterDbReady()) {
    return requireNewsletterDb()!;
  }

  const result = await sendEventReminder(eventId, { force });
  revalidatePath("/admin/newsletter");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");

  if (!result.ok) return { ok: false, error: result.error };
  return {
    ok: true,
    message: `Reminder sent to ${result.recipientCount} registrant${result.recipientCount === 1 ? "" : "s"}.`,
  };
}

export async function getNewsletterStats() {
  await requireAdmin();
  return {
    confirmed: await countConfirmedSubscribers(),
  };
}
