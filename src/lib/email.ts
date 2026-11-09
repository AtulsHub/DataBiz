import { Resend } from "resend";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!isEmailConfigured()) {
    console.warn("[email] RESEND_API_KEY / EMAIL_FROM missing — logging instead");
    console.info({ to: input.to, subject: input.subject });
    const link = input.html.match(/href="([^"]+)"/)?.[1];
    if (link) {
      console.info(`[email] Magic / action link for ${input.to}:\n${link}`);
    } else {
      console.info(input.html);
    }
    return { id: "dev-log" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });

  if (result.error) {
    const message = result.error.message;
    const testingOnly =
      /only send testing emails to your own email address/i.test(message);

    // Resend's free onboarding sender can only mail the account owner.
    // For local college-email sign-in, fall back to the terminal link.
    if (testingOnly || process.env.EMAIL_DEV_FALLBACK === "1") {
      console.warn(`[email] Resend blocked send (${message}) — logging link instead`);
      const link = input.html.match(/href="([^"]+)"/)?.[1];
      if (link) {
        console.info(`[email] Magic / action link for ${input.to}:\n${link}`);
      } else {
        console.info(input.html);
      }
      return { id: "dev-fallback" };
    }

    throw new Error(message);
  }

  return result.data;
}
