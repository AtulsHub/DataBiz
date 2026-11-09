"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  bookInterviewSlot,
  respondToOffer,
} from "@/app/actions/hiring";
import {
  applicantVisibleStage,
  type ApplicationSummary,
} from "@/lib/applications";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  remaining: number;
};

type Props = {
  application: ApplicationSummary;
  slots: Slot[];
};

export function ApplicationCard({ application, slots }: Props) {
  const visible = applicantVisibleStage(
    application.stage,
    application.resultsPublishedAt,
  );
  const [message, setMessage] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="border border-line bg-paper-elevated p-5">
      <p className="font-medium text-ink">{application.drive.title}</p>
      <p className="mt-1 font-mono text-xs text-mute">
        {application.role.name} · stage {visible}
      </p>

      {application.role.oaDeadline ? (
        <p className="mt-3 text-sm text-steel">
          OA deadline {formatDateTime(application.role.oaDeadline)}
        </p>
      ) : null}
      {application.booking ? (
        <p className="mt-3 text-sm text-steel">
          Interview {formatDateTime(application.booking.startsAt)}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {visible === "oa" ? (
          <Button href={`/account/oa/${application.id}`} variant="ember" size="sm">
            Open OA
          </Button>
        ) : null}

        {(visible === "shortlisted" || visible === "interview") &&
        !application.booking ? (
          <div className="w-full space-y-2">
            <p className="text-sm text-mute">Book an interview slot</p>
            {slots.filter((s) => s.remaining > 0).length === 0 ? (
              <p className="text-sm text-mute">No open slots yet.</p>
            ) : (
              <ul className="space-y-2">
                {slots
                  .filter((s) => s.remaining > 0)
                  .map((slot) => (
                    <li key={slot.id} className="flex flex-wrap items-center gap-3">
                      <span className="text-sm">
                        {formatDateTime(slot.startsAt)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const result = await bookInterviewSlot(
                              application.id,
                              slot.id,
                            );
                            setMessage(
                              result.ok ? "Slot booked." : result.error,
                            );
                          })
                        }
                      >
                        Book
                      </Button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        ) : null}

        {visible === "selected" ? (
          <>
            <Button
              type="button"
              variant="ember"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await respondToOffer(application.id, "accepted");
                  setMessage(result.ok ? "Offer accepted." : result.error);
                })
              }
            >
              Accept
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await respondToOffer(application.id, "declined");
                  setMessage(result.ok ? "Offer declined." : result.error);
                })
              }
            >
              Decline
            </Button>
          </>
        ) : null}

        <Link
          href={`/join/${application.drive.slug}`}
          className="text-sm text-ember hover:underline"
        >
          Drive page
        </Link>
      </div>
      {message ? <p className="mt-3 text-sm text-mute">{message}</p> : null}
    </div>
  );
}
