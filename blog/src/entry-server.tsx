// Build-time prerender entry (see scripts/prerender.mjs). Renders a route to
// static HTML with the same components the browser runs, and re-exports the
// Sanity fetchers so the prerender script reuses the bundled queries.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import App from './App'
import type { InitialData } from './lib/initial-data'

export { fetchPosts, fetchPost, fetchMorePosts } from './lib/sanity'
export { VIDEOS } from './pages/WatchPage'

export function render(url: string, data: InitialData): { html: string; head: string } {
  globalThis.__INITIAL_DATA__ = data
  const helmetContext: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
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
