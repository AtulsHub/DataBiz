export type Announcement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  status: "published" | "draft";
  href?: string;
};

export const announcements: Announcement[] = [];

export function getPublishedAnnouncements() {
  return announcements
    .filter((a) => a.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}
