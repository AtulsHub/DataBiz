"use client";

import { useActionState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addGalleryPhoto,
  deleteEventPhoto,
} from "@/app/actions/event-photos";
import type { ActionResult } from "@/app/actions/events";
import type { GalleryPhotoItem } from "@/lib/event-photos";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";

type EventOption = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type Props = {
  events: EventOption[];
  photos: GalleryPhotoItem[];
};

const initial: ActionResult = { ok: false };

export function GalleryAdminForm({ events, photos }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addGalleryPhoto, initial);
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="space-y-12">
      <form
        action={formAction}
        className="max-w-xl space-y-4 border border-line bg-paper-elevated p-5 sm:p-6"
      >
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Upload a gallery photo
          </h2>
          <p className="mt-1 text-sm text-mute">
            Photos are tied to an event and appear on `/gallery` once that event
            is published or marked past.
          </p>
        </div>

        {state.error ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="text-sm text-ember" role="status">
            Photo added to the gallery.
          </p>
        ) : null}

        {events.length === 0 ? (
          <p className="text-sm text-mute">
            Create an event first, then come back to attach photos.{" "}
            <Link href="/admin/events/new" className="text-ember hover:underline">
              New event
            </Link>
          </p>
        ) : (
          <>
            <Field id="eventId" label="Event" required>
              <select
                id="eventId"
                name="eventId"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select an event
                </option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} · {event.status}
                  </option>
                ))}
              </select>
            </Field>
            <ImageUpload
              name="publicId"
              folder={CLOUDINARY_FOLDERS.gallery}
              label="Photo"
              hint="Max 5 MB. JPG, PNG, or WebP."
              clearLabel="Clear"
            />
            <Field id="caption" label="Caption">
              <input id="caption" name="caption" className={inputClass} />
            </Field>
            <Button type="submit" variant="ember" disabled={pending}>
              {pending ? "Uploading…" : "Add to gallery"}
            </Button>
          </>
        )}
      </form>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          All gallery photos
        </h2>
        {photos.length === 0 ? (
          <p className="mt-4 text-sm text-mute">No photos uploaded yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="overflow-hidden border border-line bg-paper-elevated"
              >
                {photo.url ? (
                  <Image
                    src={photo.url}
                    alt={photo.caption || photo.eventTitle}
                    width={640}
                    height={400}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-panel" aria-hidden />
                )}
                <div className="space-y-2 p-4">
                  <p className="text-sm font-medium text-ink">
                    {photo.eventTitle}
                  </p>
                  <p className="text-sm text-mute">
                    {photo.caption || "No caption"}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link
                      href={`/admin/events/${photo.eventId}`}
                      className="text-sm text-ember hover:underline"
                    >
                      Edit event
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={deleting}
                      onClick={() => {
                        startDelete(async () => {
                          await deleteEventPhoto(photo.id, photo.eventId);
                          router.refresh();
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
