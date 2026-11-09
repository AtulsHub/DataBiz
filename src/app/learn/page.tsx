import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { getPublishedPathways } from "@/lib/pathways";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Learn",
  description: "Learning pathways through data, ML, and AI with sources the core trusts.",
};

const disciplineLabel = {
  data: "Data",
  ml: "ML",
  ai: "AI",
  other: "Other",
} as const;

async function LearnContent() {
  await connection();
  const pathways = await getPublishedPathways();

  return (
    <>
      <PageHero
        index="07"
        label="Learn"
        title="Pick a pathway. Follow the modules."
        description="Each pathway links out to external sources the core trusts — nothing is rehosted, nothing is padded. Members can mark modules complete."
      />
      <section className="py-16 sm:py-20">
        <Container>
          {pathways.length === 0 ? (
            <EmptyState
              label="No pathways"
              title="Pathways are being drafted."
              body="The core publishes a pathway only after checking every module."
            />
          ) : (
            <ol className="space-y-6">
              {pathways.map((pathway, i) => (
                <li key={pathway.slug}>
                  <Reveal y={12} delay={0.04 * i}>
                    <Link
                      href={`/learn/${pathway.slug}`}
                      className="group grid gap-6 border border-line bg-paper-elevated p-7 transition-colors hover:border-signal md:grid-cols-[1fr_1.2fr] md:gap-12"
                    >
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal">
                          {String(i + 1).padStart(2, "0")} ·{" "}
                          {disciplineLabel[pathway.discipline]}
                        </p>
                        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight group-hover:text-signal">
                          {pathway.title}
                        </h2>
                        <p className="mt-3 leading-relaxed text-steel">
                          {pathway.summary}
                        </p>
                        <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink/60 group-hover:text-signal">
                          {pathway.modules.length} modules{" "}
                          <ArrowUpRight size={16} aria-hidden />
                        </span>
                      </div>
                      <ol className="divide-y divide-line self-center border-y border-line text-sm">
                        {pathway.modules.map((m, j) => (
                          <li key={m.id} className="flex gap-4 py-3">
                            <span className="font-mono text-steel">
                              {String(j + 1).padStart(2, "0")}
                            </span>
                            <span className="font-medium">{m.title}</span>
                          </li>
                        ))}
                      </ol>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </section>
    </>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <PageHero
          index="07"
          label="Learn"
          title="Pick a pathway. Follow the modules."
          description="Loading pathways…"
        />
      }
    >
      <LearnContent />
    </Suspense>
  );
}
