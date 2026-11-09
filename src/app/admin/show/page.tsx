import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isEpisodesDbReady, listAdminEpisodes } from "@/lib/episodes";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · DataBrew" };

export default async function AdminShowPage() {
  const dbReady = isEpisodesDbReady();
  const episodes = dbReady ? await listAdminEpisodes() : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            DataBrew
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Draft and publish interview episodes on `/show`. Link an episode to
            a past event when the recording ships.
          </p>
        </div>
        {dbReady ? (
          <Button href="/admin/show/new" variant="ember">
            New episode
          </Button>
        ) : null}
      </div>

      {!dbReady ? (
        <p className="mt-8 border border-line bg-paper-elevated px-4 py-3 text-sm text-mute">
          Connect Neon to manage episodes. Public `/show` stays empty until you
          publish.
        </p>
      ) : episodes.length === 0 ? (
        <p className="mt-8 text-sm text-mute">No episodes in the database yet.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {episodes.map((episode) => (
            <li key={episode.id}>
              <Link
                href={`/admin/show/${episode.id}`}
                className="grid gap-1 py-5 transition-colors hover:bg-paper-elevated sm:grid-cols-[1fr_8rem_10rem] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-medium text-ink">{episode.title}</p>
                  <p className="mt-1 font-mono text-xs text-mute">
                    /show/{episode.slug}
                    {episode.eventSlug ? ` · event ${episode.eventSlug}` : ""}
                  </p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                  {episode.status}
                </p>
                <p className="text-sm text-mute">
                  {formatDate(episode.publishedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
