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

// Watch pages (/videos/:slug) — video is the PRIMARY content of these URLs,
// which is what makes them eligible for Google video rich results.
const { VIDEOS } = await import(path.join(root, 'dist-server/entry-server.js')).then((m) => ({ VIDEOS: m.VIDEOS ?? [] })).catch(() => ({ VIDEOS: [] }))
for (const v of VIDEOS) {
  const route = `/videos/${v.slug}`
  const outDir = path.join(dist, 'videos', v.slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(route, { route }))
  console.log(`prerendered ${route}`)
}

// Personalized share pages (/r/:combo). Prerendered so WhatsApp/social read
// real OpenGraph + VideoObject tags (rich video preview), but deliberately
// noindex (in the page's own <meta robots>) and OMITTED from both sitemaps —
// they are share landings, not 64 templated SEO doorway pages.
const { RENEWAL_VIDEOS } = await import(path.join(root, 'dist-server/entry-server.js')).then((m) => ({ RENEWAL_VIDEOS: m.RENEWAL_VIDEOS ?? {} })).catch(() => ({ RENEWAL_VIDEOS: {} }))
for (const slug of Object.keys(RENEWAL_VIDEOS)) {
  const route = `/r/${slug}`
  const outDir = path.join(dist, 'r', slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(route, { route }))
}
console.log(`prerendered ${Object.keys(RENEWAL_VIDEOS).length} /r/ share pages (noindex, not in sitemap)`)

// sitemap.xml
const urls = [
  { loc: `${SITE_URL}/`, lastmod: posts[0]?.publishedAt },
  ...posts.map((p) => ({ loc: `${SITE_URL}/${p.slug}`, lastmod: p.publishedAt })),
  ...VIDEOS.map((v) => ({ loc: `${SITE_URL}/videos/${v.slug}`, lastmod: v.uploadDate })),
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

// video-sitemap.xml (Google video sitemap extension)
if (VIDEOS.length) {
  const vs = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    ...VIDEOS.map((v) => `  <url><loc>${SITE_URL}/videos/${v.slug}</loc><video:video><video:thumbnail_loc>${SITE_URL}${v.poster}</video:thumbnail_loc><video:title>${v.title.replace(/&/g,'&amp;')}</video:title><video:description>${v.description.replace(/&/g,'&amp;')}</video:description><video:content_loc>${SITE_URL}${v.mp4}</video:content_loc><video:publication_date>${v.uploadDate}</video:publication_date></video:video></url>`),
    '</urlset>',
    '',
  ].join('\n')
  fs.writeFileSync(path.join(dist, 'video-sitemap.xml'), vs)
  console.log(`wrote video-sitemap.xml (${VIDEOS.length} videos)`)
}

// Bing URL Submission API: push the URL set straight into Bing's crawl queue on
// each build. Auth is the BWT API key (Vercel env BING_WEBMASTER_API_KEY) — no
// hosted key file, so it can't hit IndexNow's key-association 403. Best-effort:
// failures log and never fail the build.
const BING_API_KEY = process.env.BING_WEBMASTER_API_KEY
if (BING_API_KEY) {
  try {
    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${BING_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl: `${SITE_URL}/`, urlList: urls.map((u) => u.loc) }),
      }
    )
    console.log(`Bing SubmitUrlBatch: ${res.status} (${urls.length} urls)`)
  } catch (e) {
    console.warn(`Bing SubmitUrlBatch failed (non-fatal): ${e.message}`)
  }
} else {
  console.warn('Bing SubmitUrlBatch skipped: BING_WEBMASTER_API_KEY not set')
}

// IndexNow: legacy secondary ping for Yandex/other engines. The key file lives at
// public/<key>.txt; Bing has twice dropped the key association (403
// UserForbiddedToAccessSite), which is why SubmitUrlBatch above is the primary path.
const INDEXNOW_KEY = '38dcaec0900d4e9a86f958fea904473e'
try {
  const host = new URL(SITE_URL).host
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls.map((u) => u.loc),
    }),
  })
  console.log(`IndexNow ping: ${res.status} (${urls.length} urls submitted to Bing/Yandex)`)
} catch (e) {
  console.warn(`IndexNow ping failed (non-fatal): ${e.message}`)
}
