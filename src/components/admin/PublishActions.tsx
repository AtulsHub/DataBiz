"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useDesk } from "@/components/admin/DeskContext";

type Props = {
  pending: boolean;
  cancelHref?: string;
  publicHref?: string;
  /** Extra actions for admins (e.g. mark past). */
  adminExtras?: React.ReactNode;
  publishLabel?: string;
  draftLabel?: string;
};

/** Save / publish buttons that respect member vs admin desk permissions. */
export function PublishActions({
  pending,
  cancelHref,
  publicHref,
  adminExtras,
  publishLabel = "Publish",
  draftLabel = "Save draft",
}: Props) {
  const { canPublish } = useDesk();

  if (!canPublish) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            name="intent"
            value="draft"
            variant="ember"
            disabled={pending}
          >
            {pending ? "Saving…" : "Submit for approval"}
          </Button>
          {cancelHref ? (
            <Link href={cancelHref} className="text-sm text-mute hover:text-ink">
              Cancel
            </Link>
          ) : null}
        </div>
        <p className="text-sm text-mute">
          Members save drafts only. An admin publishes the final version.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="submit"
        name="intent"
        value="publish"
        variant="ember"
        disabled={pending}
      >
        {pending ? "Saving…" : publishLabel}
      </Button>
      <Button
        type="submit"
        name="intent"
        value="draft"
        variant="ghost"
        disabled={pending}
      >
        {pending ? "Saving…" : draftLabel}
      </Button>
      {adminExtras}
      {publicHref ? (
        <Button href={publicHref} variant="ghost">
          View public page
        </Button>
      ) : cancelHref ? (
        <Link href={cancelHref} className="text-sm text-mute hover:text-ink">
          Cancel
        </Link>
      ) : null}
    </div>
  );
}
