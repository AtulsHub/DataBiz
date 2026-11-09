"use client";

import { useActionState, useTransition } from "react";
import {
  setAlumniStatus,
  updateAlumniProfile,
} from "@/app/actions/alumni";
import type { ActionResult } from "@/app/actions/events";
import type { AlumniItem } from "@/lib/alumni";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type Props = { alumni: AlumniItem };

const initial: ActionResult = { ok: false };

export function AlumniEditorForm({ alumni }: Props) {
  const action = updateAlumniProfile.bind(null, alumni.id!);
  const [state, formAction, pending] = useActionState(action, initial);
  const [statusPending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {alumni.status !== "published" ? (
          <Button
            type="button"
            variant="ember"
            size="sm"
            disabled={statusPending}
            onClick={() =>
              startTransition(() => {
                void setAlumniStatus(alumni.id!, "published");
              })
            }
          >
            Publish
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={statusPending}
            onClick={() =>
              startTransition(() => {
                void setAlumniStatus(alumni.id!, "pending");
              })
            }
          >
            Unpublish
          </Button>
        )}
      </div>

      <form action={formAction} className="space-y-5">
        {state.error ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="text-sm text-signal-deep" role="status">
            Saved.
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Name" required>
            <input
              id="name"
              name="name"
              required
              defaultValue={alumni.name}
              className={inputClass}
            />
          </Field>
          <Field id="batch" label="Batch" required>
            <input
              id="batch"
              name="batch"
              required
              defaultValue={alumni.batch}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="branch" label="Branch">
            <input
              id="branch"
              name="branch"
              defaultValue={alumni.branch}
              className={inputClass}
            />
          </Field>
          <Field id="societyRole" label="Society role">
            <input
              id="societyRole"
              name="societyRole"
              defaultValue={alumni.societyRole}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="currentTitle" label="Current title">
            <input
              id="currentTitle"
              name="currentTitle"
              defaultValue={alumni.currentTitle}
              className={inputClass}
            />
          </Field>
          <Field id="organization" label="Organization" required>
            <input
              id="organization"
              name="organization"
              required
              defaultValue={alumni.organization}
              className={inputClass}
            />
          </Field>
        </div>

        <Field id="linkedinUrl" label="LinkedIn">
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={alumni.linkedinUrl}
            className={inputClass}
          />
        </Field>

        <Field id="note" label="Note">
          <textarea
            id="note"
            name="note"
            rows={4}
            defaultValue={alumni.note}
            className={textareaClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="status" label="Status">
            <select
              id="status"
              name="status"
              defaultValue={alumni.status}
              className={inputClass}
            >
              <option value="pending">Pending</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field id="sortOrder" label="Sort order">
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={alumni.sortOrder}
              className={inputClass}
            />
          </Field>
        </div>

        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
