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

/** Empty until the core publishes DataBrew episodes in Neon. */
export const episodes: Episode[] = [];
