"use client";

import { useActionState } from "react";
import { saveBrochureSetting } from "@/app/actions/sponsors";
import type { ActionResult } from "@/app/actions/events";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";

const initial: ActionResult = { ok: false };

export function BrochureSettingForm({
  defaultPublicId,
}: {
  defaultPublicId: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveBrochureSetting,
    initial,
  );

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-signal-deep" role="status">
          Brochure setting saved.
        </p>
      ) : null}
      <Field id="brochurePublicId" label="Brochure public id or URL">
        <input
          id="brochurePublicId"
          name="brochurePublicId"
          defaultValue={defaultPublicId}
          className={inputClass}
          placeholder="sponsors/databiz-brochure.pdf"
        />
      </Field>
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save brochure"}
      </Button>
    </form>
  );
}
