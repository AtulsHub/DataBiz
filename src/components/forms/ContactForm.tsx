"use client";

import { useActionState } from "react";
import {
  submitContactForm,
  type ContactActionResult,
} from "@/app/actions/contact";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "./Field";
import { site } from "@/content/site";

const initial: ContactActionResult = { ok: false };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initial,
  );

  if (state.ok) {
    return (
      <p className="border border-line bg-paper-elevated px-4 py-5 text-sm text-signal-deep" role="status">
        Message received. The core will reply to the email you left.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="contact-first-name"
          label="First name"
          required
          error={state.fieldErrors?.firstName}
        >
          <input
            id="contact-first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className={inputClass}
          />
        </Field>
        <Field
          id="contact-last-name"
          label="Last name"
          required
          error={state.fieldErrors?.lastName}
        >
          <input
            id="contact-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        id="contact-email"
        label="Email"
        required
        error={state.fieldErrors?.email}
      >
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </Field>
      <Field id="contact-topic" label="Topic">
        <input
          id="contact-topic"
          name="topic"
          type="text"
          placeholder="Sponsorship, collaboration, a question…"
          className={inputClass}
        />
      </Field>
      <Field
        id="contact-message"
        label="Message"
        required
        error={state.fieldErrors?.message}
      >
        <textarea
          id="contact-message"
          name="message"
          required
          className={textareaClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          variant="primary"
          size="md"
          pending={pending}
          pendingLabel="Sending…"
        >
          Send message
        </Button>
        <p className="text-xs text-steel">
          Delivered to {site.email} via Resend.
        </p>
      </div>
    </form>
  );
}
