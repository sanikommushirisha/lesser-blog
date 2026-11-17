// Per-route SEO for the marketing site: one table read by the server (meta
// injected into the first HTML response and the build-time prerender) and by
// the browser (kept in step on in-app navigation). Plain data only: this file
// is bundled into the client too, so no Node imports.
//
// Rules (CLAUDE.md): titles 50-60 characters ending "| Lesser Tax",
// descriptions 140-160, canonical = the page itself, no em-dashes. The build
// enforces them (checkMeta in script/prerender.ts).

import { PASSPORT_PRICE } from "./passport-pricing";

export const BASE_URL = "https://lesser.tax";
export const BRAND = "Lesser Tax";

export interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  /** "noindex,follow" for pages that should not appear in search results. */
  robots?: string;
  /** Structured data, emitted as <script type="application/ld+json"> blocks in <head>. */
  jsonLd?: object[];
}

const OG_DEFAULT = `${BASE_URL}/og-landing.jpg`;
const OG_NRI = `${BASE_URL}/og-nri.jpg`;

export const ORGANIZATION_ID = `${BASE_URL}/#organization`;

const PROVIDER = { "@id": ORGANIZATION_ID };

const organization = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  "@id": ORGANIZATION_ID,
  name: BRAND,
  alternateName: "Lesser",
  url: `${BASE_URL}/`,
  logo: `${BASE_URL}/favicon.png`,
  image: OG_DEFAULT,
  description:
    "Flat-fee tax filing and year-round tax planning by Big Four-trained CPAs for tech professionals, NRIs and small businesses in the United States.",
  email: "use@lesser.tax",
  areaServed: { "@type": "Country", name: "United States" },
  priceRange: "$$",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "use@lesser.tax",
    areaServed: "US",
    availableLanguage: "English",
  },
  knowsAbout: [
    "U.S. individual income tax filing",
    "Tax planning for tech professionals",
    "RSU, ISO, NSO and ESPP taxation",
    "H-1B and green card holder taxes",
    "NRI taxation",
    "FBAR (FinCEN Form 114)",
    "FATCA Form 8938",
    "PFIC and Form 8621",
    "India-U.S. tax treaty (DTAA)",
    "Indian income tax return (ITR) filing",
    "Partnership returns (Form 1065)",
    "S corporation returns (Form 1120-S)",
    "Rental property and real estate LLC taxes",
    "Indian passport renewal in the USA",
  ],
  sameAs: [
    "https://www.linkedin.com/company/lesser-tax/",
    "https://x.com/lesser_tax",
    "https://www.instagram.com/lessertax/",
  ],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: BRAND,
  url: `${BASE_URL}/`,
  publisher: PROVIDER,
  inLanguage: "en-US",
};

/** Home > ... > page, built from [name, path] pairs (home is added). */
function breadcrumbs(...trail: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"] as [string, string], ...trail].map(([name, p], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${BASE_URL}${p}`,
    })),
  };
}

function service(opts: {
  name: string;
  serviceType: string;
  path: string;
  description: string;
  /** Lowest advertised price in USD, as shown on the page. */
  price?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: opts.serviceType,
    url: `${BASE_URL}${opts.path}`,
    description: opts.description,
    provider: PROVIDER,
    areaServed: { "@type": "Country", name: "United States" },
    ...(opts.price
      ? {
          offers: {
            "@type": "Offer",
            price: opts.price,
            priceCurrency: "USD",
            url: `${BASE_URL}${opts.path}`,
          },
        }
      : {}),
  };
}

/** Builds an entry whose og/twitter copy defaults to the title and description. */
function page(
  path: string,
  m: Omit<PageMeta, "canonical" | "ogTitle" | "ogDescription" | "ogImage"> &
    Partial<Pick<PageMeta, "ogTitle" | "ogDescription" | "ogImage">>,
): PageMeta {
  return {
    ...m,
    ogTitle: m.ogTitle ?? m.title,
    ogDescription: m.ogDescription ?? m.description,
    ogImage: m.ogImage ?? OG_DEFAULT,
    canonical: path === "/" ? `${BASE_URL}/` : `${BASE_URL}${path}`,
  };
}

// The Nextdoor, Broadcom, Coupa and Google offer pages are the same page with
// the company name swapped. Indexed, they read as doorway pages (Google spam
// policies) and compete with "/" for the same queries, so they stay reachable
// for employees we send them to but out of search results. To index one again,
// give it content specific to that employer first (see the lesser-seo skill).
function companyOffer(path: string, company: string, ogImage: string): PageMeta {
  return page(path, {
    robots: "noindex,follow",
    title: `${company} Employee Tax Planning and Filing | ${BRAND}`,
    description: `Tax planning and filing for ${company} employees: RSUs, ISOs and ESPP handled by Big Four-trained CPAs. Flat-fee pricing and year-round support from ${BRAND}.`,
    ogTitle: `Tax Planning for ${company} Employees | ${BRAND}`,
    ogDescription: `Get more from your ${company} equity. CPA tax planning for RSUs, ISOs and ESPP with flat-fee pricing and year-round support.`,
    ogImage,
    jsonLd: [
      service({
        name: `Tax planning and filing for ${company} employees`,
        serviceType: "Equity compensation tax planning",
        path,
        description: `Flat-fee tax filing and planning for ${company} employees with RSUs, ISOs and ESPP.`,
      }),
      breadcrumbs([`${company} employees`, path]),
    ],
  });
}

export const PAGE_META: Record<string, PageMeta> = {
  "/": page("/", {
    title: `CPA Tax Filing & Tax Planning for Tech Workers | ${BRAND}`,
    description:
      "Big Four-trained CPAs and an AI-powered platform for tech professionals with RSUs, ISOs and stock options. Flat-fee tax filing and planning from $99 a year.",
    ogTitle: `${BRAND}: Your CPA Team for Equity Comp and Complex Taxes`,
    ogDescription:
      "Big Four-trained CPAs meet AI-powered tax planning. Flat-fee pricing from $99 a year. Built for tech professionals with RSUs, ISOs and stock options.",
    jsonLd: [organization, website],
  }),
  "/nris": page("/nris", {
    title: `NRI Tax Filing: U.S. & India Cross-Border Taxes | ${BRAND}`,
    description:
      "U.S. and India tax filing for NRIs by CPAs who know both systems: FBAR, FATCA, PFIC, Indian rental income, foreign tax credits and RNOR planning. From $99.",
    ogTitle: `${BRAND}: U.S. and India Tax Experts for NRIs`,
    ogDescription:
      "Cross-border tax compliance for Indian professionals in the U.S. FBAR, FATCA and PFIC handled by CPAs, with flat-fee pricing.",
    ogImage: OG_NRI,
    jsonLd: [
      service({
        name: "NRI tax filing (U.S. and India)",
        serviceType: "Cross-border tax preparation",
        path: "/nris",
        description:
          "U.S. tax filing for Indian professionals living in the U.S., including FBAR, FATCA, PFIC, foreign tax credits and RNOR planning.",
        price: "99",
      }),
      breadcrumbs(["NRI tax filing", "/nris"]),
    ],
  }),
  // Free Indian passport forms (LD-78): the hub and one page per form. Copy and
  // FAQs come from shared/passport-forms/engine/content.ts (synced from the app).
  "/tools/indian-passport-forms": page("/tools/indian-passport-forms", {
    title: "Indian Passport Renewal Forms USA: Fill Free | Lesser Tax",
    description: "Fill every VFS USA form for Indian passport renewal: Annexure E, the appearance affidavit, Annexures C, D, F and J, and the checklist. Free, nothing stored.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"])],
  }),
  "/tools/indian-passport-forms/passport-seva-online-form": page("/tools/indian-passport-forms/passport-seva-online-form", {
    title: "Passport Seva Re-issue Form Answers (USA) | Lesser Tax",
    description: "Get every answer for the Passport Seva re-issue form on the mission portal, in the portal's order and ready to copy, then a PDF of your answers. Free.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Passport Seva form answers", "/tools/indian-passport-forms/passport-seva-online-form"])],
  }),
  "/tools/indian-passport-forms/vfs-checklist": page("/tools/indian-passport-forms/vfs-checklist", {
    title: "VFS Passport Renewal Checklist USA: Fill Free | Lesser Tax",
    description: "Fill the VFS USA checklist for your Indian passport renewal: the Nov 2026 edition for your case, adult, minor, lost, damaged or Tatkal. Free filled PDF.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["VFS checklist", "/tools/indian-passport-forms/vfs-checklist"])],
  }),
  "/tools/indian-passport-forms/annexure-e": page("/tools/indian-passport-forms/annexure-e", {
    title: "Annexure E for Passport Renewal (VFS USA) | Lesser Tax",
    description: "Fill Annexure E for Indian passport renewal at VFS USA: points 3 and 7 crossed out for you, long names fit, no notary needed. Download the filled PDF free.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Annexure E", "/tools/indian-passport-forms/annexure-e"])],
  }),
  "/tools/indian-passport-forms/affidavit-change-in-appearance-and-signature": page("/tools/indian-passport-forms/affidavit-change-in-appearance-and-signature", {
    title: "Appearance and Signature Affidavit (VFS USA) | Lesser Tax",
    description: "Every VFS USA applicant sends the Affidavit for Change in Appearance and Signature, even if nothing changed. Fill it online and download the PDF free.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Appearance affidavit", "/tools/indian-passport-forms/affidavit-change-in-appearance-and-signature"])],
  }),
  "/tools/indian-passport-forms/name-change-affidavit": page("/tools/indian-passport-forms/name-change-affidavit", {
    title: "Name Change Affidavit for Indian Passport | Lesser Tax",
    description: "Fill the name change affidavit VFS USA needs notarized for an Indian passport: old and new name, witnesses and notary block. Download the filled PDF free.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Name change affidavit", "/tools/indian-passport-forms/name-change-affidavit"])],
  }),
  "/tools/indian-passport-forms/annexure-j-joint-photo-declaration": page("/tools/indian-passport-forms/annexure-j-joint-photo-declaration", {
    title: "Annexure J Joint Photo Declaration (VFS USA) | Lesser Tax",
    description: "No marriage certificate? Fill Annexure J, the joint photo declaration both spouses sign to add a spouse's name to an Indian passport. Free filled PDF.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Annexure J", "/tools/indian-passport-forms/annexure-j-joint-photo-declaration"])],
  }),
  "/tools/indian-passport-forms/annexure-f": page("/tools/indian-passport-forms/annexure-f", {
    title: "Annexure F for Lost or Damaged Passport | Lesser Tax",
    description: "Fill Annexure F, the declaration VFS USA requires to replace a lost or damaged Indian passport, with your police report details. Download the PDF free.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Annexure F", "/tools/indian-passport-forms/annexure-f"])],
  }),
  "/tools/indian-passport-forms/annexure-d": page("/tools/indian-passport-forms/annexure-d", {
    title: "Annexure D for a Minor's Passport (USA) | Lesser Tax",
    description: "Both parents sign Annexure D for every minor's Indian passport at VFS USA, before a notary. Fill both parents' details once and download the PDF free.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Annexure D", "/tools/indian-passport-forms/annexure-d"])],
  }),
  "/tools/indian-passport-forms/annexure-c": page("/tools/indian-passport-forms/annexure-c", {
    title: "Annexure C: One Parent Can't Consent (Minor) | Lesser Tax",
    description: "Fill Annexure C when one parent can't consent to a minor's Indian passport: the right reason kept, the others crossed out. Download the filled PDF free.",
    ogImage: OG_NRI,
    jsonLd: [breadcrumbs(["Passport forms", "/tools/indian-passport-forms"], ["Annexure C", "/tools/indian-passport-forms/annexure-c"])],
  }),
  "/webinars": page("/webinars", {
    title: `Webinars on Tax, Money and Investing | ${BRAND}`,
    description:
      "Join Lesser Tax live webinars on tax, retirement, estate planning and investing for immigrants, or catch up on what you missed from past sessions.",
  }),
  "/webinars/how-to-invest-startups-before-going-public": page("/webinars/how-to-invest-startups-before-going-public", {
    title: `The 15x You Missed: Pre-IPO Investing Webinar | ${BRAND}`,
    description:
      "Live Q&A on Sunday, November 15, 10 to 11 AM PT: how to invest in startups before they go public. Register to get the Zoom link and a reminder.",
  }),
  "/marketplace": page("/marketplace", {
    title: `NRI Services: Passport Renewal and India ITR | ${BRAND}`,
    description:
      "Renew your Indian passport from the U.S. and file your India tax return online with expert-guided tools. Business formation and GST help coming soon.",
    ogTitle: `${BRAND} Marketplace: Expert Services for Global Indians`,
    ogDescription:
      "Indian passport renewal and India tax filing for NRIs in the U.S., guided step by step and reviewed by experts. More NRI services coming soon.",
    ogImage: OG_NRI,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${BRAND} Marketplace: Expert Services for Global Indians`,
        url: `${BASE_URL}/marketplace`,
        description: "Indian passport renewal, India tax filing and other services for NRIs living in the United States.",
        isPartOf: { "@id": `${BASE_URL}/#website` },
      },
      breadcrumbs(["Marketplace", "/marketplace"]),
    ],
  }),
  "/business": page("/business", {
    title: `Business Tax Filing $100: 1120, 1065, 1120-S | ${BRAND}`,
    description:
      "File your business tax return for a $100 flat fee: Form 1120, 1065 or 1120-S. CPA-reviewed, 48-hour turnaround, and you review the return before you pay.",
    jsonLd: [
      service({
        name: "Business tax return filing",
        serviceType: "Business tax preparation",
        path: "/business",
        description: "Form 1120, 1065 and 1120-S business tax returns, prepared on our platform and reviewed by a CPA.",
        price: "100",
      }),
      breadcrumbs(["Business tax filing", "/business"]),
    ],
  }),
  "/business/partnerships": page("/business/partnerships", {
    title: `Partnership Tax Filing: Form 1065 and K-1s | ${BRAND}`,
    description:
      "File your partnership return for $100 per entity: Form 1065 plus K-1s, CPA-reviewed with a 24-hour turnaround. Built for real estate investors with LLCs.",
    jsonLd: [
      service({
        name: "Partnership tax filing (Form 1065 and K-1s)",
        serviceType: "Partnership tax preparation",
        path: "/business/partnerships",
        description: "Form 1065 partnership returns with K-1s, reviewed by a CPA, at $100 per entity.",
        price: "100",
      }),
      breadcrumbs(["Business tax filing", "/business"], ["Partnerships", "/business/partnerships"]),
    ],
  }),
  "/business/deadline": page("/business/deadline", {
    title: `March 15 Business Tax Deadline: File in 24 Hrs | ${BRAND}`,
    description:
      "Up against the March 15 deadline? File your business tax return in 24 hours for $100: Form 1120, 1065 or 1120-S. CPA-reviewed, no waitlist, no rush fees.",
    jsonLd: [
      service({
        name: "Fast business tax filing before March 15",
        serviceType: "Business tax preparation",
        path: "/business/deadline",
        description: "Form 1120, 1065 or 1120-S filed within 24 hours, reviewed by a CPA, at a $100 flat fee.",
        price: "100",
      }),
      breadcrumbs(["Business tax filing", "/business"], ["March 15 deadline", "/business/deadline"]),
    ],
  }),
  "/business/realestate": page("/business/realestate", {
    title: `Real Estate LLC Tax Filing: $100 Per Entity | ${BRAND}`,
    description:
      "$100 per entity for Form 1065 plus K-1s, so 5 rental LLCs cost $500, not $7,500. CPA-reviewed with a 24-hour turnaround for multi-entity real estate investors.",
    jsonLd: [
      service({
        name: "Tax filing for real estate LLCs",
        serviceType: "Partnership tax preparation",
        path: "/business/realestate",
        description: "Form 1065 and K-1s for real estate investors with multiple rental LLCs, at $100 per entity.",
        price: "100",
      }),
      breadcrumbs(["Business tax filing", "/business"], ["Real estate investors", "/business/realestate"]),
    ],
  }),
  "/offers/nextdoor": companyOffer("/offers/nextdoor", "Nextdoor", `${BASE_URL}/og-nextdoor.jpg`),
  "/offers/broadcom": companyOffer("/offers/broadcom", "Broadcom", `${BASE_URL}/og-broadcom.jpg`),
  "/offers/coupa": companyOffer("/offers/coupa", "Coupa", `${BASE_URL}/og-coupa.jpg`),
  "/offers/google": companyOffer("/offers/google", "Google", OG_DEFAULT),
  "/offers/infosys": page("/offers/infosys", {
    title: `Infosys Employee Tax Planning & Filing | ${BRAND}`,
    description:
      "Tax planning and filing for Infosys employees: RSUs, ESOPs and U.S.-India cross-border income handled by Big Four-trained CPAs, with flat-fee pricing.",
    ogTitle: `Tax Planning for Infosys Employees | ${BRAND}`,
    ogDescription:
      "Get more from your Infosys equity. CPA tax planning for RSUs, ESOPs and cross-border income with flat-fee pricing and year-round support.",
    ogImage: OG_NRI,
    jsonLd: [
      service({
        name: "Tax planning and filing for Infosys employees",
        serviceType: "Equity compensation tax planning",
        path: "/offers/infosys",
        description: "Flat-fee tax filing and planning for Infosys employees with RSUs, ESOPs and cross-border income.",
      }),
      breadcrumbs(["Infosys employees", "/offers/infosys"]),
    ],
  }),
  "/offers/riverisland": page("/offers/riverisland", {
    title: `NRI Tax Filing for River Islands, Lathrop CA | ${BRAND}`,
    description:
      "U.S. and India tax filing for NRI families in River Islands, Lathrop CA: FBAR, FATCA, PFIC, Indian rental income and RNOR planning. Flat-fee pricing from CPAs.",
    ogTitle: `${BRAND}: NRI Tax Specialists for River Islands Families`,
    ogDescription:
      "Local U.S. and India tax expertise for the River Islands community in Lathrop, CA. FBAR, FATCA and PFIC compliance handled by CPAs.",
    ogImage: `${BASE_URL}/og-riverisland.jpg`,
    jsonLd: [
      service({
        name: "NRI tax filing for River Islands families",
        serviceType: "Cross-border tax preparation",
        path: "/offers/riverisland",
        description: "U.S. and India tax filing for NRI families in River Islands, Lathrop, California.",
      }),
      breadcrumbs(["River Islands NRI tax filing", "/offers/riverisland"]),
    ],
  }),
  "/dashboard/tax-experts": page("/dashboard/tax-experts", {
    title: `Book a CPA or Tax Expert Consultation Online | ${BRAND}`,
    description:
      "Book a one-on-one consultation with a vetted CPA or tax expert for U.S. and India tax questions. See each expert's experience, services and price, then book.",
    jsonLd: [breadcrumbs(["Tax experts", "/dashboard/tax-experts"])],
  }),
  "/privacy": page("/privacy", {
    title: `Privacy Policy: How We Protect Your Data | ${BRAND}`,
    description:
      "How Lesser Tax collects, uses, stores and protects your personal and tax information, who we share it with, and the choices and rights you have over your data.",
    jsonLd: [breadcrumbs(["Privacy policy", "/privacy"])],
  }),
  "/terms": page("/terms", {
    title: `Terms of Use for the Lesser Tax Website and App | ${BRAND}`,
    description:
      "The terms for using the Lesser Tax website and tax platform: who can use it, our services, your responsibilities, liability, disputes and how to reach us.",
    jsonLd: [breadcrumbs(["Terms of use", "/terms"])],
  }),
};

// Public pages that are kept out of search results: a preview of the signed-in
// dashboard (its content duplicates the marketing pages) and per-expert pages
// whose content is loaded in the browser. They still get their own title and
// canonical so they are never mistaken for the home page.
const NOINDEX = "noindex,follow";
const noindexPages: Record<string, [string, string]> = {
  "/dashboard": [
    `Dashboard Preview | ${BRAND}`,
    "A preview of the Lesser Tax dashboard: your tax return, investments, tax experts and NRI services in one place.",
  ],
  "/dashboard/investments": [
    `Investments | ${BRAND}`,
    "Pre-IPO and private market investment opportunities, previewed in the Lesser Tax dashboard.",
  ],
  "/dashboard/taxation": [
    `Taxation | ${BRAND}`,
    "Your U.S. and India tax filing, planning and documents, previewed in the Lesser Tax dashboard.",
  ],
  "/dashboard/marketplace": [
    `Marketplace | ${BRAND}`,
    "NRI services such as Indian passport renewal and India tax filing, previewed in the Lesser Tax dashboard.",
  ],
};
for (const [p, [title, description]] of Object.entries(noindexPages)) {
  PAGE_META[p] = page(p, { title, description, robots: NOINDEX });
}

const TAX_EXPERT_PAGE = /^\/dashboard\/tax-experts\/[^/]+(\/booking)?$/;

export const NOT_FOUND_META: PageMeta = {
  ...page("/404", {
    title: `Page Not Found | ${BRAND}`,
    description: "This page does not exist. Find tax filing, NRI services and guides on Lesser Tax.",
    robots: "noindex",
  }),
  canonical: "",
};

/** "/nris/" -> "/nris"; "/" stays "/". Query and hash are dropped. */
export function normalizePath(url: string): string {
  const pathname = new URL(url, BASE_URL).pathname;
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;
}

/** Meta for a route, or null when the site has no such page (a 404). */
export function routeMeta(url: string): PageMeta | null {
  const p = normalizePath(url);
  if (PAGE_META[p]) return PAGE_META[p];
  if (TAX_EXPERT_PAGE.test(p)) {
    return page(p, {
      title: p.endsWith("/booking") ? `Your Consultation Booking | ${BRAND}` : `Tax Expert Profile | ${BRAND}`,
      description: "Book a one-on-one consultation with a vetted CPA or tax expert on Lesser Tax.",
      robots: NOINDEX,
    });
  }
  return null;
}

/** Routes rendered to static HTML at build time (dynamic expert pages are not). */
export const PRERENDER_ROUTES = Object.keys(PAGE_META);

/** Indexable routes, i.e. what belongs in sitemap.xml. */
export const SITEMAP_ROUTES = Object.entries(PAGE_META)
  .filter(([, m]) => !m.robots)
  .map(([p]) => p);
