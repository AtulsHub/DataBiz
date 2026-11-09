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

/** Primary chrome — DataBrew is an event format, not a top-level destination. */
export const navPrimary = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/learn", label: "Learn" },
  { href: "/work", label: "Work" },
] as const;

export const navSecondary = [
  { href: "/team", label: "Team" },
  { href: "/alumni", label: "Alumni" },
  { href: "/join", label: "Join" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/announcements", label: "Announcements" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerCols = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/team", label: "Team" },
      { href: "/work", label: "Work" },
      { href: "/alumni", label: "Alumni" },
    ],
  },
  {
    title: "Programs",
    links: [
      { href: "/events", label: "Events" },
      { href: "/learn", label: "Pathways" },
      { href: "/blog", label: "Blog" },
      { href: "/join", label: "Join" },
    ],
  },
  {
    title: "Society",
    links: [
      { href: "/sponsors", label: "Sponsors" },
      { href: "/announcements", label: "Announcements" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/guidelines", label: "Guidelines" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const;
