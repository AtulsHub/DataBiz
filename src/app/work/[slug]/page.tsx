import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getProject, getPublishedProjects } from "@/content/projects";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { Markdown } from "@/components/ui/Markdown";
import { PageHero } from "@/components/ui/PageHero";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const params = getPublishedProjects().map((p) => ({ slug: p.slug }));
  // Cache Components requires at least one param; this placeholder resolves to notFound().
  return params.length > 0 ? params : [{ slug: "no-projects" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <PageHero
        index={String(project.year)}
        label="Project"
        title={project.title}
        description={project.summary}
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <article>
            <Markdown content={project.body} />
          </article>
          <aside aria-label="Project links" className="lg:border-l lg:border-line lg:pl-8">
            <DeskLabel>Links</DeskLabel>
            {project.links.length === 0 ? (
              <p className="mt-3 text-sm text-steel">No public links yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {project.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 font-medium text-signal hover:underline"
                    >
                      {link.label}
                      <ArrowUpRight size={16} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10">
              <Button href="/work" variant="ghost" size="sm">
                All projects
              </Button>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
