import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getPathway, getPublishedPathways } from "@/content/pathways";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublishedPathways().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pathway = getPathway(slug);
  if (!pathway) return { title: "Pathway not found" };
  return { title: pathway.title, description: pathway.summary };
}

export default async function PathwayPage({ params }: Props) {
  const { slug } = await params;
  const pathway = getPathway(slug);
  if (!pathway) notFound();

  return (
    <>
      <PageHero
        index={pathway.discipline.toUpperCase()}
        label="Pathway"
        title={pathway.title}
        description={pathway.summary}
      />
      <section className="py-16 sm:py-20">
        <Container>
          {pathway.modules.length === 0 ? (
            <EmptyState
              label="Modules"
              title="No modules yet."
              body="The core adds modules once each source has been checked."
            />
          ) : (
            <ol className="divide-y divide-line border-y border-line">
              {pathway.modules.map((mod, i) => (
                <li key={mod.url}>
                  <Reveal y={10} delay={0.03 * i}>
                    <a
                      href={mod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid gap-3 py-7 transition-colors hover:bg-paper-elevated/80 sm:grid-cols-[5rem_1fr_auto] sm:gap-8 sm:px-2"
                    >
                      <span className="font-mono text-sm text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2 className="font-display text-2xl font-bold tracking-tight group-hover:text-signal">
                          {mod.title}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </h2>
                        <p className="mt-1.5 max-w-2xl leading-relaxed text-steel">{mod.description}</p>
                        <p className="mt-2 font-mono text-[0.7rem] text-steel">
                          {new URL(mod.url).hostname.replace(/^www\./, "")}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={20}
                        aria-hidden
                        className="text-ink/40 group-hover:text-signal"
                      />
                    </a>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-10">
            <Button href="/learn" variant="ghost" size="sm">
              All pathways
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
