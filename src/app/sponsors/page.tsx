import type { Metadata } from "next";
import { sponsorsCopy } from "@/content/pages";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Sponsors",
  description: sponsorsCopy.body,
};

export default function SponsorsPage() {
  return (
    <>
      <PageHero
        index="11"
        label="Sponsors"
        title={sponsorsCopy.headline}
        description={sponsorsCopy.body}
        align="split"
      />

      <section className="border-b border-line py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <DeskLabel index="01">Supporters</DeskLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance">
              Organizations backing the work.
            </h2>
          </Reveal>
          <EmptyState
            label="Logos pending"
            title="No sponsors are listed yet."
            body="We only show a logo once the organization has agreed to it. This space stays empty until then."
          />
        </Container>
      </section>

      <section className="bg-panel py-16 text-white sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <DeskLabel index="02" tone="inverse">
              Start a conversation
            </DeskLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
              Write to the core.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/70">
              Tell us what you&apos;d like to support — a session, a fest, or the society&apos;s year-round work — and
              we&apos;ll reply with options.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={`mailto:${site.email}?subject=Sponsorship`} variant="spark" size="md">
                {site.email}
              </Button>
              <Button href="/contact" variant="inverse" size="md">
                Contact form
              </Button>
            </div>
          </div>

          <div className="self-end border border-white/15 p-6">
            <DeskLabel tone="inverse">Brochure</DeskLabel>
            <p className="mt-3 leading-relaxed text-white/70">
              The sponsorship brochure hasn&apos;t been published yet. Email the core and we&apos;ll send it directly.
            </p>
            <Button
              type="button"
              variant="inverse"
              size="md"
              disabled
              aria-disabled="true"
              className="mt-5 cursor-not-allowed opacity-50 hover:bg-paper-elevated"
            >
              Brochure PDF — coming soon
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
