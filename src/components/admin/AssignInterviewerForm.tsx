"use client";

import { useState, useTransition } from "react";
import { assignInterviewer } from "@/app/actions/hiring";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

type Props = {
  applications: { id: string; label: string }[];
  interviewers: { id: string; label: string }[];
};

export function AssignInterviewerForm({ applications, interviewers }: Props) {
  const [applicationId, setApplicationId] = useState(applications[0]?.id ?? "");
  const [interviewerId, setInterviewerId] = useState(interviewers[0]?.id ?? "");
  const [message, setMessage] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  if (applications.length === 0 || interviewers.length === 0) {
    return (
      <p className="text-sm text-mute">
        Need at least one application and one interviewer/admin user.
      </p>
    );
  }

  return (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-[1fr_1fr_auto]">
      <Field id="assign-app" label="Application">
        <select
          id="assign-app"
          className={inputClass}
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
        >
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              {app.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="assign-interviewer" label="Interviewer">
        <select
          id="assign-interviewer"
          className={inputClass}
          value={interviewerId}
          onChange={(e) => setInterviewerId(e.target.value)}
        >
          {interviewers.map((person) => (
            <option key={person.id} value={person.id}>
              {person.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end">
        <Button
          type="button"
          variant="ember"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await assignInterviewer(applicationId, interviewerId);
              setMessage(result.ok ? "Assigned." : result.error);
            })
          }
        >
          {pending ? "Saving…" : "Assign"}
        </Button>
      </div>
      {message ? <p className="sm:col-span-3 text-sm text-mute">{message}</p> : null}
    </div>
  );
}
