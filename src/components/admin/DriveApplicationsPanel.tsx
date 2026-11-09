"use client";

import { useTransition, useState } from "react";
import {
  exportDriveCsv,
  moveApplicationStage,
  promoteWaitlisted,
  publishDriveResults,
  setManualScore,
} from "@/app/actions/hiring";
import type { ApplicationStage } from "@/lib/applications";
import { Button } from "@/components/ui/Button";

type AppRow = {
  id: string;
  stage: ApplicationStage;
  role: { name: string };
  user: {
    name: string;
    email: string;
    rollNumber?: string | null;
    year?: string | null;
    branch?: string | null;
  };
  attempt?: {
    id: string;
    status: string;
    autoScore?: number | null;
    manualScore?: number | null;
  } | null;
};

type Props = {
  driveId: string;
  applications: AppRow[];
  resultsPublished: boolean;
};

const stages: ApplicationStage[] = [
  "applied",
  "oa",
  "shortlisted",
  "interview",
  "selected",
  "waitlisted",
  "rejected",
  "accepted",
  "declined",
];

export function DriveApplicationsPanel({
  driveId,
  applications,
  resultsPublished,
}: Props) {
  const [message, setMessage] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="ember"
          disabled={pending || resultsPublished}
          onClick={() =>
            startTransition(async () => {
              const result = await publishDriveResults(driveId);
              setMessage(
                result.ok
                  ? "Results published and emails sent where applicable."
                  : result.error,
              );
            })
          }
        >
          Publish results
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await exportDriveCsv(driveId);
              if (!result.ok || !result.csv) {
                setMessage(result.error || "Export failed.");
                return;
              }
              const blob = new Blob([result.csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `drive-${driveId}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              setMessage("CSV downloaded.");
            })
          }
        >
          Export CSV
        </Button>
      </div>
      {message ? <p className="text-sm text-mute">{message}</p> : null}

      {applications.length === 0 ? (
        <p className="text-sm text-mute">No applications yet.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {applications.map((app) => (
            <li key={app.id} className="grid gap-3 py-4 lg:grid-cols-[1.2fr_1fr_auto]">
              <div>
                <p className="font-medium text-ink">{app.user.name}</p>
                <p className="mt-1 font-mono text-xs text-mute">
                  {app.user.email}
                  {app.user.rollNumber ? ` · ${app.user.rollNumber}` : ""}
                </p>
                <p className="mt-1 text-sm text-steel">
                  {app.role.name}
                  {app.user.year ? ` · ${app.user.year}` : ""}
                  {app.user.branch ? ` · ${app.user.branch}` : ""}
                </p>
                {app.attempt ? (
                  <p className="mt-2 font-mono text-xs text-mute">
                    OA {app.attempt.status}
                    {app.attempt.autoScore != null
                      ? ` · auto ${app.attempt.autoScore}`
                      : ""}
                    {app.attempt.manualScore != null
                      ? ` · manual ${app.attempt.manualScore}`
                      : ""}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-10 rounded-sm border border-line-strong bg-paper-elevated px-2 text-sm"
                  defaultValue={app.stage}
                  disabled={pending}
                  onChange={(e) =>
                    startTransition(async () => {
                      const result = await moveApplicationStage(
                        app.id,
                        e.target.value as ApplicationStage,
                      );
                      setMessage(result.ok ? `Moved to ${e.target.value}.` : result.error);
                    })
                  }
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                {app.attempt ? (
                  <button
                    type="button"
                    className="text-xs text-ember hover:underline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const raw = window.prompt(
                          "Manual score",
                          String(app.attempt?.manualScore ?? 0),
                        );
                        if (raw == null) return;
                        const result = await setManualScore(
                          app.attempt!.id,
                          Number(raw),
                        );
                        setMessage(
                          result.ok ? "Manual score saved." : result.error,
                        );
                      })
                    }
                  >
                    Set manual score
                  </button>
                ) : null}
                {app.stage === "declined" ? (
                  <button
                    type="button"
                    className="text-xs text-ember hover:underline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await promoteWaitlisted(app.id);
                        setMessage(
                          result.ok
                            ? "Promoted earliest waitlisted applicant."
                            : result.error,
                        );
                      })
                    }
                  >
                    Promote waitlist
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
