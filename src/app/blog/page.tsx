import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/content/posts";
import { formatDate, readingTime } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from DataBiz members on data, ML, and AI.",
};

export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <>
      <PageHero
        index="05"
        label="Blog"
        title="Notes from people who work with data."
        description="Long-form writing by members — read it slowly, check the references."
      />
      <section className="py-16 sm:py-20">
        <Container>
          {posts.length === 0 ? (
            <EmptyState
              label="No posts"
              title="The first post is on its way."
              body="Members' writing will be published here after core review."
            />
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <Reveal y={10} delay={0.03 * i}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid gap-4 py-9 transition-colors hover:bg-paper-elevated/80 lg:grid-cols-[12rem_1fr] lg:gap-10 lg:px-2"
                    >
                      <div className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                        <time dateTime={post.publishedAt} className="text-signal">
                          {formatDate(post.publishedAt)}
                        </time>
                        <p className="mt-1">{readingTime(post.body)} min read</p>
                        <p className="mt-1">By {post.author}</p>
                      </div>
                      <div>
                        <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight group-hover:text-signal sm:text-4xl text-balance">
                          {post.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-steel">
                          {post.excerpt}
                        </p>
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
                          {post.tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded-[var(--radius)] bg-signal-soft px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-signal-deep"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
