import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Work",
  description: "Student projects from DataBiz members at NIT Bhopal.",
};

export default function WorkPage() {
  const projects = getPublishedProjects();

  return (
    <>
      <PageHero
        index="03"
        label="Work"
        title="Questions turned into shipped work."
        description="Projects built by members — each one with its question, its method, and its links."
      />
      <section className="py-16 sm:py-20">
        <Container>
          {projects.length === 0 ? (
            <EmptyState
              label="Nothing published yet"
              title="Projects will appear once the core publishes them."
              body="We only list work members have actually shipped. In the meantime, the learning pathways are the best place to start building."
              action={{ href: "/learn", label: "Open learning pathways" }}
            />
          ) : (
            <ol className="divide-y divide-line border-y border-line">
              {projects.map((project, i) => (
                <li key={project.slug}>
                  <Reveal y={10} delay={0.03 * i}>
                    <Link
                      href={`/work/${project.slug}`}
                      className="group grid gap-3 py-8 transition-colors hover:bg-paper-elevated/80 sm:grid-cols-[5rem_1fr_auto] sm:gap-8 sm:px-2"
                    >
                      <span className="font-mono text-sm text-signal">
                        {project.year}
                      </span>
                      <div>
                        <h2 className="font-display text-3xl font-bold tracking-tight group-hover:text-signal">
                          {project.title}
                        </h2>
                        <p className="mt-2 max-w-2xl leading-relaxed text-steel">
                          {project.summary}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={20}
                        aria-hidden
                        className="text-ink/40 group-hover:text-signal"
                      />
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
