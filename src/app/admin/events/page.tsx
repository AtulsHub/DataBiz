import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Admin · Events" };

export default function AdminEventsPage() {
  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Events</h1>
      <p className="mt-3 max-w-xl text-mute">
        Create, publish, RSVP, and mark past — coming in the events milestone.
      </p>
    </Container>
  );
}
