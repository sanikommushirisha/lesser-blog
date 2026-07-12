// The blog composition family. Design language mirrors the editorial system
// (indigo world, verified-tick signature open, restraint everywhere else).
// Used three ways: <Player> in-post (instant), scroll-scrubbed <Player>
// (tatkaal explainer), and CLI-rendered MP4s for /videos/ watch pages.
import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion'
import { CONSULATES, FEES, type Plan } from './constants'

const BG = 'linear-gradient(160deg,#101a38,#1c2a58)'
const ACCENT = '#9db4ff'
const FPS = 30

/** Scale unit: sizes are designed on a 1280-wide landscape canvas; portrait
 *  canvases (mobile Player, 720x900) scale from a 640 design width so type
 *  stays readable at ~360 CSS px. */
function useU() {
  const { width, height } = useVideoConfig()
  const portrait = height > width
  return { u: width / (portrait ? 640 : 1280), portrait }
}

const fill: React.CSSProperties = {
  background: BG,
  color: '#fff',
  fontFamily: "'Roboto','Segoe UI',-apple-system,sans-serif",
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '4.5%',
}

function Tick({ size = 84, delay = 0 }: { size?: number; delay?: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 120 } })
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: '#34c39a',
        color: '#fff',
        fontSize: size * 0.55,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${s})`,
      }}
    >
      ✓
    </div>
  )
}

function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame()
  const o = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const y = interpolate(frame - delay, [0, 12], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return <div style={{ opacity: o, transform: `translateY(${y}px)`, ...style }}>{children}</div>
}

function Counter({ to, delay = 0, prefix = '$' }: { to: number; delay?: number; prefix?: string }) {
  const frame = useCurrentFrame()
  const v = Math.round(interpolate(frame - delay, [0, 24], [0, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {v.toLocaleString()}
    </span>
  )
}

/* ============ 1. Personalized renewal timeline ============ */
export const TIMELINE_DURATION = 18 * FPS

export function RenewalTimeline({ plan }: { plan: Plan }) {
  const cons = CONSULATES[plan.consulate]
  const { u, portrait } = useU()
  const rowW = portrait ? 520 * u : 560 * u
  const scenes: [number, React.ReactNode][] = [
    [
      3 * FPS,
      <AbsoluteFill key="s1" style={fill}>
        <Tick size={84 * u} />
        <FadeUp delay={8}>
          <div style={{ fontSize: 46 * u, fontWeight: 800, marginTop: 26 * u, letterSpacing: -0.5 }}>
            {plan.name ? `${plan.name}, your renewal timeline` : 'Your renewal timeline'}
          </div>
          <div style={{ fontSize: 22 * u, opacity: 0.7, marginTop: 10 * u }}>verified against the VFS fee schedule · July 2026</div>
        </FadeUp>
      </AbsoluteFill>,
    ],
    [
      3 * FPS,
      <AbsoluteFill key="s2" style={fill}>
        <FadeUp>
          <div style={{ fontSize: 64 * u }}>📍</div>
          <div style={{ fontSize: 44 * u, fontWeight: 800, marginTop: 6 * u }}>{cons.label}</div>
          <div style={{ fontSize: 22 * u, opacity: 0.75, marginTop: 10 * u }}>{cons.jurisdiction}</div>
          {cons.note && <div style={{ fontSize: 19 * u, marginTop: 14 * u, color: '#fcd34d' }}>{cons.note}</div>}
        </FadeUp>
      </AbsoluteFill>,
    ],
    [
      5 * FPS,
      <AbsoluteFill key="s3" style={fill}>
        <div style={{ fontSize: 36 * u, fontWeight: 800, marginBottom: 26 * u }}>What you’ll actually pay</div>
        {[
          ['Government fee', plan.govt, 6],
          ['ICWF', FEES.icwf, 18],
          ['VFS service fee', FEES.vfs, 30],
          ...(plan.tatkaal ? ([['Tatkaal surcharge', plan.tatkaal, 42]] as const) : []),
        ].map(([label, amt, d]) => (
          <FadeUp key={String(label)} delay={d as number} style={{ width: rowW }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 26 * u,
                padding: `${10 * u}px 0`,
                borderBottom: '1px solid rgba(255,255,255,.15)',
              }}
            >
              <span>{label}</span>
              <b>
                <Counter to={amt as number} delay={d as number} />
              </b>
            </div>
          </FadeUp>
        ))}
        <FadeUp delay={plan.tatkaal ? 58 : 46} style={{ width: rowW }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 38 * u, fontWeight: 800, paddingTop: 16 * u, color: ACCENT }}>
            <span>Your total</span>
            <b>
              <Counter to={plan.total} delay={plan.tatkaal ? 58 : 46} />
            </b>
          </div>
        </FadeUp>
      </AbsoluteFill>,
    ],
    [
      4.5 * FPS,
      <AbsoluteFill key="s4" style={fill}>
        <div style={{ fontSize: 36 * u, fontWeight: 800, marginBottom: 70 * u }}>Working back from your trip</div>
        <TimelineBar plan={plan} />
        <FadeUp delay={40}>
          <div style={{ fontSize: 22 * u, opacity: 0.8, marginTop: 64 * u }}>
            {plan.caseType === 'tatkaal' ? 'Tatkaal: ~2-3 weeks door to door' : `Plan ~${plan.weeks} weeks door to door`}
            {plan.tripLabel && plan.applyByLabel ? ` · flight ${plan.tripLabel} → apply by ${plan.applyByLabel}` : ''}
          </div>
          {plan.pvRisk && (
            <div
              style={{
                marginTop: 22,
                display: 'inline-block',
                background: 'rgba(251,191,36,.16)',
                border: '1px solid rgba(251,191,36,.5)',
                color: '#fcd34d',
                fontSize: 20 * u,
                fontWeight: 600,
                borderRadius: 99,
                padding: `${8 * u}px ${22 * u}px`,
              }}
            >
              ⚠ police verification likely — adds ~30 days
            </div>
          )}
        </FadeUp>
      </AbsoluteFill>,
    ],
    [
      2.5 * FPS,
      <AbsoluteFill key="s5" style={fill}>
        <FadeUp>
          <div style={{ fontSize: 40 * u, fontWeight: 800, color: ACCENT }}>Renew with Lesser</div>
          <div style={{ fontSize: 22 * u, opacity: 0.75, marginTop: 12 * u }}>Get the packet right the first time · $140 flat · blog.lesser.tax</div>
        </FadeUp>
        <div style={{ marginTop: 26 * u }}>
          <Tick size={56 * u} delay={6} />
        </div>
      </AbsoluteFill>,
    ],
  ]
  let from = 0
  return (
    <AbsoluteFill style={{ background: BG }}>
      {scenes.map(([d, node], i) => {
        const seq = (
          <Sequence key={i} from={from} durationInFrames={d}>
            {node}
          </Sequence>
        )
        from += d
        return seq
      })}
    </AbsoluteFill>
  )
}

function TimelineBar({ plan }: { plan: Plan }) {
  const frame = useCurrentFrame()
  const { u, portrait } = useU()
  const { width } = useVideoConfig()
  const w = interpolate(frame, [6, 66], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mark = (left: string, text: string) => (
    <div style={{ position: 'absolute', left, top: -44 * u, transform: 'translateX(-50%)', fontSize: (portrait ? 15 : 17) * u, whiteSpace: 'nowrap' }}>
      {text}
      <div style={{ position: 'absolute', left: '50%', top: 32 * u, width: 2, height: 18 * u, background: 'rgba(255,255,255,.5)' }} />
    </div>
  )
  return (
    <div style={{ width: width * 0.82, position: 'relative' }}>
      <div style={{ height: 14 * u, borderRadius: 8, background: 'rgba(255,255,255,.15)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${w}%`, background: `linear-gradient(90deg,#5f79ec,${ACCENT})`, borderRadius: 8 }} />
        {mark('4%', 'today')}
        {mark(portrait ? '38%' : '34%', plan.applyByLabel ? `apply by ${plan.applyByLabel}` : 'apply')}
        {mark(portrait ? '78%' : '74%', 'passport back')}
        <div style={{ position: 'absolute', left: '95%', top: -58 * u, transform: 'translateX(-50%)', fontSize: 30 * u }}>🛫</div>
      </div>
    </div>
  )
}

/* ============ 2. NumberStory (ask → answer, watch pages) ============ */
export const NUMBERSTORY_DURATION = 8 * FPS

export interface NumberStoryProps {
  kicker: string
  big: string
  answer: string
}

export function NumberStory({ kicker, big, answer }: NumberStoryProps) {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()
  const { u } = useU()
  const s = spring({ frame: frame - 10, fps, config: { damping: 12 } })
  return (
    <AbsoluteFill style={fill}>
      <FadeUp>
        <div style={{ fontSize: 20 * u, letterSpacing: '.22em', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>{kicker}</div>
      </FadeUp>
      <div style={{ fontSize: 130 * u, fontWeight: 900, letterSpacing: -4 * u, color: ACCENT, transform: `scale(${s})`, margin: `${18 * u}px 0 ${10 * u}px`, fontVariantNumeric: 'tabular-nums' }}>
        {big}
      </div>
      <FadeUp delay={26}>
        <div style={{ fontSize: 26 * u, opacity: 0.85, maxWidth: width * 0.85, lineHeight: 1.5 }}>{answer}</div>
      </FadeUp>
      <FadeUp delay={26}>
        <div style={{ fontSize: 17 * u, opacity: 0.5, marginTop: 30 * u }}>blog.lesser.tax · verified July 2026</div>
      </FadeUp>
    </AbsoluteFill>
  )
}

/* ============ 3. Tatkaal explainer (scroll-scrub + watch page MP4) ============ */
export const EXPLAINER_DURATION = 16 * FPS

const EXPLAINER_STEPS = [
  { at: 0.06, label: 'apply online', cap: 'Day 0 — Passport Seva form, Tatkaal selected. Forms expire in 180 days.' },
  { at: 0.32, label: 'VFS packet', cap: 'Day 2-4 — packet lands at VFS. This is where holds happen.' },
  { at: 0.62, label: '5 working days', cap: 'Day 5-11 — the consulate prints in 5 working days if your PVR is clear.' },
  { at: 0.88, label: 'courier back', cap: 'Day 12-15 — courier back. ~2-3 weeks door to door, $271 all-in (36-page).' },
]

export function TatkaalExplainer() {
  const frame = useCurrentFrame()
  const { durationInFrames, width } = useVideoConfig()
  const { u, portrait } = useU()
  const p = frame / durationInFrames
  const active = [...EXPLAINER_STEPS].reverse().find((s) => p >= s.at - 0.04)
  return (
    <AbsoluteFill style={fill}>
      <div style={{ fontSize: 40 * u, fontWeight: 800, marginBottom: 84 * u }}>The Tatkaal route, day by day</div>
      <div style={{ width: width * 0.84, position: 'relative' }}>
        <div style={{ height: 14 * u, borderRadius: 8, background: 'rgba(255,255,255,.15)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${Math.min(100, p * 112)}%`,
              background: `linear-gradient(90deg,#5f79ec,${ACCENT})`,
              borderRadius: 8,
            }}
          />
          {EXPLAINER_STEPS.map((s) => (
            <div
              key={s.label}
              style={{
                position: 'absolute',
                left: `${s.at * 100}%`,
                top: -46 * u,
                transform: 'translateX(-50%)',
                fontSize: (portrait ? 15 : 18) * u,
                whiteSpace: 'nowrap',
                opacity: p >= s.at - 0.06 ? 1 : 0.4,
                fontWeight: active?.label === s.label ? 800 : 400,
                color: active?.label === s.label ? ACCENT : '#fff',
              }}
            >
              {s.label}
              <div style={{ position: 'absolute', left: '50%', top: 34 * u, width: 2, height: 18 * u, background: 'rgba(255,255,255,.5)' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 24 * u, opacity: 0.85, marginTop: 80 * u, maxWidth: width * 0.82, minHeight: 76 * u }}>{active?.cap ?? 'It starts online.'}</div>
    </AbsoluteFill>
  )
}
