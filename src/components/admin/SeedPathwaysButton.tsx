"use client";

import { useState, useTransition } from "react";
import { seedPathwaysAction } from "@/app/actions/pathways";
import { Button } from "@/components/ui/Button";

export function SeedPathwaysButton() {
  const [message, setMessage] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          setMessage(undefined);
          startTransition(async () => {
            const result = await seedPathwaysAction();
            if (!result.ok) {
              setMessage(result.error || "Seed failed.");
              return;
            }
            setMessage(result.error || "Starter pathways are in the database.");
          });
        }}
      >
        {pending ? "Seeding…" : "Seed starters"}
      </Button>
      {message ? <p className="text-xs text-mute">{message}</p> : null}
    </div>
  );
}
