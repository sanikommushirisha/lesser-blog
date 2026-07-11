import { useEffect } from 'react'

// Lesser workspace. The app_id is public — it only identifies which
// workspace's Messenger to load; all data access happens server-side.
const APP_ID = 'o461n2j4'
const WIDGET_SRC = `https://widget.intercom.io/widget/${APP_ID}`
// Auto-open once per visitor across the whole blog, not once per post.
const AUTO_OPEN_KEY = 'lesser_blog_intercom_auto_opened'
// The widget must be booted well before showNewMessage: calling it within
// a few seconds of boot silently drops the pre-filled composer text
// (verified against the live o461n2j4 workspace — 3s gap loses the text,
// 9s keeps it). A 10s auto-open therefore forces the load to start at 1s;
// the script is async and layout-stable so LCP/CLS are unaffected.
const LOAD_DELAY_MS = 1_000
const AUTO_OPEN_DELAY_MS = 10_000

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
 * Deliberately not called on page load — the widget is ~250KB and would
 * drag down Core Web Vitals on prerendered posts. Callers invoke this on
 * first scroll or just before the auto-open timer fires.
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

function hasAutoOpened(): boolean {
  try {
    return localStorage.getItem(AUTO_OPEN_KEY) === '1'
  } catch {
    return true // storage blocked → err on the quiet side, never auto-open
  }
}

function markAutoOpened() {
  try {
    localStorage.setItem(AUTO_OPEN_KEY, '1')
  } catch {
    /* ignore */
  }
}

export interface PostContext {
  title: string
  slug: string
  category?: string
}

/**
 * Blog-post Messenger behavior:
 * - loads the widget 1s after the post renders (launcher appears)
 * - at 10s, opens the composer pre-filled with the post title so the
 *   reader only has to finish the sentence and hit send — Intercom only
 *   creates a conversation once the visitor sends a message
 * - auto-open fires once per visitor (localStorage), repeat visits just
 *   get the launcher
 * - post title/slug/category ride along as custom attributes so the
 *   inbox shows what the visitor was reading and Fin can tailor answers
 */
export function useIntercomForPost(post: PostContext | null) {
  const title = post?.title
  const slug = post?.slug
  const category = post?.category
  useEffect(() => {
    if (!title || !slug || typeof window === 'undefined') return

    const attributes = {
      blog_post_title: title,
      blog_post_slug: slug,
      ...(category ? { blog_post_category: category } : {}),
    }

    // Load well ahead of the auto-open so the widget has time to finish
    // booting before showNewMessage fires (see LOAD_DELAY_MS comment).
    const loadTimer = window.setTimeout(() => ensureLoaded(attributes), LOAD_DELAY_MS)

    const timer = window.setTimeout(() => {
      ensureLoaded(attributes)
      if (hasAutoOpened()) return
      markAutoOpened()
      window.Intercom?.(
        'showNewMessage',
        `I'm reading "${title}" and I have a question: `
      )
    }, AUTO_OPEN_DELAY_MS)

    return () => {
      window.clearTimeout(loadTimer)
      window.clearTimeout(timer)
    }
  }, [title, slug, category])
}
