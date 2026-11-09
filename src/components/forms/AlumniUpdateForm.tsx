"use client";

import { useActionState } from "react";
import { submitAlumniUpdate } from "@/app/actions/alumni";
import type { ActionResult } from "@/app/actions/events";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "./Field";
import { site } from "@/content/site";

const initial: ActionResult = { ok: false };

export function AlumniUpdateForm() {
  const [state, formAction, pending] = useActionState(
    submitAlumniUpdate,
    initial,
  );

  if (state.ok) {
    return (
      <p className="text-sm leading-relaxed text-signal-deep" role="status">
        Thanks — your update is pending review. The core will publish it to
        `/alumni` after checking the details.
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error} If submissions are offline, write to {site.email}.
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="alumni-name"
          label="Name"
          required
          error={state.fieldErrors?.name}
        >
          <input
            id="alumni-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>
        <Field
          id="alumni-batch"
          label="Batch (graduation year)"
          required
          error={state.fieldErrors?.batch}
        >
          <input
            id="alumni-batch"
            name="batch"
            type="text"
            inputMode="numeric"
            maxLength={4}
            required
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="alumni-email"
          label="Email"
          required
          error={state.fieldErrors?.email}
        >
          <input
            id="alumni-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
        </Field>
        <Field id="alumni-branch" label="Branch">
          <input
            id="alumni-branch"
            name="branch"
            type="text"
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="alumni-role" label="Role in DataBiz">
          <input
            id="alumni-role"
            name="societyRole"
            type="text"
            className={inputClass}
          />
        </Field>
        <Field id="alumni-title" label="Current title">
          <input
            id="alumni-title"
            name="title"
            type="text"
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="alumni-org"
          label="Organization"
          required
          error={state.fieldErrors?.organization}
        >
          <input
            id="alumni-org"
            name="organization"
            type="text"
            autoComplete="organization"
            required
            className={inputClass}
          />
        </Field>
        <Field
          id="alumni-linkedin"
          label="LinkedIn"
          error={state.fieldErrors?.linkedinUrl}
        >
          <input
            id="alumni-linkedin"
            name="linkedin"
            type="url"
            placeholder="https://"
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        id="alumni-note"
        label="Note for the community"
        hint="A line or two about what you do now, or advice for current members."
      >
        <textarea id="alumni-note" name="note" className={textareaClass} />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? "Sending…" : "Send update"}
        </Button>
        <p className="text-xs text-steel">
          The core reviews every update before it appears on this page.
        </p>
      </div>
    </form>
  );
}
