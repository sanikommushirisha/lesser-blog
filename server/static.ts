import express, { type Express, type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import fs from "fs";
import path from "path";
import { NOT_FOUND_META, normalizePath, routeMeta, type PageMeta } from "../shared/page-meta";

export { PAGE_META } from "../shared/page-meta";
export type { PageMeta } from "../shared/page-meta";

/** Meta for a request URL, or the 404 page's when the site has no such page. */
export function metaFor(originalUrl: string): { meta: PageMeta; status: 200 | 404 } {
  const meta = routeMeta(originalUrl);
  return meta ? { meta, status: 200 } : { meta: NOT_FOUND_META, status: 404 };
}

const escapeAttr = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeText = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Writes a route's meta into the HTML shell (client/index.html or its build):
 * title, description, robots, canonical, OG/Twitter tags and JSON-LD. Used by
 * the build-time prerender, the production server and the dev server, so all
 * three send the same head.
 */
export function injectMeta(html: string, meta: PageMeta): string {
  const set = (pattern: RegExp, tag: string) => {
    html = html.replace(pattern, tag);
  };
  const attr = (selector: string, value: string) =>
    set(new RegExp(`<meta ${selector} content="[^"]*"`), `<meta ${selector} content="${escapeAttr(value)}"`);

  set(/<title>[^<]*<\/title>/, `<title>${escapeText(meta.title)}</title>`);
  attr('name="description"', meta.description);
  attr('name="robots"', meta.robots ?? "index,follow,max-image-preview:large");
  attr('property="og:title"', meta.ogTitle);
  attr('property="og:description"', meta.ogDescription);
  attr('property="og:image"', meta.ogImage);
  attr('name="twitter:title"', meta.ogTitle);
  attr('name="twitter:description"', meta.ogDescription);
  attr('name="twitter:image"', meta.ogImage);

  if (meta.canonical) {
    attr('property="og:url"', meta.canonical);
    set(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${escapeAttr(meta.canonical)}"`);
  } else {
    // The 404 page has no URL of its own.
    set(/\s*<meta property="og:url" content="[^"]*" \/>/, "");
    set(/\s*<link rel="canonical" href="[^"]*" \/>/, "");
  }

  if (meta.jsonLd?.length) {
    // "<" is escaped so a value can never close the script tag early.
    const blocks = meta.jsonLd
      .map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`)
      .join("\n    ");
    html = html.replace("</head>", `    ${blocks}\n  </head>`);
  }

  return html;
}

/** Where the build writes a route's prerendered page, relative to dist/prerendered. */
export function prerenderFile(route: string): string {
  return route === "/" ? "index.html" : `${route.slice(1)}.html`;
}
export const NOT_FOUND_FILE = "404.html";

/**
 * Response headers that apply to every response: basic hardening plus HSTS
 * (the site is HTTPS-only; nginx redirects http).
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

/**
 * Static file options: Vite's content-hashed bundles (assets/) never change
 * under the same name, so browsers may keep them for a year; other public
 * files (images, sitemaps) are revalidated daily; HTML is always revalidated.
 */
function staticOptions(): Parameters<typeof express.static>[1] {
  return {
    index: false,
    redirect: false,
    setHeaders(res, filePath) {
      if (/[\\/]assets[\\/]/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    },
  };
}

/**
 * Mounts the blog sub-app at /blog. It keeps its own dependency tree and build
 * (React 19 / Tailwind 4 / Vite 8, versus React 18 / Tailwind 3 / Vite 7 here),
 * so this only has to serve what its build emits.
 *
 * That build prerenders real HTML per route — dist/index.html for the list,
 * dist/<slug>/index.html per post, dist/videos/<slug>/ and dist/r/<combo>/ —
 * which is the whole point of the blog's SEO setup. So a request has to resolve
 * to its own prerendered file where one exists. A path with no file is not a
 * post (posts are prerendered at build time), so it gets the SPA shell with a
 * 404 status and noindex, except Studio, which is client-only.
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
  app.use("/blog", express.static(blogPath, staticOptions()));

  app.use("/blog", (req: Request, res: Response) => {
    // A miss on a real asset path stays a 404 - returning HTML there would hand
    // the browser markup with a .js or .mp4 content type.
    if (path.extname(req.path)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    const prerendered = path.resolve(blogPath, "." + req.path, "index.html");
    const found = prerendered.startsWith(blogPath) && fs.existsSync(prerendered);
    const isStudio = req.path === "/studio" || req.path.startsWith("/studio/");

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-cache");
    if (found) {
      res.send(fs.readFileSync(prerendered, "utf-8"));
      return;
    }
    let html = fs.readFileSync(shellPath, "utf-8");
    if (!isStudio) {
      res.status(404);
      html = blogNotFound(html);
    }
    res.send(html);
  });
}

/** The blog shell as a 404: noindex, and no canonical pointing at /blog. */
function blogNotFound(html: string): string {
  return html
    .replace(/<title>[^<]*<\/title>/, "<title>Page Not Found | Lesser Tax</title>")
    .replace(/\s*<link rel="canonical"[^>]*>/, "")
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace("</head>", '  <meta name="robots" content="noindex" />\n  </head>');
}

/**
 * Marketing pages. The build prerenders every route in PAGE_META to
 * dist/prerendered/ (script/prerender.ts): full page markup plus that route's
 * meta, so crawlers that do not run JavaScript still see the content. They are
 * read once at startup and served from memory.
 *
 * Unknown paths get the prerendered 404 page with a real 404 status, so Google
 * does not index them as copies of the home page. Dynamic routes without a
 * prerendered page (tax-expert profiles) get the shell with their meta.
 */
export function marketingPages(distPath: string, prerenderedPath: string) {
  const cache = new Map<string, string>();
  const read = (file: string) => {
    let html = cache.get(file);
    if (html === undefined) {
      const full = path.resolve(prerenderedPath, file);
      html = full.startsWith(prerenderedPath) && fs.existsSync(full) ? fs.readFileSync(full, "utf-8") : "";
      cache.set(file, html);
    }
    return html || null;
  };
  const shell = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  return (req: Request, res: Response) => {
    const pathname = new URL(req.originalUrl, "http://x").pathname;

    // A miss on a file path (a removed bundle, a typo'd image) is a plain 404,
    // never an HTML page under a .js or .png URL.
    if (path.extname(pathname)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    // One URL per page: /nris/ -> /nris.
    const route = normalizePath(pathname);
    if (route !== pathname && routeMeta(route)) {
      const q = req.originalUrl.indexOf("?");
      res.redirect(301, route + (q >= 0 ? req.originalUrl.slice(q) : ""));
      return;
    }

    const { meta, status } = metaFor(route);
    const html =
      (status === 200 ? read(prerenderFile(route)) : read(NOT_FOUND_FILE)) ?? injectMeta(shell, meta);

    res.status(status);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.send(html);
  };
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // gzip for HTML, JS, CSS, JSON, SVG and XML; nginx in front passes it through.
  app.use(compression());
  app.use(securityHeaders);

  // Mounted before express.static and the marketing catch-all below, so
  // /blog/:slug and /blog/studio/* resolve to the blog rather than the
  // marketing shell.
  serveBlog(app, path.resolve(distPath, "blog"));

  // The build's index.html is the empty shell: never serve it as a page.
  app.get("/index.html", (_req: Request, res: Response) => res.redirect(301, "/"));
  app.use(express.static(distPath, staticOptions()));

  app.use("/{*path}", marketingPages(distPath, path.resolve(__dirname, "prerendered")));
}
