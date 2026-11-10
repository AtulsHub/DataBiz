import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EventEditorForm } from "@/components/admin/EventEditorForm";
import { EventRegistrationsTable } from "@/components/admin/EventRegistrationsTable";
import { EventReminderButton } from "@/components/admin/EventReminderButton";
import { EventPhotosForm } from "@/components/admin/EventPhotosForm";
import {
  getAdminEvent,
  isEventsDbReady,
  listEventRegistrations,
} from "@/lib/events";
import { listEventPhotos } from "@/lib/event-photos";
import { getDb } from "@/db";
import { events as eventsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getAdminEvent(id);
  return { title: event ? `Admin · ${event.title}` : "Admin · Event" };
}

export default async function AdminEventDetailPage({ params }: Props) {
  if (!isEventsDbReady()) {
    redirect("/admin/events");
  }

  const { id } = await params;
  const event = await getAdminEvent(id);
  if (!event?.id) notFound();

  const registrations = await listEventRegistrations(event.id);
  const photos = await listEventPhotos(event.id);
  const db = getDb();
  const [eventRow] = db
    ? await db
        .select({ reminderSentAt: eventsTable.reminderSentAt })
        .from(eventsTable)
        .where(eq(eventsTable.id, event.id))
        .limit(1)
    : [undefined];

  const mailHref = `/admin/newsletter?source=event&id=${encodeURIComponent(event.id)}&subject=${encodeURIComponent(`Event · ${event.title}`)}&body=${encodeURIComponent(`${event.title}\n\n${event.summary}\n\nhttps://www.databiz.in/events/${event.slug}`)}`;

  return (
    <Container className="space-y-14 py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {event.title}
        </h1>
        <p className="mt-2 font-mono text-xs text-mute">
          /events/{event.slug} · {event.status}
        </p>
        {event.status === "published" ? (
          <p className="mt-4 text-sm text-mute">
            <Link href={mailHref} className="text-ember hover:underline">
              Mail confirmed subscribers about this event
            </Link>
          </p>
        ) : null}
        <div className="mt-10 max-w-3xl">
          <EventEditorForm event={event} />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Reminder
        </h2>
        <p className="text-sm text-mute">
          Manual day-before mail to registrants (no cron).
        </p>
        <EventReminderButton
          eventId={event.id}
          alreadySent={Boolean(eventRow?.reminderSentAt)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Gallery
        </h2>
        <p className="text-sm text-mute">
          Photos appear on the public event page after the event is past.
        </p>
        <EventPhotosForm eventId={event.id} photos={photos} />
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              RSVPs
            </h2>
            <p className="mt-2 text-sm text-mute">
              {registrations.filter((r) => r.status === "registered").length}{" "}
              registered ·{" "}
              {registrations.filter((r) => r.status === "attended").length}{" "}
              attended
            </p>
          </div>
          <Link
            href={`/admin/events/${event.id}/check-in`}
            className="text-sm font-medium text-ember hover:underline"
          >
            Open door check-in
          </Link>
        </div>
        <div className="mt-6">
          <EventRegistrationsTable registrations={registrations} />
        </div>
      </section>
    </Container>
  );
}
