import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMyEventTicket } from "@/app/actions/account";
import { EventTicketCard } from "@/components/account/EventTicketCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Event ticket",
  description: "Your DataBiz virtual ID for door check-in.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventTicketPage({ params }: Props) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/account/tickets/${id}`)}`);
  }

  const ticket = await getMyEventTicket(id);
  if (!ticket) notFound();

  return (
    <section className="relative overflow-hidden py-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--ember)_14%,transparent),transparent_62%)]"
      />
      <Container className="relative max-w-3xl">
        <div className="mx-auto max-w-md text-center">
          <p className="eyebrow">Door pass</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your virtual ID
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mute sm:text-base">
            Your event pass hangs from a neck band — drag it, tilt it, flip it
            for a bigger QR at the door.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <EventTicketCard ticket={ticket} />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href={`/events/${ticket.event.slug}`} variant="ghost" size="md">
            Event page
          </Button>
          <Button href="/account" variant="link">
            Back to account
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-mute">
          Wrong account?{" "}
          <Link href="/login?next=/account" className="text-ember hover:underline">
            Sign in with the email you used to RSVP
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
