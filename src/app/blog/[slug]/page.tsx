import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPostBySlug, listStaticPostParams } from "@/lib/posts";
import { formatDate, readingTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Markdown } from "@/components/ui/Markdown";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listStaticPostParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Post not found" };
    return {
      title: post.title,
      description: post.excerpt,
      authors: [{ name: post.author }],
      openGraph: { type: "article", publishedTime: post.publishedAt },
    };
  } catch {
    return { title: "Blog" };
  }
}

async function PostContent({ params }: Props) {
  // Await params + mark request-time inside Suspense for instant shell.
  const { slug } = await params;
  await connection();

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTime(post.body);

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line">
        {post.coverUrl ? (
          <div className="absolute inset-0">
            <Image
              src={post.coverUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--void)_42%,transparent)_0%,color-mix(in_srgb,var(--void)_78%,transparent)_55%,var(--void)_100%)]"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--ember)_18%,transparent),transparent_50%),linear-gradient(180deg,var(--paper),var(--paper-elevated))]"
          />
        )}

        <Container
          width="narrow"
          className={`relative py-16 sm:py-24 ${post.coverUrl ? "text-on-void" : ""}`}
        >
          <p
            className={`font-mono text-[0.68rem] uppercase tracking-[0.18em] ${
              post.coverUrl ? "text-ember" : "text-mute"
            }`}
          >
            Blog · {formatDate(post.publishedAt)} · {minutes} min read
          </p>
          <h1
            className={`mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl ${
              post.coverUrl ? "text-on-void" : "text-ink"
            }`}
          >
            {post.title}
          </h1>
          {post.excerpt ? (
            <p
              className={`mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl ${
                post.coverUrl ? "text-on-void-soft" : "text-mute"
              }`}
            >
              {post.excerpt}
            </p>
          ) : null}
          <p
            className={`mt-8 font-mono text-xs uppercase tracking-[0.14em] ${
              post.coverUrl ? "text-on-void-mute" : "text-mute"
            }`}
          >
            By{" "}
            <span className={post.coverUrl ? "text-on-void" : "text-ink"}>
              {post.author}
            </span>
          </p>
        </Container>
      </header>

      <div className="py-12 sm:py-16">
        <Container width="narrow">
          <Markdown content={post.body} className="post-article" />

          {post.tags.length > 0 ? (
            <ul
              className="mt-14 flex flex-wrap gap-2 border-t border-line pt-7"
              aria-label="Tags"
            >
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm border border-line bg-paper-elevated px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8">
            <Button href="/blog" variant="ghost" size="sm">
              All posts
            </Button>
          </div>
        </Container>
      </div>
    </article>
  );
}

export default function PostPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <header className="border-b border-line py-16">
          <Container width="narrow">
            <p className="text-mute">Loading article…</p>
          </Container>
        </header>
      }
    >
      <PostContent params={params} />
    </Suspense>
  );
}
