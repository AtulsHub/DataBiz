export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  tags: string[];
  publishedAt: string;
  status: "published" | "draft";
};

/** Empty until the core publishes posts in admin / Neon. */
export const posts: Post[] = [];
