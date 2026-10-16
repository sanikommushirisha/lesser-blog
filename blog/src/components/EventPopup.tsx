import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { asset } from '../lib/base'
import { isEventUpcoming } from '../lib/event-promo'

/**
 * Event promo popup on article pages (/blog/[slug]), ported from the
 * event-popup.html embed for the 25 Oct pre-IPO session.
 *
 * Same rules as the original embed:
 *  - appears a few seconds after the page opens,
 *  - at most once per visitor every 24 hours (localStorage `lsr_evt_popup`,
 *    the key the homepage embed uses too, so closing it anywhere counts),
 *  - switches itself off once the session starts (25 Oct, 10 AM PT).
 *
 * Client-only: nothing is rendered until the timer fires, so the popup is not
 * part of the prerendered HTML crawlers read.
 */

const STORAGE_KEY = 'lsr_evt_popup'
const SHOW_AFTER_MS = 3000
const SNOOZE_MS = 24 * 60 * 60 * 1000
/** Must match the close transition in index.css (.lsr-evt). */
const CLOSE_MS = 260

const EVENT_URL = 'https://luma.com/5c2cffuo?utm_source=website&utm_medium=popup&utm_campaign=preipo-oct25'

type Phase = 'hidden' | 'entering' | 'open' | 'closing'

function snoozedRecently(): boolean {
  try {
    return Date.now() - (Number(localStorage.getItem(STORAGE_KEY)) || 0) < SNOOZE_MS
  } catch {
    return false
  }
}

export function EventPopup({ openSignal = 0 }: { openSignal?: number }) {
  const [phase, setPhase] = useState<Phase>('hidden')
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  // Schedule the popup once per page view, unless snoozed or the event started.
  useEffect(() => {
    if (!isEventUpcoming() || snoozedRecently()) return
    const timer = window.setTimeout(() => setPhase('entering'), SHOW_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // Opened on request (the bell): immediately, regardless of delay or snooze.
  // Adjusting state when a prop changes, during render (no effect needed).
  const [handledSignal, setHandledSignal] = useState(openSignal)
  if (openSignal !== handledSignal) {
    setHandledSignal(openSignal)
    if (phase !== 'open' && phase !== 'entering') setPhase('entering')
  }

  // 'entering' renders the closed state first; the next frame switches to
  // 'open' so the CSS transition actually runs (a smooth fade + rise).
  useEffect(() => {
    if (phase !== 'entering') return
    // Whatever had focus (the page, or the bell) gets it back on close.
    if (!(document.activeElement as HTMLElement | null)?.closest?.('.lsr-evt')) {
      returnFocus.current = document.activeElement as HTMLElement | null
    }
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')))
    return () => cancelAnimationFrame(frame)
  }, [phase])

  const close = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // Private mode etc.: it simply may show again later.
    }
    setPhase((p) => (p === 'hidden' ? p : 'closing'))
  }, [])

  // Finish closing after the exit transition; give focus back to the page.
  useEffect(() => {
    if (phase !== 'closing') return
    const timer = window.setTimeout(() => {
      setPhase('hidden')
      returnFocus.current?.focus?.()
    }, CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  // While visible: Esc closes, the page behind doesn't scroll, focus starts in the dialog.
  const visible = phase !== 'hidden'
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    dialog.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      root.style.overflow = prevOverflow
    }
  }, [visible, close])

  if (!visible) return null

  return createPortal(
    <div
      className="lsr-evt"
      data-state={phase === 'open' ? 'open' : 'closed'}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={dialog}
        className="lsr-evt-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lsr-evt-title"
        tabIndex={-1}
      >
        <button type="button" className="lsr-evt-x" aria-label="Close" onClick={close}>
          &times;
        </button>
        <div className="lsr-evt-in">
          <div className="lsr-evt-kick">Free live session · Sunday 25 October</div>
          {/* A <p>, not a heading: this promo is not part of the article's outline. */}
          <p id="lsr-evt-title" className="lsr-evt-title">
            The 15x
            <br />
            <em>you missed.</em>
          </p>
          <p className="lsr-evt-copy">
            How people get shares in SpaceX, OpenAI and Anthropic before they list. One hour on Zoom with two
            General Partners, live Q&amp;A, nothing sold.
          </p>
          <div className="lsr-evt-spk">
            <div className="lsr-evt-s">
              <img src={asset('/events/subbu-ramasubramanian.jpg')} alt="Subbu Ramasubramanian" width={40} height={40} />
              <div>
                <b>Subbu Ramasubramanian</b>
                <span>General Partner, T2D3 Capital</span>
              </div>
            </div>
            <div className="lsr-evt-s">
              <img src={asset('/events/abishek-surendran.jpg')} alt="Abishek Surendran" width={40} height={40} />
              <div>
                <b>Abishek Surendran</b>
                <span>Founder &amp; Managing Partner, T2D3 Capital</span>
              </div>
            </div>
          </div>
          <div className="lsr-evt-row">
            <div className="lsr-evt-when">
              10:00 AM – 11:00 AM PDT<small>10:30 PM – 11:30 PM GMT+5:30</small>
            </div>
            <a className="lsr-evt-cta" href={EVENT_URL} target="_blank" rel="noopener" onClick={close}>
              Save my seat →
            </a>
          </div>
          <div className="lsr-evt-fine">Educational only. Private markets carry risk, including illiquidity and loss.</div>
        </div>
      </div>
    </div>,
    document.body
  )
}
