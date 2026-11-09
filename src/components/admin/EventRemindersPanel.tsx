"use client";

import { useState, useTransition } from "react";
import {
  sendDueEventReminders,
  sendEventReminderNow,
} from "@/app/actions/newsletter";
import { Button } from "@/components/ui/Button";

type DueEvent = {
  id: string;
  title: string;
  startsAt: string;
  slug: string;
};

type Props = {
  due: DueEvent[];
};

export function EventRemindersPanel({ due }: Props) {
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Event reminders
          </h2>
          <p className="mt-2 max-w-xl text-sm text-mute">
            No cron. Send day-before reminders manually for published events
            starting within 36 hours that have not been reminded yet.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setError(undefined);
            setMessage(undefined);
            startTransition(async () => {
              const result = await sendDueEventReminders();
              if (result.ok) setMessage(result.message);
              else setError(result.error);
            });
          }}
        >
          {pending ? "Sending…" : "Send due reminders"}
        </Button>
      </div>

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

      {due.length === 0 ? (
        <p className="text-sm text-mute">No events are due for a reminder.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {due.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <p className="font-medium text-ink">{event.title}</p>
                <p className="mt-1 font-mono text-xs text-mute">
                  /events/{event.slug} ·{" "}
                  {new Date(event.startsAt).toLocaleString("en-IN")}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setError(undefined);
                  setMessage(undefined);
                  startTransition(async () => {
                    const result = await sendEventReminderNow(event.id);
                    if (result.ok) setMessage(result.message);
                    else setError(result.error);
                  });
                }}
              >
                Remind now
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
