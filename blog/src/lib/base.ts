// The blog is mounted as a sub-app of lesser.tax at /blog (Vite's `base`).
//
// Everything *inside* the app — router paths, `InitialData.route`, the routes
// the prerender script renders — stays basename-relative ("/", "/some-slug").
// Only the browser's real pathname carries the /blog prefix, so it is stripped
// once, here, before those internal lookups.

// "/blog/" -> "/blog". Empty string when the app is served from the domain root.
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/+$/, '')

/** Real pathname ("/blog/some-slug") -> internal route ("/some-slug"). */
export function toAppRoute(pathname: string): string {
  const withoutBase =
    BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname
  return withoutBase.replace(/\/+$/, '') || '/'
}

/**
 * Root-relative asset path ("/videos/x.mp4") -> path under the mount
 * ("/blog/videos/x.mp4"). Needed because Vite rewrites `base` into HTML and
 * imported assets, but never into plain strings in component code.
 */
export function asset(p: string): string {
  return `${BASE_PATH}${p}`
}

/** Internal route ("/some-slug") -> absolute public URL. */
export function absoluteUrl(route: string): string {
  const suffix = route === '/' ? '' : route
  return `${SITE_URL}${suffix}`
}

/** Public origin + base path the blog is served from. */
export const SITE_URL = 'https://lesser.tax/blog'
