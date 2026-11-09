export type EventItem = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  venue: string;
  meetingUrl?: string;
  startsAt: string;
  endsAt: string;
  status: "draft" | "published" | "past";
  recapBody?: string;
  recordingUrl?: string;
  posterUrl?: string;
  episodeSlug?: string;
};

export const events: EventItem[] = [
  {
    slug: "the-databrew-show-with-consultant",
    title: "The DataBrew Show with Consultant",
    summary:
      "What Big 4 audit teaches about thinking at scale, how finance, research, and analytics meet in global consulting, and the shift from compliance to impact — with Rishabh Chhabra.",
    body: `A live DataBrew conversation on careers that move between audit, consulting, research, and institutions that work at planetary scale.

Expect practical framing: how to think with incomplete data, how credibility compounds, and what “impact” actually looks like outside a slide deck.`,
    venue: "Online · Zoom",
    startsAt: "2026-02-21T18:00:00+05:30",
    endsAt: "2026-02-21T19:30:00+05:30",
    status: "past",
    posterUrl:
      "https://res.cloudinary.com/dvil2pqgj/image/upload/v1771598566/databiz/xvnlv5c26zw1skfccmzn.jpg",
    episodeSlug: "databrew-rishabh-chhabra",
    recapBody: `We sat with Rishabh Chhabra (Consultant, World Bank Group; previously Deloitte India, Audit) for a session on thinking at scale.

Themes that stuck with the room: moving from compliance to impact, bridging finance and analytics, and building a career that stays curious without losing rigor.

Recording embed will appear on the episode page once the core publishes it.`,
  },
];

export function getUpcomingEvents(now = new Date()) {
  return events
    .filter((e) => e.status === "published" && new Date(e.endsAt) > now)
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}

export function getPastEvents() {
  return events
    .filter((e) => e.status === "past")
    .sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );
}

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug && e.status !== "draft");
}

export function getNextEvent(now = new Date()) {
  return getUpcomingEvents(now)[0] ?? null;
}
