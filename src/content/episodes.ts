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

export const episodes: Episode[] = [
  {
    slug: "databrew-rishabh-chhabra",
    title: "Thinking at Scale with Rishabh Chhabra",
    summary:
      "From Big 4 audit to the World Bank Group — a DataBrew conversation on finance, research, analytics, and the move from compliance to impact.",
    showNotes: `## On this episode

Guest **Rishabh Chhabra**, Consultant at the World Bank Group, previously Deloitte India (Audit).

### Topics

- What audit teaches about thinking carefully with incomplete information
- How finance, research, and analytics meet in global consulting
- Paths toward institutions that operate at planetary scale
- The shift from compliance to impact

Recording will appear here when the core pastes a YouTube or Spotify embed.`,
    publishedAt: "2026-02-22T12:00:00+05:30",
    status: "published",
    provider: "youtube",
    eventSlug: "the-databrew-show-with-consultant",
    coverUrl:
      "https://res.cloudinary.com/dvil2pqgj/image/upload/v1771598566/databiz/xvnlv5c26zw1skfccmzn.jpg",
    guests: [
      {
        name: "Rishabh Chhabra",
        title: "Consultant",
        organization: "World Bank Group",
      },
    ],
  },
];

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
