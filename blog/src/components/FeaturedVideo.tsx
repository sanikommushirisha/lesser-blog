import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { YouTubePlayer } from './YouTubePlayer'
import { pauseYouTube, type YouTubeRef } from '../lib/youtube'

/**
 * The article's featured video. It sits where the featured image would be;
 * once the reader scrolls past it, it shrinks into a mini player that follows
 * the page (docked above "Recent blogs" in the right column, or the bottom-right
 * corner where there is no right column), and grows back into place when they
 * scroll up to it again. The reader can close the mini player, which pauses it.
 *
 * One player element is moved with `position: fixed` rather than re-mounted,
 * because re-parenting the YouTube iframe would restart the video. The move is
 * animated FLIP-style (measure, switch, animate the difference with a
 * transform), so it slides and scales smoothly instead of jumping.
 */

type Mode = 'docked' | 'floating'

const DURATION = 420
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
/** Float once less than this fraction of the in-page spot is still on screen. */
const VISIBLE_THRESHOLD = 0.3
const CORNER_GAP = 16

/** Fixed position for the mini player: the dock slot's box, else the corner. */
function floatStyleFor(slot: HTMLElement | null): CSSProperties {
  const r = slot?.getBoundingClientRect()
  if (r && r.width > 0) return { top: r.top, left: r.left, width: r.width }
  return { right: CORNER_GAP, bottom: CORNER_GAP, width: Math.min(320, window.innerWidth * 0.62) }
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function FeaturedVideo({
  video,
  title,
  poster,
  posterAlt,
  dockSlot,
  onFloatHeightChange,
}: {
  video: YouTubeRef
  title: string
  /** Our video thumbnail; falls back to YouTube's. */
  poster?: string | null
  posterAlt?: string
  /** Where the mini player docks (right column). Hidden/absent: bottom-right corner. */
  dockSlot: RefObject<HTMLDivElement | null>
  /** Height the dock slot must reserve while floating (null when docked). */
  onFloatHeightChange?: (height: number | null) => void
}) {
  const [mode, setMode] = useState<Mode>('docked')
  const [floatStyle, setFloatStyle] = useState<CSSProperties | undefined>()
  const placeholder = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const videoBox = useRef<HTMLDivElement>(null)
  const iframe = useRef<HTMLIFrameElement>(null)
  const modeRef = useRef<Mode>('docked')
  const dismissed = useRef(false)
  const flipFrom = useRef<DOMRect | null>(null)

  const go = useCallback(
    (next: Mode) => {
      if (next === modeRef.current) return
      flipFrom.current = videoBox.current?.getBoundingClientRect() ?? null
      modeRef.current = next
      setFloatStyle(next === 'floating' ? floatStyleFor(dockSlot.current) : undefined)
      setMode(next)
    },
    [dockSlot]
  )

  // Animate from where the video was to where it now is (the FLIP "invert + play").
  useLayoutEffect(() => {
    const first = flipFrom.current
    flipFrom.current = null
    const el = card.current
    const box = videoBox.current
    if (el && box) onFloatHeightChange?.(mode === 'floating' ? el.offsetHeight + 20 : null)
    if (!first || !el || !box || prefersReducedMotion()) return
    const last = box.getBoundingClientRect()
    if (!last.width) return
    const dx = first.left - last.left
    const dy = first.top - last.top
    const scale = first.width / last.width
    el.animate(
      [
        { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transformOrigin: 'top left', transform: 'none' },
      ],
      { duration: DURATION, easing: EASING }
    )
  }, [mode, onFloatHeightChange])

  // Float when the in-page spot has scrolled (mostly) off the top of the screen.
  useEffect(() => {
    const spot = placeholder.current
    if (!spot || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast = entry.intersectionRatio < VISIBLE_THRESHOLD && entry.boundingClientRect.top < 0
        // Coming back to the video resets a previous "close".
        if (!scrolledPast) dismissed.current = false
        go(scrolledPast && !dismissed.current ? 'floating' : 'docked')
      },
      { threshold: [0, VISIBLE_THRESHOLD, 0.6, 1] }
    )
    io.observe(spot)
    return () => io.disconnect()
  }, [go])

  // Keep the mini player on its slot through scrolling and resizing.
  useEffect(() => {
    if (mode !== 'floating') return
    let frame = 0
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setFloatStyle(floatStyleFor(dockSlot.current)))
    }
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [mode, dockSlot])

  const close = () => {
    pauseYouTube(iframe.current)
    dismissed.current = true
    go('docked')
  }

  const floating = mode === 'floating'

  return (
    // Keeps the video's space in the article while it floats, so nothing jumps.
    <div ref={placeholder} className="relative aspect-video w-full rounded-2xl bg-secondary">
      <div
        ref={card}
        style={floating ? floatStyle : undefined}
        role={floating ? 'region' : undefined}
        aria-label={floating ? 'Video player' : undefined}
        className={
          floating
            ? 'fixed z-40 overflow-hidden rounded-xl border border-card-border bg-card shadow-[0_24px_60px_-20px_rgba(2,6,23,0.45)]'
            : 'absolute inset-0 overflow-hidden rounded-2xl shadow-card-lg'
        }
      >
        <div ref={videoBox}>
          <YouTubePlayer video={video} title={title} poster={poster} posterAlt={posterAlt} compact={floating} iframeRef={iframe} eager />
        </div>
        {floating && (
          <div
            className="flex items-center gap-3 px-4 py-3 font-sans"
            // Appears once the card has landed, so it isn't stretched by the animation.
            style={{ animation: prefersReducedMotion() ? undefined : `fade-in 200ms ease-out ${DURATION - 60}ms both` }}
          >
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{title}</p>
            <button
              type="button"
              onClick={close}
              aria-label="Close video player"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
