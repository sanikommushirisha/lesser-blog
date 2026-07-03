#!/usr/bin/env node
// Build-time prerender: emits real HTML (content + meta + JSON-LD) for the blog
// list and every published post, plus sitemap.xml. Crawlers that do not execute
// JavaScript (bingbot, PerplexityBot, GPTBot, ClaudeBot) need this — the SPA
// shell alone is invisible to them.
//
// Runs after `vite build` (client) and `vite build --ssr` (server bundle):
//   dist/         client build, used as the HTML template + final output dir
//   dist-server/  entry-server.js with render() + Sanity fetchers

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const SITE_URL = 'https://blog.lesser.tax'

const { render, fetchPosts, fetchPost, fetchMorePosts } = await import(
  path.join(root, 'dist-server/entry-server.js')
)

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

function buildPage(route, data) {
  const { html, head } = render(route, data)
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

const posts = await fetchPosts()
if (!posts?.length) {
  console.error('prerender: fetchPosts returned no posts — refusing to emit an empty site')
  process.exit(1)
}

// Blog list at /
fs.writeFileSync(path.join(dist, 'index.html'), buildPage('/', { route: '/', posts }))
console.log(`prerendered / (${posts.length} posts on list)`)

// Each post at /<slug>/index.html
for (const item of posts) {
  const [post, more] = await Promise.all([fetchPost(item.slug), fetchMorePosts(item.slug)])
  if (!post) {
    console.warn(`prerender: skipping ${item.slug} — fetchPost returned null`)
    continue
  }
  const route = `/${item.slug}`
  const outDir = path.join(dist, item.slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(route, { route, post, more }))
  console.log(`prerendered ${route}`)
}

// sitemap.xml
const urls = [
  { loc: `${SITE_URL}/`, lastmod: posts[0]?.publishedAt },
  ...posts.map((p) => ({ loc: `${SITE_URL}/${p.slug}`, lastmod: p.publishedAt })),
]
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`
  ),
  '</urlset>',
  '',
].join('\n')
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
console.log(`wrote sitemap.xml (${urls.length} urls)`)
