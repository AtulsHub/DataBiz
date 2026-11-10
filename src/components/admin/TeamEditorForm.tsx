"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createTeamMember, updateTeamMember } from "@/app/actions/team";
import type { ActionResult } from "@/app/actions/events";
import type { TeamMemberItem } from "@/lib/team";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary-folders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = { member?: TeamMemberItem };

const initial: ActionResult = { ok: false };

export function TeamEditorForm({ member }: Props) {
  const action = member
    ? updateTeamMember.bind(null, member.id)
    : createTeamMember;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5">
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
          className="border border-line bg-paper px-3 py-2 text-sm text-ember"
          role="status"
        >
          Saved.
        </p>
      ) : null}

      <Field id="name" label="Name" required>
        <input
          id="name"
          name="name"
          required
          defaultValue={member?.name}
          className={inputClass}
        />
      </Field>
      <Field id="roleTitle" label="Role title" required>
        <input
          id="roleTitle"
          name="roleTitle"
          required
          defaultValue={member?.roleTitle}
          className={inputClass}
        />
      </Field>
      <Field id="bio" label="Bio">
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={member?.bio}
          className={textareaClass}
        />
      </Field>
      <ImageUpload
        name="photoPublicId"
        folder={CLOUDINARY_FOLDERS.avatars}
        label="Photo"
        defaultPublicId={member?.photoPublicId}
        defaultPreviewUrl={member?.photoUrl}
        clearLabel="Clear photo"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="yearLabel" label="Year label">
          <input
            id="yearLabel"
            name="yearLabel"
            placeholder="2025–26"
            defaultValue={member?.yearLabel}
            className={inputClass}
          />
        </Field>
        <Field id="sortOrder" label="Sort order">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={member?.sortOrder ?? 0}
            className={inputClass}
          />
        </Field>
      </div>
      <Field id="isCurrent" label="On public roster">
        <select
          id="isCurrent"
          name="isCurrent"
          defaultValue={member?.isCurrent === false ? "false" : "true"}
          className={inputClass}
        >
          <option value="true">Current · show on /team</option>
          <option value="false">Past · hide from /team</option>
        </select>
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="ember" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Link
          href="/admin/team"
          className="self-center text-sm text-mute hover:text-ink"
        >
          Back
        </Link>
      </div>
    </form>
  );
}
