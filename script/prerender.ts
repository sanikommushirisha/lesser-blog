// Build step: renders every marketing route to static HTML.
//
// Without this, every marketing page's first HTML response was an empty
// <div id="root"> that only JavaScript fills in. Google renders JavaScript
// late and unreliably; Bing and AI crawlers (GPTBot, PerplexityBot, ClaudeBot)
// mostly do not render it at all. Each route is rendered with the SSR build of
// client/src/entry-server.tsx, its meta from shared/page-meta.ts is written
// into the head, and the browser hydrates the result (client/src/main.tsx).
//
// Output: dist/prerendered/<route>.html (outside dist/public so express.static
// never serves it under a second URL) and dist/public/sitemap.xml.

import { mkdir, readFile, writeFile } from "fs/promises";
import { execFileSync } from "child_process";
import path from "path";
import { pathToFileURL } from "url";
import { BASE_URL, NOT_FOUND_META, PAGE_META, PRERENDER_ROUTES, SITEMAP_ROUTES } from "../shared/page-meta";
import { injectMeta, NOT_FOUND_FILE, prerenderFile } from "../server/static";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(DIST, "prerendered");

type Render = (pathname: string) => Promise<string>;

/** Sitemap lastmod: when the route's page component last changed in git. */
function lastModified(route: string, routesSource: string): string {
  const escaped = route.replace(/[/.*+?^${}()|[\]\\]/g, "\\$&");
  const file = routesSource.match(new RegExp(`path: "${escaped}", load: \\(\\) => import\\("@/pages/([^"]+)"\\)`))?.[1];
  if (file) {
    try {
      const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", `client/src/pages/${file}.tsx`], {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (date) return date;
    } catch {
      // Not a git checkout: fall through to the build date.
    }
  }
  return new Date().toISOString().slice(0, 10);
}

function sitemap(routesSource: string): string {
  const priority = (r: string) =>
    r === "/" ? "1.0" : /^\/(nris|business|services\/|marketplace)/.test(r) ? "0.9" : r.startsWith("/offers") ? "0.7" : /^\/(privacy|terms)$/.test(r) ? "0.3" : "0.6";
  const urls = SITEMAP_ROUTES.map(
    (r) => `  <url>
    <loc>${PAGE_META[r].canonical}</loc>
    <lastmod>${lastModified(r, routesSource)}</lastmod>
    <priority>${priority(r)}</priority>
  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * The SEO rules from CLAUDE.md, enforced: a page that breaks one fails the
 * build instead of quietly reaching Google.
 */
function checkMeta(routesSource: string) {
  const problems: string[] = [];
  for (const [route, m] of Object.entries(PAGE_META)) {
    const where = `PAGE_META["${route}"]`;
    if (m.canonical !== (route === "/" ? `${BASE_URL}/` : `${BASE_URL}${route}`)) problems.push(`${where}: canonical ${m.canonical}`);
    for (const [field, value] of Object.entries({ title: m.title, description: m.description, ogTitle: m.ogTitle, ogDescription: m.ogDescription })) {
      if (value.includes("\u2014")) problems.push(`${where}.${field} has an em-dash`);
    }
    if (m.robots) continue;
    if (m.title.length > 60 || m.title.length < 30) problems.push(`${where}.title is ${m.title.length} characters (30-60)`);
    if (!m.title.endsWith("| Lesser Tax")) problems.push(`${where}.title must end "| Lesser Tax"`);
    if (m.description.length > 160 || m.description.length < 120) problems.push(`${where}.description is ${m.description.length} characters (120-160)`);
  }
  const titles = Object.values(PAGE_META).map((m) => m.title);
  for (const t of new Set(titles)) if (titles.filter((x) => x === t).length > 1) problems.push(`duplicate title: ${t}`);
  // Every static route in the app needs its own entry, or it would be served as a 404.
  for (const [, route] of routesSource.matchAll(/path: "([^":]+)"/g)) {
    if (!PAGE_META[route]) problems.push(`route ${route} (client/src/routes.tsx) has no PAGE_META entry in shared/page-meta.ts`);
  }
  if (problems.length) throw new Error(`SEO check failed:\n  ${problems.join("\n  ")}`);
}

export async function prerender() {
  checkMeta(await readFile(path.join(ROOT, "client", "src", "routes.tsx"), "utf-8"));

  const shell = await readFile(path.join(DIST, "public", "index.html"), "utf-8");
  if (!shell.includes('<div id="root"></div>')) throw new Error("prerender: #root not found in index.html");

  const { render } = (await import(pathToFileURL(path.join(DIST, "server-render", "entry-server.js")).href)) as {
    render: Render;
  };

  const page = async (pathname: string, meta = PAGE_META[pathname]) => {
    const markup = await render(pathname);
    if (!markup.includes("<h1")) throw new Error(`prerender: ${pathname} rendered no <h1>`);
    return injectMeta(shell.replace('<div id="root"></div>', `<div id="root">${markup}</div>`), meta);
  };

  for (const route of PRERENDER_ROUTES) {
    const file = path.join(OUT, prerenderFile(route));
    await mkdir(path.dirname(file), { recursive: true });
    const html = await page(route);
    await writeFile(file, html);
    console.log(`prerendered ${route.padEnd(28)} ${(html.length / 1024).toFixed(0)} KB`);
  }
  await writeFile(path.join(OUT, NOT_FOUND_FILE), await page("/404-not-found", NOT_FOUND_META));

  const routesSource = await readFile(path.join(ROOT, "client", "src", "routes.tsx"), "utf-8");
  await writeFile(path.join(DIST, "public", "sitemap.xml"), sitemap(routesSource));
  console.log(`sitemap.xml: ${SITEMAP_ROUTES.length} URLs on ${BASE_URL}`);
}
