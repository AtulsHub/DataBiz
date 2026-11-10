import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function HomeSponsorsApproach() {
  return (
    <section className="border-b border-line bg-void py-16 text-on-void sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
          <Reveal>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ember">
              Sponsors
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Partner with students who turn data into stories.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-on-void-soft">
              Support a workshop, a fest, or the society&apos;s year-round work.
              Download the brochure, then write to the core — we reply with
              options that fit your goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={site.brochureUrl} external variant="spark" size="md">
                Download brochure
              </Button>
              <Button
                href={`mailto:${site.email}?subject=${encodeURIComponent("Sponsorship inquiry — DataBiz")}`}
                variant="inverse"
                size="md"
              >
                Email {site.email}
              </Button>
              <Button href="/sponsors" variant="link" className="gap-1 text-on-void">
                Sponsor page <ArrowUpRight size={16} />
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="border border-on-void-line bg-void-soft/40 p-6 sm:p-7">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-on-void-mute">
                How to approach
              </p>
              <ol className="mt-5 space-y-4 text-sm leading-relaxed text-on-void-soft">
                <li>
                  <span className="font-mono text-ember">01</span>
                  <span className="ml-3">
                    Read the brochure for formats and timelines.
                  </span>
                </li>
                <li>
                  <span className="font-mono text-ember">02</span>
                  <span className="ml-3">
                    Mail the core with what you want to support.
                  </span>
                </li>
                <li>
                  <span className="font-mono text-ember">03</span>
                  <span className="ml-3">
                    Or use the contact form and mark the topic as sponsorship.
                  </span>
                </li>
              </ol>
              <div className="mt-6">
                <Button href="/contact" variant="inverse" size="sm">
                  Contact form
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
