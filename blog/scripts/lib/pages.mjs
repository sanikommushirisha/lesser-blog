// Shared page-building helpers used by BOTH the full build (scripts/prerender.mjs)
// and the on-publish refresh (scripts/revalidate.mjs), so a post refreshed after a
// Sanity publish is byte-for-byte what a full build would have written.

import fs from 'node:fs'
import path from 'node:path'

// The blog is served under lesser.tax/blog, not on its own subdomain. Routes stay
// basename-relative ("/", "/<slug>") because they are written into dist/, which
// the server mounts at /blog, so only the public URLs carry the prefix.
export const SITE_URL = 'https://lesser.tax/blog'
export const url = (route) => `${SITE_URL}${route === '/' ? '' : route}`

// React 19 renders <title>, <meta> and <link> elements found anywhere in the tree
// as "hoistables": renderToString emits them first, at the start of the app's
// markup, and the browser moves them into <head> only once JavaScript runs.
// Crawlers read the raw HTML, where a description or canonical inside <body> is
// ignored. So the leading run of hoistables goes into <head> here. (React does not
// hydrate hoistables in place, so moving them is safe.)
const HOISTABLES = /^(?:<title>[^<]*<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*\/?>)+/

/** Returns buildPage(route, data) -> full HTML string, from the built template. */
export function createBuildPage({ template, render }) {
  return function buildPage(route, data) {
    const rendered = render(route, data)
    const hoisted = rendered.html.match(HOISTABLES)?.[0] ?? ''
    const html = rendered.html.slice(hoisted.length)
    const head = [rendered.head, hoisted.replace(/></g, '>\n    <')].filter(Boolean).join('\n    ')
    // JSON-encode initial data safely for an inline <script> (no </script> breakout)
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    return (
      template
        // Helmet supplies title/description per page; drop the static fallbacks
        .replace(/<title>[\s\S]*?<\/title>\n?/, '')
        .replace(/<meta\s+name="description"[\s\S]*?\/>\n?/, '')
        .replace('</head>', `    ${head}\n  </head>`)
        .replace(
          '<div id="root"></div>',
          `<div id="root">${html}</div>\n    <script>window.__INITIAL_DATA__=${json}</script>`
        )
    )
  }
}

/** sitemap.xml entries: the list page, every post, every watch page. */
export function sitemapUrls({ posts, videos }) {
  return [
    { loc: url('/'), lastmod: posts[0]?._updatedAt || posts[0]?.publishedAt },
    ...posts.map((p) => ({ loc: `${SITE_URL}/${p.slug}`, lastmod: p._updatedAt || p.publishedAt })),
    ...videos.map((v) => ({ loc: `${SITE_URL}/videos/${v.slug}`, lastmod: v.uploadDate })),
  ]
}

export function sitemapXml(urls) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`
    ),
    '</urlset>',
    '',
  ].join('\n')
}

/** Write via a temp file + rename so a reader never sees a half-written page. */
export function writeFileAtomic(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, content)
  fs.renameSync(tmp, file)
}
