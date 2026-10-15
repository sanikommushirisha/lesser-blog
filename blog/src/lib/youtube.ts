/**
 * YouTube link handling for blog videos. Editors paste whatever link YouTube
 * gave them; this turns it into a video id (+ optional start time) we can
 * embed. Shared by the Sanity schema (validation) and the site (rendering), so
 * a link the Studio accepts is always one the site can play.
 */

export interface YouTubeRef {
  id: string
  /** Start offset in seconds, from ?t= / ?start= / #t= in the pasted link. */
  start?: number
}

const ID = /^[A-Za-z0-9_-]{11}$/

/** "90", "90s", "1m30s", "1h2m3s" → seconds. */
function parseTime(raw: string | null): number | undefined {
  if (!raw) return undefined
  if (/^\d+$/.test(raw)) return Number(raw) || undefined
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!m || !m[0]) return undefined
  const secs = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
  return secs || undefined
}

/**
 * Accepts youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID,
 * /v/ID, m./music./www./no-www hosts and youtube-nocookie.com, with or without
 * the protocol. Returns null for anything that isn't a single YouTube video.
 */
export function parseYouTubeUrl(input: string | null | undefined): YouTubeRef | null {
  if (!input) return null
  const raw = input.trim()
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m|music)\./, '')
  let id: string | null = null
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, first, second] = url.pathname.split('/')
    if (first === 'watch') id = url.searchParams.get('v')
    else if (['embed', 'shorts', 'live', 'v'].includes(first)) id = second ?? null
  }
  if (!id || !ID.test(id)) return null

  const hashT = url.hash.match(/t=([^&]+)/)?.[1] ?? null
  const start = parseTime(url.searchParams.get('t') ?? url.searchParams.get('start') ?? hashT)
  return start ? { id, start } : { id }
}

/**
 * Privacy-enhanced embed URL, tuned so playback feels native to the page:
 * starts on the first click (autoplay, since the click on our poster IS the
 * user gesture), plays inline on iOS, hides annotations, and limits the
 * end-screen suggestions to the same channel (rel=0).
 */
export function youTubeEmbedUrl(ref: YouTubeRef): string {
  const params = new URLSearchParams({
    autoplay: '1',
    // Lets the page pause the video (pauseYouTube) when the floating card is closed.
    enablejsapi: '1',
    rel: '0',
    playsinline: '1',
    iv_load_policy: '3',
    modestbranding: '1',
    color: 'white',
  })
  if (ref.start) params.set('start', String(ref.start))
  return `https://www.youtube-nocookie.com/embed/${ref.id}?${params}`
}

/**
 * Thumbnail URLs, best first. maxresdefault (1280x720) only exists for HD
 * uploads; when it's missing YouTube serves a 120x90 grey placeholder with a
 * 200, so the player checks the loaded size and steps down to the next one.
 */
export function youTubeThumbnails(id: string): string[] {
  return ['maxresdefault', 'sddefault', 'hqdefault'].map((q) => `https://i.ytimg.com/vi/${id}/${q}.jpg`)
}

/** Pause an embed created with youTubeEmbedUrl (it enables the JS API). */
export function pauseYouTube(iframe: HTMLIFrameElement | null): void {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*')
}

export function youTubeWatchUrl(ref: YouTubeRef): string {
  return `https://www.youtube.com/watch?v=${ref.id}${ref.start ? `&t=${ref.start}s` : ''}`
}
