import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { getPublishedAlumni } from "@/lib/alumni";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { AlumniUpdateForm } from "@/components/forms/AlumniUpdateForm";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Where DataBiz members go after NIT Bhopal.",
};

async function AlumniList() {
  await connection();
  const alumni = await getPublishedAlumni();

  if (alumni.length === 0) {
    return (
      <EmptyState
        label="Alumni"
        title="No alumni profiles are published yet."
        body="Profiles appear after an alumnus sends an update and the core approves it. If that's you, the form below is the way in."
      />
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {alumni.map((a, i) => (
        <li key={a.slug}>
          <Reveal
            y={12}
            delay={0.04 * i}
            className="surface-card surface-card-hover flex h-full flex-col overflow-hidden rounded-[var(--radius)]"
          >
            <div className="relative aspect-[4/3] w-full bg-panel">
              {a.photoUrl ? (
                <Image
                  src={a.photoUrl}
                  alt={`Portrait of ${a.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex h-full w-full flex-col items-center justify-center gap-2"
                >
                  <span className="font-mono text-sm text-ember">{a.batch}</span>
                  <span className="font-display text-4xl font-bold text-ink-soft">
                    {a.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-mute">
                Batch {a.batch}
                {a.branch ? ` · ${a.branch}` : ""}
              </p>
              <h2 className="font-display text-xl font-bold tracking-tight">
                {a.name}
              </h2>
              {a.societyRole ? (
                <p className="text-sm text-ember">{a.societyRole}</p>
              ) : null}
              <p className="text-sm font-medium text-ink">
                {[a.currentTitle, a.organization].filter(Boolean).join(", ")}
              </p>
              {a.note ? (
                <p className="mt-1 text-sm leading-relaxed text-mute">{a.note}</p>
              ) : null}
              {a.linkedinUrl ? (
                <a
                  href={a.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-ember hover:underline"
                >
                  LinkedIn <ArrowUpRight size={14} aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export default function AlumniPage() {
  return (
    <>
      <PageHero
        index="09"
        label="Alumni"
        title="Where the data took them."
        description="Former members who have shared an update. Nothing is listed without their say-so."
      />

      <section className="border-b border-line py-16 sm:py-20">
        <Container>
          <Suspense
            fallback={
              <p className="text-sm text-mute">Loading alumni directory…</p>
            }
          >
            <AlumniList />
          </Suspense>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <DeskLabel index="Update">Alumni, check in</DeskLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Tell us where you are now.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-mute">
              Share your batch, role, photo, and what you&apos;re working on. The
              core reviews every update before it is published, and you can ask
              to be removed at any time.
            </p>
          </div>
          <div className="surface-card rounded-[var(--radius)] p-6 sm:p-8">
            <AlumniUpdateForm />
          </div>
        </Container>
      </section>
    </>
  );
}
