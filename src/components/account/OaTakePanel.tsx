"use client";

import { useMemo, useState, useTransition } from "react";
import { startOaAttempt, submitOaAttempt } from "@/app/actions/hiring";
import type { PublicQuestion } from "@/lib/applications";
import { ResumeUpload } from "@/components/admin/ResumeUpload";
import { Button } from "@/components/ui/Button";
import { inputClass, textareaClass } from "@/components/forms/Field";

type Props = {
  applicationId: string;
  questions: PublicQuestion[];
  oaMode: string;
  initialAttemptId?: string | null;
  initialEndsAt?: string | null;
  alreadySubmitted?: boolean;
};

export function OaTakePanel({
  applicationId,
  questions,
  oaMode,
  initialAttemptId,
  initialEndsAt,
  alreadySubmitted,
}: Props) {
  const [attemptId, setAttemptId] = useState(initialAttemptId ?? "");
  const [endsAt, setEndsAt] = useState(initialEndsAt ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const needsQuiz =
    oaMode === "quiz" || oaMode === "quiz_and_upload" || oaMode === "live_quiz";
  const needsUpload = oaMode === "upload" || oaMode === "quiz_and_upload";

  const remainingLabel = useMemo(() => {
    if (!endsAt) return null;
    const ms = new Date(endsAt).getTime() - Date.now();
    if (ms <= 0) return "Time is up — submit now.";
    const mins = Math.ceil(ms / 60_000);
    return `${mins} min remaining`;
  }, [endsAt]);

  if (alreadySubmitted) {
    return <p className="text-sm text-mute">This OA is already submitted.</p>;
  }

  if (!attemptId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mute">
          Starting begins your timer (if the role uses one). One attempt only.
        </p>
        <Button
          type="button"
          variant="ember"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await startOaAttempt(applicationId);
              if (!result.ok || !result.attemptId) {
                setMessage(result.error || "Could not start.");
                return;
              }
              setAttemptId(result.attemptId);
              setEndsAt(result.endsAt ?? "");
            })
          }
        >
          {pending ? "Starting…" : "Start OA"}
        </Button>
        {message ? <p className="text-sm text-danger">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {remainingLabel ? (
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ember">
          {remainingLabel}
        </p>
      ) : null}

      {needsQuiz ? (
        <ol className="space-y-6">
          {questions.map((q, index) => (
            <li key={q.id} className="space-y-2">
              <p className="font-medium text-ink">
                {index + 1}. {q.prompt}{" "}
                <span className="font-mono text-xs text-mute">
                  ({q.points} pts)
                </span>
              </p>
              {q.kind === "multiple_choice" ? (
                <select
                  className={inputClass}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                >
                  <option value="">Choose</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <textarea
                  rows={q.kind === "long_text" ? 6 : 3}
                  className={textareaClass}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              )}
            </li>
          ))}
        </ol>
      ) : null}

      {needsUpload ? (
        <div className="space-y-2">
          <p className="text-sm text-mute">
            Upload your OA file (PDF), or leave blank to reuse your resume.
          </p>
          <ResumeUpload name="oaUploadPublicId" />
        </div>
      ) : null}

      <Button
        type="button"
        variant="ember"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const hidden = document.querySelector<HTMLInputElement>(
              'input[name="oaUploadPublicId"]',
            );
            const payload = questions.map((q) => ({
              questionId: q.id,
              response: answers[q.id] ?? "",
            }));
            const result = await submitOaAttempt(
              attemptId,
              JSON.stringify(payload),
              hidden?.value || undefined,
            );
            setMessage(result.ok ? "Submitted." : result.error);
          })
        }
      >
        {pending ? "Submitting…" : "Submit OA"}
      </Button>
      {message ? <p className="text-sm text-mute">{message}</p> : null}
    </div>
  );
}
