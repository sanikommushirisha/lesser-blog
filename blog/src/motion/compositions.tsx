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

const fill: React.CSSProperties = {
  background: BG,
  color: '#fff',
  fontFamily: "'Roboto','Segoe UI',-apple-system,sans-serif",
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: 60,
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
  const scenes: [number, React.ReactNode][] = [
    [
      3 * FPS,
      <AbsoluteFill key="s1" style={fill}>
        <Tick />
        <FadeUp delay={8}>
          <div style={{ fontSize: 46, fontWeight: 800, marginTop: 26, letterSpacing: -0.5 }}>
            {plan.name ? `${plan.name}, your renewal timeline` : 'Your renewal timeline'}
          </div>
          <div style={{ fontSize: 22, opacity: 0.7, marginTop: 10 }}>verified against the VFS fee schedule · July 2026</div>
        </FadeUp>
      </AbsoluteFill>,
    ],
    [
      3 * FPS,
      <AbsoluteFill key="s2" style={fill}>
        <FadeUp>
          <div style={{ fontSize: 64 }}>📍</div>
          <div style={{ fontSize: 44, fontWeight: 800, marginTop: 6 }}>{cons.label}</div>
          <div style={{ fontSize: 22, opacity: 0.75, marginTop: 10 }}>{cons.jurisdiction}</div>
          {cons.note && <div style={{ fontSize: 19, marginTop: 14, color: '#fcd34d' }}>{cons.note}</div>}
        </FadeUp>
      </AbsoluteFill>,
    ],
    [
      5 * FPS,
      <AbsoluteFill key="s3" style={fill}>
        <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 26 }}>What you’ll actually pay</div>
        {[
          ['Government fee', plan.govt, 6],
          ['ICWF', FEES.icwf, 18],
          ['VFS service fee', FEES.vfs, 30],
          ...(plan.tatkaal ? ([['Tatkaal surcharge', plan.tatkaal, 42]] as const) : []),
        ].map(([label, amt, d]) => (
          <FadeUp key={String(label)} delay={d as number} style={{ width: 560 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 26,
                padding: '10px 0',
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
        <FadeUp delay={plan.tatkaal ? 58 : 46} style={{ width: 560 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 38, fontWeight: 800, paddingTop: 16, color: ACCENT }}>
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
        <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 70 }}>Working back from your trip</div>
        <TimelineBar plan={plan} />
        <FadeUp delay={40}>
          <div style={{ fontSize: 22, opacity: 0.8, marginTop: 64 }}>
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
                fontSize: 20,
                fontWeight: 600,
                borderRadius: 99,
                padding: '8px 22px',
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
          <div style={{ fontSize: 40, fontWeight: 800, color: ACCENT }}>Get the packet right the first time</div>
          <div style={{ fontSize: 22, opacity: 0.75, marginTop: 12 }}>Lesser passport prep · $140 flat · blog.lesser.tax</div>
        </FadeUp>
        <div style={{ marginTop: 26 }}>
          <Tick size={56} delay={6} />
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
  const w = interpolate(frame, [6, 66], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mark = (left: string, text: string) => (
    <div style={{ position: 'absolute', left, top: -44, transform: 'translateX(-50%)', fontSize: 17, whiteSpace: 'nowrap' }}>
      {text}
      <div style={{ position: 'absolute', left: '50%', top: 32, width: 2, height: 18, background: 'rgba(255,255,255,.5)' }} />
    </div>
  )
  return (
    <div style={{ width: 760, position: 'relative' }}>
      <div style={{ height: 14, borderRadius: 8, background: 'rgba(255,255,255,.15)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${w}%`, background: `linear-gradient(90deg,#5f79ec,${ACCENT})`, borderRadius: 8 }} />
        {mark('4%', 'today')}
        {mark('34%', plan.applyByLabel ? `apply by ${plan.applyByLabel}` : 'apply')}
        {mark('74%', 'passport back')}
        <div style={{ position: 'absolute', left: '95%', top: -58, transform: 'translateX(-50%)', fontSize: 30 }}>🛫</div>
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
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - 10, fps, config: { damping: 12 } })
  return (
    <AbsoluteFill style={fill}>
      <FadeUp>
        <div style={{ fontSize: 20, letterSpacing: '.22em', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>{kicker}</div>
      </FadeUp>
      <div style={{ fontSize: 130, fontWeight: 900, letterSpacing: -4, color: ACCENT, transform: `scale(${s})`, margin: '18px 0 10px', fontVariantNumeric: 'tabular-nums' }}>
        {big}
      </div>
      <FadeUp delay={26}>
        <div style={{ fontSize: 26, opacity: 0.85, maxWidth: 720, lineHeight: 1.5 }}>{answer}</div>
      </FadeUp>
      <FadeUp delay={26}>
        <div style={{ fontSize: 17, opacity: 0.5, marginTop: 30 }}>blog.lesser.tax · verified July 2026</div>
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
  const { durationInFrames } = useVideoConfig()
  const p = frame / durationInFrames
  const active = [...EXPLAINER_STEPS].reverse().find((s) => p >= s.at - 0.04)
  return (
    <AbsoluteFill style={fill}>
      <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 84 }}>The Tatkaal route, day by day</div>
      <div style={{ width: 860, position: 'relative' }}>
        <div style={{ height: 14, borderRadius: 8, background: 'rgba(255,255,255,.15)', position: 'relative' }}>
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
                top: -46,
                transform: 'translateX(-50%)',
                fontSize: 18,
                whiteSpace: 'nowrap',
                opacity: p >= s.at - 0.06 ? 1 : 0.4,
                fontWeight: active?.label === s.label ? 800 : 400,
                color: active?.label === s.label ? ACCENT : '#fff',
              }}
            >
              {s.label}
              <div style={{ position: 'absolute', left: '50%', top: 34, width: 2, height: 18, background: 'rgba(255,255,255,.5)' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 24, opacity: 0.85, marginTop: 80, maxWidth: 760, minHeight: 76 }}>{active?.cap ?? 'It starts online.'}</div>
    </AbsoluteFill>
  )
}
