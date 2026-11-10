"use client";

import { useActionState, useTransition } from "react";
import Image from "next/image";
import { addEventPhoto, deleteEventPhoto } from "@/app/actions/event-photos";
import type { ActionResult } from "@/app/actions/events";
import type { EventPhotoItem } from "@/lib/event-photos";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = {
  eventId: string;
  photos: EventPhotoItem[];
};

const initial: ActionResult = { ok: false };

export function EventPhotosForm({ eventId, photos }: Props) {
  const action = addEventPhoto.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4 max-w-xl">
        {state.error ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="text-sm text-signal-deep" role="status">
            Photo added.
          </p>
        ) : null}
        <ImageUpload
          name="publicId"
          folder={CLOUDINARY_FOLDERS.gallery}
          label="Gallery photo"
          hint="Shown on the past event page and on /gallery."
          clearLabel="Clear"
        />
        <Field id="caption" label="Caption">
          <input id="caption" name="caption" className={inputClass} />
        </Field>
        <Button type="submit" variant="ghost" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add photo"}
        </Button>
      </form>

      {photos.length === 0 ? (
        <p className="text-sm text-mute">No gallery photos yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="border border-line bg-paper-elevated p-3">
              {photo.url ? (
                <Image
                  src={photo.url}
                  alt={photo.caption || ""}
                  width={480}
                  height={320}
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              <p className="mt-2 text-sm text-mute">{photo.caption || "No caption"}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                disabled={deleting}
                onClick={() => {
                  startDelete(async () => {
                    await deleteEventPhoto(photo.id, eventId);
                  });
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
