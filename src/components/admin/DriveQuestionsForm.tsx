"use client";

import { useActionState, useState } from "react";
import { saveRoleQuestions } from "@/app/actions/hiring";
import type { ActionResult } from "@/app/actions/events";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type QuestionDraft = {
  key: string;
  id?: string;
  prompt: string;
  kind: "multiple_choice" | "short_text" | "long_text";
  optionsText: string;
  answerKey: string;
  points: string;
};

type Props = {
  roleId: string;
  roleName: string;
  questions: {
    id: string;
    prompt: string;
    kind: string;
    options: string[] | null;
    answerKey: string | null;
    points: number;
  }[];
};

const initial: ActionResult = { ok: false };

export function DriveQuestionsForm({ roleId, roleName, questions }: Props) {
  const action = saveRoleQuestions.bind(null, roleId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [drafts, setDrafts] = useState<QuestionDraft[]>(() =>
    questions.length
      ? questions.map((q) => ({
          key: q.id,
          id: q.id,
          prompt: q.prompt,
          kind: (q.kind as QuestionDraft["kind"]) || "short_text",
          optionsText: (q.options ?? []).join("\n"),
          answerKey: q.answerKey ?? "",
          points: String(q.points ?? 1),
        }))
      : [
          {
            key: crypto.randomUUID(),
            prompt: "",
            kind: "multiple_choice",
            optionsText: "",
            answerKey: "",
            points: "1",
          },
        ],
  );

  return (
    <form action={formAction} className="space-y-4 border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">Questions · {roleName}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            setDrafts((prev) => [
              ...prev,
              {
                key: crypto.randomUUID(),
                prompt: "",
                kind: "short_text",
                optionsText: "",
                answerKey: "",
                points: "1",
              },
            ])
          }
        >
          Add question
        </Button>
      </div>
      <input
        type="hidden"
        name="questionsJson"
        value={JSON.stringify(
          drafts
            .filter((d) => d.prompt.trim())
            .map((d) => ({
              id: d.id,
              prompt: d.prompt,
              kind: d.kind,
              options: d.optionsText
                .split("\n")
                .map((o) => o.trim())
                .filter(Boolean),
              answerKey: d.answerKey || undefined,
              points: Number(d.points) || 1,
            })),
        )}
      />
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-signal-deep">Questions saved.</p> : null}

      <ul className="space-y-4">
        {drafts.map((draft) => (
          <li key={draft.key} className="space-y-3 bg-paper-elevated p-3">
            <Field id={`q-${draft.key}`} label="Prompt">
              <textarea
                id={`q-${draft.key}`}
                rows={2}
                value={draft.prompt}
                onChange={(e) =>
                  setDrafts((prev) =>
                    prev.map((row) =>
                      row.key === draft.key
                        ? { ...row, prompt: e.target.value }
                        : row,
                    ),
                  )
                }
                className={textareaClass}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field id={`kind-${draft.key}`} label="Kind">
                <select
                  value={draft.kind}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? {
                              ...row,
                              kind: e.target.value as QuestionDraft["kind"],
                            }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                >
                  <option value="multiple_choice">Multiple choice</option>
                  <option value="short_text">Short text</option>
                  <option value="long_text">Long text</option>
                </select>
              </Field>
              <Field id={`pts-${draft.key}`} label="Points">
                <input
                  type="number"
                  min={1}
                  value={draft.points}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, points: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
              <Field id={`key-${draft.key}`} label="Answer key">
                <input
                  value={draft.answerKey}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, answerKey: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>
            {draft.kind === "multiple_choice" ? (
              <Field
                id={`opts-${draft.key}`}
                label="Options"
                hint="One option per line"
              >
                <textarea
                  id={`opts-${draft.key}`}
                  rows={3}
                  value={draft.optionsText}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((row) =>
                        row.key === draft.key
                          ? { ...row, optionsText: e.target.value }
                          : row,
                      ),
                    )
                  }
                  className={textareaClass}
                />
              </Field>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setDrafts((prev) => prev.filter((row) => row.key !== draft.key))
              }
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <Button type="submit" variant="ember" disabled={pending}>
        {pending ? "Saving…" : "Save questions"}
      </Button>
    </form>
  );
}
