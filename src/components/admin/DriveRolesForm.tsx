"use client";

import { useActionState, useState } from "react";
import { saveDriveRoles } from "@/app/actions/hiring";
import type { ActionResult } from "@/app/actions/events";
import type { DriveRoleItem, OaMode } from "@/lib/drives";
import { toDatetimeLocalValue } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type Draft = {
  key: string;
  id?: string;
  name: string;
  description: string;
  oaMode: OaMode;
  oaDeadline: string;
  liveStartsAt: string;
  liveEndsAt: string;
  quizMinutes: string;
};

type Props = { driveId: string; roles: DriveRoleItem[] };

const initial: ActionResult = { ok: false };

function toDrafts(roles: DriveRoleItem[]): Draft[] {
  if (roles.length === 0) {
    return [
      {
        key: crypto.randomUUID(),
        name: "",
        description: "",
        oaMode: "quiz",
        oaDeadline: "",
        liveStartsAt: "",
        liveEndsAt: "",
        quizMinutes: "60",
      },
    ];
  }
  return roles.map((role) => ({
    key: role.id,
    id: role.id,
    name: role.name,
    description: role.description,
    oaMode: role.oaMode,
    oaDeadline: role.oaDeadline ? toDatetimeLocalValue(role.oaDeadline) : "",
    liveStartsAt: role.liveStartsAt ? toDatetimeLocalValue(role.liveStartsAt) : "",
    liveEndsAt: role.liveEndsAt ? toDatetimeLocalValue(role.liveEndsAt) : "",
    quizMinutes: role.quizMinutes != null ? String(role.quizMinutes) : "",
  }));
}

export function DriveRolesForm({ driveId, roles }: Props) {
  const action = saveDriveRoles.bind(null, driveId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [drafts, setDrafts] = useState(() => toDrafts(roles));

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="hidden"
        name="rolesJson"
        value={JSON.stringify(
          drafts
            .filter((d) => d.name.trim())
            .map((d) => ({
              id: d.id,
              name: d.name,
              description: d.description,
              oaMode: d.oaMode,
              oaDeadline: d.oaDeadline || undefined,
              liveStartsAt: d.liveStartsAt || undefined,
              liveEndsAt: d.liveEndsAt || undefined,
              quizMinutes: d.quizMinutes ? Number(d.quizMinutes) : null,
            })),
        )}
      />
      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-signal-deep" role="status">
          Roles saved.
        </p>
      ) : null}

      <div className="flex justify-between gap-3">
        <p className="text-sm text-mute">Each role has its own OA mode and deadlines.</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            setDrafts((prev) => [
              ...prev,
              {
                key: crypto.randomUUID(),
                name: "",
                description: "",
                oaMode: "quiz",
                oaDeadline: "",
                liveStartsAt: "",
                liveEndsAt: "",
                quizMinutes: "60",
              },
            ])
          }
        >
          Add role
        </Button>
      </div>

      <ul className="space-y-4">
        {drafts.map((draft) => (
          <li key={draft.key} className="space-y-3 border border-line bg-paper p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id={`role-name-${draft.key}`} label="Role name">
                <input
                  id={`role-name-${draft.key}`}
                  value={draft.name}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key ? { ...row, name: e.target.value } : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
              <Field id={`role-mode-${draft.key}`} label="OA mode">
                <select
                  id={`role-mode-${draft.key}`}
                  value={draft.oaMode}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, oaMode: e.target.value as OaMode }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                >
                  <option value="quiz">Quiz</option>
                  <option value="upload">Upload</option>
                  <option value="quiz_and_upload">Quiz + upload</option>
                  <option value="live_quiz">Live quiz</option>
                </select>
              </Field>
            </div>
            <Field id={`role-desc-${draft.key}`} label="Description">
              <textarea
                id={`role-desc-${draft.key}`}
                rows={2}
                value={draft.description}
                onChange={(e) =>
                  setDrafts((prev) =>
                    prev.map((row) =>
                      row.key === draft.key
                        ? { ...row, description: e.target.value }
                        : row,
                    ),
                  )
                }
                className={textareaClass}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field id={`oa-deadline-${draft.key}`} label="OA deadline">
                <input
                  type="datetime-local"
                  value={draft.oaDeadline}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, oaDeadline: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
              <Field id={`quiz-mins-${draft.key}`} label="Quiz minutes">
                <input
                  type="number"
                  min={1}
                  value={draft.quizMinutes}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, quizMinutes: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
              <Field id={`live-start-${draft.key}`} label="Live starts">
                <input
                  type="datetime-local"
                  value={draft.liveStartsAt}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, liveStartsAt: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
              <Field id={`live-end-${draft.key}`} label="Live ends">
                <input
                  type="datetime-local"
                  value={draft.liveEndsAt}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, liveEndsAt: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={drafts.length <= 1}
              onClick={() =>
                setDrafts((prev) => prev.filter((row) => row.key !== draft.key))
              }
            >
              Remove role
            </Button>
          </li>
        ))}
      </ul>

      <Button type="submit" variant="ember" disabled={pending}>
        {pending ? "Saving…" : "Save roles"}
      </Button>
    </form>
  );
}
