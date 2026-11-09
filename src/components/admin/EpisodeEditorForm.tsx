"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createEpisode, updateEpisode } from "@/app/actions/episodes";
import type { ActionResult } from "@/app/actions/events";
import type { EpisodeItem } from "@/lib/episodes";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";

type EventOption = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type GuestDraft = {
  key: string;
  name: string;
  title: string;
  organization: string;
};

type Props = {
  episode?: EpisodeItem;
  events: EventOption[];
};

const initial: ActionResult = { ok: false };

export function EpisodeEditorForm({ episode, events }: Props) {
  const action = episode
    ? updateEpisode.bind(null, episode.id!)
    : createEpisode;
  const [state, formAction, pending] = useActionState(action, initial);
  const [guests, setGuests] = useState<GuestDraft[]>(
    episode?.guests?.length
      ? episode.guests.map((guest) => ({
          key: crypto.randomUUID(),
          name: guest.name,
          title: guest.title,
          organization: guest.organization,
        }))
      : [{ key: crypto.randomUUID(), name: "", title: "", organization: "" }],
  );
  const isPublished = episode?.status === "published";

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p
          className="border border-line bg-paper px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p
          className="border border-line bg-paper px-3 py-2 text-sm text-signal-deep"
          role="status"
        >
          Saved.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="title" label="Title" required error={state.fieldErrors?.title}>
          <input
            id="title"
            name="title"
            required
            defaultValue={episode?.title}
            className={inputClass}
          />
        </Field>
        <Field id="slug" label="Slug" hint="Leave blank to generate from the title.">
          <input
            id="slug"
            name="slug"
            defaultValue={episode?.slug}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="status"
          label="Status"
          hint="Draft stays private. Publish opens /show/[slug]."
        >
          <select
            id="status"
            name="status"
            defaultValue={episode?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft — not public</option>
            <option value="published">Published — live on /show</option>
          </select>
        </Field>
        <Field id="provider" label="Provider">
          <select
            id="provider"
            name="provider"
            defaultValue={episode?.provider ?? "youtube"}
            className={inputClass}
          >
            <option value="youtube">YouTube</option>
            <option value="spotify">Spotify</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field id="summary" label="Summary">
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={episode?.summary}
          className={textareaClass}
        />
      </Field>

      <ImageUpload
        name="coverPublicId"
        folder={CLOUDINARY_FOLDERS.show}
        label="Cover image"
        hint="Uploads to Cloudinary show/."
        defaultPublicId={episode?.coverPublicId}
        defaultPreviewUrl={episode?.coverUrl}
        clearLabel="Clear cover"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="embedUrl"
          label="Embed URL"
          hint="iframe src from YouTube or Spotify. Can be empty until the recording is ready."
        >
          <input
            id="embedUrl"
            name="embedUrl"
            type="url"
            defaultValue={episode?.embedUrl}
            className={inputClass}
            placeholder="https://www.youtube.com/embed/…"
          />
        </Field>
        <Field id="externalUrl" label="Open on platform URL">
          <input
            id="externalUrl"
            name="externalUrl"
            type="url"
            defaultValue={episode?.externalUrl}
            className={inputClass}
            placeholder="https://…"
          />
        </Field>
      </div>

      <Field
        id="eventId"
        label="Linked event"
        hint="Optional. Links the episode to /events/[slug] both ways."
      >
        <select
          id="eventId"
          name="eventId"
          defaultValue={episode?.eventId ?? ""}
          className={inputClass}
        >
          <option value="">No linked event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} ({event.status})
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="showNotes"
        label="Show notes (markdown)"
        hint="Rendered on the public episode page."
      >
        <textarea
          id="showNotes"
          name="showNotes"
          rows={12}
          defaultValue={episode?.showNotes}
          className={textareaClass}
        />
      </Field>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Guests</p>
            <p className="mt-1 text-sm text-mute">
              Name, title, and organization for each guest.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setGuests((prev) => [
                ...prev,
                {
                  key: crypto.randomUUID(),
                  name: "",
                  title: "",
                  organization: "",
                },
              ])
            }
          >
            Add guest
          </Button>
        </div>
        <ul className="space-y-4">
          {guests.map((guest, index) => (
            <li
              key={guest.key}
              className="grid gap-3 border border-line bg-paper-elevated p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <Field
                id={`guestName-${guest.key}`}
                label={index === 0 ? "Name" : `Guest ${index + 1} name`}
              >
                <input
                  id={`guestName-${guest.key}`}
                  name="guestName"
                  value={guest.name}
                  onChange={(e) =>
                    setGuests((prev) =>
                      prev.map((row) =>
                        row.key === guest.key
                          ? { ...row, name: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                  placeholder="Guest name"
                />
              </Field>
              <Field
                id={`guestTitle-${guest.key}`}
                label={index === 0 ? "Title" : `Guest ${index + 1} title`}
              >
                <input
                  id={`guestTitle-${guest.key}`}
                  name="guestTitle"
                  value={guest.title}
                  onChange={(e) =>
                    setGuests((prev) =>
                      prev.map((row) =>
                        row.key === guest.key
                          ? { ...row, title: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                  placeholder="Role"
                />
              </Field>
              <Field
                id={`guestOrganization-${guest.key}`}
                label={
                  index === 0
                    ? "Organization"
                    : `Guest ${index + 1} organization`
                }
              >
                <input
                  id={`guestOrganization-${guest.key}`}
                  name="guestOrganization"
                  value={guest.organization}
                  onChange={(e) =>
                    setGuests((prev) =>
                      prev.map((row) =>
                        row.key === guest.key
                          ? { ...row, organization: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                  placeholder="Org"
                />
              </Field>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={guests.length <= 1}
                  onClick={() =>
                    setGuests((prev) => prev.filter((row) => row.key !== guest.key))
                  }
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          name="intent"
          value="publish"
          variant="ember"
          disabled={pending}
        >
          {pending ? "Saving…" : "Publish"}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="ghost"
          disabled={pending}
        >
          Save draft
        </Button>
        {isPublished ? (
          <Button href={`/show/${episode!.slug}`} variant="ghost">
            View public page
          </Button>
        ) : episode ? (
          <p className="text-sm text-mute">
            Public URL opens after you click{" "}
            <span className="font-medium text-ink">Publish</span>.
          </p>
        ) : (
          <Link href="/admin/show" className="text-sm text-mute hover:text-ink">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
