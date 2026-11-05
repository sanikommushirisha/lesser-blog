import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { abVariant } from '../motion/events'
import {
  GATE_OPEN_CLASS,
  chooseOffer,
  isGatedPost,
  isGatePreview,
  isUnlocked,
  rememberUnlock,
  type Offer,
} from '../lib/lead-magnets'

/** Wraps the part of the article behind the gate; JSON-LD points at this class. */
export const GATED_CLASS = 'lesser-gated'
export const GATED_ID = 'gated-content'

/** The gate opens when this marker scrolls above this share of the screen. */
const TRIGGER_AT = 0.55

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void }
  }
}

function capture(event: string, props: Record<string, unknown>) {
  try {
    window.posthog?.capture(event, props)
  } catch {
    // Analytics never gets in the reader's way.
  }
}

type Choice = ReturnType<typeof chooseOffer>

/**
 * Email gate for articles: marks where the free part ends, and when the reader
 * scrolls past it blurs the rest and asks for an email.
 *
 * Client-only, like EventPopup: the prerendered HTML stays complete for search
 * and AI crawlers, and readers without JavaScript read the whole post.
 */
export function EmailGate({ slug }: { slug: string }) {
  const marker = useRef<HTMLDivElement>(null)
  const [choice, setChoice] = useState<Choice | null>(null)

  useEffect(() => {
    if (!(isGatedPost(slug) || isGatePreview()) || isUnlocked()) return
    const el = marker.current
    if (!el) return

    let frame = 0
    const check = () => {
      frame = 0
      if (el.getBoundingClientRect().top > window.innerHeight * TRIGGER_AT) return
      window.removeEventListener('scroll', onScroll)
      const picked = chooseOffer(slug, abVariant('gate-offer'))
      setChoice(picked)
      capture('gate_shown', { offer: picked.offer.id, topic: picked.topic, arm: picked.arm, slug })
    }
    // Only a real scroll opens it, even on a screen tall enough to show the marker.
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [slug])

  // Lock while open. Done on the DOM, not in render, so hydration stays clean.
  useEffect(() => {
    if (!choice) return
    const content = document.getElementById(GATED_ID)
    const root = document.documentElement
    content?.setAttribute('data-locked', 'true')
    content?.setAttribute('inert', '')
    root.classList.add(GATE_OPEN_CLASS)
    // An open chat window would sit on top of the gate, so close it.
    window.Intercom?.('hide')
    return () => {
      content?.removeAttribute('data-locked')
      content?.removeAttribute('inert')
      root.classList.remove(GATE_OPEN_CLASS)
    }
  }, [choice])

  return (
    <>
      <div ref={marker} aria-hidden="true" />
      {choice &&
        createPortal(
          <GateDialog choice={choice} slug={slug} onDone={() => setChoice(null)} />,
          document.body
        )}
    </>
  )
}

function GateDialog({ choice, slug, onDone }: { choice: Choice; slug: string; onDone: () => void }) {
  const { offer, topic, arm } = choice
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle')
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus({ preventScroll: true })
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, offer: offer.id, slug, lsr_trap: trap }),
        signal: AbortSignal.timeout(12000),
      })
      if (res.status === 400 || res.status === 429) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        setError(body?.error ?? 'Please check your email and try again.')
        setStatus('idle')
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      capture('gate_subscribed', { offer: offer.id, topic, arm, slug })
      rememberUnlock()
      setStatus('done')
    } catch {
      // Our outage is not the reader's problem: let them read, and say the
      // PDF is not coming so they do not wait for it.
      capture('gate_error', { offer: offer.id, slug })
      rememberUnlock()
      setStatus('failed')
    }
  }

  return (
    <div className="lesser-gate" role="dialog" aria-modal="true" aria-labelledby="lesser-gate-title">
      <div className="lesser-gate-box">
        {status === 'done' || status === 'failed' ? (
          <>
            <h2 id="lesser-gate-title">{status === 'done' ? "You're in" : 'Keep reading'}</h2>
            <p>
              {status === 'done'
                ? `The full article is unlocked, and your free PDF is on its way to ${email}.`
                : "Sorry, we couldn't send your PDF just now. The full article is unlocked, so you can keep reading."}
            </p>
            <button type="button" className="lesser-gate-button" onClick={onDone}>
              Keep reading
            </button>
          </>
        ) : (
          <GateForm
            offer={offer}
            email={email}
            trap={trap}
            error={error}
            sending={status === 'sending'}
            input={input}
            onEmail={setEmail}
            onTrap={setTrap}
            onSubmit={submit}
          />
        )}
      </div>
    </div>
  )
}

function GateForm(props: {
  offer: Offer
  email: string
  trap: string
  error: string
  sending: boolean
  input: React.RefObject<HTMLInputElement | null>
  onEmail: (v: string) => void
  onTrap: (v: string) => void
  onSubmit: (e: FormEvent) => void
}) {
  const { offer, email, trap, error, sending, input, onEmail, onTrap, onSubmit } = props
  return (
    <>
      <p className="lesser-gate-eyebrow">Free for readers</p>
      <h2 id="lesser-gate-title">{offer.headline}</h2>
      <p>{offer.sub}</p>
      <form onSubmit={onSubmit}>
        <label htmlFor="lesser-gate-email">Email</label>
        <input
          ref={input}
          id="lesser-gate-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          aria-describedby="lesser-gate-note"
          aria-invalid={error ? true : undefined}
        />
        {/* Honeypot for form bots: off screen, skipped by keyboard and screen readers.
            Named so browser autofill does not recognise it (a field called
            "company" gets autofilled, and the server would drop real readers). */}
        <input
          className="lesser-gate-trap"
          type="text"
          name="lsr_trap"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={trap}
          onChange={(e) => onTrap(e.target.value)}
        />
        {error && (
          <p className="lesser-gate-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="lesser-gate-button" disabled={sending}>
          {sending ? 'Sending...' : 'Continue reading'}
        </button>
      </form>
      <p className="lesser-gate-note" id="lesser-gate-note">
        You'll also get our short weekly tax note. Unsubscribe any time. See our{' '}
        <a href="/privacy">privacy policy</a>.
      </p>
      <Link to="/" className="lesser-gate-link">
        Back to all articles
      </Link>
    </>
  )
}
