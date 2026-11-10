#!/usr/bin/env node
// Build-time prerender: emits real HTML (content + meta + JSON-LD) for the blog
// list and every published post, plus sitemap.xml. Crawlers that do not execute
// JavaScript (bingbot, PerplexityBot, GPTBot, ClaudeBot) need this â€” the SPA
// shell alone is invisible to them.
//
// Runs after `vite build` (client) and `vite build --ssr` (server bundle):
//   dist/         client build, used as the HTML template + final output dir
//   dist-server/  entry-server.js with render() + Sanity fetchers

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SITE_URL, createBuildPage, sitemapUrls, sitemapXml } from './lib/pages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
// pathToFileURL, not a bare path: dynamic import() of a Windows absolute path
// ("C:\...") is rejected as an unsupported URL scheme, so local builds on
// Windows would fail here even though CI on Linux is fine.
const entryServer = pathToFileURL(path.join(root, 'dist-server/entry-server.js')).href

const { render, fetchPosts, fetchPost, fetchMorePosts } = await import(entryServer)

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

// dist/index.html is overwritten with the rendered list page below, so keep the
// pristine shell next to the server bundle. scripts/revalidate.mjs (the on-publish
// refresh) renders pages from it without needing a full build.
fs.writeFileSync(path.join(root, 'dist-server', 'template.html'), template)

const buildPage = createBuildPage({ template, render })

const posts = await fetchPosts()
if (!posts?.length) {
  console.error('prerender: fetchPosts returned no posts â€” refusing to emit an empty site')
  process.exit(1)
}

// Blog list at /
fs.writeFileSync(path.join(dist, 'index.html'), buildPage('/', { route: '/', posts }))
console.log(`prerendered / (${posts.length} posts on list)`)

// Each post at /<slug>/index.html
for (const item of posts) {
  const [post, more] = await Promise.all([fetchPost(item.slug), fetchMorePosts(item.slug)])
  if (!post) {
    console.warn(`prerender: skipping ${item.slug} â€” fetchPost returned null`)
    continue
  }
  const route = `/${item.slug}`
  const outDir = path.join(dist, item.slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(route, { route, post, more }))
  console.log(`prerendered ${route}`)
}

// Watch pages (/videos/:slug) â€” video is the PRIMARY content of these URLs,
// which is what makes them eligible for Google video rich results.
const { VIDEOS } = await import(entryServer).then((m) => ({ VIDEOS: m.VIDEOS ?? [] })).catch(() => ({ VIDEOS: [] }))
for (const v of VIDEOS) {
  const route = `/videos/${v.slug}`
  const outDir = path.join(dist, 'videos', v.slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(route, { route }))
  console.log(`prerendered ${route}`)
}

// Personalized share pages (/r/:combo). Prerendered so WhatsApp/social read
// real OpenGraph + VideoObject tags (rich video preview), but deliberately
// noindex (in the page's own <meta robots>) and OMITTED from both sitemaps â€”
// they are share landings, not 64 templated SEO doorway pages.
const { RENEWAL_VIDEOS } = await import(entryServer).then((m) => ({ RENEWAL_VIDEOS: m.RENEWAL_VIDEOS ?? {} })).catch(() => ({ RENEWAL_VIDEOS: {} }))
for (const slug of Object.keys(RENEWAL_VIDEOS)) {
  const route = `/r/${slug}`
  const outDir = path.join(dist, 'r', slug)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), buildPage(route, { route }))
}
console.log(`prerendered ${Object.keys(RENEWAL_VIDEOS).length} /r/ share pages (noindex, not in sitemap)`)

// sitemap.xml
const urls = sitemapUrls({ posts, videos: VIDEOS })
const sitemap = sitemapXml(urls)
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
// each build. Auth is the BWT API key (Vercel env BING_WEBMASTER_API_KEY) â€” no
// hosted key file, so it can't hit IndexNow's key-association 403. Best-effort:
// failures log and never fail the build.
// Only from a real deploy build. A developer running `npm run build` locally
// should not be announcing URLs to Bing/Yandex - especially while /blog is not
// live yet, which would submit URLs that currently 404. Set SUBMIT_URLS=1 to
// force it.
const SUBMIT_URLS = Boolean(
  process.env.VERCEL || process.env.CI || process.env.SUBMIT_URLS,
)

const BING_API_KEY = SUBMIT_URLS ? process.env.BING_WEBMASTER_API_KEY : null
if (!SUBMIT_URLS) {
  console.log('local build: skipping Bing + IndexNow submission (set SUBMIT_URLS=1 to force)')
}
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
if (SUBMIT_URLS) try {
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
