import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

const BASE_URL = "https://lesser.tax";

interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Lesser - Flat-Fee Tax Planning & Filing for Tech Professionals",
    description: "Big Four-trained CPAs. AI-powered platform. Flat-fee pricing from $99/year. Year-round tax strategy for tech professionals with equity compensation — RSUs, ISOs, and stock options.",
    ogTitle: "Lesser — Your CPA Team for Equity Comp & Complex Taxes",
    ogDescription: "Big Four-trained CPAs meet AI-powered tax planning. Flat-fee pricing from $99/year. Built for tech professionals with RSUs, ISOs, and stock options.",
    ogImage: `${BASE_URL}/og-landing.jpg`,
    canonical: `${BASE_URL}/`,
  },
  "/offers/nextdoor": {
    title: "Nextdoor Employee Tax Planning & Filing | Lesser",
    description: "Specialized tax planning for Nextdoor employees. Optimize your RSUs, ISOs, and ESPP with Big Four-trained CPAs. Flat-fee pricing and year-round support.",
    ogTitle: "Lesser — Tax Planning for Nextdoor Employees",
    ogDescription: "Maximize your Nextdoor equity value. Expert CPA tax planning for RSUs, ISOs, and ESPP. Flat-fee, tech-forward service.",
    ogImage: `${BASE_URL}/og-nextdoor.png`,
    canonical: `${BASE_URL}/offers/nextdoor`,
  },
  "/nris": {
    title: "NRI Tax Filing - U.S. & India Cross-Border Tax Services | Lesser",
    description: "Expert U.S.-India tax filing for NRIs. FBAR, FATCA, PFIC, rental income, foreign tax credits, and RNOR planning. Flat-fee pricing from $99.",
    ogTitle: "Lesser — U.S. & India Tax Experts for NRIs",
    ogDescription: "Comprehensive cross-border tax compliance. FBAR, FATCA, and PFIC expertise for Indian professionals in the U.S.",
    ogImage: `${BASE_URL}/og-nri.jpg`,
    canonical: `${BASE_URL}/nris`,
  },
  "/offers/broadcom": {
    title: "Broadcom Employee Tax Planning & Filing | Lesser",
    description: "Specialized tax planning for Broadcom employees. Optimize your RSUs, ISOs, and ESPP with Big Four-trained CPAs. Flat-fee pricing and year-round support.",
    ogTitle: "Lesser — Tax Planning for Broadcom Employees",
    ogDescription: "Maximize your Broadcom equity value. Expert CPA tax planning for RSUs, ISOs, and ESPP. Flat-fee, tech-forward service.",
    ogImage: `${BASE_URL}/og-broadcom.png`,
    canonical: `${BASE_URL}/offers/broadcom`,
  },
  "/offers/coupa": {
    title: "Coupa Employee Tax Planning & Filing | Lesser",
    description: "Specialized tax planning for Coupa employees. Optimize your RSUs, ISOs, and ESPP with Big Four-trained CPAs. Flat-fee pricing and year-round support.",
    ogTitle: "Lesser — Tax Planning for Coupa Employees",
    ogDescription: "Maximize your Coupa equity value. Expert CPA tax planning for RSUs, ISOs, and ESPP. Flat-fee, tech-forward service.",
    ogImage: `${BASE_URL}/og-coupa.png`,
    canonical: `${BASE_URL}/offers/coupa`,
  },
  "/offers/riverisland": {
    title: "River Islands NRI Tax Filing - Cross-Border U.S.-India Tax Services | Lesser",
    description: "Expert U.S.-India tax filing for NRI families in River Islands, Lathrop CA. FBAR, FATCA, PFIC, rental income, and RNOR planning. Flat-fee pricing.",
    ogTitle: "Lesser — NRI Tax Specialists for River Islands Families",
    ogDescription: "Localized U.S.-India tax expertise for the River Islands community in Lathrop, CA. FBAR, FATCA, and PFIC compliance by experts.",
    ogImage: `${BASE_URL}/og-riverisland.jpg`,
    canonical: `${BASE_URL}/offers/riverisland`,
  },
  "/business": {
    title: "Business Tax Filing - Form 1120, 1065, 1120-S | Lesser",
    description: "File your business tax return for $100 flat fee. Form 1120, 1065, or 1120-S. CPA-reviewed, 48hr turnaround, review before you pay.",
    ogTitle: "Lesser — Business Tax Filing for $100",
    ogDescription: "File your business tax return — Form 1120, 1065, or 1120-S. CPA-reviewed, 48hr turnaround. Upload docs and let our team handle the rest.",
    ogImage: `${BASE_URL}/og-landing.jpg`,
    canonical: `${BASE_URL}/business`,
  },
  "/business/partnerships": {
    title: "Partnership Tax Filing - Form 1065 + K-1s for $100/Entity | Lesser",
    description: "File your partnership return for $100 per entity. Form 1065 + K-1s, CPA-reviewed, 24hr turnaround. Trusted by 10,000+ real estate investors.",
    ogTitle: "Lesser — Partnership Tax Filing for $100/Entity",
    ogDescription: "Form 1065 + K-1s filed for $100 per entity. CPA-reviewed, 24hr turnaround. Built for real estate investors with multiple LLCs.",
    ogImage: `${BASE_URL}/og-landing.jpg`,
    canonical: `${BASE_URL}/business/partnerships`,
  },
  "/business/deadline": {
    title: "March 15 Business Tax Deadline — File in 24 Hrs | Lesser",
    description: "March 15 deadline approaching? File your business tax return in 24 hours for $100. Form 1120, 1065, or 1120-S. CPA-reviewed, no waitlist, no rush fees.",
    ogTitle: "Lesser — March 15 Deadline. File in 24 Hrs for $100",
    ogDescription: "Business tax deadline is March 15. Upload today, filed tomorrow. $100 flat fee for Form 1120, 1065, or 1120-S. CPA-reviewed, no waitlist.",
    ogImage: `${BASE_URL}/og-landing.jpg`,
    canonical: `${BASE_URL}/business/deadline`,
  },
  "/business/realestate": {
    title: "$100 Per Entity — RE Investor Tax Filing | Lesser",
    description: "$100 per entity for Form 1065 + K-1s. 5 LLCs = $500, not $7,500. CPA-reviewed, 24hr turnaround. Built for real estate investors with multiple rental LLCs.",
    ogTitle: "Lesser — $100 Per Entity. Not $1,500.",
    ogDescription: "Own 5 rental LLCs? That's $500 total — not $7,500. Form 1065 + K-1s, CPA-reviewed, 24hr turnaround. Built for multi-entity RE investors.",
    ogImage: `${BASE_URL}/og-landing.jpg`,
    canonical: `${BASE_URL}/business/realestate`,
  },
};

function injectMeta(html: string, meta: PageMeta): string {
  let result = html;

  result = result.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  result = result.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${meta.description}"`
  );
  result = result.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${meta.ogTitle}"`
  );
  result = result.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${meta.ogDescription}"`
  );
  result = result.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${meta.ogImage}"`
  );
  result = result.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${meta.canonical}"`
  );
  result = result.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${meta.ogTitle}"`
  );
  result = result.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${meta.ogDescription}"`
  );
  result = result.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${meta.ogImage}"`
  );
  result = result.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${meta.canonical}"`
  );

  return result;
}

/**
 * Mounts the blog sub-app at /blog. It keeps its own dependency tree and build
 * (React 19 / Tailwind 4 / Vite 8, versus React 18 / Tailwind 3 / Vite 7 here),
 * so this only has to serve what its build emits.
 *
 * That build prerenders real HTML per route — dist/index.html for the list,
 * dist/<slug>/index.html per post, dist/videos/<slug>/ and dist/r/<combo>/ —
 * which is the whole point of the blog's SEO setup. So a request has to resolve
 * to its own prerendered file where one exists; falling back to the SPA shell
 * for everything would serve crawlers an empty div and throw that work away.
 */
export function serveBlog(app: Express, blogPath: string) {
  const shellPath = path.resolve(blogPath, "index.html");

  if (!fs.existsSync(shellPath)) {
    console.warn(
      `[blog] no build found at ${blogPath} - /blog will return 503. Run "npm run build:blog".`,
    );
    app.use("/blog", (_req: Request, res: Response) => {
      res
        .status(503)
        .type("text/plain")
        .send('Blog is not built. Run "npm run build:blog".');
    });
    return;
  }

  // index:false + redirect:false so directory requests fall through to the
  // handler below, which picks the prerendered file and avoids a 301 hop.
  app.use("/blog", express.static(blogPath, { index: false, redirect: false }));

  app.use("/blog", (req: Request, res: Response) => {
    // A miss on a real asset path stays a 404 - returning HTML there would hand
    // the browser markup with a .js or .mp4 content type.
    if (path.extname(req.path)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    const prerendered = path.resolve(blogPath, "." + req.path, "index.html");
    const file =
      prerendered.startsWith(blogPath) && fs.existsSync(prerendered)
        ? prerendered
        : shellPath;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-cache");
    res.send(fs.readFileSync(file, "utf-8"));
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Mounted before express.static and the marketing catch-all below, so
  // /blog/:slug and /blog/studio/* resolve to the blog rather than the
  // marketing shell.
  serveBlog(app, path.resolve(distPath, "blog"));

  app.use(express.static(distPath));

  app.use("/{*path}", (req: Request, res: Response) => {
    const indexPath = path.resolve(distPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf-8");

    const routePath = req.path;
    const meta = PAGE_META[routePath] || PAGE_META["/"];
    html = injectMeta(html, meta);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });
}
