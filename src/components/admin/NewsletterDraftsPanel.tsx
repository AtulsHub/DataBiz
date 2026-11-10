"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  dismissNewsletterDraft,
  sendNewsletter,
} from "@/app/actions/newsletter";
import type { NewsletterDraftItem } from "@/lib/newsletter";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";

type Props = { drafts: NewsletterDraftItem[] };

export function NewsletterDraftsPanel({ drafts }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (drafts.length === 0) {
    return (
      <p className="mt-4 text-sm text-mute">No member drafts waiting.</p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {drafts.map((draft) => (
        <li key={draft.id} className="space-y-3 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-ink">{draft.subject}</p>
              <p className="mt-1 text-sm text-mute">
                From {draft.createdByEmail || "member"} ·{" "}
                {formatDateTime(draft.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ember"
                size="sm"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const fd = new FormData();
                    fd.set("subject", draft.subject);
                    fd.set("body", draft.body);
                    fd.set("draftId", draft.id);
                    if (draft.sourceType) fd.set("sourceType", draft.sourceType);
                    if (draft.sourceId) fd.set("sourceId", draft.sourceId);
                    await sendNewsletter(undefined, fd);
                    router.refresh();
                  });
                }}
              >
                Approve & send
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await dismissNewsletterDraft(draft.id);
                    router.refresh();
                  });
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap rounded-sm border border-line bg-paper px-3 py-3 text-sm text-ink-soft">
            {draft.body}
          </pre>
        </li>
      ))}
    </ul>
  );
}
