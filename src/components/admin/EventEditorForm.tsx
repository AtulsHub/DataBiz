"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createEvent,
  updateEvent,
  type ActionResult,
} from "@/app/actions/events";
import type { EventItem } from "@/lib/events";
import { toDatetimeLocalValue } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { PosterUpload } from "@/components/admin/PosterUpload";

type Props = {
  event?: EventItem;
};

const initial: ActionResult = { ok: false };

export function EventEditorForm({ event }: Props) {
  const action = event
    ? updateEvent.bind(null, event.id!)
    : createEvent;

  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="border border-line bg-paper px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="border border-line bg-paper px-3 py-2 text-sm text-signal-deep" role="status">
          Saved.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="title" label="Title" required error={state.fieldErrors?.title}>
          <input
            id="title"
            name="title"
            required
            defaultValue={event?.title}
            className={inputClass}
          />
        </Field>
        <Field
          id="slug"
          label="Slug"
          hint={event ? "Changing the slug updates the public URL." : "Leave blank to generate from the title."}
          error={state.fieldErrors?.slug}
        >
          <input
            id="slug"
            name="slug"
            defaultValue={event?.slug}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="summary" label="Summary" error={state.fieldErrors?.summary}>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={event?.summary}
          className={textareaClass}
        />
      </Field>

      <Field id="body" label="Body (markdown)" error={state.fieldErrors?.body}>
        <textarea
          id="body"
          name="body"
          rows={10}
          defaultValue={event?.body}
          className={textareaClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="venue" label="Venue">
          <input
            id="venue"
            name="venue"
            defaultValue={event?.venue}
            className={inputClass}
          />
        </Field>
        <Field id="meetingUrl" label="Meeting URL">
          <input
            id="meetingUrl"
            name="meetingUrl"
            type="url"
            defaultValue={event?.meetingUrl}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="startsAt"
          label="Starts"
          required
          error={state.fieldErrors?.startsAt}
          hint="Asia/Kolkata"
        >
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={
              event?.startsAt ? toDatetimeLocalValue(event.startsAt) : undefined
            }
            className={inputClass}
          />
        </Field>
        <Field
          id="endsAt"
          label="Ends"
          required
          error={state.fieldErrors?.endsAt}
          hint="Asia/Kolkata"
        >
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            required
            defaultValue={
              event?.endsAt ? toDatetimeLocalValue(event.endsAt) : undefined
            }
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="capacity" label="Capacity" hint="Blank = unlimited">
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={event?.capacity ?? undefined}
            className={inputClass}
          />
        </Field>
        <Field id="rsvpDeadline" label="RSVP deadline">
          <input
            id="rsvpDeadline"
            name="rsvpDeadline"
            type="datetime-local"
            defaultValue={
              event?.rsvpDeadline
                ? toDatetimeLocalValue(event.rsvpDeadline)
                : undefined
            }
            className={inputClass}
          />
        </Field>
        <Field id="status" label="Status" required>
          <select
            id="status"
            name="status"
            defaultValue={event?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="past">Past</option>
          </select>
        </Field>
      </div>

      <Field id="template" label="Template">
        <select
          id="template"
          name="template"
          defaultValue={event?.template ?? "default"}
          className={inputClass}
        >
          <option value="default">Default</option>
          <option value="fest">Fest</option>
        </select>
      </Field>

      <PosterUpload
        defaultPublicId={event?.posterPublicId}
        defaultPreviewUrl={event?.posterUrl}
      />

      <Field id="recordingUrl" label="Recording URL">
        <input
          id="recordingUrl"
          name="recordingUrl"
          type="url"
          defaultValue={event?.recordingUrl}
          className={inputClass}
        />
      </Field>

      <Field
        id="recapBody"
        label="Recap (markdown)"
        hint="Shown on the same public URL after you mark the event past."
      >
        <textarea
          id="recapBody"
          name="recapBody"
          rows={8}
          defaultValue={event?.recapBody}
          className={textareaClass}
        />
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : event ? "Save event" : "Create event"}
        </Button>
        {event ? (
          <Button href={`/events/${event.slug}`} variant="ghost">
            View public page
          </Button>
        ) : (
          <Link href="/admin/events" className="text-sm text-mute hover:text-ink">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
