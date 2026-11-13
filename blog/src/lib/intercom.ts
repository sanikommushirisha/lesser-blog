import { useEffect } from 'react'

// Lesser workspace. The app_id is public — it only identifies which
// workspace's Messenger to load; all data access happens server-side.
const APP_ID = 'o461n2j4'
const WIDGET_SRC = `https://widget.intercom.io/widget/${APP_ID}`

type IntercomFn = ((command: string, ...args: unknown[]) => void) & {
  q?: unknown[]
  c?: (args: unknown) => void
}

declare global {
  interface Window {
    Intercom?: IntercomFn
    intercomSettings?: Record<string, unknown>
  }
}

let loaded = false

/**
 * Inject the Messenger script and boot it. Idempotent, client-only.
 * Called after the window "load" event, never during it: the widget is ~250KB
 * and loading it earlier would compete with the post's LCP image.
 */
function ensureLoaded(attributes: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (loaded) {
    window.Intercom?.('update', attributes)
    return
  }
  loaded = true

  // Standard Intercom queue shim: buffers calls until the widget script
  // replaces window.Intercom with the real implementation.
  const shim: IntercomFn = (...args: unknown[]) => {
    shim.q?.push(args)
  }
  shim.q = []
  window.Intercom = shim
  window.intercomSettings = { app_id: APP_ID, ...attributes }

  const script = document.createElement('script')
  script.src = WIDGET_SRC
  script.async = true
  script.onload = () => window.Intercom?.('boot', { app_id: APP_ID, ...attributes })
  document.body.appendChild(script)
}

export interface PostContext {
  title: string
  slug: string
  category?: string
}

/**
 * Blog-post Messenger, on every post (USER-31):
 * - loads the widget once the page has finished loading (the window "load"
 *   event, the same moment the marketing pages' snippet uses). The script is
 *   async and layout-stable and comes after the load event, so LCP/CLS are
 *   unaffected, and the Messenger is booted well inside the first 5 seconds.
 * - the 5-second question is NOT sent from here. Website code can only open
 *   the Messenger or pre-fill the reader's own message; it cannot post a
 *   message as Lesser or act on the reply. An Intercom Workflow does that:
 *   "Customer visits a page", URL contains lesser.tax/blog/, Time on page
 *   5 seconds, Show workflow until "Engaged with" (once per visit until the
 *   reader answers). Its question has Yes/No reply buttons and "Yes" sends the
 *   sign-up link. Full spec: Linear USER-31. The old 10s pre-filled pop-up was
 *   removed so readers never get two pop-ups.
 * - moving to another post inside the blog calls `update`, which tells
 *   Intercom the URL changed, so the Workflow's page rules are checked again.
 * - post title/slug/category ride along as custom attributes so the inbox
 *   shows what the visitor was reading and Fin can tailor answers.
 */
export function useIntercomForPost(post: PostContext | null) {
  const title = post?.title
  const slug = post?.slug
  const category = post?.category
  useEffect(() => {
    if (!title || !slug || typeof window === 'undefined') return

    const load = () =>
      ensureLoaded({
        blog_post_title: title,
        blog_post_slug: slug,
        ...(category ? { blog_post_category: category } : {}),
      })

    if (loaded || document.readyState === 'complete') {
      load()
      return
    }
    window.addEventListener('load', load, { once: true })
    return () => window.removeEventListener('load', load)
  }, [title, slug, category])
}
