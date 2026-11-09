export type PathwayModule = {
  title: string;
  description: string;
  url: string;
};

export type Pathway = {
  slug: string;
  title: string;
  summary: string;
  discipline: "data" | "ml" | "ai" | "other";
  status: "published" | "draft";
  sortOrder: number;
  modules: PathwayModule[];
};

export const pathways: Pathway[] = [
  {
    slug: "data-foundations",
    title: "Data Foundations",
    summary:
      "Get fluent with tables, questions, and honest visuals before you chase models.",
    discipline: "data",
    status: "published",
    sortOrder: 1,
    modules: [
      {
        title: "Thinking with tables",
        description: "Frame a question, pick a grain, and check your joins.",
        url: "https://www.khanacademy.org/math/statistics-probability",
      },
      {
        title: "SQL for analysis",
        description: "Select, aggregate, and window your way to a clean answer.",
        url: "https://mode.com/sql-tutorial/",
      },
      {
        title: "Visual honesty",
        description: "Charts that clarify — and the ways they quietly mislead.",
        url: "https://www.storytellingwithdata.com/",
      },
    ],
  },
  {
    slug: "machine-learning-craft",
    title: "Machine Learning Craft",
    summary:
      "Build models that survive evaluation, leakage checks, and real deployment constraints.",
    discipline: "ml",
    status: "published",
    sortOrder: 2,
    modules: [
      {
        title: "Supervised learning map",
        description: "Classification, regression, and what “good enough” means.",
        url: "https://www.fast.ai/",
      },
      {
        title: "Validation discipline",
        description: "Splits, leakage, and metrics that match the decision.",
        url: "https://scikit-learn.org/stable/model_selection.html",
      },
      {
        title: "Feature work",
        description: "Encode, transform, and document what the model actually sees.",
        url: "https://www.kaggle.com/learn",
      },
    ],
  },
  {
    slug: "applied-ai-studio",
    title: "Applied AI Studio",
    summary:
      "Use modern AI tools carefully — with grounding, evaluation, and human judgment.",
    discipline: "ai",
    status: "published",
    sortOrder: 3,
    modules: [
      {
        title: "LLM literacy",
        description: "What these systems do well, where they invent, and how to check.",
        url: "https://www.deeplearning.ai/short-courses/",
      },
      {
        title: "Retrieval & grounding",
        description: "Keep answers tied to sources your peers can verify.",
        url: "https://www.promptingguide.ai/",
      },
      {
        title: "Responsible use",
        description: "Privacy, bias, and saying “we don’t know” out loud.",
        url: "https://www.nist.gov/artificial-intelligence",
      },
    ],
  },
];

export function getPublishedPathways() {
  return pathways
    .filter((p) => p.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPathway(slug: string) {
  return getPublishedPathways().find((p) => p.slug === slug);
}
