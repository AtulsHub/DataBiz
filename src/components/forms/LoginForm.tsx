"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "./Field";

const DOMAIN = "@stu.manit.ac.in";

export function LoginForm() {
  const [error, setError] = useState<string | undefined>();
  const [checked, setChecked] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "")
      .trim()
      .toLowerCase();

    if (!email.endsWith(DOMAIN) || email.length <= DOMAIN.length) {
      setChecked(false);
      setError(`Use your MANIT student address ending in ${DOMAIN}.`);
      return;
    }
    setError(undefined);
    // Magic-link delivery connects with the auth backend.
    setChecked(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field
        id="login-email"
        label="College email"
        required
        error={error}
        hint={`Only ${DOMAIN} addresses can sign in.`}
      >
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder={`rollnumber${DOMAIN}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-email-error" : "login-email-hint"}
          className={inputClass}
        />
      </Field>
      <Button type="submit" variant="primary" size="md" className="w-full">
        Email me a sign-in link
      </Button>
      {checked ? (
        <p className="text-sm leading-relaxed text-steel" role="status">
          That address is eligible, but sign-in isn&apos;t switched on yet — no link has been sent. Accounts open when the
          next recruitment drive or student feature goes live.
        </p>
      ) : null}
    </form>
  );
}
