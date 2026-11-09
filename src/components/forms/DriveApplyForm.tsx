"use client";

import { useActionState } from "react";
import Link from "next/link";
import { applyToDrive } from "@/app/actions/hiring";
import type { ActionResult } from "@/app/actions/events";
import type { DriveItem } from "@/lib/drives";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";
import { ResumeUpload } from "@/components/admin/ResumeUpload";

type Props = {
  drive: DriveItem;
  signedIn: boolean;
  profileReady: boolean;
  alreadyApplied: boolean;
};

const initial: ActionResult = { ok: false };

export function DriveApplyForm({
  drive,
  signedIn,
  profileReady,
  alreadyApplied,
}: Props) {
  const [state, formAction, pending] = useActionState(applyToDrive, initial);

  if (!signedIn) {
    return (
      <Button href={`/login?next=/join/${drive.slug}`} variant="ember" className="w-full">
        Sign in to apply
      </Button>
    );
  }

  if (alreadyApplied) {
    return (
      <p className="text-sm text-mute">
        You already applied. Track your stage on{" "}
        <Link href="/account" className="text-ember hover:underline">
          /account
        </Link>
        .
      </p>
    );
  }

  if (!profileReady) {
    return (
      <p className="text-sm text-mute">
        Add your name, year, and branch on{" "}
        <Link href="/account" className="text-ember hover:underline">
          /account
        </Link>{" "}
        before applying.
      </p>
    );
  }

  if (state.ok) {
    return (
      <p className="border border-line bg-paper px-3 py-2 text-sm text-signal-deep" role="status">
        Application submitted. Open{" "}
        <Link href="/account" className="underline">
          your account
        </Link>{" "}
        for stage updates.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="driveId" value={drive.id} />
      {state.error ? (
        <p className="border border-line bg-paper px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <Field id="roleId" label="Role" required>
        <select id="roleId" name="roleId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Select a role
          </option>
          {drive.roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </Field>
      <ResumeUpload />
      <Field id="portfolioUrl" label="Portfolio URL">
        <input
          id="portfolioUrl"
          name="portfolioUrl"
          type="text"
          inputMode="url"
          placeholder="https://"
          className={inputClass}
        />
      </Field>
      <Button type="submit" variant="ember" disabled={pending} className="w-full">
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
