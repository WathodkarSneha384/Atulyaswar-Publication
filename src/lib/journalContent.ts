export const journalMenuItems = [
  { label: "Home", href: "/" },
  { label: "Journal", href: "/journal" },
] as const;

export const journalPages = {
  about: {
    title: "About",
    description:
      "Atulyaswar is a peer reviewed music research journal focused on quality scholarship across vocal, instrumental, pedagogy, aesthetics, and interdisciplinary music studies.",
    points: [
      "Peer reviewed process to maintain academic quality.",
      "Open access intent to increase research visibility.",
      "Focus on Indian music traditions and contemporary practices.",
    ],
  },
  "editorial-board": {
    title: "Editorial Board",
    description:
      "The editorial board section will list Chief Editor, managing editors, reviewers, and advisory members with credentials.",
    points: [
      "Chief editor and associate editor profiles.",
      "Reviewer panel with domain specialization.",
      "Institution affiliations and contact channels.",
    ],
  },
  "current-issue": {
    title: "Current Issue",
    description:
      "This section is reserved for the latest published volume and issue details, including paper list and downloadable links.",
    points: [
      "Volume and issue metadata.",
      "Table of contents for current papers.",
      "Direct links for abstract and full text.",
    ],
  },
  archive: {
    title: "Archive",
    description:
      "Archive will organize previous issues by year, volume, and issue number for easy scholarly retrieval.",
    points: [
      "Year-wise archival listing.",
      "Searchable issue index.",
      "Persistent links to historical publications.",
    ],
  },
  "contact-us": {
    title: "Contact Us",
    description:
      "Use this section to provide official email, editorial office address, and collaboration/inquiry form.",
    points: [
      "Primary journal communication email.",
      "Submission and technical support contact details.",
      "Office hours and expected response window.",
    ],
  },
  faq: {
    title: "FAQ",
    description:
      "Frequently asked questions help authors and readers understand review timelines, policies, and submission requirements.",
    points: [
      "Review time and decision process.",
      "Formatting and referencing expectations.",
      "Publication ethics and plagiarism policy.",
    ],
  },
  "submit-manuscript": {
    title: "Submit Manuscript",
    description:
      "This area can host your online manuscript submission form, author declaration, and checklist.",
    points: [
      "Author details and manuscript upload fields.",
      "Declaration and originality confirmation.",
      "Status update flow after submission.",
    ],
  },
  manuscripts: {
    title: "Manuscripts",
    description:
      "Approved manuscript submissions are listed here after admin review and approval.",
    points: [
      "Shows approved manuscript titles and author information.",
      "Updated by editorial admin after submission review.",
      "Supports transparent publication workflow.",
    ],
  },
  guidelines: {
    title: "Guidelines",
    description:
      "Guidelines define manuscript format, citation standards, word count, and accepted file templates.",
    points: [
      "Formatting template and structure.",
      "Citation style and bibliography requirements.",
      "Image/audio notation inclusion rules.",
    ],
  },
  "open-access-policy": {
    title: "Open Access Policy",
    description:
      "Atulyaswar intends to provide unrestricted access to research output for readers and scholars without paywall barriers.",
    points: [
      "Free access to published content.",
      "Citation-friendly, discoverable publication model.",
      "Transparent rights and usage conditions.",
    ],
  },
} as const;

export type JournalSlug = keyof typeof journalPages;
