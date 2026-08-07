// Build-time prerender entry (see scripts/prerender.mjs). Renders a route to
// static HTML with the same components the browser runs, and re-exports the
// Sanity fetchers so the prerender script reuses the bundled queries.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import App from './App'
import type { InitialData } from './lib/initial-data'
import { BASE_PATH } from './lib/base'

export { fetchPosts, fetchPost, fetchMorePosts } from './lib/sanity'
export { VIDEOS } from './pages/watchVideos'
export { RENEWAL_VIDEOS } from './pages/renewalVideos.generated'

export function render(url: string, data: InitialData): { html: string; head: string } {
  globalThis.__INITIAL_DATA__ = data
  const helmetContext: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      {/*
        basename must match the client's BrowserRouter, and the location has to
        carry it too. Without this every <Link> in the prerendered HTML is
        emitted as "/<slug>" instead of "/blog/<slug>", pointing the whole blog's
        internal link graph at the marketing app's 404.
      */}
      <StaticRouter basename={BASE_PATH} location={`${BASE_PATH}${url}`}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  )
  const h = helmetContext.helmet
  const head = h
    ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()]
        .filter(Boolean)
        .join('\n    ')
    : ''
  return { html, head }
}
