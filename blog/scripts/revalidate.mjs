#!/usr/bin/env node
// On-publish refresh: re-renders ONE post, the blog list and the sitemaps from
// live Sanity data, without a CI run or a rebuild. Called by the Lesser app's
// Sanity webhook (app/api/webhooks/sanity) on the same server.
//
//   node scripts/revalidate.mjs --slug=<slug> [--previous=<old-slug>]
//   node scripts/revalidate.mjs --all    (list + sitemaps, and any published post
//                                         that has no page yet, e.g. one that was
//                                         dated in the future when it was built)
//
// Needs the output of a normal build on this machine: the served files and
// dist-server/ (entry-server.js + template.html). Safe to run while the site is
// serving: every file is written to a temp name and renamed.
//
// WHERE IT WRITES: the folder the Express server actually serves at /blog. In
// production that is <repo>/dist/public/blog (a COPY of blog/dist made by
// script/build.ts), so it is used when it exists. Otherwise (the blog built on
// its own) blog/dist. BLOG_OUT_DIR overrides both.
//
// Like the full build, only posts Sanity lists as published (publishedAt in the
// past) get a page. A post Sanity no longer lists (unpublished, deleted, or dated
// in the future) has its static page removed, so it 404s like any unknown path.
// Exit code 0 = refreshed, non-zero = nothing was changed or it failed part way
// (stderr says why).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createBuildPage, sitemapUrls, sitemapXml, writeFileAtomic } from './lib/pages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const servedByServer = path.resolve(root, '..', 'dist', 'public', 'blog')
const dist = process.env.BLOG_OUT_DIR
  ? path.resolve(process.env.BLOG_OUT_DIR)
  : fs.existsSync(path.join(servedByServer, 'index.html'))
    ? servedByServer
    : path.join(root, 'dist')
const distServer = path.join(root, 'dist-server')

// Top-level folders in dist/ that are not posts. A slug equal to one of these must
// never be written or deleted by this script.
const RESERVED = new Set(['assets', 'videos', 'r', 'guides', 'studio', 'public', 'sanity'])
const SLUG = /^[a-z0-9][a-z0-9-]{0,199}$/

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=')
    return [k, v.length ? v.join('=') : true]
  })
)

function fail(msg) {
  console.error(`revalidate: ${msg}`)
  process.exit(1)
}

function checkSlug(label, value) {
  if (typeof value !== 'string' || !SLUG.test(value) || RESERVED.has(value)) {
    fail(`${label} "${value}" is not a valid post slug`)
  }
  return value
}

const slug = args.slug ? checkSlug('slug', args.slug) : null
const previous = args.previous && args.previous !== slug ? checkSlug('previous', args.previous) : null
if (!slug && !args.all) fail('pass --slug=<slug> or --all')

const templatePath = path.join(distServer, 'template.html')
const entryPath = path.join(distServer, 'entry-server.js')
if (!fs.existsSync(templatePath) || !fs.existsSync(entryPath) || !fs.existsSync(path.join(dist, 'index.html'))) {
  fail(`no build found (${dist} and ${distServer} must come from a build)`)
}

const { render, fetchPosts, fetchPost, fetchMorePosts, VIDEOS = [] } = await import(
  pathToFileURL(entryPath).href
)
const buildPage = createBuildPage({ template: fs.readFileSync(templatePath, 'utf8'), render })

// Same guard as the full build: never replace the site with an empty one.
const posts = await fetchPosts()
if (!posts?.length) fail('Sanity returned no posts, leaving the site untouched')

function removePost(s) {
  const dir = path.join(dist, s)
  const file = path.join(dir, 'index.html')
  if (!dir.startsWith(dist + path.sep) || !fs.existsSync(file)) return false
  fs.rmSync(file)
  // Drop the folder only if nothing else is in it.
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
  console.log(`removed /${s}`)
  return true
}

function renderPost(s) {
  return Promise.all([fetchPost(s), fetchMorePosts(s)]).then(([post, more]) => {
    if (!post) return false
    const route = `/${s}`
    writeFileAtomic(path.join(dist, s, 'index.html'), buildPage(route, { route, post, more }))
    console.log(`rendered ${route}`)
    return true
  })
}

if (slug) {
  // Same rule as the full build: a page exists only for a post on the published list.
  if (posts.some((p) => p.slug === slug)) {
    if (!(await renderPost(slug))) removePost(slug)
  } else {
    removePost(slug)
  }
}
if (args.all) {
  // Backstop: publish any listed post that has no page yet.
  for (const p of posts) {
    if (!SLUG.test(p.slug) || RESERVED.has(p.slug)) continue
    if (!fs.existsSync(path.join(dist, p.slug, 'index.html'))) await renderPost(p.slug)
  }
}
// A renamed slug leaves the old page behind: take it down.
if (previous && !posts.some((p) => p.slug === previous)) removePost(previous)

// The list page and sitemap always reflect the full published set.
writeFileAtomic(path.join(dist, 'index.html'), buildPage('/', { route: '/', posts }))
console.log(`rendered / (${posts.length} posts) into ${dist}`)
writeFileAtomic(path.join(dist, 'sitemap.xml'), sitemapXml(sitemapUrls({ posts, videos: VIDEOS })))
console.log('wrote sitemap.xml')
