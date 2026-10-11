import { useEffect } from "react";

// Page meta for in-app navigation. Crawlers get each route's meta from the
// server (PAGE_META in server/static.ts, injected into the first HTML
// response); this keeps the document in step when the user arrives by a
// client-side link instead.
//
// Updates the tags index.html already has rather than adding new ones.
// react-helmet appends its own copies next to the server-injected tags, which
// leaves two canonicals and two descriptions in the page.

export type PageMeta = {
  title: string;
  description: string;
  /** Absolute URL, e.g. https://lesser.tax/marketplace */
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
};

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

export function usePageMeta(m: PageMeta) {
  useEffect(() => {
    const ogTitle = m.ogTitle ?? m.title;
    const ogDescription = m.ogDescription ?? m.description;

    document.title = m.title;
    setTag('meta[name="description"]', meta("name", "description"), "content", m.description);
    setTag(
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
    setTag('meta[property="og:title"]', meta("property", "og:title"), "content", ogTitle);
    setTag('meta[property="og:description"]', meta("property", "og:description"), "content", ogDescription);
    setTag('meta[name="twitter:title"]', meta("name", "twitter:title"), "content", ogTitle);
    setTag('meta[name="twitter:description"]', meta("name", "twitter:description"), "content", ogDescription);
    if (m.ogImage) {
      setTag('meta[property="og:image"]', meta("property", "og:image"), "content", m.ogImage);
      setTag('meta[name="twitter:image"]', meta("name", "twitter:image"), "content", m.ogImage);
    }
  }, [m.title, m.description, m.canonical, m.ogTitle, m.ogDescription, m.ogImage]);
}
