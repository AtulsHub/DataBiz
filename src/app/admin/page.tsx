import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { isDatabaseConfigured } from "@/db";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminHomePage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Semester desk
      </h1>
      <p className="mt-3 max-w-2xl text-mute leading-relaxed">
        Publish events, posts, pathways, and run drives from here. Content
        editors for each section ship next — this shell is gated to{" "}
        <span className="font-mono text-ember">admin</span> sessions only.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Database",
            value: isDatabaseConfigured() ? "Connected" : "Not configured",
          },
          {
            label: "Open drive",
            value: "—",
          },
          {
            label: "Upcoming events",
            value: "—",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="border border-line bg-paper-elevated px-5 py-6"
          >
            <p className="eyebrow">{card.label}</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
