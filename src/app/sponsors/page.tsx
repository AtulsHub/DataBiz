import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { sponsorsCopy } from "@/content/pages";
import { site } from "@/content/site";
import {
  getBrochureDownloadUrl,
  listSponsors,
} from "@/lib/sponsors";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Sponsors",
  description: sponsorsCopy.body,
};

async function SponsorsBody() {
  await connection();
  const sponsors = await listSponsors();
  const brochureUrl = await getBrochureDownloadUrl();

  return (
    <>
      <section className="border-b border-line py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <DeskLabel index="01">Supporters</DeskLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance">
              Organizations backing the work.
            </h2>
          </Reveal>
          {sponsors.length === 0 ? (
            <EmptyState
              label="Sponsors"
              title="No sponsors are listed yet."
              body="We only show a logo once the organization has agreed to it. This space stays empty until then."
            />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {sponsors.map((sponsor) => (
                <li key={sponsor.id} className="border border-line bg-paper-elevated p-5">
                  {sponsor.logoUrl ? (
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      width={240}
                      height={80}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <p className="font-display text-xl font-semibold">{sponsor.name}</p>
                  )}
                  {sponsor.blurb ? (
                    <p className="mt-3 text-sm text-steel">{sponsor.blurb}</p>
                  ) : null}
                  {sponsor.url ? (
                    <a
                      href={sponsor.url}
                      className="mt-3 inline-block text-sm text-ember hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-void py-16 text-on-void sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <DeskLabel index="02" tone="inverse">
              Start a conversation
            </DeskLabel>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
              Write to the core.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-on-void-soft">
              Tell us what you&apos;d like to support — a session, a fest, or the
              society&apos;s year-round work — and we&apos;ll reply with options.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                href={`mailto:${site.email}?subject=Sponsorship`}
                variant="spark"
                size="md"
              >
                {site.email}
              </Button>
              <Button href="/contact" variant="inverse" size="md">
                Contact form
              </Button>
              {site.socials.linkedin ? (
                <Button href={site.socials.linkedin} external variant="inverse" size="md">
                  LinkedIn
                </Button>
              ) : null}
              {site.socials.instagram ? (
                <Button href={site.socials.instagram} external variant="inverse" size="md">
                  Instagram
                </Button>
              ) : null}
            </div>
          </div>

          <div className="self-end border border-on-void-line bg-void-soft/40 p-6">
            <DeskLabel tone="inverse">Brochure</DeskLabel>
            <p className="mt-3 leading-relaxed text-on-void-soft">
              {brochureUrl
                ? "Download the sponsorship brochure as a PDF."
                : "The sponsorship brochure hasn't been published yet. Email the core and we'll send it directly."}
            </p>
            {brochureUrl ? (
              <Button
                href={brochureUrl}
                external
                variant="inverse"
                size="md"
                className="mt-5"
              >
                Download brochure
              </Button>
            ) : (
              <Button
                href={`mailto:${site.email}?subject=Sponsorship%20brochure`}
                variant="inverse"
                size="md"
                className="mt-5"
              >
                Request the brochure
              </Button>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

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
      <Suspense fallback={<PageLoader label="Loading sponsors…" />}>
        <SponsorsBody />
      </Suspense>
    </>
  );
}
