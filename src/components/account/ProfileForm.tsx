"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

type Profile = {
  name?: string | null;
  year?: string | null;
  branch?: string | null;
  phone?: string | null;
};

type Props = {
  profile: Profile;
};

export function ProfileForm({ profile }: Props) {
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setSaved(false);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const year = String(data.get("year") ?? "").trim();
    const branch = String(data.get("branch") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    const { error: updateError } = await authClient.updateUser({
      name,
      year,
      branch,
      phone,
    } as {
      name: string;
      year: string;
      branch: string;
      phone: string;
    });

    setPending(false);

    if (updateError) {
      setError(updateError.message || "Could not save your profile.");
      return;
    }

    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field id="profile-name" label="Display name" required>
        <input
          id="profile-name"
          name="name"
          type="text"
          required
          defaultValue={profile.name ?? ""}
          autoComplete="name"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="profile-year" label="Year" hint="e.g. 2nd year">
          <input
            id="profile-year"
            name="year"
            type="text"
            defaultValue={profile.year ?? ""}
            className={inputClass}
          />
        </Field>
        <Field id="profile-branch" label="Branch" hint="e.g. CSE">
          <input
            id="profile-branch"
            name="branch"
            type="text"
            defaultValue={profile.branch ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
      <Field id="profile-phone" label="Phone">
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          autoComplete="tel"
          className={inputClass}
        />
      </Field>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-signal-deep" role="status">
          Profile saved.
        </p>
      ) : null}

      <Button
        type="submit"
        variant="ember"
        pending={pending}
        pendingLabel="Saving…"
      >
        Save profile
      </Button>
    </form>
  );
}
