import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EventEditorForm } from "@/components/admin/EventEditorForm";
import { EventRegistrationsTable } from "@/components/admin/EventRegistrationsTable";
import {
  getAdminEvent,
  isEventsDbReady,
  listEventRegistrations,
} from "@/lib/events";

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

  return (
    <Container className="space-y-14 py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {event.title}
        </h1>
        <p className="mt-2 font-mono text-xs text-mute">
          /events/{event.slug} · {event.status}
        </p>
        <div className="mt-10 max-w-3xl">
          <EventEditorForm event={event} />
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          RSVPs
        </h2>
        <p className="mt-2 text-sm text-mute">
          {registrations.filter((r) => r.status === "registered").length}{" "}
          registered ·{" "}
          {registrations.filter((r) => r.status === "attended").length} attended
        </p>
        <div className="mt-6">
          <EventRegistrationsTable registrations={registrations} />
        </div>
      </section>
    </Container>
  );
}
