export type EventStatus = "draft" | "published" | "past";

export type EventItem = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  venue: string;
  meetingUrl?: string;
  startsAt: string;
  endsAt: string;
  capacity?: number | null;
  rsvpDeadline?: string;
  status: EventStatus;
  recapBody?: string;
  recordingUrl?: string;
  posterUrl?: string;
  posterPublicId?: string;
  episodeSlug?: string;
  template?: "default" | "fest";
};

/** Seed catalog used when DATABASE_URL is unset. */
export const events: EventItem[] = [
  {
    id: "seed-databrew-consultant",
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
    posterPublicId: "databiz/xvnlv5c26zw1skfccmzn",
    episodeSlug: "databrew-rishabh-chhabra",
    template: "default",
    recapBody: `We sat with Rishabh Chhabra (Consultant, World Bank Group; previously Deloitte India, Audit) for a session on thinking at scale.

Themes that stuck with the room: moving from compliance to impact, bridging finance and analytics, and building a career that stays curious without losing rigor.

Recording embed will appear on the episode page once the core publishes it.`,
  },
];
