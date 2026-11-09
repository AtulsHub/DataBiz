import { and, asc, count, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  eventRegistrations,
  events,
  newsletterSends,
  subscribers,
} from "@/db/schema";
import { appBaseUrl } from "@/lib/app-url";
import { sendTransactionalEmail } from "@/lib/email";

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type NewsletterSendItem = {
  id: string;
  subject: string;
  body: string;
  sentAt: string;
  recipientCount: number;
  sourceType?: string;
  sourceId?: string;
  status: string;
  error?: string;
};

export function isNewsletterDbReady() {
  return isDatabaseConfigured();
}

export function normalizeSubscriberEmail(email: string) {
  return email.trim().toLowerCase();
}

export function newConfirmToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export function confirmUrl(token: string) {
  return `${appBaseUrl()}/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

export function unsubscribeUrl(token: string) {
  return `${appBaseUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function countConfirmedSubscribers() {
  const db = getDb();
  if (!db) return 0;
  const [row] = await db
    .select({ value: count() })
    .from(subscribers)
    .where(eq(subscribers.status, "confirmed"));
  return row?.value ?? 0;
}

export async function listConfirmedSubscribers() {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(subscribers)
    .where(eq(subscribers.status, "confirmed"))
    .orderBy(desc(subscribers.confirmedAt));
}

export async function listNewsletterSends(limit = 20): Promise<NewsletterSendItem[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(newsletterSends)
    .orderBy(desc(newsletterSends.sentAt))
    .limit(limit);
  return rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    body: row.body,
    sentAt: row.sentAt.toISOString(),
    recipientCount: row.recipientCount,
    sourceType: row.sourceType ?? undefined,
    sourceId: row.sourceId ?? undefined,
    status: row.status,
    error: row.error ?? undefined,
  }));
}

function markdownishToHtml(body: string) {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const withBreaks = escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("");
  return withBreaks || "<p></p>";
}

export async function sendNewsletterToConfirmed(input: {
  subject: string;
  body: string;
  sourceType?: string;
  sourceId?: string;
}): Promise<{ ok: true; recipientCount: number; sendId: string } | { ok: false; error: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database is not configured." };

  const list = await listConfirmedSubscribers();
  if (list.length === 0) {
    return { ok: false, error: "No confirmed subscribers yet." };
  }

  const sendId = crypto.randomUUID();
  const htmlBody = markdownishToHtml(input.body);
  let sent = 0;
  const failures: string[] = [];

  for (const row of list) {
    const token = row.confirmToken || newConfirmToken();
    if (!row.confirmToken) {
      await db
        .update(subscribers)
        .set({ confirmToken: token })
        .where(eq(subscribers.id, row.id));
    }
    try {
      await sendTransactionalEmail({
        to: row.email,
        subject: input.subject,
        html: `
          ${htmlBody}
          <hr />
          <p style="font-size:12px;color:#666">
            <a href="${unsubscribeUrl(token)}">Unsubscribe</a> from DataBiz updates.
          </p>
        `,
      });
      sent += 1;
    } catch (error) {
      failures.push(
        `${row.email}: ${error instanceof Error ? error.message : "send failed"}`,
      );
    }
  }

  await db.insert(newsletterSends).values({
    id: sendId,
    subject: input.subject,
    body: input.body,
    sentAt: new Date(),
    recipientCount: sent,
    sourceType: input.sourceType || null,
    sourceId: input.sourceId || null,
    status: failures.length === 0 ? "sent" : sent > 0 ? "partial" : "failed",
    error: failures.length ? failures.slice(0, 5).join("; ") : null,
  });

  if (sent === 0) {
    return {
      ok: false,
      error: failures[0] || "Could not send to any subscriber.",
    };
  }

  return { ok: true, recipientCount: sent, sendId };
}

/** Events starting within the next ~36h that still need a day-before reminder. */
export async function listEventsDueForReminder(now = new Date()) {
  const db = getDb();
  if (!db) return [];

  const horizon = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  const rows = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.status, "published"),
        isNull(events.reminderSentAt),
        gte(events.startsAt, now),
        lte(events.startsAt, horizon),
      ),
    )
    .orderBy(asc(events.startsAt));

  return rows;
}

export async function sendEventReminder(
  eventId: string,
  options?: { force?: boolean },
): Promise<{ ok: true; recipientCount: number } | { ok: false; error: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: "Database is not configured." };

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) return { ok: false, error: "Event not found." };
  if (event.status !== "published" && event.status !== "past") {
    return { ok: false, error: "Publish the event before sending reminders." };
  }
  if (event.reminderSentAt && !options?.force) {
    return {
      ok: false,
      error:
        "Reminder already sent for this event. Use force resend only if you intend to mail again.",
    };
  }

  const regs = await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, "registered"),
      ),
    );

  if (regs.length === 0) {
    return { ok: false, error: "No registered attendees to remind." };
  }

  // Claim the send before mailing to avoid double-send on overlap.
  if (options?.force) {
    await db
      .update(events)
      .set({ reminderSentAt: new Date(), updatedAt: new Date() })
      .where(eq(events.id, eventId));
  } else {
    const claimed = await db
      .update(events)
      .set({ reminderSentAt: new Date(), updatedAt: new Date() })
      .where(and(eq(events.id, eventId), isNull(events.reminderSentAt)))
      .returning({ id: events.id });
    if (claimed.length === 0) {
      return {
        ok: false,
        error:
          "Reminder already sent for this event. Use force resend only if you intend to mail again.",
      };
    }
  }

  const when = event.startsAt.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const eventLink = `${appBaseUrl()}/events/${event.slug}`;
  let sent = 0;

  for (const reg of regs) {
    try {
      await sendTransactionalEmail({
        to: reg.email,
        subject: `Reminder · ${event.title} is tomorrow`,
        html: `
          <p>Hi ${reg.firstName},</p>
          <p>This is a reminder that <strong>${event.title}</strong> is coming up.</p>
          <p><strong>When:</strong> ${when}</p>
          ${event.venue ? `<p><strong>Where:</strong> ${event.venue}</p>` : ""}
          ${event.meetingUrl ? `<p><a href="${event.meetingUrl}">Join link</a></p>` : ""}
          <p><a href="${eventLink}">Event page</a></p>
        `,
      });
      sent += 1;
    } catch {
      // Continue; admin can force-resend if needed.
    }
  }

  if (sent === 0) {
    await db
      .update(events)
      .set({ reminderSentAt: null, updatedAt: new Date() })
      .where(eq(events.id, eventId));
    return { ok: false, error: "Could not send any reminder emails." };
  }

  return { ok: true, recipientCount: sent };
}
