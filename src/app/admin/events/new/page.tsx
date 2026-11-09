import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EventEditorForm } from "@/components/admin/EventEditorForm";
import { isEventsDbReady } from "@/lib/events";

export const metadata: Metadata = { title: "Admin · New event" };

export default function AdminNewEventPage() {
  if (!isEventsDbReady()) {
    redirect("/admin/events");
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        New event
      </h1>
      <p className="mt-2 max-w-xl text-mute">
        Save as draft first, then publish when the public page should open.
      </p>
      <div className="mt-10 max-w-3xl">
        <EventEditorForm />
      </div>
    </Container>
  );
}
