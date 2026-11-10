"use client";

import { useActionState } from "react";
import { registerForEvent, type ActionResult } from "@/app/actions/events";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "./Field";
import { site } from "@/content/site";

type Props = {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  defaults?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    year?: string;
    branch?: string;
  };
  databaseReady: boolean;
};

const initial: ActionResult = { ok: false };

export function EventRsvpForm({
  eventId,
  eventTitle,
  eventSlug,
  defaults,
  databaseReady,
}: Props) {
  const [state, formAction, pending] = useActionState(registerForEvent, initial);

  if (!databaseReady) {
    return (
      <MailtoRsvpFallback
        eventTitle={eventTitle}
        eventSlug={eventSlug}
        defaults={defaults}
      />
    );
  }

  if (state.ok) {
    return (
      <p className="text-sm leading-relaxed text-signal-deep" role="status">
        You&apos;re registered. Check your inbox for a confirmation — we&apos;ll
        also remind you the day before.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-4"
      aria-label={`RSVP for ${eventTitle}`}
    >
      <input type="hidden" name="eventId" value={eventId} />
      {state.error ? (
        <p className="text-xs text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="rsvp-first"
          label="First name"
          required
          error={state.fieldErrors?.firstName}
        >
          <input
            id="rsvp-first"
            name="firstName"
            required
            defaultValue={defaults?.firstName}
            className={inputClass}
          />
        </Field>
        <Field
          id="rsvp-last"
          label="Last name"
          required
          error={state.fieldErrors?.lastName}
        >
          <input
            id="rsvp-last"
            name="lastName"
            required
            defaultValue={defaults?.lastName}
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        id="rsvp-email"
        label="Email"
        required
        error={state.fieldErrors?.email}
      >
        <input
          id="rsvp-email"
          name="email"
          type="email"
          required
          defaultValue={defaults?.email}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="rsvp-year" label="Year" required error={state.fieldErrors?.year}>
          <input
            id="rsvp-year"
            name="year"
            required
            placeholder="e.g. 2nd year"
            defaultValue={defaults?.year}
            className={inputClass}
          />
        </Field>
        <Field
          id="rsvp-branch"
          label="Branch"
          required
          error={state.fieldErrors?.branch}
        >
          <input
            id="rsvp-branch"
            name="branch"
            required
            placeholder="e.g. CSE"
            defaultValue={defaults?.branch}
            className={inputClass}
          />
        </Field>
      </div>
      <Button
        type="submit"
        variant="signal"
        size="md"
        className="w-full"
        pending={pending}
        pendingLabel="Saving…"
      >
        Reserve a seat
      </Button>
    </form>
  );
}

function MailtoRsvpFallback({
  eventTitle,
  eventSlug,
  defaults,
}: {
  eventTitle: string;
  eventSlug: string;
  defaults?: Props["defaults"];
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-mute">
        Live RSVP storage needs Neon connected. Until then, send a quick email.
      </p>
      <Button
        href={`mailto:${site.email}?subject=${encodeURIComponent(`RSVP: ${eventTitle}`)}&body=${encodeURIComponent(
          `Event: ${eventTitle} (${eventSlug})\nName: ${defaults?.firstName ?? ""} ${defaults?.lastName ?? ""}\nEmail: ${defaults?.email ?? ""}\nYear: ${defaults?.year ?? ""}\nBranch: ${defaults?.branch ?? ""}`,
        )}`}
        external
        variant="signal"
        size="md"
        className="w-full"
      >
        Email RSVP
      </Button>
    </div>
  );
}
