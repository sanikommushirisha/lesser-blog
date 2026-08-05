import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSignupSchema, insertBusinessSignupSchema } from "@shared/schema";
import { appendSignupToSheet, appendBusinessSignupToSheet } from "./google-sheets";
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

const BOT_UA_PATTERNS = [
  "facebookexternalhit", "twitterbot", "linkedinbot", "whatsapp",
  "telegrambot", "slackbot", "discordbot", "googlebot", "bingbot",
  "applebot", "pinterest", "tumblr", "vkshare", "w3c_validator",
  "semrushbot", "ahrefsbot", "rogerbot", "embedly", "quora link preview",
  "showyoubot", "outbrain", "developers.google.com",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((p) => ua.includes(p));
}

function injectMeta(html: string, meta: PageMeta): string {
  let result = html;
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  result = result.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${meta.description}"`);
  result = result.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${meta.ogTitle}"`);
  result = result.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${meta.ogDescription}"`);
  result = result.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${meta.ogImage}"`);
  result = result.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${meta.canonical}"`);
  result = result.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${meta.ogTitle}"`);
  result = result.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${meta.ogDescription}"`);
  result = result.replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${meta.ogImage}"`);
  result = result.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${meta.canonical}"`);
  return result;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const knownRoutes = Object.keys(PAGE_META);

  // /get-started has never been a route on this site, so older blog and
  // campaign links to it 404'd. Send them to the app's sign-up instead.
  app.get("/get-started", (_req: Request, res: Response) => {
    res.redirect(302, "https://lesser.tax/app/auth/sign-up");
  });

  app.post("/api/signups", async (req: Request, res: Response) => {
    const parsed = insertSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const signup = await storage.createSignup(parsed.data);
    try {
      await appendSignupToSheet(signup);
    } catch (err) {
      console.error("[Signup] Google Sheets write failed, lead saved in memory only:", err);
    }
    res.status(201).json(signup);
  });

  app.post("/api/business-signups", async (req: Request, res: Response) => {
    const parsed = insertBusinessSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const signup = await storage.createBusinessSignup(parsed.data);
    try {
      await appendBusinessSignupToSheet(signup);
    } catch (err) {
      console.error("[Signup] Google Sheets write failed for business lead:", err);
    }
    res.status(201).json(signup);
  });

  app.use((req: Request, res: Response, next) => {
    const ua = req.headers["user-agent"] || "";
    const routePath = req.path;

    if (!knownRoutes.includes(routePath) || !isBot(ua)) {
      return next();
    }

    const templatePaths = [
      path.resolve(process.cwd(), "client", "index.html"),
      path.resolve(process.cwd(), "dist", "public", "index.html"),
    ];

    let template: string | null = null;
    for (const p of templatePaths) {
      if (fs.existsSync(p)) {
        template = fs.readFileSync(p, "utf-8");
        break;
      }
    }

    if (!template) return next();

    const meta = PAGE_META[routePath] || PAGE_META["/"];
    const html = injectMeta(template, meta);
    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  });

  return httpServer;
}
