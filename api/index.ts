/**
 * Vercel serverless entry point.
 *
 * server/index.ts is the long-lived server used by the Google Cloud deploy: it
 * calls httpServer.listen() at import time and serves every static file itself.
 * A serverless function can do neither, so this builds the same Express app
 * without listening and leaves static files to Vercel's filesystem layer, which
 * is checked BEFORE the rewrites in vercel.json. That means the marketing
 * bundle, the blog's prerendered HTML and both asset trees are served straight
 * from dist/public, and only what has no file on disk reaches this handler:
 *
 *   - POST /api/signups, POST /api/business-signups
 *   - GET  /get-started            (302 to the app's sign-up)
 *   - marketing SPA routes         (index.html + per-route meta injection)
 *
 * server/index.ts is deliberately untouched, so `npm start` still behaves
 * exactly as it does today.
 */
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "../server/routes";
import { PAGE_META, injectMeta } from "../server/static";

const app = express();
const httpServer = createServer(app);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// This file stays ESM (root package.json is "type": "module"), so __dirname
// does not exist here - resolve the module directory from import.meta instead.
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

// The HTML under these roots is bundled into the function by vercel.json's
// includeFiles. cwd is the project root inside the function, but the second
// candidate keeps this working if that ever changes.
const PUBLIC_ROOTS = [
  path.join(process.cwd(), "dist", "public"),
  path.join(MODULE_DIR, "..", "dist", "public"),
];

function readPublic(...segments: string[]): string | null {
  for (const root of PUBLIC_ROOTS) {
    const candidate = path.join(root, ...segments);
    if (candidate.startsWith(root) && fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, "utf-8");
    }
  }

  return null;
}

const ready = (async () => {
  await registerRoutes(httpServer, app);

  app.use(
    (err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Internal Server Error:", err);

      if (res.headersSent) {
        return next(err);
      }

      return res.status(status).json({ message });
    },
  );

  // Mirrors serveStatic's catch-all. Anything with a file extension that got
  // this far missed on disk, so it stays a 404 rather than being handed HTML
  // under a .js or .mp4 content type.
  app.use("/{*path}", (req: Request, res: Response) => {
    // Inside a mounted handler Express rewrites req.path relative to the mount
    // point, which is "/" for every request here. originalUrl keeps the real
    // path, which is what the blog lookup and the meta table both key off.
    const pathname = (req.originalUrl || req.url || "/").split("?")[0];

    if (path.extname(pathname)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    // serveBlog's job: prefer the route's own prerendered file, fall back to
    // the blog shell. Without this /blog/studio and any un-prerendered blog
    // route would be answered with the marketing shell instead.
    if (pathname === "/blog" || pathname.startsWith("/blog/")) {
      const slug = pathname.slice("/blog".length);
      const html =
        readPublic("blog", slug, "index.html") ??
        readPublic("blog", "index.html");

      if (!html) {
        res
          .status(503)
          .type("text/plain")
          .send('Blog is not built. Run "npm run build:blog".');
        return;
      }

      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-cache");
      res.send(html);
      return;
    }

    const shell = readPublic("index.html");
    if (!shell) {
      res
        .status(500)
        .type("text/plain")
        .send("Build output missing: dist/public/index.html");
      return;
    }

    const meta = PAGE_META[pathname] || PAGE_META["/"];

    res.setHeader("Content-Type", "text/html");
    res.send(injectMeta(shell, meta));
  });
})();

export default async function handler(req: Request, res: Response) {
  await ready;
  return app(req, res);
}
