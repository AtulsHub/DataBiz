"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("sent");
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3">
      <label className="sr-only" htmlFor="newsletter-email">
        Email for newsletter
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="you@email.com"
          className="h-11 flex-1 rounded-sm border border-white/15 bg-void-soft px-3 text-sm text-paper placeholder:text-white/35 focus:border-ember focus:outline-none"
        />
        <Button type="submit" variant="ember" size="md" className="sm:w-auto">
          Subscribe
        </Button>
      </div>
      {status === "sent" ? (
        <p className="text-sm text-ember" role="status">
          Check your inbox to confirm.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-300" role="alert">
          Enter a valid email address.
        </p>
      ) : null}
    </form>
  );
}
