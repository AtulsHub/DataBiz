"use client";

import { useEffect, useState } from "react";
import {
  hasAccountPassword,
  setAccountPassword,
} from "@/app/actions/account";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

export function PasswordForm() {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState<"set" | "changed" | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void hasAccountPassword().then((value) => {
      if (!cancelled) setHasPassword(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setSaved(null);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const currentPassword = String(data.get("currentPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setPending(false);
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPending(false);
      setError("Use at least 8 characters.");
      return;
    }

    const changing = hasPassword;
    if (changing) {
      const { error: changeError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      setPending(false);
      if (changeError) {
        setError(changeError.message || "Could not change password.");
        return;
      }
    } else {
      const result = await setAccountPassword(newPassword);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setHasPassword(true);
    }

    e.currentTarget.reset();
    setSaved(changing ? "changed" : "set");
  }

  if (hasPassword === null) {
    return <p className="text-sm text-mute">Checking password status…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <p className="text-sm text-mute">
        {hasPassword
          ? "Change the password you use with your college email on sign in."
          : "You still need a password — finish setup to keep using your account."}
      </p>

      {hasPassword ? (
        <Field id="current-password" label="Current password" required>
          <input
            id="current-password"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </Field>
      ) : null}

      <Field id="new-password" label="New password" required hint="At least 8 characters.">
        <input
          id="new-password"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <Field id="confirm-password" label="Confirm password" required>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
          {saved === "changed"
            ? "Password updated."
            : "Password saved. Use it on the next sign-in."}
        </p>
      ) : null}

      <Button type="submit" variant="ember" disabled={pending}>
        {pending
          ? "Saving…"
          : hasPassword
            ? "Change password"
            : "Set password"}
      </Button>
    </form>
  );
}
