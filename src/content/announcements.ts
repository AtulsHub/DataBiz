export type Announcement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  status: "published" | "draft";
  href?: string;
};

/** Empty until the core publishes notices in Neon. */
export const announcements: Announcement[] = [];
