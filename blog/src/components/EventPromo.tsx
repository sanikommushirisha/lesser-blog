import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { EventPopup } from './EventPopup'
import { isEventUpcoming } from '../lib/event-promo'

/**
 * Event promo on article pages: the auto-opening popup plus a bell button that
 * sits next to the Intercom chat launcher (bottom-right) and reopens it.
 *
 * The bell matches the launcher (48px circle, same corner, same 20px inset;
 * it sits one launcher-width plus a 12px gap to its left) and carries a "1"
 * badge until the visitor has opened the popup from it. Both disappear once the
 * event starts. Client-only: nothing here is in the prerendered HTML.
 */

const BELL_SEEN_KEY = 'lsr_evt_bell_seen'

const noSubscribe = () => () => {}

/**
 * The Intercom launcher's background color, once it has rendered. Covers both
 * launcher styles: the lightweight one in the page, and the classic one inside
 * Intercom's (same-origin) launcher iframe. Null until it exists.
 */
function intercomLauncherColor(): string | null {
  let el = document.querySelector<HTMLElement>('.intercom-lightweight-app-launcher, .intercom-launcher')
  if (!el) {
    const frame = document.querySelector<HTMLIFrameElement>('iframe[name="intercom-launcher-frame"]')
    try {
      el = frame?.contentDocument?.querySelector<HTMLElement>('.intercom-launcher, [class*="launcher"]') ?? null
    } catch {
      el = null
    }
  }
  if (!el) return null
  const bg = getComputedStyle(el).backgroundColor
  return bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' ? bg : null
}

function bellSeen(): boolean {
  try {
    return localStorage.getItem(BELL_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function EventPromo() {
  // Browser-only facts, read without an effect. The server snapshots keep the
  // prerendered HTML (and the first client render) bell-free, so hydration matches.
  const upcoming = useSyncExternalStore(noSubscribe, isEventUpcoming, () => false)
  const seenBefore = useSyncExternalStore(noSubscribe, bellSeen, () => true)
  const [clicked, setClicked] = useState(false)
  const [openSignal, setOpenSignal] = useState(0)
  const showBadge = !seenBefore && !clicked
  const bell = useRef<HTMLButtonElement>(null)

  // Match the chat launcher's color exactly. Intercom loads a second or two
  // after the page (lib/intercom.ts), so look for it for up to 30s.
  useEffect(() => {
    if (!upcoming) return
    const apply = () => {
      const color = intercomLauncherColor()
      if (color) bell.current?.style.setProperty('--lsr-launcher-bg', color)
      return Boolean(color)
    }
    if (apply()) return
    const poll = window.setInterval(() => apply() && window.clearInterval(poll), 500)
    const stop = window.setTimeout(() => window.clearInterval(poll), 30_000)
    return () => {
      window.clearInterval(poll)
      window.clearTimeout(stop)
    }
  }, [upcoming])

  const openFromBell = () => {
    setOpenSignal((n) => n + 1)
    setClicked(true)
    try {
      localStorage.setItem(BELL_SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <EventPopup openSignal={openSignal} />
      {upcoming && (
        <button
          ref={bell}
          type="button"
          className="lsr-evt-bell"
          onClick={openFromBell}
          aria-label={
            showBadge
              ? 'Upcoming event: free live session on 25 October (1 new)'
              : 'Upcoming event: free live session on 25 October'
          }
          title="Free live session · Sunday 25 October"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {showBadge && (
            <span className="lsr-evt-bell-badge" aria-hidden="true">
              1
            </span>
          )}
        </button>
      )}
    </>
  )
}
