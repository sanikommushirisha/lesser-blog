import https from "https";
import type { Express, Request } from "express";

// Same-origin PostHog proxy (LES-265): the site and blog send analytics to
// lesser.tax/ingest instead of us.i.posthog.com, which ad-blockers drop. The
// app (lesser.tax/app) has its own at /app/ingest.
//
// Only the headers PostHog needs go up: never the visitor's cookies (the app's
// session cookie lives on the same domain). X-Forwarded-For is nginx's, so
// PostHog's GeoIP still sees the visitor rather than this server.

const API_HOST = "us.i.posthog.com";
const ASSETS_HOST = "us-assets.i.posthog.com";
const FORWARD_REQUEST_HEADERS = ["content-type", "content-encoding", "content-length", "user-agent", "accept", "accept-encoding"];
const FORWARD_RESPONSE_HEADERS = ["content-type", "content-encoding", "content-length", "cache-control", "vary"];

/** Upstream host for a path below /ingest. Scripts and remote config come from the assets CDN. */
export function ingestHost(path: string): string {
  return /^\/(static|array)\//.test(path) ? ASSETS_HOST : API_HOST;
}

export function upstreamHeaders(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers[name];
    if (typeof value === "string") out[name] = value;
  }
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" && forwarded) || req.socket.remoteAddress;
  if (ip) out["x-forwarded-for"] = ip;
  return out;
}

export function mountPostHogProxy(app: Express) {
  app.use("/ingest", (req, res) => {
    const host = ingestHost(req.url);
    const upstream = https.request(
      {
        hostname: host,
        method: req.method,
        path: req.url, // already relative to the /ingest mount, query included
        headers: { ...upstreamHeaders(req), host },
      },
      (upstreamRes) => {
        const headers: Record<string, string | string[]> = {};
        for (const name of FORWARD_RESPONSE_HEADERS) {
          const value = upstreamRes.headers[name];
          if (value !== undefined) headers[name] = value;
        }
        res.writeHead(upstreamRes.statusCode ?? 502, headers);
        upstreamRes.pipe(res);
      },
    );
    upstream.setTimeout(30_000, () => upstream.destroy());
    upstream.on("error", () => {
      if (!res.headersSent) res.status(502).end();
      else res.end();
    });
    req.pipe(upstream);
  });
}
