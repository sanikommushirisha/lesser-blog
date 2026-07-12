// In-post motion widgets. All Remotion code is lazy-imported on first
// interaction (facade pattern): non-users pay zero bundle/CWV cost. Every
// widget renders a crawlable text twin server-side.
import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import {
  CONSULATES,
  computePlan,
  planSentence,
  type Booklet,
  type CaseType,
  type PlanInput,
} from './constants'
import { track } from './events'
import { isNarrow } from './viewport'
import { comboSlug } from './combos'

const LazyRenewalPlayer = lazy(() => import('./players').then((m) => ({ default: m.RenewalPlayer })))
const LazyStoryPlayer = lazy(() => import('./players').then((m) => ({ default: m.StoryPlayer })))
const LazyScrollPlayer = lazy(() => import('./players').then((m) => ({ default: m.ScrollExplainerPlayer })))

function useSeen(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  // Hold the latest cb in a ref and guard with a fire-once flag so the effect
  // depends only on [ref]. Widgets that re-render on scroll (ScrollExplainer's
  // setProgress) would otherwise pass a new inline cb every frame, tearing down
  // and re-subscribing the observer — which re-fires 'seen' on each frame while
  // the element is on screen (observed live: 287 'seen' from one visitor).
  const cbRef = useRef(cb)
  useEffect(() => {
    cbRef.current = cb
  })
  const fired = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el || fired.current || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && !fired.current) {
            fired.current = true
            cbRef.current()
            io.disconnect()
          }
        }),
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}

/* ================= Concept 1: Your Renewal, Visualized ================= */
export function RenewalWidget({ slug, placement, variant }: { slug: string; placement: string; variant?: string }) {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [input, setInput] = useState<PlanInput>(() => ({
    consulate: (params?.get('c') as PlanInput['consulate']) || 'new-york',
    caseType: (params?.get('k') as CaseType) || 'normal',
    booklet: (params?.get('b') as Booklet) || '36',
    trip: params?.get('t') || defaultTrip(),
    name: params?.get('n') || '',
  }))
  const [inView, setInView] = useState(false)
  const [userStarted, setUserStarted] = useState(false) // reduced-motion path
  const [done, setDone] = useState(false)
  const [customized, setCustomized] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const plan = useMemo(() => computePlan(input), [input])
  const shared = Boolean(params?.get('c'))
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useSeen(ref, () => {
    setInView(true)
    track('seen', { concept: 'renewal-viz', slug, placement, variant })
    if (!reduced) track('play', { concept: 'renewal-viz', slug, placement, variant, meta: { auto: true } })
  })
  useEffect(() => {
    if (shared) track('shared-open', { concept: 'renewal-viz', slug, placement, variant })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Share to the dedicated /r/:combo watch page: it serves the pre-rendered
  // 9:16 MP4 (rich WhatsApp preview + VideoObject) and replays live if the
  // reader opens it. trip/name ride as params for the personalized replay.
  const shareUrl = () => {
    const u = new URL(`${window.location.origin}/r/${comboSlug(input)}`)
    if (input.trip) u.searchParams.set('t', input.trip)
    if (input.name) u.searchParams.set('n', input.name)
    return u.toString()
  }

  const set = (patch: Partial<PlanInput>) => {
    setInput((p) => ({ ...p, ...patch }))
    setDone(false)
    if (!customized) {
      setCustomized(true)
    }
    track('customize', { concept: 'renewal-viz', slug, placement, variant, meta: patch as Record<string, unknown> })
  }

  const playerVisible = inView && (!reduced || userStarted)
  // remount on plan change so the new timeline replays from the top
  const planKey = `${plan.consulate}|${plan.caseType}|${plan.booklet}|${plan.trip}|${plan.name}`

  return (
    <section
      id="your-timeline"
      ref={ref}
      className="my-10 scroll-mt-6 rounded-2xl border border-border bg-card p-4 font-sans sm:p-5"
    >
      <div className="overflow-hidden rounded-xl" style={{ aspectRatio: isNarrow() ? '4/5' : '16/9', maxWidth: isNarrow() ? 420 : undefined, margin: isNarrow() ? '0 auto' : undefined }}>
        {playerVisible ? (
          <Suspense fallback={<Poster />}>
            <LazyRenewalPlayer
              key={planKey}
              plan={plan}
              onEnded={() => {
                setDone(true)
                track('complete', { concept: 'renewal-viz', slug, placement, variant })
              }}
            />
          </Suspense>
        ) : (
          <button
            onClick={() => {
              setUserStarted(true)
              track('play', { concept: 'renewal-viz', slug, placement, variant, meta: { auto: false } })
            }}
            className="flex h-full w-full flex-col items-center justify-center gap-3 text-white"
            style={{ background: 'linear-gradient(160deg,#101a38,#1c2a58)' }}
            aria-label="Play your renewal timeline"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-xl text-[#16214a]">▶</span>
            <span className="text-sm opacity-80">your renewal, as a video</span>
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Consulate">
          <select value={input.consulate} onChange={(e) => set({ consulate: e.target.value as PlanInput['consulate'] })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {Object.entries(CONSULATES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label.replace('CGI ', '').replace('Embassy of India, ', '')}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Case">
          <select value={input.caseType} onChange={(e) => set({ caseType: e.target.value as CaseType })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="normal">Standard re-issue</option>
            <option value="tatkaal">Tatkaal (urgent)</option>
            <option value="lost">Lost / damaged</option>
            <option value="minor">Minor (under 15)</option>
          </select>
        </Field>
        <Field label="Booklet">
          <select value={input.booklet} onChange={(e) => set({ booklet: e.target.value as Booklet })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="36">36 pages</option>
            <option value="60">60 pages</option>
          </select>
        </Field>
        <Field label="India trip date">
          <input type="date" value={input.trip ?? ''} onChange={(e) => set({ trip: e.target.value })} className="w-full min-w-0 appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </Field>
        <div className="col-span-2 sm:col-span-1"><Field label="Name on video">
          <input value={input.name ?? ''} maxLength={14} placeholder="Aisha" onChange={(e) => set({ name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </Field></div>
      </div>

      {done && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(planSentence(plan) + ' Watch it: ' + shareUrl())}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('share', { concept: 'renewal-viz', slug, placement, variant, meta: { channel: 'whatsapp' } })}
            className="rounded-xl bg-[#0d8a41] px-5 py-2.5 text-sm font-semibold text-white no-underline"
          >
            Share on WhatsApp
          </a>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(shareUrl())
              track('share', { concept: 'renewal-viz', slug, placement, variant, meta: { channel: 'copy' } })
            }}
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Copy your link
          </button>
          <span className="text-xs text-muted-foreground">the link replays this exact timeline for whoever opens it</span>
        </div>
      )}

      {/* crawlable twin — always in the HTML, same constants as the video */}
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{planSentence(plan)}</p>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Poster() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-white" style={{ background: 'linear-gradient(160deg,#101a38,#1c2a58)' }}>
      loading…
    </div>
  )
}

function defaultTrip() {
  const t = new Date()
  t.setDate(t.getDate() + 90)
  return t.toISOString().slice(0, 10)
}

/* ================= Concept 2: scroll-driven explainer ================= */
export function ScrollExplainer({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  useSeen(ref, () => {
    setMounted(true)
    track('seen', { concept: 'scroll-explainer', slug })
  })
  useEffect(() => {
    if (!mounted) return
    let fired = false
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)))
      setProgress(p)
      if (p > 0.95 && !fired) {
        fired = true
        track('complete', { concept: 'scroll-explainer', slug })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mounted, slug])
  return (
    <section ref={ref} className="my-10 font-sans" style={{ height: '200vh' }}>
      <div className="sticky top-16">
        <div className="overflow-hidden rounded-xl" style={{ aspectRatio: isNarrow() ? '36/35' : '16/8.5' }}>
          {mounted ? (
            <Suspense fallback={<Poster />}>
              <LazyScrollPlayer progress={progress} />
            </Suspense>
          ) : (
            <Poster />
          )}
        </div>
      </div>
    </section>
  )
}

/* ================= Concept 5: ask → video answer ================= */
const ASK: Record<string, { q: string; kicker: string; big: string; answer: string }> = {
  fbar: {
    q: 'Do my NRE + NRO accounts need FBAR?',
    kicker: 'One threshold, all accounts',
    big: '$10,000',
    answer: 'Combined across ALL non-US accounts, any single day of the year. NRE and NRO both count. Filed free at bsaefiling.fincen.gov.',
  },
  tatkaal: {
    q: 'Is Tatkaal worth $125 for me?',
    kicker: 'The queue you are buying',
    big: '5 days',
    answer: 'vs 30 working days normal. Worth it only if a flight depends on it and your police record is clean — lost passports are excluded.',
  },
  rsu: {
    q: 'Why did my RSU refund shrink?',
    kicker: 'Withheld is not owed',
    big: '22% ≠ 32%',
    answer: 'Employers withhold a flat 22% on vests; if your bracket is higher, the difference lands on your return at filing.',
  },
}

export function AskWidget({ slug, questions }: { slug: string; questions: (keyof typeof ASK)[] }) {
  const [active, setActive] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useSeen(ref, () => track('seen', { concept: 'ask-video', slug }))
  const pick = (k: string) => {
    setComposing(true)
    setActive(null)
    track('play', { concept: 'ask-video', slug, meta: { q: k } })
    setTimeout(() => {
      setComposing(false)
      setActive(k)
    }, 900)
  }
  const d = active ? ASK[active] : null
  return (
    <section ref={ref} className="my-10 rounded-2xl border border-border bg-card p-5 font-sans sm:p-6">
      <p className="eyebrow">30-second video answers</p>
      <div className="mb-2 mt-3 flex flex-wrap gap-2">
        {questions.map((k) => (
          <button key={k} onClick={() => pick(k)} className="rounded-full border border-border bg-background px-4 py-2 text-[13.5px] font-semibold text-foreground hover:border-primary hover:text-primary">
            {ASK[k].q}
          </button>
        ))}
      </div>
      {composing && <p className="my-3 text-sm text-muted-foreground">composing your answer…</p>}
      {d && (
        <div className="mt-3 overflow-hidden rounded-xl" style={{ aspectRatio: isNarrow() ? '4/5' : '16/8', maxWidth: isNarrow() ? 420 : undefined, margin: isNarrow() ? '0.75rem auto 0' : undefined }}>
          <Suspense fallback={<Poster />}>
            <LazyStoryPlayer
              key={active}
              props={{ kicker: d.kicker, big: d.big, answer: d.answer }}
              onEnded={() => track('complete', { concept: 'ask-video', slug, meta: { q: active } })}
            />
          </Suspense>
        </div>
      )}
      {/* crawlable twin */}
      <div className="mt-4 border-t border-border pt-3">
        {questions.map((k) => (
          <p key={k} className="mb-1.5 text-[13px] leading-relaxed text-muted-foreground">
            <b className="text-foreground">{ASK[k].q}</b> {ASK[k].answer}
          </p>
        ))}
      </div>
    </section>
  )
}
