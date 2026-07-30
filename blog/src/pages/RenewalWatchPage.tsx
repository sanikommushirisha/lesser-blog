// Personalized renewal share pages (/r/:combo). These are SHARE landing pages,
// not SEO targets: noindex (so 64 templated combos don't read as thin/doorway
// pages), but with full OpenGraph + VideoObject so WhatsApp/social render a rich
// video preview, and a crawlable text twin so any bot that does fetch sees the
// facts. The one indexed SERP video lane stays the curated /videos/ pages.
import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { computePlan, planSentence, CONSULATES, type PlanInput } from '../motion/constants'
import { comboSlug, parseComboSlug } from '../motion/combos'
import { RENEWAL_VIDEOS } from './renewalVideos.generated'
import { track } from '../motion/events'

const LazyRenewalPlayer = lazy(() => import('../motion/players').then((m) => ({ default: m.RenewalPlayer })))

const SITE = 'https://blog.lesser.tax'

export function RenewalWatchPage() {
  const { combo } = useParams<{ combo: string }>()
  const key = parseComboSlug(combo ?? '')
  if (!key) {
    return (
      <main className="mx-auto w-full max-w-[720px] px-4 pt-16 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">Timeline not found</h1>
        <Link to="/indian-passport-renewal-usa" className="mt-6 inline-block font-medium text-primary">
          Build your own renewal timeline →
        </Link>
      </main>
    )
  }

  // Optional overlays (interactive replay + text twin only; NOT in the shared MP4).
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const input: PlanInput = {
    ...key,
    trip: params?.get('t') || undefined,
    name: params?.get('n') || undefined,
  }
  // key is non-null past the guard, so the canonical slug is a guaranteed string.
  const comboId = comboSlug(key)
  const plan = computePlan(input)
  const cons = CONSULATES[key.consulate]
  const video = RENEWAL_VIDEOS[comboId]
  const canonical = `${SITE}/r/${comboId}`
  const title = `${cons.label} · ${caseLabel(key.caseType)} — your renewal timeline`
  const description = planSentence(plan)

  const jsonLd = video && {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl: video.poster,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.mp4,
    publisher: { '@type': 'Organization', name: 'Lesser', logo: { '@type': 'ImageObject', url: 'https://lesser.tax/logo.png' } },
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-4 pt-10 font-sans sm:px-6">
      <Helmet>
        <title>{`${title} — Lesser`}</title>
        <meta name="description" content={description} />
        {/* Share landing page, not an SEO target. */}
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {video && <meta property="og:image" content={video.poster} />}
        {video && <meta property="og:video" content={video.mp4} />}
        {video && <meta property="og:video:type" content="video/mp4" />}
        {video && <meta property="og:video:width" content={String(video.width)} />}
        {video && <meta property="og:video:height" content={String(video.height)} />}
        <meta name="twitter:card" content={video ? 'player' : 'summary'} />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>

      <Link to="/indian-passport-renewal-usa" className="text-sm text-muted-foreground hover:text-primary">
        ← Indian passport renewal guide
      </Link>
      <h1 className="mb-4 mt-6 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
        {plan.name ? `${plan.name}, your renewal timeline` : 'Your renewal timeline'}
      </h1>

      <div className="mx-auto overflow-hidden rounded-2xl" style={{ maxWidth: 380 }}>
        {video ? (
          <video
            controls
            autoPlay
            muted
            playsInline
            poster={video.poster}
            onPlay={() => track('play', { concept: 'renewal-share', slug: comboId, meta: { auto: true } })}
            onEnded={() => track('complete', { concept: 'renewal-share', slug: comboId })}
            className="w-full"
            style={{ aspectRatio: '9/16', background: '#101a38' }}
          >
            <source src={video.mp4} type="video/mp4" />
          </video>
        ) : (
          // No pre-rendered MP4 for this combo yet — replay live in-browser.
          <Suspense fallback={<div className="flex aspect-[9/16] items-center justify-center bg-[#101a38] text-sm text-white">loading…</div>}>
            <LazyRenewalPlayer plan={plan} onEnded={() => track('complete', { concept: 'renewal-share', slug: comboId })} />
          </Suspense>
        )}
      </div>

      {/* Crawlable twin — every fact in the HTML, same constants as the video. */}
      <p className="mx-auto mt-5 max-w-[46ch] text-center text-[15px] leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6">
        <a
          href="https://lesser.tax/services/passport-renewal"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('cta', { concept: 'renewal-share', slug: comboId })}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground no-underline"
        >
          Renew with Lesser · $140 flat
        </a>
        <Link to="/indian-passport-renewal-usa#your-timeline" className="text-sm font-medium text-muted-foreground hover:text-primary">
          Build your own timeline →
        </Link>
      </div>
      <div className="h-16" />
    </main>
  )
}

function caseLabel(c: PlanInput['caseType']): string {
  return { normal: 'standard re-issue', tatkaal: 'Tatkaal (urgent)', lost: 'lost / damaged', minor: "minor's renewal" }[c]
}
