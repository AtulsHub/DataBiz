import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { AnnouncementEditorForm } from "@/components/admin/AnnouncementEditorForm";
import { isAnnouncementsDbReady } from "@/lib/announcements";
import { listAdminEvents } from "@/lib/events";
import { listAdminPosts } from "@/lib/posts";
import { listAdminDrives } from "@/lib/drives";
import { listAdminEpisodes } from "@/lib/episodes";

export const metadata: Metadata = { title: "Admin · New announcement" };

export default async function AdminNewAnnouncementPage() {
  if (!isAnnouncementsDbReady()) redirect("/admin/announcements");
  const [events, posts, drives, episodes] = await Promise.all([
    listAdminEvents(),
    listAdminPosts(),
    listAdminDrives(),
    listAdminEpisodes(),
  ]);

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        New announcement
      </h1>
      <div className="mt-10 max-w-3xl">
        <AnnouncementEditorForm
          events={events.filter((e) => e.id).map((e) => ({ id: e.id!, label: e.title }))}
          posts={posts.filter((p) => p.id).map((p) => ({ id: p.id!, label: p.title }))}
          drives={drives.map((d) => ({ id: d.id, label: d.title }))}
          episodes={episodes
            .filter((e) => e.id)
            .map((e) => ({ id: e.id!, label: e.title }))}
        />
      </div>
    </Container>
  );
}
