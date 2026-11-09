"use client";

import { useState, useTransition } from "react";
import { sendEventReminderNow } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/Button";

type Props = {
  eventId: string;
  alreadySent: boolean;
};

export function EventReminderButton({ eventId, alreadySent }: Props) {
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => {
            setError(undefined);
            setMessage(undefined);
            startTransition(async () => {
              const result = await sendEventReminderNow(eventId, alreadySent);
              if (result.ok) setMessage(result.message);
              else setError(result.error);
            });
          }}
        >
          {pending
            ? "Sending…"
            : alreadySent
              ? "Force resend reminder"
              : "Send reminder now"}
        </Button>
      </div>
      {alreadySent ? (
        <p className="text-xs text-mute">
          A reminder was already marked sent. Force resend only if you intend to
          mail registrants again.
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-signal-deep" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
