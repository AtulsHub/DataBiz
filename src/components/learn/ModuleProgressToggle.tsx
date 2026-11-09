"use client";

import { useState, useTransition } from "react";
import { setPathwayModuleComplete } from "@/app/actions/pathways";

type Props = {
  moduleId: string;
  initialCompleted: boolean;
};

export function ModuleProgressToggle({ moduleId, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const next = !completed;
          setError(undefined);
          startTransition(async () => {
            const result = await setPathwayModuleComplete(moduleId, next);
            if (!result.ok) {
              setError(result.error || "Could not update progress.");
              return;
            }
            setCompleted(next);
          });
        }}
        className="inline-flex items-center gap-2 rounded-sm border border-line-strong bg-paper-elevated px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink disabled:opacity-60"
        aria-pressed={completed}
      >
        <span
          aria-hidden
          className={`inline-block size-3 rounded-full border ${
            completed
              ? "border-ember bg-ember"
              : "border-line-strong bg-transparent"
          }`}
        />
        {pending ? "Saving…" : completed ? "Completed" : "Mark complete"}
      </button>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
