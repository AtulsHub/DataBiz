import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { aboutPage } from "@/content/pages";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: aboutPage.whoWeAre,
};

const elsewhere = [
  { href: "/learn", label: "Learn", note: "Pathways with sources the core trusts" },
  { href: "/events", label: "Events", note: "Workshops, talks, and hackathons" },
  { href: "/blog", label: "Blog", note: "Writing from members" },
  { href: "/team", label: "Team", note: "Who runs the society this year" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        index="01"
        label="About"
        title="A club for turning raw data into true stories."
        description={site.college}
        align="split"
      />

      {/* Who we are — editorial split */}
      <section className="border-b border-line py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <Reveal>
            <DeskLabel index="A">Who we are</DeskLabel>
            <p className="mt-4 font-mono text-xs uppercase leading-relaxed tracking-[0.14em] text-steel">
              {site.line}
              <br />
              {site.location}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="font-serif text-2xl leading-[1.5] text-ink sm:text-[1.7rem] text-balance">
              {aboutPage.whoWeAre}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Mission — dark panel */}
      <section className="bg-void py-16 text-on-void sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <DeskLabel index="B" tone="inverse">
            Mission
          </DeskLabel>
          <Reveal>
            <p className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] sm:text-5xl text-balance">
              {site.mission}
            </p>
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="How we work">
              {site.approach.map((item) => (
                <li
                  key={item}
                  className="rounded-[var(--radius)] border border-on-void-line px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ember"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* Values — numbered rows */}
      <section className="border-b border-line py-16 sm:py-24">
        <Container>
          <Reveal>
            <DeskLabel index="C">What we hold to</DeskLabel>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Four commitments behind every session.
            </h2>
          </Reveal>
          <ol className="mt-12 divide-y divide-line border-y border-line">
            {site.values.map((value, i) => (
              <li key={value.title}>
                <Reveal
                  delay={0.04 * i}
                  y={10}
                  className="grid gap-3 py-7 sm:grid-cols-[5rem_1fr_1.2fr] sm:gap-8"
                >
                  <span className="font-mono text-sm text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="leading-relaxed text-steel">{value.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Steps */}
      <section className="border-b border-line bg-paper-elevated py-16 sm:py-24">
        <Container>
          <Reveal>
            <DeskLabel index="D">How the year runs</DeskLabel>
          </Reveal>
          <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {aboutPage.steps.map((step, i) => (
              <Link
                key={step.title}
                href={step.href}
                className="group flex flex-col justify-between gap-10 bg-paper-elevated p-7 transition-colors hover:bg-signal-soft"
              >
                <div>
                  <span className="font-mono text-xs text-signal">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-steel">{step.body}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-ink/60 group-hover:text-signal">
                  Open <ArrowUpRight size={16} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Links */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <DeskLabel index="E">Keep exploring</DeskLabel>
          </Reveal>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {elsewhere.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-baseline justify-between gap-6 py-5 transition-colors hover:bg-paper-elevated/80 sm:px-2"
                >
                  <span className="font-display text-3xl font-bold tracking-tight group-hover:text-signal sm:text-4xl">
                    {item.label}
                  </span>
                  <span className="hidden text-steel sm:block">{item.note}</span>
                  <ArrowUpRight
                    size={20}
                    aria-hidden
                    className="shrink-0 text-ink/40 group-hover:text-signal"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
