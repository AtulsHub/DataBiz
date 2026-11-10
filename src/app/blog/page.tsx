import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { formatDate, readingTime } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from DataBiz members on data, ML, and AI.",
};

async function BlogContent() {
  await connection();
  const posts = await getPublishedPosts();

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
            <ul className="grid gap-8 sm:gap-10">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <Reveal y={12} delay={0.03 * Math.min(i, 8)}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid overflow-hidden border border-line bg-paper-elevated transition-[border-color,transform] duration-300 hover:border-ink sm:grid-cols-[minmax(0,16rem)_1fr]"
                    >
                      <div className="relative aspect-[16/11] bg-panel sm:aspect-auto sm:min-h-[12rem]">
                        {post.coverUrl ? (
                          <Image
                            src={post.coverUrl}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 16rem, 100vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div
                            aria-hidden
                            className="absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--ember)_22%,transparent),transparent_55%),var(--panel)]"
                          />
                        )}
                      </div>
                      <div className="flex flex-col justify-center p-5 sm:p-7">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">
                          {formatDate(post.publishedAt)} ·{" "}
                          {readingTime(post.body)} min · {post.author}
                        </p>
                        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink transition-colors group-hover:text-ember sm:text-3xl text-balance">
                          {post.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute sm:text-lg">
                          {post.excerpt}
                        </p>
                        {post.tags.length > 0 ? (
                          <ul
                            className="mt-4 flex flex-wrap gap-2"
                            aria-label="Tags"
                          >
                            {post.tags.map((tag) => (
                              <li
                                key={tag}
                                className="rounded-sm border border-line px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        ) : null}
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

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <PageHero index="05" label="Blog" title="Loading posts…" />
      }
    >
      <BlogContent />
    </Suspense>
  );
}
