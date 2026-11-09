import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function HomeContactStrip() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="grid gap-10 border-t border-line pt-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
              Write the core.
            </h2>
            <p className="mt-3 max-w-md text-mute leading-relaxed">
              Questions about events, joining, or partnership — we read every note.
            </p>
          </div>
          <div className="space-y-5">
            <div>
              <p className="eyebrow">Email</p>
              <a
                href={`mailto:${site.email}`}
                className="mt-1 block text-lg font-medium text-ember hover:underline"
              >
                {site.email}
              </a>
            </div>
            <div>
              <p className="eyebrow">Campus</p>
              <p className="mt-1 text-ink-soft">{site.college}</p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button href="/contact" variant="primary" size="sm">
                Contact form
              </Button>
              <Button href={site.socials.linkedin} external variant="ghost" size="sm">
                LinkedIn
              </Button>
              <Button href={site.socials.instagram} external variant="ghost" size="sm">
                Instagram
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
