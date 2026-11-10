"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormSkeleton } from "@/components/ui/PageLoader";
import { Field, inputClass } from "./Field";
import { authClient } from "@/lib/auth-client";
import {
  allowedEmailDomain,
  isAllowedCollegeEmail,
} from "@/lib/email-domain";
import { cn } from "@/lib/utils";

type AuthStatus = {
  configured: boolean;
  database: boolean;
  secret: boolean;
  email: boolean;
  domain: string;
};

type Mode = "signin" | "signup" | "reset";

function setPasswordCallback(next: string) {
  const safe = next.startsWith("/") ? next : "/account";
  return `/set-password?next=${encodeURIComponent(safe)}`;
}

function modeFromQuery(value: string | null): Mode {
  if (value === "signup" || value === "sign-up" || value === "register") {
    return "signup";
  }
  if (value === "reset" || value === "forgot") {
    return "reset";
  }
  return "signin";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [mode, setMode] = useState<Mode>(() =>
    modeFromQuery(searchParams.get("mode")),
  );
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "INVALID_TOKEN" || err === "link") {
      setError(
        "That sign-up link is invalid or was already used. Request a fresh one, or sign in if you already have a password.",
      );
      setMode("signup");
    } else {
      setMode(modeFromQuery(searchParams.get("mode")));
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

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(undefined);
    setSent(false);
    const params = new URLSearchParams(searchParams.toString());
    if (nextMode === "signin") {
      params.delete("mode");
    } else {
      params.set("mode", nextMode);
    }
    const query = params.toString();
    router.replace(query ? `/login?${query}` : "/login", { scroll: false });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");

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

    if (mode === "signin") {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
        callbackURL: next,
      });

      setPending(false);

      if (authError) {
        setError(
          authError.message ||
            "Wrong email or password. New here? Use Sign up first.",
        );
        return;
      }

      router.push(next.startsWith("/") ? next : "/account");
      router.refresh();
      return;
    }

    if (mode === "reset") {
      const { error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      setPending(false);

      if (resetError) {
        setError(resetError.message || "Could not send a reset link.");
        return;
      }

      setSent(true);
      return;
    }

    const afterVerify = setPasswordCallback(next);
    const { error: authError } = await authClient.signIn.magicLink({
      email,
      callbackURL: afterVerify,
      newUserCallbackURL: afterVerify,
      errorCallbackURL: "/login?error=link&mode=signup",
    });

    setPending(false);

    if (authError) {
      setError(authError.message || "Could not send the sign-up link.");
      return;
    }

    setSent(true);
  }

  if (!status) {
    return <FormSkeleton />;
  }

  const busy = pending;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={busy}>
      {mode !== "reset" ? (
        <div
          role="tablist"
          aria-label="Account"
          className="grid grid-cols-2 border border-line bg-paper p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            disabled={busy}
            onClick={() => switchMode("signin")}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60",
              mode === "signin"
                ? "bg-paper-elevated text-ink shadow-sm"
                : "text-mute hover:text-ink",
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            disabled={busy}
            onClick={() => switchMode("signup")}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60",
              mode === "signup"
                ? "bg-paper-elevated text-ink shadow-sm"
                : "text-mute hover:text-ink",
            )}
          >
            Sign up
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">Forgot password</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => switchMode("signin")}
            className="text-sm font-medium text-ember hover:underline disabled:opacity-60"
          >
            Back to sign in
          </button>
        </div>
      )}

      {mode === "signup" ? (
        <p className="text-sm leading-relaxed text-mute">
          New to DataBiz? We email a one-time link to your college address.
          After you open it, you must create a password — then use Sign in next
          time.
        </p>
      ) : null}

      {mode === "reset" ? (
        <p className="text-sm leading-relaxed text-mute">
          Enter your college email and we&apos;ll send a reset link.
        </p>
      ) : null}

      <Field
        id="login-email"
        label="College email"
        required
        error={error}
        hint={`Only ${domain} addresses can ${mode === "signup" ? "sign up" : "sign in"}.`}
      >
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          disabled={busy}
          placeholder={`rollnumber${domain}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-email-error" : "login-email-hint"}
          className={inputClass}
        />
      </Field>

      {mode === "signin" ? (
        <Field id="login-password" label="Password" required>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            disabled={busy}
            className={inputClass}
          />
        </Field>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        pending={busy}
        pendingLabel={
          mode === "signin"
            ? "Signing in…"
            : mode === "reset"
              ? "Sending reset link…"
              : "Sending sign-up link…"
        }
      >
        {mode === "signin"
          ? "Sign in"
          : mode === "reset"
            ? "Email me a reset link"
            : "Email me a sign-up link"}
      </Button>

      {mode === "signin" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            type="button"
            disabled={busy}
            onClick={() => switchMode("signup")}
            className="font-medium text-ember hover:underline disabled:opacity-60"
          >
            Need an account? Sign up
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => switchMode("reset")}
            className="text-mute hover:text-ink hover:underline disabled:opacity-60"
          >
            Forgot password?
          </button>
        </div>
      ) : null}

      {mode === "signup" ? (
        <p className="text-sm text-mute">
          Already verified?{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() => switchMode("signin")}
            className="font-medium text-ember hover:underline disabled:opacity-60"
          >
            Sign in
          </button>
        </p>
      ) : null}

      {sent && mode === "signup" ? (
        <p className="text-sm leading-relaxed text-mute" role="status">
          Check your inbox and open the link once. You must create a password
          right after — then use Sign in with email + password.
        </p>
      ) : null}

      {sent && mode === "reset" ? (
        <p className="text-sm leading-relaxed text-mute" role="status">
          If that address has an account, a reset link is on its way. Open it
          and choose a new password.
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
