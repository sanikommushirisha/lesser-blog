import { useEffect } from "react";
import { useLocation } from "wouter";
import { NOT_FOUND_META, routeMeta, type PageMeta } from "@shared/page-meta";

// Page meta for in-app navigation. Crawlers and the first page load get each
// route's meta in the HTML itself (PAGE_META in shared/page-meta.ts, written by
// the server and the build-time prerender); this keeps the document in step
// when the user moves to another page by a client-side link.
//
// It updates the tags index.html already has rather than adding new ones, so a
// page never ends up with two canonicals or two descriptions. Pages do not set
// their own meta: add or change a route's entry in shared/page-meta.ts.

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: "name" | "property", value: string) => () => {
  const el = document.createElement("meta");
  el.setAttribute(key, value);
  return el;
};

function applyMeta(m: PageMeta) {
  document.title = m.title;
  setTag('meta[name="description"]', meta("name", "description"), "content", m.description);
  // The 404 page has no canonical: it is not a page of its own.
  if (!m.canonical) document.head.querySelector('link[rel="canonical"]')?.remove();
  else setTag(
    'link[rel="canonical"]',
    () => {
      const el = document.createElement("link");
      el.rel = "canonical";
      return el;
    },
    "href",
    m.canonical,
  );
  setTag('meta[property="og:url"]', meta("property", "og:url"), "content", m.canonical);
  setTag('meta[property="og:title"]', meta("property", "og:title"), "content", m.ogTitle);
  setTag('meta[property="og:description"]', meta("property", "og:description"), "content", m.ogDescription);
  setTag('meta[property="og:image"]', meta("property", "og:image"), "content", m.ogImage);
  setTag('meta[name="twitter:title"]', meta("name", "twitter:title"), "content", m.ogTitle);
  setTag('meta[name="twitter:description"]', meta("name", "twitter:description"), "content", m.ogDescription);
  setTag('meta[name="twitter:image"]', meta("name", "twitter:image"), "content", m.ogImage);
  setTag('meta[name="robots"]', meta("name", "robots"), "content", m.robots ?? "index,follow");
}

/** Keeps <head> in step with the current route. Rendered once, in App. */
export function RouteMeta() {
  const [location] = useLocation();
  useEffect(() => {
    applyMeta(routeMeta(location) ?? NOT_FOUND_META);
  }, [location]);
  return null;
}
