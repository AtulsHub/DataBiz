import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import {
  canTrackPathwayProgress,
  getCompletedModuleIds,
  getPathwayBySlug,
  listStaticPathwayParams,
} from "@/lib/pathways";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ModuleProgressToggle } from "@/components/learn/ModuleProgressToggle";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listStaticPathwayParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pathway = await getPathwayBySlug(slug);
  if (!pathway) return { title: "Pathway not found" };
  return { title: pathway.title, description: pathway.summary };
}

async function PathwayContent({ slug }: { slug: string }) {
  await connection();
  const pathway = await getPathwayBySlug(slug);
  if (!pathway) notFound();

  const session = await getSession();
  const canTrack = canTrackPathwayProgress(session?.user.role);
  const completed = canTrack && session
    ? await getCompletedModuleIds(
        session.user.id,
        pathway.modules.map((m) => m.id),
      )
    : new Set<string>();

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
          {canTrack ? (
            <p className="mb-8 max-w-2xl text-sm text-mute">
              Mark modules complete as you finish them. Progress is private to
              you and to admins.
            </p>
          ) : (
            <p className="mb-8 max-w-2xl text-sm text-mute">
              Anyone can follow the links.{" "}
              {session ? (
                <>
                  Pathway progress unlocks when an admin promotes you to{" "}
                  <span className="font-medium text-ink">member</span>.
                </>
              ) : (
                <>
                  <a href="/login?next=/learn" className="text-ember hover:underline">
                    Sign in
                  </a>{" "}
                  as a member to track completion.
                </>
              )}
            </p>
          )}

          {pathway.modules.length === 0 ? (
            <EmptyState
              label="Modules"
              title="No modules yet."
              body="The core adds modules once each source has been checked."
            />
          ) : (
            <ol className="divide-y divide-line border-y border-line">
              {pathway.modules.map((mod, i) => {
                let hostname = "";
                try {
                  hostname = new URL(mod.url).hostname.replace(/^www\./, "");
                } catch {
                  hostname = mod.url;
                }

                return (
                  <li key={mod.id}>
                    <Reveal y={10} delay={0.03 * i}>
                      <div className="grid gap-4 py-7 sm:grid-cols-[5rem_1fr_auto] sm:items-start sm:gap-8 sm:px-2">
                        <span className="font-mono text-sm text-signal">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <a
                            href={mod.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-start gap-2"
                          >
                            <h2 className="font-display text-2xl font-bold tracking-tight group-hover:text-signal">
                              {mod.title}
                              <span className="sr-only"> (opens in a new tab)</span>
                            </h2>
                            <ArrowUpRight
                              size={18}
                              aria-hidden
                              className="mt-1 shrink-0 text-ink/40 group-hover:text-signal"
                            />
                          </a>
                          <p className="mt-1.5 max-w-2xl leading-relaxed text-steel">
                            {mod.description}
                          </p>
                          <p className="mt-2 font-mono text-[0.7rem] text-steel">
                            {hostname}
                          </p>
                        </div>
                        {canTrack ? (
                          <ModuleProgressToggle
                            moduleId={mod.id}
                            initialCompleted={completed.has(mod.id)}
                          />
                        ) : null}
                      </div>
                    </Reveal>
                  </li>
                );
              })}
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

export default async function PathwayPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <PageHero
          label="Pathway"
          title="Loading pathway…"
          description="Fetching modules."
        />
      }
    >
      <PathwayContent slug={slug} />
    </Suspense>
  );
}
