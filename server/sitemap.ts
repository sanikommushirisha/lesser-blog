// /sitemap.xml: ONE sitemap for the whole site, built when it is requested
// (cached for a few minutes) instead of at build time. Posts are published
// every day, so a file written at deploy time went stale within a day.
//
// Contents, in this order before sorting by priority (highest first):
//   1. Marketing pages: every PAGE_META route without `robots`, lastmod from git
//      (dist/sitemap-lastmod.json, written by script/prerender.ts).
//   2. The blog list, then every published post fetched from Sanity, with the
//      post's _updatedAt as lastmod.
//   3. The blog's video watch pages (also in /blog/video-sitemap.xml, which
//      stays separate because it carries the video metadata).
//
// Only canonical URLs that answer 200 go in, so a post is listed only once its
// prerendered page exists (the build or the Sanity publish webhook writes it).
// If Sanity cannot be reached, the last good list is reused, and before the
// first success the blog's own sitemap.xml on disk is used.

import type { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { BASE_URL, PAGE_META, SITEMAP_ROUTES } from "../shared/page-meta";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  priority: number;
}

interface SanityPost {
  slug: string;
  _updatedAt: string;
}

const BLOG_URL = `${BASE_URL}/blog`;

/**
 * Never listed, whatever PAGE_META says: the employer offer pages that are
 * noindex (same page with the company name swapped), the app and Sanity Studio.
 * The blog's /r/ share pages and /guides PDFs are noindex too.
 */
const EXCLUDED = [
  /^\/offers\/(google|nextdoor|broadcom|coupa)$/,
  /^\/app(\/|$)/,
  /^\/blog\/(studio|r|guides)(\/|$)/,
];

export function isExcluded(pathname: string): boolean {
  return EXCLUDED.some((r) => r.test(pathname));
}

/** Priority per path. The file is ordered by it, highest first. */
export function priorityFor(pathname: string): number {
  if (pathname === "/") return 1.0;
  if (/^\/(nris|business|services\/|marketplace)/.test(pathname)) return 0.9;
  if (pathname === "/blog") return 0.8;
  if (pathname.startsWith("/blog/videos/")) return 0.6;
  if (pathname.startsWith("/blog/") || pathname.startsWith("/offers/")) return 0.7;
  if (/^\/(privacy|terms)$/.test(pathname)) return 0.3;
  return 0.6;
}

const entry = (loc: string, lastmod?: string): SitemapEntry => ({
  loc,
  lastmod,
  priority: priorityFor(new URL(loc).pathname),
});

const escapeXml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function sitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(
    (e) =>
      `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n` +
      (e.lastmod ? `    <lastmod>${escapeXml(e.lastmod)}</lastmod>\n` : "") +
      `    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

/** Marketing pages, in PAGE_META order. */
export function pageEntries(lastmod: Record<string, string>): SitemapEntry[] {
  return SITEMAP_ROUTES.map((r) => entry(PAGE_META[r].canonical, lastmod[r]));
}

// Same filter as the blog's own fetchPosts() (blog/src/lib/sanity.ts): a post is
// live once its publishedAt has passed. Drafts are never returned without a token,
// but are excluded explicitly anyway.
const POSTS_QUERY =
  '*[_type == "post" && defined(slug.current) && publishedAt <= now() && !(_id in path("drafts.**"))]' +
  ' | order(publishedAt desc) { "slug": slug.current, _updatedAt }';

async function fetchSanityPosts(): Promise<SanityPost[]> {
  // Public identifiers (also baked into the blog bundle), not secrets.
  const projectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "1mxaoto5";
  const dataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
  const url = `https://${projectId}.apicdn.sanity.io/v2026-06-01/data/query/${dataset}?query=${encodeURIComponent(POSTS_QUERY)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Sanity answered ${res.status}`);
  const { result } = (await res.json()) as { result?: unknown };
  if (!Array.isArray(result)) throw new Error("Sanity sent no result list");
  const posts = result.filter(
    (p): p is SanityPost => typeof p?.slug === "string" && typeof p?._updatedAt === "string",
  );
  // Same guard as the blog build: an empty answer is a fault, not "no posts".
  if (!posts.length) throw new Error("Sanity returned no posts");
  return posts;
}

/** <url> blocks of a sitemap file on disk, as [loc, date] pairs. */
function readSitemapFile(file: string, dateTag: string): [string, string | undefined][] {
  let xml: string;
  try {
    xml = fs.readFileSync(file, "utf-8");
  } catch {
    return [];
  }
  return Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g)).flatMap(([, block]) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const date = block.match(new RegExp(`<${dateTag}>([^<]+)</${dateTag}>`))?.[1];
    return loc ? [[loc, date] as [string, string | undefined]] : [];
  });
}

/** Posts as listed in the blog's own sitemap.xml (kept fresh by the publish webhook). */
function postsFromBlogSitemap(blogDir: string): SanityPost[] {
  return readSitemapFile(path.join(blogDir, "sitemap.xml"), "lastmod").flatMap(([loc, lastmod]) => {
    const slug = loc.startsWith(`${BLOG_URL}/`) ? loc.slice(BLOG_URL.length + 1) : "";
    return slug && !slug.includes("/") ? [{ slug, _updatedAt: lastmod ?? "" }] : [];
  });
}

/** Whether the blog has a prerendered page for this slug, i.e. /blog/<slug> answers 200. */
function hasPage(blogDir: string, slug: string): boolean {
  const file = path.resolve(blogDir, slug, "index.html");
  return file.startsWith(blogDir + path.sep) && fs.existsSync(file);
}

export function buildEntries(opts: {
  pages: SitemapEntry[];
  posts: SanityPost[];
  blogDir: string;
}): SitemapEntry[] {
  const { pages, posts, blogDir } = opts;
  const live = posts.filter((p) => hasPage(blogDir, p.slug));
  const newest = live.reduce<string | undefined>(
    (max, p) => (p._updatedAt && (!max || p._updatedAt > max) ? p._updatedAt : max),
    undefined,
  );
  const videos = readSitemapFile(path.join(blogDir, "video-sitemap.xml"), "video:publication_date")
    .filter(([loc]) => loc.startsWith(`${BLOG_URL}/videos/`))
    .map(([loc, date]) => entry(loc, date));

  const all = [
    ...pages,
    ...(fs.existsSync(path.join(blogDir, "index.html")) ? [entry(BLOG_URL, newest)] : []),
    ...live.map((p) => entry(`${BLOG_URL}/${p.slug}`, p._updatedAt || undefined)),
    ...videos,
  ];
  const seen = new Set<string>();
  return all
    .filter((e) => !isExcluded(new URL(e.loc).pathname) && !seen.has(e.loc) && seen.add(e.loc))
    .sort((a, b) => b.priority - a.priority); // stable: equal priorities keep the order above
}

const FRESH_MS = 10 * 60 * 1000;
const RETRY_MS = 60 * 1000;

/**
 * Serves /sitemap.xml. Mounted before the static files, so it replaces the
 * build-time file this site used to ship.
 */
export function mountSitemap(app: Express, opts: { blogDir: string; lastmodFile: string }) {
  const blogDir = path.resolve(opts.blogDir);
  let lastmod: Record<string, string> = {};
  try {
    lastmod = JSON.parse(fs.readFileSync(opts.lastmodFile, "utf-8"));
  } catch {
    // Development, or a build without the prerender step: pages go out without lastmod.
  }
  const pages = pageEntries(lastmod);

  let cache: { xml: string; until: number } | null = null;
  let lastGoodPosts: SanityPost[] | null = null;
  let building: Promise<string> | null = null;

  async function build(): Promise<string> {
    let posts: SanityPost[];
    let freshFor = FRESH_MS;
    try {
      posts = lastGoodPosts = await fetchSanityPosts();
    } catch (err) {
      console.error(`[sitemap] Sanity fetch failed, using the last good list: ${(err as Error).message}`);
      posts = lastGoodPosts ?? postsFromBlogSitemap(blogDir);
      freshFor = RETRY_MS;
    }
    const xml = sitemapXml(buildEntries({ pages, posts, blogDir }));
    cache = { xml, until: Date.now() + freshFor };
    return xml;
  }

  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    let xml = cache && Date.now() < cache.until ? cache.xml : null;
    if (!xml) {
      building ??= build().finally(() => {
        building = null;
      });
      xml = await building;
    }
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(xml);
  });
}
