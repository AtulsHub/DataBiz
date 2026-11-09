import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PostEditorForm } from "@/components/admin/PostEditorForm";
import { isPostsDbReady } from "@/lib/posts";

export const metadata: Metadata = { title: "Admin · New post" };

export default function AdminNewPostPage() {
  if (!isPostsDbReady()) redirect("/admin/posts");

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        New post
      </h1>
      <div className="mt-10 max-w-3xl">
        <PostEditorForm />
      </div>
    </Container>
  );
}
