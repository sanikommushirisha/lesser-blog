// Dedicated video watch pages (/videos/:slug) — the only page type Google
// still grants video rich results to (video must be the PRIMARY content).
// Each page: self-hosted MP4 + poster, VideoObject JSON-LD, and a full
// transcript-style text twin so every fact is crawlable.
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { track } from '../motion/events'

export interface WatchVideo {
  slug: string
  title: string
  description: string
  duration: string // ISO 8601
  durationLabel: string
  uploadDate: string
  mp4: string
  poster: string
  relatedPost: { slug: string; title: string }
  transcript: { heading: string; lines: string[] }[]
}

export const VIDEOS: WatchVideo[] = [
  {
    slug: 'tatkaal-from-the-us-in-45-seconds',
    title: 'Tatkaal from the US, day by day',
    description:
      'The urgent Indian passport re-issue route from the USA in under a minute: what Tatkaal actually expedites, the 5-working-day consulate leg, and the $271 all-in total for a 36-page booklet.',
    duration: 'PT16S',
    durationLabel: '0:16',
    uploadDate: '2026-07-12',
    mp4: '/videos/tatkaal-explainer.mp4',
    poster: '/videos/tatkaal-explainer-poster.png',
    relatedPost: { slug: 'tatkaal-passport-renewal-usa-eligibility', title: 'Tatkaal eligibility from the US: the complete guide' },
    transcript: [
      {
        heading: 'What the video covers',
        lines: [
          'Day 0: the Passport Seva form, with Tatkaal selected. The form is the same as the normal route; the queue changes, not the paperwork. Forms expire after 180 days.',
          'Days 2-4: your packet lands at VFS Global. This is where applications go on hold — wrong jurisdiction or a stale photo spec stops the file before the consulate ever sees it.',
          'Days 5-11: the consulate prints in 5 working days, if your police verification record is clear. Only this leg is expedited.',
          'Days 12-15: courier back. About 2 to 3 weeks door to door, versus roughly 8 weeks on the normal route.',
          'Cost: the Tatkaal surcharge is a flat $125 on top of the base fees — $125 government fee + $2 ICWF + $19 VFS service fee, so a 36-page booklet lands at $271 all-in ($321 for the 60-page jumbo).',
        ],
      },
    ],
  },
]

export function WatchPage() {
  const { vslug } = useParams<{ vslug: string }>()
  const video = VIDEOS.find((v) => v.slug === vslug)
  if (!video) {
    return (
      <main className="mx-auto w-full max-w-[720px] px-4 pt-16 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">Video not found</h1>
        <Link to="/" className="mt-6 inline-block font-medium text-primary">
          ← All articles
        </Link>
      </main>
    )
  }
  const siteUrl = 'https://blog.lesser.tax'
  const canonical = `${siteUrl}/videos/${video.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: siteUrl + video.poster,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: siteUrl + video.mp4,
    publisher: { '@type': 'Organization', name: 'Lesser', logo: { '@type': 'ImageObject', url: 'https://lesser.tax/logo.png' } },
  }
  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pt-10 font-sans sm:px-6">
      <Helmet>
        <title>{`${video.title} — Lesser Blog`}</title>
        <meta name="description" content={video.description} />
        <link rel="canonical" href={canonical} />
        {/* Open Graph / Twitter — so shared links render a rich card (poster + video) */}
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={video.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={siteUrl + video.poster} />
        <meta property="og:video" content={siteUrl + video.mp4} />
        <meta property="og:video:type" content="video/mp4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={video.title} />
        <meta name="twitter:description" content={video.description} />
        <meta name="twitter:image" content={siteUrl + video.poster} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
        ← All articles
      </Link>
      <p className="eyebrow mt-6">Lesser explains · {video.durationLabel}</p>
      <h1 className="mb-5 mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl">{video.title}</h1>
      <video
        controls
        preload="none"
        poster={video.poster}
        playsInline
        onPlay={() => track('play', { concept: 'watch-page', slug: video.slug })}
        onEnded={() => track('complete', { concept: 'watch-page', slug: video.slug })}
        className="w-full rounded-xl"
        style={{ aspectRatio: '16/8.5', background: '#101a38' }}
      >
        <source src={video.mp4} type="video/mp4" />
      </video>
      <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-muted-foreground">{video.description}</p>

      {video.transcript.map((t) => (
        <section key={t.heading} className="mt-8">
          <h2 className="mb-3 text-xl font-semibold text-foreground">{t.heading}</h2>
          {t.lines.map((l, i) => (
            <p key={i} className="mb-3 max-w-[70ch] text-[15px] leading-relaxed text-muted-foreground">
              {l}
            </p>
          ))}
        </section>
      ))}

      <div className="mb-16 mt-10 border-t border-border pt-5">
        <p className="eyebrow !text-muted-foreground">Read the full guide</p>
        <Link to={`/${video.relatedPost.slug}`} className="mt-2 inline-block text-[15px] font-semibold text-foreground hover:text-primary">
          {video.relatedPost.title} <span className="text-primary">→</span>
        </Link>
      </div>
    </main>
  )
}
