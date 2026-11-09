import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PostEditorForm } from "@/components/admin/PostEditorForm";
import { getAdminPost, isPostsDbReady } from "@/lib/posts";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getAdminPost(id);
  return { title: post ? `Admin · ${post.title}` : "Admin · Post" };
}

export default async function AdminPostDetailPage({ params }: Props) {
  if (!isPostsDbReady()) redirect("/admin/posts");
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post?.id) notFound();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {post.title}
      </h1>
      <p className="mt-2 font-mono text-xs text-mute">
        /blog/{post.slug} · {post.status}
      </p>
      {post.status === "published" ? (
        <p className="mt-4 text-sm text-mute">
          <Link
            href={`/admin/newsletter?source=post&id=${encodeURIComponent(post.id)}&subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`${post.excerpt}\n\nhttps://www.databiz.in/blog/${post.slug}`)}`}
            className="text-ember hover:underline"
          >
            Mail confirmed subscribers about this post
          </Link>
        </p>
      ) : null}
      <div className="mt-10 max-w-3xl">
        <PostEditorForm post={post} />
      </div>
    </Container>
  );
}
