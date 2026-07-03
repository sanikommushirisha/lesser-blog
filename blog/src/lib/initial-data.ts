import type { Post, PostListItem } from './sanity'

// Data injected by the prerender step (scripts/prerender.mjs). On the server it is
// set before renderToString; in the browser it comes from the inline
// window.__INITIAL_DATA__ script in prerendered HTML. Consumed once per page load
// so client-side navigation always fetches fresh data.
export interface InitialData {
  route: string
  posts?: PostListItem[]
  post?: Post | null
  more?: PostListItem[]
}

declare global {
  var __INITIAL_DATA__: InitialData | undefined
}

export function takeInitialData(route: string): InitialData | null {
  const data = globalThis.__INITIAL_DATA__
  if (!data || data.route !== route) return null
  if (typeof window !== 'undefined') globalThis.__INITIAL_DATA__ = undefined
  return data
}

export function hasInitialDataFor(route: string): boolean {
  return globalThis.__INITIAL_DATA__?.route === route
}
