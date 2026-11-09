import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EpisodeEditorForm } from "@/components/admin/EpisodeEditorForm";
import {
  getAdminEpisode,
  isEpisodesDbReady,
  listEventsForEpisodeLink,
} from "@/lib/episodes";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const episode = await getAdminEpisode(id);
  return { title: episode ? `Admin · ${episode.title}` : "Admin · Episode" };
}

export default async function AdminEpisodeDetailPage({ params }: Props) {
  if (!isEpisodesDbReady()) redirect("/admin/show");
  const { id } = await params;
  const episode = await getAdminEpisode(id);
  if (!episode?.id) notFound();
  const events = await listEventsForEpisodeLink();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {episode.title}
      </h1>
      <p className="mt-2 font-mono text-xs text-mute">
        /show/{episode.slug} · {episode.status}
      </p>
      <div className="mt-10 max-w-3xl">
        <EpisodeEditorForm episode={episode} events={events} />
      </div>
    </Container>
  );
}
