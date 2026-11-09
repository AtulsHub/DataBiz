import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Write to the ${site.name} core at ${site.college}.`,
};

export default function ContactPage() {
  const { socials } = site;

  return (
    <>
      <PageHero
        index="12"
        label="Contact"
        title="Write to the core."
        description="Questions, collaborations, sponsorships — a real person on the core reads every message."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="space-y-8">
            <div>
              <DeskLabel>Email</DeskLabel>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 inline-block font-display text-xl font-bold tracking-tight text-signal hover:underline sm:text-2xl"
              >
                {site.email}
              </a>
            </div>
            <div>
              <DeskLabel>Find us</DeskLabel>
              <p className="mt-2 leading-relaxed text-steel">{site.location}</p>
            </div>
            <div>
              <DeskLabel>Elsewhere</DeskLabel>
              <ul className="mt-2 space-y-1">
                <li>
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink hover:text-signal"
                  >
                    LinkedIn
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink hover:text-signal"
                  >
                    Instagram
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border border-line bg-paper-elevated p-6 sm:p-8">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
