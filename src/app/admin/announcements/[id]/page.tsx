import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { AnnouncementEditorForm } from "@/components/admin/AnnouncementEditorForm";
import {
  getAdminAnnouncement,
  isAnnouncementsDbReady,
} from "@/lib/announcements";
import { listAdminEvents } from "@/lib/events";
import { listAdminPosts } from "@/lib/posts";
import { listAdminDrives } from "@/lib/drives";
import { listAdminEpisodes } from "@/lib/episodes";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getAdminAnnouncement(id);
  return { title: item ? `Admin · ${item.title}` : "Admin · Announcement" };
}

export default async function AdminAnnouncementDetailPage({ params }: Props) {
  if (!isAnnouncementsDbReady()) redirect("/admin/announcements");
  const { id } = await params;
  const item = await getAdminAnnouncement(id);
  if (!item) notFound();

  const [events, posts, drives, episodes] = await Promise.all([
    listAdminEvents(),
    listAdminPosts(),
    listAdminDrives(),
    listAdminEpisodes(),
  ]);

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {item.title}
      </h1>
      <div className="mt-10 max-w-3xl">
        <AnnouncementEditorForm
          announcement={item}
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
