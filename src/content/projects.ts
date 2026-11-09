export type Project = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  year: number;
  links: { label: string; url: string }[];
  status: "published" | "draft";
};

/** Projects stay empty until the core publishes real work. Do not invent a roster. */
export const projects: Project[] = [];

export function getPublishedProjects() {
  return projects
    .filter((p) => p.status === "published")
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export function getProject(slug: string) {
  return getPublishedProjects().find((p) => p.slug === slug);
}
