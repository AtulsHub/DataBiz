"use client";

import { useActionState } from "react";
import {
  submitNewsletterDraft,
  type NewsletterActionResult,
} from "@/app/actions/newsletter";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { useDesk } from "@/components/admin/DeskContext";

type Props = {
  confirmedCount: number;
  defaultSubject?: string;
  defaultBody?: string;
  sourceType?: string;
  sourceId?: string;
};

const initial: NewsletterActionResult = { ok: false };

export function NewsletterSendForm({
  confirmedCount,
  defaultSubject = "",
  defaultBody = "",
  sourceType,
  sourceId,
}: Props) {
  const { canPublish } = useDesk();
  const [state, formAction, pending] = useActionState(
    submitNewsletterDraft,
    initial,
  );

  return (
    <form action={formAction} className="space-y-5">
      {sourceType ? (
        <input type="hidden" name="sourceType" value={sourceType} />
      ) : null}
      {sourceId ? <input type="hidden" name="sourceId" value={sourceId} /> : null}

      {state.error ? (
        <p className="border border-line bg-paper px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok && state.message ? (
        <p
          className="border border-line bg-paper px-3 py-2 text-sm text-ember"
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <p className="text-sm text-mute">
        Recipients:{" "}
        <span className="font-mono text-ink">{confirmedCount}</span> confirmed
        subscriber{confirmedCount === 1 ? "" : "s"}.
        {!canPublish
          ? " Your draft waits for an admin before anyone is mailed."
          : null}
      </p>

      <Field id="subject" label="Subject" required error={state.fieldErrors?.subject}>
        <input
          id="subject"
          name="subject"
          required
          defaultValue={defaultSubject}
          className={inputClass}
        />
      </Field>

      <Field
        id="body"
        label="Body"
        hint="Plain text with blank lines for paragraphs. An unsubscribe link is appended automatically."
        required
        error={state.fieldErrors?.body}
      >
        <textarea
          id="body"
          name="body"
          required
          rows={10}
          defaultValue={defaultBody}
          className={textareaClass}
        />
      </Field>

      <Button
        type="submit"
        variant="ember"
        disabled={pending || (canPublish && confirmedCount === 0)}
      >
        {pending
          ? canPublish
            ? "Sending…"
            : "Submitting…"
          : canPublish
            ? "Send to confirmed list"
            : "Submit for admin approval"}
      </Button>
    </form>
  );
}
