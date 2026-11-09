export type EpisodeGuest = {
  name: string;
  title: string;
  organization: string;
};

export type Episode = {
  slug: string;
  title: string;
  summary: string;
  showNotes: string;
  publishedAt: string;
  status: "published" | "draft";
  provider: "youtube" | "spotify" | "other";
  embedUrl?: string;
  externalUrl?: string;
  eventSlug?: string;
  coverUrl?: string;
  guests: EpisodeGuest[];
};

/** Empty until the core publishes DataBrew episodes. */
export const episodes: Episode[] = [];

export function getPublishedEpisodes() {
  return episodes
    .filter((e) => e.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getEpisode(slug: string) {
  return getPublishedEpisodes().find((e) => e.slug === slug);
}

export function getLatestEpisode() {
  return getPublishedEpisodes()[0] ?? null;
}
