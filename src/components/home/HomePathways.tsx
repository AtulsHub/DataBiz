import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PathwayItem } from "@/lib/pathways";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const disciplineLabel = {
  data: "Data",
  ml: "ML",
  ai: "AI",
  other: "Other",
} as const;

export function HomePathways({ pathways }: { pathways: PathwayItem[] }) {
  if (pathways.length === 0) return null;

  return (
    <section className="border-b border-line py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">Learn</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
              Pathways, not a course platform.
            </h2>
            <p className="mt-4 max-w-sm text-mute leading-relaxed">
              Curated external readings and problem sets. Members can track
              modules once they sign in.
            </p>
            <Link
              href="/learn"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ember hover:underline"
            >
              Browse all <ArrowUpRight size={14} />
            </Link>
          </Reveal>

          <ol className="relative space-y-0 border-l border-line pl-8">
            {pathways.map((pathway, i) => (
              <Reveal key={pathway.slug} delay={0.05 * i}>
                <li className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[2.15rem] top-1.5 h-2.5 w-2.5 rounded-full bg-ember ring-4 ring-paper" />
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mute">
                    {disciplineLabel[pathway.discipline]}
                  </p>
                  <Link
                    href={`/learn/${pathway.slug}`}
                    className="mt-2 block font-display text-2xl font-semibold tracking-tight text-ink transition-colors hover:text-ember"
                  >
                    {pathway.title}
                  </Link>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-mute">
                    {pathway.summary}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
