"use client";

import { useActionState } from "react";
import { createInterviewSlot } from "@/app/actions/hiring";
import type { ActionResult } from "@/app/actions/events";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

type Props = {
  driveId: string;
  slots: {
    id: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    booked: number;
    remaining: number;
  }[];
};

const initial: ActionResult = { ok: false };

export function DriveSlotsForm({ driveId, slots }: Props) {
  const action = createInterviewSlot.bind(null, driveId);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid gap-4 sm:grid-cols-4">
        <Field id="startsAt" label="Starts" required>
          <input id="startsAt" name="startsAt" type="datetime-local" required className={inputClass} />
        </Field>
        <Field id="endsAt" label="Ends" required>
          <input id="endsAt" name="endsAt" type="datetime-local" required className={inputClass} />
        </Field>
        <Field id="capacity" label="Capacity">
          <input id="capacity" name="capacity" type="number" min={1} defaultValue={1} className={inputClass} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="ember" disabled={pending}>
            {pending ? "Adding…" : "Add slot"}
          </Button>
        </div>
        {state.error ? (
          <p className="sm:col-span-4 text-sm text-danger">{state.error}</p>
        ) : null}
        {state.ok ? (
          <p className="sm:col-span-4 text-sm text-signal-deep">Slot added.</p>
        ) : null}
      </form>

      {slots.length === 0 ? (
        <p className="text-sm text-mute">No interview slots yet.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {slots.map((slot) => (
            <li key={slot.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
              <span>
                {formatDateTime(slot.startsAt)} → {formatDateTime(slot.endsAt)}
              </span>
              <span className="font-mono text-xs text-mute">
                {slot.booked}/{slot.capacity} booked
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
