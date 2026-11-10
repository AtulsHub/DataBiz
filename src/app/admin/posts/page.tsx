import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isPostsDbReady, listAdminPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Posts" };

export default async function AdminPostsPage() {
  const dbReady = isPostsDbReady();
  const posts = dbReady ? await listAdminPosts() : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Posts
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Draft and publish long-form writing on `/blog`.
          </p>
        </div>
        {dbReady ? (
          <Button href="/admin/posts/new" variant="ember">
            New post
          </Button>
        ) : null}
      </div>

      {!dbReady ? (
        <p className="mt-8 border border-line bg-paper-elevated px-4 py-3 text-sm text-mute">
          Connect Neon to manage posts. Public `/blog` stays empty until you publish.
        </p>
      ) : posts.length === 0 ? (
        <p className="mt-8 text-sm text-mute">No posts yet.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="grid gap-1 py-5 transition-colors hover:bg-paper-elevated sm:grid-cols-[1fr_8rem_10rem] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-medium text-ink">{post.title}</p>
                  <p className="mt-1 font-mono text-xs text-mute">
                    /blog/{post.slug}
                  </p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                  {post.status}
                </p>
                <p className="text-sm text-mute">
                  {formatDate(post.publishedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
