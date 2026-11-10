"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createResource, updateResource } from "@/app/actions/resources";
import type { ActionResult } from "@/app/actions/events";
import type { ResourceItem } from "@/lib/resources";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type Props = { resource?: ResourceItem };

const initial: ActionResult = { ok: false };

export function ResourceEditorForm({ resource }: Props) {
  const action = resource
    ? updateResource.bind(null, resource.id)
    : createResource;
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

      <Field id="title" label="Title" required>
        <input
          id="title"
          name="title"
          required
          defaultValue={resource?.title}
          className={inputClass}
        />
      </Field>
      <Field id="description" label="Description">
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={resource?.description}
          className={textareaClass}
        />
      </Field>
      <Field
        id="url"
        label="External URL"
        hint="Use this for Google Docs, Notion, GitHub, etc."
      >
        <input
          id="url"
          name="url"
          type="url"
          defaultValue={resource?.url}
          className={inputClass}
        />
      </Field>
      <Field
        id="publicId"
        label="Cloudinary public id"
        hint="Private file in the resources/ folder. Members open it via a signed link."
      >
        <input
          id="publicId"
          name="publicId"
          defaultValue={resource?.publicId}
          className={inputClass}
          placeholder="resources/handbook.pdf"
        />
      </Field>
      <Field id="sortOrder" label="Sort order">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={resource?.sortOrder ?? 0}
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Link href="/admin/resources" className="text-sm text-mute hover:text-ink self-center">
          Back
        </Link>
      </div>
    </form>
  );
}
