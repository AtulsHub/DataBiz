"use client";

import { useActionState } from "react";
import {
  subscribeNewsletter,
  type NewsletterActionResult,
} from "@/app/actions/newsletter";
import { Button } from "@/components/ui/Button";

const initial: NewsletterActionResult = { ok: false };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeNewsletter,
    initial,
  );

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3">
      <label className="sr-only" htmlFor="newsletter-email">
        Email for newsletter
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="h-11 flex-1 rounded-sm border border-[color:var(--on-void-line)] bg-void-soft px-3 text-sm text-[color:var(--on-void)] placeholder:text-[color:var(--on-void-mute)] focus:border-ember focus:outline-none"
        />
        <Button
          type="submit"
          variant="ember"
          size="md"
          className="sm:w-auto"
          disabled={pending}
        >
          {pending ? "Sending…" : "Subscribe"}
        </Button>
      </div>
      {state.ok ? (
        <p className="text-sm text-ember" role="status">
          {state.already
            ? state.message || "You are already subscribed."
            : "Check your inbox to confirm."}
        </p>
      ) : null}
      {!state.ok && state.error ? (
        <p className="text-sm text-[#ffb4a8]" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
