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

/** Empty until the core publishes events in admin / Neon. */
export const events: EventItem[] = [];
