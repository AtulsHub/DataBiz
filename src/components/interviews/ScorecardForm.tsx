"use client";

import { useActionState, useState } from "react";
import { submitScorecard } from "@/app/actions/hiring";
import type { ActionResult } from "@/app/actions/events";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/forms/Field";

type RubricRow = { criterion: string; score: number };

type Props = {
  applicationId: string;
  defaultRubric: RubricRow[];
  defaultNotes?: string;
  defaultRecommendation?: string;
};

const initial: ActionResult = { ok: false };

export function ScorecardForm({
  applicationId,
  defaultRubric,
  defaultNotes,
  defaultRecommendation,
}: Props) {
  const action = submitScorecard.bind(null, applicationId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [rubric, setRubric] = useState(defaultRubric);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="rubricJson" value={JSON.stringify(rubric)} />
      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-signal-deep" role="status">
          Scorecard saved.
        </p>
      ) : null}

      <ul className="space-y-3">
        {rubric.map((row, index) => (
          <li key={row.criterion} className="grid grid-cols-[1fr_6rem] gap-3">
            <p className="text-sm font-medium self-center">{row.criterion}</p>
            <input
              type="number"
              min={1}
              max={5}
              className={inputClass}
              value={row.score}
              onChange={(e) =>
                setRubric((prev) =>
                  prev.map((item, i) =>
                    i === index
                      ? { ...item, score: Number(e.target.value) }
                      : item,
                  ),
                )
              }
            />
          </li>
        ))}
      </ul>

      <Field id={`rec-${applicationId}`} label="Recommendation">
        <select
          id={`rec-${applicationId}`}
          name="recommendation"
          defaultValue={defaultRecommendation ?? "maybe"}
          className={inputClass}
        >
          <option value="yes">Yes</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
      </Field>

      <Field id={`notes-${applicationId}`} label="Notes">
        <textarea
          id={`notes-${applicationId}`}
          name="notes"
          rows={4}
          defaultValue={defaultNotes}
          className={textareaClass}
        />
      </Field>

      <Button type="submit" variant="ember" disabled={pending}>
        {pending ? "Saving…" : "Save scorecard"}
      </Button>
    </form>
  );
}
