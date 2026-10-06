import http from "http";
import type { Express } from "express";

// In production nginx serves the Lesser app under lesser.tax/app, so the site
// calls it same-origin (e.g. /app/api/public/tax-experts). This mirrors that
// in development by forwarding /app/* to a locally running app, which has no
// basePath, so the /app prefix is stripped.
export function mountDevAppProxy(app: Express) {
  const target = new URL(process.env.LESSER_APP_ORIGIN || "http://localhost:3000");

  app.use("/app", (req, res) => {
    const upstream = http.request(
      {
        hostname: target.hostname,
        port: target.port,
        method: req.method,
        path: req.url, // already relative to the /app mount
        headers: { ...req.headers, host: target.host },
      },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
        upstreamRes.pipe(res);
      },
    );
    upstream.on("error", () => {
      if (!res.headersSent) {
        res.status(502).json({ error: `Lesser app not reachable at ${target.origin}` });
      }
    });
    req.pipe(upstream);
  });
}
