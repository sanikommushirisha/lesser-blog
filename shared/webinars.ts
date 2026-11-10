// Lesser's webinars, shown on /webinars (upcoming first, then past). One entry per webinar.
// An entry with `external: true` sends the visitor to its Luma page; the others have their
// own page on this site (client/src/pages/webinar.tsx, listed in client/src/routes.tsx).

export interface WebinarEntry {
  slug: string;
  /** Taken from the event's own Luma page. */
  title: string;
  /** Shown on the card, always Pacific time. */
  whenLabel: string;
  /** Where it is listed when the page is built; an "upcoming" one moves to "Past" in the browser once endsAt has passed. */
  status: "upcoming" | "past";
  /** ISO times in UTC. */
  startsAt: string;
  endsAt: string;
  speakers: string[];
  /** Where the card goes. */
  href: string;
  external?: boolean;
  /**
   * Card image, without extension: the card loads `<image>-400.webp` and `<image>-800.webp`
   * (3:2, sized for the card) with `<image>.jpg` as the fallback. Made from the event artwork
   * cropped to its top 3:2; the file name carries a content hash, so it is cached for a year.
   */
  image: string;
}

export const WEBINARS: WebinarEntry[] = [
  {
    slug: "how-to-invest-startups-before-going-public",
    title: "How to Invest in Startups Before They Go Public",
    whenLabel: "Sunday, Nov 15, 2026 • 10:00 AM PT",
    status: "upcoming",
    startsAt: "2026-11-15T18:00:00Z",
    endsAt: "2026-11-15T19:00:00Z",
    speakers: ["Subbu Ramasubramanian", "Abishek Surendran"],
    href: "/webinars/how-to-invest-startups-before-going-public",
    image: "/webinar-assets/how-to-invest-startups-55982630",
  },
  {
    slug: "long-term-strategy-retirement-income-estate-planning",
    // From https://luma.com/ti65u0oq
    title: "Long-term strategy for Retirement Income and Estate Planning",
    whenLabel: "Saturday, Sep 26, 2026 • 11:00 AM PT",
    status: "past",
    startsAt: "2026-09-26T18:00:00Z",
    endsAt: "2026-09-26T18:45:00Z",
    speakers: ["Suvashis Nandy", "Parineet Sehgal"],
    href: "https://luma.com/ti65u0oq",
    external: true,
    image: "/webinar-assets/retirement-income-estate-planning-6cc9e611",
  },
];

export const WEBINAR_HOW_TO_INVEST_PATH = "/webinars/how-to-invest-startups-before-going-public";
