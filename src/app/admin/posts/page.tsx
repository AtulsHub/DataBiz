import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Admin · Posts" };

export default function AdminPostsPage() {
  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Posts</h1>
      <p className="mt-3 max-w-xl text-mute">
        Blog editor and publish flow lands after the events CMS.
      </p>
    </Container>
  );
}
