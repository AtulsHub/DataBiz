"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "./Field";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState<string | undefined>(
    token ? undefined : "Missing reset token. Request a new link from sign in.",
  );
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token. Request a new link from sign in.");
      return;
    }

    const data = new FormData(e.currentTarget);
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(undefined);
    setPending(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword,
      token,
    });

    setPending(false);

    if (resetError) {
      setError(resetError.message || "Could not reset password.");
      return;
    }

    setDone(true);
    router.push("/login?next=/account");
    router.refresh();
  }

  if (done) {
    return (
      <p className="text-sm text-mute" role="status">
        Password updated. Redirecting to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field
        id="reset-password"
        label="New password"
        required
        hint="At least 8 characters."
        error={error}
      >
        <input
          id="reset-password"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          className={inputClass}
        />
      </Field>
      <Field id="reset-confirm" label="Confirm password" required>
        <input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={!token}
        pending={pending}
        pendingLabel="Saving…"
      >
        Save new password
      </Button>
    </form>
  );
}
