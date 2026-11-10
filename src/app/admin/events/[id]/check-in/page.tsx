import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckInScanner } from "@/components/admin/CheckInScanner";
import { Container } from "@/components/ui/Container";
import { getAdminEvent, isEventsDbReady } from "@/lib/events";
import { requireDesk } from "@/lib/session";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getAdminEvent(id);
  return {
    title: event ? `Check-in · ${event.title}` : "Check-in",
  };
}

export default async function EventCheckInPage({ params }: Props) {
  await requireDesk();

  if (!isEventsDbReady()) {
    redirect("/admin/events");
  }

  const { id } = await params;
  const event = await getAdminEvent(id);
  if (!event?.id) notFound();

  return (
    <Container className="space-y-8 py-12">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mute">
          Door check-in
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          {event.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-mute">
          Scan each attendee&apos;s virtual ID. Successful scans mark the RSVP
          as attended.
        </p>
        <p className="mt-4 text-sm">
          <Link
            href={`/admin/events/${event.id}`}
            className="text-ember hover:underline"
          >
            Back to event admin
          </Link>
        </p>
      </div>

      <CheckInScanner eventId={event.id} eventTitle={event.title} />
    </Container>
  );
}
