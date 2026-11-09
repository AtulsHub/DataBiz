"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "./Field";
import { site } from "@/content/site";

type Props = {
  eventTitle: string;
  eventSlug: string;
};

type Errors = Partial<Record<"name" | "email", string>>;

export function EventRsvpForm({ eventTitle, eventSlug }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const rollNumber = String(data.get("roll") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // RSVP storage lands with the backend; until then the RSVP is sent as an email.
    const subject = encodeURIComponent(`RSVP: ${eventTitle}`);
    const body = encodeURIComponent(
      `Event: ${eventTitle} (${eventSlug})\nName: ${name}\nEmail: ${email}${
        rollNumber ? `\nRoll number: ${rollNumber}` : ""
      }`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label={`RSVP for ${eventTitle}`}>
      <Field id="rsvp-name" label="Name" required error={errors.name}>
        <input
          id="rsvp-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "rsvp-name-error" : undefined}
          className={inputClass}
        />
      </Field>
      <Field id="rsvp-email" label="Email" required error={errors.email}>
        <input
          id="rsvp-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "rsvp-email-error" : undefined}
          className={inputClass}
        />
      </Field>
      <Field
        id="rsvp-roll"
        label="Roll number"
        hint="MANIT students can add a roll number; guests can skip this."
      >
        <input
          id="rsvp-roll"
          name="roll"
          type="text"
          autoComplete="off"
          aria-describedby="rsvp-roll-hint"
          className={inputClass}
        />
      </Field>
      <Button type="submit" variant="signal" size="md" className="w-full">
        Reserve a seat
      </Button>
      {sent ? (
        <p className="text-sm text-signal-deep" role="status">
          Your mail app should open with the RSVP ready to send. If it does not, write to {site.email}.
        </p>
      ) : null}
    </form>
  );
}
