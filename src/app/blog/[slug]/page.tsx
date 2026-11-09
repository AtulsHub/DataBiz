import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPostBySlug, listPublicPostSlugs } from "@/lib/posts";
import { formatDate, readingTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { Markdown } from "@/components/ui/Markdown";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listPublicPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: { type: "article", publishedTime: post.publishedAt },
  };
}

async function PostContent({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <header className="border-b border-line pt-12 pb-12 sm:pt-16">
        <Container width="narrow">
          <DeskLabel index="Blog">
            {formatDate(post.publishedAt)} · {readingTime(post.body)} min read
          </DeskLabel>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl text-balance">
            {post.title}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-steel">
            {post.excerpt}
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-steel">
            By <span className="text-ink">{post.author}</span>
          </p>
        </Container>
      </header>
      <article className="py-12 sm:py-16">
        <Container width="narrow">
          <Markdown content={post.body} />
          <ul
            className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6"
            aria-label="Tags"
          >
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[var(--radius)] bg-signal-soft px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-signal-deep"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button href="/blog" variant="ghost" size="sm">
              All posts
            </Button>
          </div>
        </Container>
      </article>
    </>
  );
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <header className="border-b border-line pt-12 pb-12">
          <Container width="narrow">
            <p className="text-mute">Loading article…</p>
          </Container>
        </header>
      }
    >
      <PostContent slug={slug} />
    </Suspense>
  );
}
