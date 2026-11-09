import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isEventsDbReady, listAdminEvents } from "@/lib/events";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Events" };

export default async function AdminEventsPage() {
  const dbReady = isEventsDbReady();
  const events = dbReady ? await listAdminEvents() : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Events
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Draft, publish, take RSVPs, mark past, and write the recap on the same URL.
          </p>
        </div>
        {dbReady ? (
          <Button href="/admin/events/new" variant="ember">
            New event
          </Button>
        ) : null}
      </div>

      {!dbReady ? (
        <p className="mt-8 border border-line bg-paper-elevated px-4 py-3 text-sm text-mute">
          Connect Neon (`DATABASE_URL`) and run `pnpm db:push` to manage events
          here. Public `/events` stays empty until Neon is connected and you publish.
        </p>
      ) : events.length === 0 ? (
        <p className="mt-8 text-sm text-mute">
          No events in the database yet. Create one to publish a public slug.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/admin/events/${event.id}`}
                className="grid gap-1 py-5 transition-colors hover:bg-paper-elevated sm:grid-cols-[1fr_8rem_10rem] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-medium text-ink">{event.title}</p>
                  <p className="mt-1 font-mono text-xs text-mute">
                    /events/{event.slug}
                  </p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                  {event.status}
                </p>
                <p className="text-sm text-mute">
                  {formatDateTime(event.startsAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
