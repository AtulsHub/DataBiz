"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createSponsor, updateSponsor } from "@/app/actions/sponsors";
import type { ActionResult } from "@/app/actions/events";
import type { SponsorItem } from "@/lib/sponsors";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = { sponsor?: SponsorItem };

const initial: ActionResult = { ok: false };

export function SponsorEditorForm({ sponsor }: Props) {
  const action = sponsor ? updateSponsor.bind(null, sponsor.id) : createSponsor;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5">
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

      <Field id="name" label="Name" required>
        <input id="name" name="name" required defaultValue={sponsor?.name} className={inputClass} />
      </Field>
      <Field id="url" label="Website">
        <input id="url" name="url" type="url" defaultValue={sponsor?.url} className={inputClass} />
      </Field>
      <Field id="blurb" label="Blurb">
        <textarea id="blurb" name="blurb" rows={3} defaultValue={sponsor?.blurb} className={textareaClass} />
      </Field>
      <ImageUpload
        name="logoPublicId"
        folder={CLOUDINARY_FOLDERS.sponsors}
        label="Logo"
        defaultPublicId={sponsor?.logoPublicId}
        defaultPreviewUrl={sponsor?.logoUrl}
        clearLabel="Clear logo"
      />
      <Field id="sortOrder" label="Sort order">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={sponsor?.sortOrder ?? 0}
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Link href="/admin/sponsors" className="text-sm text-mute hover:text-ink self-center">
          Back
        </Link>
      </div>
    </form>
  );
}
