import { useEffect, useRef, useState, type RefObject } from 'react'
import { youTubeEmbedUrl, youTubeThumbnails, type YouTubeRef } from '../lib/youtube'

/**
 * Click-to-play YouTube video that looks like part of the page, not an embed.
 *
 * Until the reader clicks, nothing from YouTube runs: we render our own poster
 * (the post's video thumbnail when given, else the video's own thumbnail at the
 * best available quality) with a Lesser-styled play button, so the
 * page stays fast and prerenders to real HTML. The click swaps in the
 * privacy-enhanced player with autoplay, so one click starts the video. The
 * poster stays underneath until the player has loaded, which avoids the black
 * flash a bare iframe swap shows.
 *
 * Note: a few mobile browsers (some iOS versions) don't pass the click through
 * to the newly created player, so the reader may need one more tap there.
 */

let warmed = false
/** Open connections to YouTube on hover/focus so the click plays sooner. */
function warmConnections() {
  if (warmed || typeof document === 'undefined') return
  warmed = true
  for (const href of ['https://www.youtube-nocookie.com', 'https://www.google.com', 'https://i.ytimg.com']) {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    link.crossOrigin = ''
    document.head.appendChild(link)
  }
}

export function YouTubePlayer({
  video,
  title,
  className = '',
  eager = false,
  poster,
  posterAlt = '',
  compact = false,
  iframeRef,
}: {
  video: YouTubeRef
  /** Used for the iframe title and the play button's accessible name. */
  title: string
  className?: string
  /** Load the thumbnail eagerly (above the fold, e.g. the article hero). */
  eager?: boolean
  /** Our own cover image; falls back to YouTube's thumbnails. */
  poster?: string | null
  /** Alt text for the cover image. */
  posterAlt?: string
  /** Smaller play button, no label: for the floating mini player. */
  compact?: boolean
  /** Access to the player, e.g. to pause it with pauseYouTube(). */
  iframeRef?: RefObject<HTMLIFrameElement | null>
}) {
  const thumbs = poster ? [poster] : youTubeThumbnails(video.id)
  const [thumb, setThumb] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const nextThumb = () => setThumb((i) => Math.min(i + 1, thumbs.length - 1))

  // On prerendered pages the thumbnail can finish loading before React attaches
  // onLoad, so check the first one once after hydration too.
  const img = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const el = img.current
    if (!poster && el?.complete && el.naturalWidth > 0 && el.naturalWidth <= 120) nextThumb()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-[#011f1a] ${className}`}>
      <img
        ref={img}
        src={thumbs[thumb]}
        alt={posterAlt}
        width={1280}
        height={720}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // Missing sizes come back as a 120x90 placeholder rather than a 404.
        onLoad={(e) => !poster && e.currentTarget.naturalWidth <= 120 && nextThumb()}
        onError={nextThumb}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      />

      {playing ? (
        <iframe
          ref={iframeRef}
          src={youTubeEmbedUrl(video)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          // YouTube refuses to play (error 153) when no referrer reaches it.
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          onPointerEnter={warmConnections}
          onFocus={warmConnections}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-gradient-to-t from-black/45 via-black/5 to-transparent focus-visible:outline-none"
        >
          <span
            className={`flex items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] ring-4 ring-white/25 transition-[transform,width,height] duration-300 ease-out group-hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-white ${compact ? 'h-12 w-12' : 'h-[72px] w-[72px]'}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={`ml-1 ${compact ? 'h-5 w-5' : 'h-[30px] w-[30px]'}`}>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" />
            </svg>
          </span>
          {!compact && (
            <span className="absolute bottom-3 left-4 text-sm font-semibold text-white drop-shadow">Watch video</span>
          )}
        </button>
      )}

      {playing && !loaded && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
        </span>
      )}
    </div>
  )
}
