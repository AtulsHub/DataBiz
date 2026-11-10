"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setAlumniStatus,
  updateAlumniProfile,
} from "@/app/actions/alumni";
import type { ActionResult } from "@/app/actions/events";
import type { AlumniItem } from "@/lib/alumni";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = { alumni: AlumniItem };

const initial: ActionResult = { ok: false };

export function AlumniEditorForm({ alumni }: Props) {
  const router = useRouter();
  const action = updateAlumniProfile.bind(null, alumni.id!);
  const [state, formAction, pending] = useActionState(action, initial);
  const [statusPending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div className="rounded-[var(--radius)] border border-line bg-paper-elevated p-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">
          Promotion
        </p>
        <p className="mt-2 text-sm text-mute">
          Pending profiles stay off `/alumni`. Publish to promote them to the
          public directory.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {alumni.status !== "published" ? (
            <Button
              type="button"
              variant="ember"
              size="sm"
              disabled={statusPending}
              onClick={() =>
                startTransition(async () => {
                  await setAlumniStatus(alumni.id!, "published");
                  router.refresh();
                })
              }
            >
              {statusPending ? "Publishing…" : "Promote to public"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={statusPending}
              onClick={() =>
                startTransition(async () => {
                  await setAlumniStatus(alumni.id!, "pending");
                  router.refresh();
                })
              }
            >
              {statusPending ? "Updating…" : "Unpublish"}
            </Button>
          )}
          <p className="self-center font-mono text-xs uppercase tracking-[0.12em] text-mute">
            {alumni.status}
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        {state.error ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="text-sm text-ember" role="status">
            Saved.
          </p>
        ) : null}

        <ImageUpload
          name="photoPublicId"
          folder={CLOUDINARY_FOLDERS.avatars}
          label="Photo"
          defaultPublicId={alumni.photoPublicId}
          defaultPreviewUrl={alumni.photoUrl}
          clearLabel="Clear photo"
        />

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
