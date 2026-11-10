export const site = {
  name: "DataBiz",
  line: "Data Science & Analytics Club",
  college: "NIT Bhopal — MANIT",
  email: "databiz.nitb@gmail.com",
  domain: "https://www.databiz.in",
  location: "Maulana Azad National Institute of Technology, Bhopal",
  mission:
    "Make data useful, understandable, and human. Help every member tell a true story with data, and use that skill with care.",
  heroSupport:
    "A student society at NIT Bhopal for people who learn data, machine learning, and AI by building together.",
  socials: {
    linkedin: "https://www.linkedin.com/company/databiz-nitb/",
    instagram: "https://www.instagram.com/databiz_nitb",
    x: null as string | null,
  },
  /** In-app sponsorship brochure page. */
  brochureUrl: "/brochure",
  /** Printable PDF served from /public. */
  brochurePdfUrl: "/brochure/databiz-sponsorship.pdf",
  values: [
    {
      title: "Learn by doing",
      body: "Sessions and projects apply concepts to real problems, not slide decks alone.",
    },
    {
      title: "Community first",
      body: "Confidence grows when peers build, fail, and ship together.",
    },
    {
      title: "Think across disciplines",
      body: "Data connects economics, healthcare, the environment, and more.",
    },
    {
      title: "Create responsible impact",
      body: "Use data for work that is socially careful and honestly communicated.",
    },
  ],
  approach: [
    "Learning by doing",
    "Community driven",
    "Industry ready",
    "Innovation first",
  ],
} as const;

/**
 * Desktop primary nav — keep short.
 * Join stays a header CTA.
 */
export const navPrimary = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/learn", label: "Learn" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
] as const;

/** Extra links for mobile drawer (after primary). */
export const navMore = [
  { href: "/join", label: "Join" },
  { href: "/show", label: "DataBrew" },
  { href: "/team", label: "Team" },
  { href: "/alumni", label: "Alumni" },
  { href: "/announcements", label: "Announcements" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/brochure", label: "Brochure" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "Account" },
] as const;

/** @deprecated Prefer navMore — kept for any leftover imports. */
export const navSecondary = navMore;

export const footerCols = [
  {
    title: "Programs",
    links: [
      { href: "/events", label: "Events" },
      { href: "/learn", label: "Pathways" },
      { href: "/blog", label: "Blog" },
      { href: "/show", label: "DataBrew" },
      { href: "/join", label: "Join" },
    ],
  },
  {
    title: "People & work",
    links: [
      { href: "/team", label: "Team" },
      { href: "/alumni", label: "Alumni" },
      { href: "/work", label: "Projects" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Society",
    links: [
      { href: "/about", label: "About" },
      { href: "/announcements", label: "Announcements" },
      { href: "/sponsors", label: "Sponsors" },
      { href: "/brochure", label: "Brochure" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/guidelines", label: "Guidelines" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const;

/** Home “Explore” strip — destinations visitors should find in one glance. */
export const homeExplore = [
  {
    href: "/events",
    label: "Events",
    body: "Sessions, workshops, and RSVPs.",
  },
  {
    href: "/join",
    label: "Join",
    body: "Open drives and how to apply.",
  },
  {
    href: "/gallery",
    label: "Gallery",
    body: "Photos from society sessions.",
  },
  {
    href: "/blog",
    label: "Blog",
    body: "Long-form from members.",
  },
  {
    href: "/show",
    label: "DataBrew",
    body: "Interview recordings and notes.",
  },
  {
    href: "/brochure",
    label: "Brochure",
    body: "Packages and how to partner with us.",
  },
] as const;
