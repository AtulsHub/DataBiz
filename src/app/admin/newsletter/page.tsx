import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { NewsletterSendForm } from "@/components/admin/NewsletterSendForm";
import { NewsletterDraftsPanel } from "@/components/admin/NewsletterDraftsPanel";
import { EventRemindersPanel } from "@/components/admin/EventRemindersPanel";
import {
  countConfirmedSubscribers,
  isNewsletterDbReady,
  listEventsDueForReminder,
  listNewsletterSends,
  listPendingNewsletterDrafts,
} from "@/lib/newsletter";
import { canAccessAdmin } from "@/lib/roles";
import { requireDesk } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";
import { appBaseUrl } from "@/lib/app-url";

export const metadata: Metadata = { title: "Admin · Newsletter" };

type Props = {
  searchParams: Promise<{
    source?: string;
    id?: string;
    subject?: string;
    body?: string;
  }>;
};

export default async function AdminNewsletterPage({ searchParams }: Props) {
  const session = await requireDesk();
  const isAdmin = canAccessAdmin(session.user.role);
  const params = await searchParams;
  const dbReady = isNewsletterDbReady();
  const confirmedCount = dbReady ? await countConfirmedSubscribers() : 0;
  const sends = dbReady && isAdmin ? await listNewsletterSends(15) : [];
  const drafts = dbReady && isAdmin ? await listPendingNewsletterDrafts() : [];
  const due = dbReady && isAdmin ? await listEventsDueForReminder() : [];

  const sourceType = params.source?.trim() || undefined;
  const sourceId = params.id?.trim() || undefined;
  const defaultSubject =
    params.subject?.trim() ||
    (sourceType === "event"
      ? "New DataBiz event"
      : sourceType === "post"
        ? "New from the DataBiz blog"
        : sourceType === "drive"
          ? "DataBiz recruiting is open"
          : "");
  const defaultBody =
    params.body?.trim() ||
    (sourceType && sourceId
      ? `Something new is live on DataBiz.\n\n${appBaseUrl()}/${
          sourceType === "event"
            ? "events"
            : sourceType === "post"
              ? "blog"
              : sourceType === "drive"
                ? "join"
                : ""
        }`
      : "");

  return (
    <Container className="space-y-14 py-10 sm:py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Newsletter
        </h1>
        <p className="mt-2 max-w-2xl text-mute">
          {isAdmin
            ? "Compose and send to confirmed subscribers, or approve drafts from members."
            : "Compose a draft. An admin reviews and sends the final mail."}
        </p>
      </div>

      {!dbReady ? (
        <p className="border border-line bg-paper-elevated px-4 py-3 text-sm text-mute">
          Connect Neon to manage the list. Run{" "}
          <span className="font-mono">pnpm db:push</span> after pulling schema
          changes.
        </p>
      ) : (
        <>
          <section className="max-w-3xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Compose
            </h2>
            <div className="mt-6">
              <NewsletterSendForm
                confirmedCount={confirmedCount}
                defaultSubject={defaultSubject}
                defaultBody={defaultBody}
                sourceType={sourceType}
                sourceId={sourceId}
              />
            </div>
          </section>

          {isAdmin ? (
            <>
              <section>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Pending member drafts
                </h2>
                <NewsletterDraftsPanel drafts={drafts} />
              </section>

              <EventRemindersPanel
                due={due.map((event) => ({
                  id: event.id,
                  title: event.title,
                  slug: event.slug,
                  startsAt: event.startsAt.toISOString(),
                }))}
              />

              <section>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Recent sends
                </h2>
                {sends.length === 0 ? (
                  <p className="mt-4 text-sm text-mute">No sends logged yet.</p>
                ) : (
                  <ul className="mt-6 divide-y divide-line border-y border-line">
                    {sends.map((send) => (
                      <li
                        key={send.id}
                        className="grid gap-1 py-4 sm:grid-cols-[1fr_8rem_10rem]"
                      >
                        <div>
                          <p className="font-medium text-ink">{send.subject}</p>
                          <p className="mt-1 font-mono text-xs text-mute">
                            {send.sourceType
                              ? `${send.sourceType}${send.sourceId ? ` · ${send.sourceId.slice(0, 8)}` : ""}`
                              : "manual"}{" "}
                            · {send.status}
                          </p>
                        </div>
                        <p className="font-mono text-xs text-mute">
                          {send.recipientCount} sent
                        </p>
                        <p className="text-sm text-mute">
                          {formatDateTime(send.sentAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </>
      )}
    </Container>
  );
}
