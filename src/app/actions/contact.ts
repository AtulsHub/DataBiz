"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import { contactMessages } from "@/db/schema";
import { sendTransactionalEmail, isEmailConfigured } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export type ContactActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitContactForm(
  _prev: ContactActionResult | undefined,
  formData: FormData,
): Promise<ContactActionResult> {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
    return { ok: false, error: "Too many messages. Try again in a minute." };
  }

  const parsed = z
    .object({
      firstName: z.string().trim().min(1, "First name is required."),
      lastName: z.string().trim().min(1, "Last name is required."),
      email: z.string().trim().email("Enter a valid email address."),
      message: z
        .string()
        .trim()
        .min(10, "Add a few words so the core can reply usefully."),
      topic: z.string().trim().optional(),
    })
    .safeParse({
      firstName: formString(formData, "firstName"),
      lastName: formString(formData, "lastName"),
      email: formString(formData, "email"),
      message: formString(formData, "message"),
      topic: formString(formData, "topic") || undefined,
    });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const inbox = process.env.CONTACT_INBOX?.trim();
  if (!inbox) {
    return {
      ok: false,
      error: "CONTACT_INBOX is not configured on the server.",
    };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const subject = parsed.data.topic
    ? `Contact · ${parsed.data.topic}`
    : `Contact · ${fullName}`;

  try {
    if (isDatabaseConfigured() && getDb()) {
      await getDb()!.insert(contactMessages).values({
        id: crypto.randomUUID(),
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        message: parsed.data.topic
          ? `Topic: ${parsed.data.topic}\n\n${parsed.data.message}`
          : parsed.data.message,
        createdAt: new Date(),
      });
    }

    if (!isEmailConfigured()) {
      console.info("[contact]", {
        to: inbox,
        from: parsed.data.email,
        subject,
        message: parsed.data.message,
      });
    } else {
      await sendTransactionalEmail({
        to: inbox,
        replyTo: parsed.data.email,
        subject,
        html: `
          <p><strong>From:</strong> ${fullName} &lt;${parsed.data.email}&gt;</p>
          ${parsed.data.topic ? `<p><strong>Topic:</strong> ${parsed.data.topic}</p>` : ""}
          <p>${parsed.data.message.replace(/\n/g, "<br />")}</p>
        `,
      });
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not send the message.",
    };
  }
}
