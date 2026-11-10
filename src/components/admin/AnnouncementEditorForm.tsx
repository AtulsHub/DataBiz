"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createAnnouncement,
  updateAnnouncement,
} from "@/app/actions/announcements";
import type { ActionResult } from "@/app/actions/events";
import type { AnnouncementItem } from "@/lib/announcements";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type RefOption = { id: string; label: string };

type Props = {
  announcement?: AnnouncementItem;
  events: RefOption[];
  posts: RefOption[];
  drives: RefOption[];
  episodes: RefOption[];
};

const initial: ActionResult = { ok: false };

function defaultRefType(item?: AnnouncementItem) {
  if (item?.eventId) return "event";
  if (item?.postId) return "post";
  if (item?.driveId) return "drive";
  if (item?.episodeId) return "episode";
  return "none";
}

function defaultRefId(item?: AnnouncementItem) {
  return item?.eventId || item?.postId || item?.driveId || item?.episodeId || "";
}

export function AnnouncementEditorForm({
  announcement,
  events,
  posts,
  drives,
  episodes,
}: Props) {
  const action = announcement
    ? updateAnnouncement.bind(null, announcement.id)
    : createAnnouncement;
  const [state, formAction, pending] = useActionState(action, initial);
  const refType = defaultRefType(announcement);

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

      <Field id="title" label="Title" required>
        <input
          id="title"
          name="title"
          required
          defaultValue={announcement?.title}
          className={inputClass}
        />
      </Field>

      <Field id="body" label="Body (markdown)">
        <textarea
          id="body"
          name="body"
          rows={8}
          defaultValue={announcement?.body}
          className={textareaClass}
        />
      </Field>

      <Field id="status" label="Status">
        <select
          id="status"
          name="status"
          defaultValue={announcement?.status ?? "draft"}
          className={inputClass}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="refType" label="Optional link" hint="At most one reference.">
          <select
            id="refType"
            name="refType"
            defaultValue={refType}
            className={inputClass}
          >
            <option value="none">None</option>
            <option value="event">Event</option>
            <option value="post">Post</option>
            <option value="drive">Drive</option>
            <option value="episode">Episode</option>
          </select>
        </Field>
        <Field id="refId" label="Reference">
          <select
            id="refId"
            name="refId"
            defaultValue={defaultRefId(announcement)}
            className={inputClass}
          >
            <option value="">Select…</option>
            {[...events, ...posts, ...drives, ...episodes].length === 0 ? null : null}
            <optgroup label="Events">
              {events.map((o) => (
                <option key={`e-${o.id}`} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Posts">
              {posts.map((o) => (
                <option key={`p-${o.id}`} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Drives">
              {drives.map((o) => (
                <option key={`d-${o.id}`} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Episodes">
              {episodes.map((o) => (
                <option key={`ep-${o.id}`} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="publish" variant="ember" disabled={pending}>
          {pending ? "Saving…" : "Publish"}
        </Button>
        <Button type="submit" name="intent" value="draft" variant="ghost" disabled={pending}>
          Save draft
        </Button>
        {announcement ? (
          <Link
            href={`/admin/newsletter?source=announcement&id=${announcement.id}&subject=${encodeURIComponent(announcement.title)}`}
            className="text-sm text-ember hover:underline self-center"
          >
            Mail subscribers
          </Link>
        ) : (
          <Link href="/admin/announcements" className="text-sm text-mute hover:text-ink self-center">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
