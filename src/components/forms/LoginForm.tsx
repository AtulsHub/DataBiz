"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "./Field";
import { authClient } from "@/lib/auth-client";
import {
  allowedEmailDomain,
  isAllowedCollegeEmail,
} from "@/lib/email-domain";

type AuthStatus = {
  configured: boolean;
  database: boolean;
  secret: boolean;
  email: boolean;
  domain: string;
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "INVALID_TOKEN" || err === "link") {
      setError(
        "That sign-in link is invalid or was already used. Request a fresh one.",
      );
    }

    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data: AuthStatus) => setStatus(data))
      .catch(() =>
        setStatus({
          configured: false,
          database: false,
          secret: false,
          email: false,
          domain: allowedEmailDomain(),
        }),
      );
  }, [searchParams]);

  const domain = status?.domain ? `@${status.domain}` : "@stu.manit.ac.in";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "")
      .trim()
      .toLowerCase();

    if (!isAllowedCollegeEmail(email)) {
      setSent(false);
      setError(`Use your MANIT student address ending in ${domain}.`);
      return;
    }

    if (!status?.configured) {
      setSent(false);
      setError(
        "Sign-in is not wired yet. Add DATABASE_URL and BETTER_AUTH_SECRET to .env.local, then run pnpm db:push.",
      );
      return;
    }

    setError(undefined);
    setPending(true);

    const { error: authError } = await authClient.signIn.magicLink({
      email,
      callbackURL: next,
      newUserCallbackURL: next,
      errorCallbackURL: "/login?error=link",
    });

    setPending(false);

    if (authError) {
      setError(authError.message || "Could not send the sign-in link.");
      return;
    }

    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field
        id="login-email"
        label="College email"
        required
        error={error}
        hint={`Only ${domain} addresses can sign in.`}
      >
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder={`rollnumber${domain}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-email-error" : "login-email-hint"}
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
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
      {sent ? (
        <p className="text-sm leading-relaxed text-mute" role="status">
          Check your inbox for a one-time link. It expires in 15 minutes.
          With the Resend test sender, open the magic link printed in the{" "}
          <strong className="font-medium text-ink">dev server terminal</strong>{" "}
          once, on <span className="font-mono text-ink">localhost:3000</span>{" "}
          (not 127.0.0.1). Do not reuse an old link.
        </p>
      ) : null}
      {status && !status.configured ? (
        <p className="border border-line bg-paper px-3 py-2 text-xs leading-relaxed text-mute">
          Backend status: database {status.database ? "ready" : "missing"},
          auth secret {status.secret ? "ready" : "missing"}. Public pages keep
          working on seed content until Neon is connected.
        </p>
      ) : null}
    </form>
  );
}
