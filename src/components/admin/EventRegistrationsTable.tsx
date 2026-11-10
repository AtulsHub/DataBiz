"use client";

import { useTransition } from "react";
import { setRegistrationStatus } from "@/app/actions/events";
import type { EventRegistration } from "@/lib/events";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Props = {
  registrations: EventRegistration[];
};

export function EventRegistrationsTable({ registrations }: Props) {
  const [pending, startTransition] = useTransition();

  if (registrations.length === 0) {
    return (
      <p className="text-sm text-mute">No RSVPs yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-line bg-paper-elevated font-mono text-[0.65rem] uppercase tracking-[0.14em] text-steel">
          <tr>
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">Year / branch</th>
            <th className="px-3 py-2 font-medium">Ticket</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">When</th>
            <th className="px-3 py-2 font-medium">Check-in</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {registrations.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-3">
                {row.firstName} {row.lastName}
              </td>
              <td className="px-3 py-3 font-mono text-xs">{row.email}</td>
              <td className="px-3 py-3 text-mute">
                {row.year} · {row.branch}
              </td>
              <td className="px-3 py-3 font-mono text-xs">
                {row.ticketCode ?? "—"}
                {row.checkedInAt ? (
                  <span className="mt-1 block text-mute">
                    in {formatDateTime(row.checkedInAt)}
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-3 capitalize">{row.status}</td>
              <td className="px-3 py-3 text-mute">
                {formatDateTime(row.createdAt)}
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  {row.status !== "attended" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ember"
                      disabled={pending}
                      onClick={() =>
                        startTransition(() => {
                          void setRegistrationStatus(row.id, "attended");
                        })
                      }
                    >
                      Attended
                    </Button>
                  ) : null}
                  {row.status !== "cancelled" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        startTransition(() => {
                          void setRegistrationStatus(row.id, "cancelled");
                        })
                      }
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        startTransition(() => {
                          void setRegistrationStatus(row.id, "registered");
                        })
                      }
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
