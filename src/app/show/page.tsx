import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedEpisodes } from "@/content/episodes";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "The DataBrew Show",
  description: "Conversations with practitioners on data, careers, and impact.",
};

export default function ShowPage() {
  const episodes = getPublishedEpisodes();

  return (
    <>
      <PageHero
        index="06"
        label="The DataBrew Show"
        title="Long conversations over strong coffee."
        description="Practitioners talk about the work behind the résumé — and how they got there."
      />
      <section className="py-16 sm:py-20">
        <Container>
          {episodes.length === 0 ? (
            <EmptyState
              label="No episodes"
              title="Episodes will be listed here."
              body="Recordings appear after each DataBrew session."
              action={{ href: "/events", label: "See events" }}
            />
          ) : (
            <ol className="divide-y divide-line border-y border-line">
              {episodes.map((ep, i) => (
                <li key={ep.slug}>
                  <Reveal y={10} delay={0.03 * i}>
                    <Link
                      href={`/show/${ep.slug}`}
                      className="group grid gap-5 py-8 transition-colors hover:bg-paper-elevated/80 md:grid-cols-[4rem_14rem_1fr] md:items-center md:gap-8 md:px-2"
                    >
                      <span className="font-mono text-sm text-signal">
                        EP{String(episodes.length - i).padStart(2, "0")}
                      </span>
                      {ep.coverUrl ? (
                        <Image
                          src={ep.coverUrl}
                          alt=""
                          width={448}
                          height={252}
                          sizes="14rem"
                          className="aspect-video w-full rounded-[var(--radius)] border border-line object-cover"
                        />
                      ) : (
                        <div aria-hidden className="aspect-video w-full rounded-[var(--radius)] bg-panel" />
                      )}
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                          <time dateTime={ep.publishedAt}>{formatDate(ep.publishedAt)}</time>
                          {ep.guests.length > 0
                            ? ` · ${ep.guests.map((g) => g.name).join(", ")}`
                            : ""}
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight group-hover:text-signal">
                          {ep.title}
                        </h2>
                        <p className="mt-2 max-w-2xl leading-relaxed text-steel">{ep.summary}</p>
                      </div>
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
