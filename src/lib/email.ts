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
    throw new Error(result.error.message);
  }

  return result.data;
}
