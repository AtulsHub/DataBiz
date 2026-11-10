"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccountPassword } from "@/app/actions/account";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "./Field";

export function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const data = new FormData(e.currentTarget);
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setPending(false);
      setError("Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPending(false);
      setError("Passwords do not match.");
      return;
    }

    const result = await setAccountPassword(newPassword);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(next.startsWith("/") ? next : "/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field
        id="set-password"
        label="Create password"
        required
        hint="At least 8 characters. You will use this with your college email to sign in."
        error={error}
      >
        <input
          id="set-password"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          className={inputClass}
        />
      </Field>
      <Field id="set-confirm" label="Confirm password" required>
        <input
          id="set-confirm"
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
        disabled={pending}
      >
        {pending ? "Saving…" : "Save password and continue"}
      </Button>
    </form>
  );
}
