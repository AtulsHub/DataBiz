"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "./Field";
import { site } from "@/content/site";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topic = String(data.get("topic") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Tell us who is writing.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (message.length < 10) next.message = "Add a few words so the core can reply usefully.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Server delivery is not wired yet — hand off to the visitor's mail client.
    const subject = encodeURIComponent(topic || `Message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Name" required error={errors.name}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="contact-email" label="Email" required error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass}
          />
        </Field>
      </div>
      <Field id="contact-topic" label="Topic">
        <input
          id="contact-topic"
          name="topic"
          type="text"
          placeholder="Sponsorship, collaboration, a question…"
          className={inputClass}
        />
      </Field>
      <Field id="contact-message" label="Message" required error={errors.message}>
        <textarea
          id="contact-message"
          name="message"
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={textareaClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" size="md">
          Send message
        </Button>
        <p className="text-xs text-steel">
          Opens your mail app addressed to {site.email}.
        </p>
      </div>
      {sent ? (
        <p className="text-sm text-signal-deep" role="status">
          Your mail app should open with the message ready. If it does not, write to {site.email}.
        </p>
      ) : null}
    </form>
  );
}
