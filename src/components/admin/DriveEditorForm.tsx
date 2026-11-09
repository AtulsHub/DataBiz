"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createDrive, updateDrive } from "@/app/actions/hiring";
import type { ActionResult } from "@/app/actions/events";
import type { DriveItem } from "@/lib/drives";
import { toDatetimeLocalValue } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type Props = { drive?: DriveItem };

const initial: ActionResult = { ok: false };

export function DriveEditorForm({ drive }: Props) {
  const action = drive ? updateDrive.bind(null, drive.id) : createDrive;
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
        <Field id="title" label="Title" required>
          <input id="title" name="title" required defaultValue={drive?.title} className={inputClass} />
        </Field>
        <Field id="slug" label="Slug">
          <input id="slug" name="slug" defaultValue={drive?.slug} className={inputClass} />
        </Field>
      </div>

      <Field id="description" label="Description (markdown)">
        <textarea
          id="description"
          name="description"
          rows={8}
          defaultValue={drive?.description}
          className={textareaClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="opensAt" label="Opens" required>
          <input
            id="opensAt"
            name="opensAt"
            type="datetime-local"
            required
            defaultValue={drive ? toDatetimeLocalValue(drive.opensAt) : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="closesAt" label="Closes" required>
          <input
            id="closesAt"
            name="closesAt"
            type="datetime-local"
            required
            defaultValue={drive ? toDatetimeLocalValue(drive.closesAt) : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="status" label="Status">
          <select id="status" name="status" defaultValue={drive?.status ?? "draft"} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : drive ? "Save drive" : "Create drive"}
        </Button>
        {drive ? (
          <Button href={`/join/${drive.slug}`} variant="ghost">
            View public page
          </Button>
        ) : (
          <Link href="/admin/drives" className="text-sm text-mute hover:text-ink">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
