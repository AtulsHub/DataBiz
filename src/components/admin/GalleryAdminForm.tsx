"use client";

import { useActionState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addGalleryPhoto,
  deleteEventPhoto,
} from "@/app/actions/event-photos";
import type { ActionResult } from "@/app/actions/events";
import {
  groupGalleryByEvent,
  type GalleryPhotoItem,
} from "@/lib/event-photos";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { GalleryImage } from "@/components/gallery/GalleryImage";
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
  const sections = groupGalleryByEvent(photos);

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
            Upload gallery photos
          </h2>
          <p className="mt-1 text-sm text-mute">
            Pick an event, then select one or many images. They appear on
            `/gallery` once that event is published or marked past.
          </p>
        </div>

        {state.error ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="text-sm text-ember" role="status">
            Photos added to the gallery.
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
              label="Photos"
              hint="Max 5 MB each. JPG, PNG, or WebP."
              clearLabel="Clear all"
              multiple
            />
            <Field id="caption" label="Caption">
              <input
                id="caption"
                name="caption"
                className={inputClass}
                placeholder="Optional — applied to every photo in this upload"
              />
            </Field>
            <Button type="submit" variant="ember" disabled={pending}>
              {pending ? "Saving…" : "Add to gallery"}
            </Button>
          </>
        )}
      </form>

      <section className="space-y-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Gallery by event
        </h2>
        {sections.length === 0 ? (
          <p className="text-sm text-mute">No photos uploaded yet.</p>
        ) : (
          sections.map((section) => (
            <div key={section.eventId} className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {section.eventTitle}
                  </h3>
                  <p className="mt-1 text-sm text-mute">
                    {section.photos.length} photo
                    {section.photos.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Link
                  href={`/admin/events/${section.eventId}`}
                  className="text-sm text-ember hover:underline"
                >
                  Edit event
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {section.photos.map((photo) => (
                  <li
                    key={photo.id}
                    className="overflow-hidden border border-line bg-paper-elevated"
                  >
                    {photo.url ? (
                      <GalleryImage
                        src={photo.url}
                        alt={photo.caption || photo.eventTitle}
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-panel" aria-hidden />
                    )}
                    <div className="space-y-2 p-4">
                      <p className="text-sm text-mute">
                        {photo.caption || "No caption"}
                      </p>
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
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
