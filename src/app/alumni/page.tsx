import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getPublishedAlumni } from "@/content/alumni";
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

export default function AlumniPage() {
  const alumni = getPublishedAlumni();

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
          {alumni.length === 0 ? (
            <EmptyState
              label="Directory pending"
              title="No alumni profiles are published yet."
              body="Profiles appear after an alumnus sends an update and the core approves it. If that's you, the form below is the way in."
            />
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {alumni.map((a, i) => (
                <li key={a.slug}>
                  <Reveal
                    y={10}
                    delay={0.03 * i}
                    className="grid gap-3 py-7 sm:grid-cols-[6rem_1fr_1fr] sm:gap-8"
                  >
                    <span className="font-mono text-sm text-signal">{a.batch}</span>
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight">{a.name}</h2>
                      <p className="mt-1 text-sm text-steel">
                        {a.branch} · {a.societyRole}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {a.currentTitle}, {a.organization}
                      </p>
                      {a.note ? <p className="mt-1 text-steel">{a.note}</p> : null}
                      {a.linkedinUrl ? (
                        <a
                          href={a.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-signal hover:underline"
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
          )}
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <DeskLabel index="Update">Alumni, check in</DeskLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Tell us where you are now.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-steel">
              Share your batch, role, and what you&apos;re working on. The core reviews every update before it is
              published, and you can ask to be removed at any time.
            </p>
          </div>
          <div className="border border-line bg-paper-elevated p-6 sm:p-8">
            <AlumniUpdateForm />
          </div>
        </Container>
      </section>
    </>
  );
}
