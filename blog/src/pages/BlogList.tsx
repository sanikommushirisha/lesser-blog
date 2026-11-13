import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { fetchPosts, isConfigured, type PostListItem } from '../lib/sanity'
import { FeaturedPostCard, PostCard } from '../components/PostCard'
import { PostCardSkeleton } from '../components/Skeleton'
import { ArrowDownIcon, CloseIcon, SearchIcon } from '../components/Icons'
import { filterPosts, topicsOf } from '../lib/blog-filters'
import { takeInitialData } from '../lib/initial-data'
import { SITE_URL } from '../lib/base'
import { BRAND, ORGANIZATION } from '../lib/seo'

const TITLE = `NRI Tax and Indian Passport Guides for the USA | ${BRAND}`
const DESCRIPTION =
  'Guides for Indians in the U.S. on NRI taxes, FBAR, the India-U.S. tax treaty, Indian passport renewal, and equity and business taxes, by tax experts.'

/** The blog and its articles, newest first, plus Home > Blog breadcrumbs. */
function blogJsonLd(posts: PostListItem[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${SITE_URL}#blog`,
        name: `${BRAND} Blog`,
        url: SITE_URL,
        description: DESCRIPTION,
        publisher: ORGANIZATION,
        inLanguage: 'en-US',
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: `${SITE_URL}/${p.slug}`,
          datePublished: p.publishedAt,
          dateModified: p._updatedAt || p.publishedAt,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lesser.tax/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE_URL },
        ],
      },
    ],
  }
}

/** Guides shown in the grid before "Show more", and how many each click adds. */
const PAGE_SIZE = 12
const SIGN_UP = 'https://lesser.tax/app/auth/sign-up?utm_source=blog&utm_medium=blog_list'

function capture(event: string, props: Record<string, unknown>) {
  try {
    ;(window as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog?.capture(event, props)
  } catch {
    /* analytics must never break the page */
  }
}

// false while React hydrates the prerendered HTML (and on the server), true after.
const noSubscribe = () => () => {}
const useHydrated = () =>
  useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  )

const eyebrow = 'text-sm font-semibold uppercase tracking-[0.14em] text-primary-mid'
const pillButton =
  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function BlogList() {
  const seeded = useMemo(() => takeInitialData('/'), [])
  const [posts, setPosts] = useState<PostListItem[] | null>(seeded?.posts ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (seeded?.posts) return
    fetchPosts().then(setPosts).catch(() => setError(true))
  }, [seeded])

  // The filters live in the URL (/blog?q=fbar&topic=tax-planning) so a filtered
  // view can be shared. They are read only after hydration: the prerendered
  // HTML is the unfiltered page (every guide, for crawlers), and the first
  // browser render has to match it.
  const [params, setParams] = useSearchParams()
  const hydrated = useHydrated()

  const topics = useMemo(() => topicsOf(posts ?? []), [posts])
  const query = hydrated ? (params.get('q') ?? '') : ''
  const topicParam = hydrated ? (params.get('topic') ?? '') : ''
  const topic = topics.find((t) => t.slug === topicParam) ?? null
  const filtering = Boolean(query.trim() || topic)

  const results = useMemo(
    () => filterPosts(posts ?? [], { query, topic: topic?.slug ?? '' }),
    [posts, query, topic]
  )
  // Unfiltered, the newest guide is featured on its own and the grid holds the rest.
  const featured = !filtering ? (posts?.[0] ?? null) : null
  const grid = filtering ? results : (posts?.slice(1) ?? [])

  // "Show more" reveals PAGE_SIZE more each click, counted per filter so a new
  // search or topic starts again at the first PAGE_SIZE.
  const filterKey = `${query}|${topic?.slug ?? ''}`
  const [extra, setExtra] = useState({ key: '', count: 0 })
  const shown = PAGE_SIZE + (extra.key === filterKey ? extra.count : 0)

  function setFilter(next: { q?: string; topic?: string }, { replace }: { replace: boolean }) {
    const p = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value) p.set(key, value)
      else p.delete(key)
    }
    setParams(p, { replace, preventScrollReset: true })
  }

  function pickTopic(slug: string) {
    setFilter({ topic: slug }, { replace: false })
    if (slug) capture('blog_topic_selected', { topic: slug })
  }

  // What readers search for, and which searches find nothing, shows which
  // guides are missing. Sent once the reader stops typing.
  const resultCount = results.length
  useEffect(() => {
    const q = query.trim()
    if (!q) return
    const timer = window.setTimeout(
      () => capture('blog_search', { query: q, results: resultCount, topic: topic?.slug ?? null }),
      1200
    )
    return () => window.clearTimeout(timer)
  }, [query, topic, resultCount])

  const heading = query.trim()
    ? `Results for "${query.trim()}"${topic ? ` in ${topic.title}` : ''}`
    : (topic?.title ?? 'All guides')
  const countLine = filtering
    ? `${resultCount} ${resultCount === 1 ? 'guide' : 'guides'}`
    : `${posts?.length ?? 0} guides, newest first`

  return (
    <main className="w-full pb-4">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={BRAND} />
        <meta property="og:image" content="https://lesser.tax/og-nri.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        {posts?.length ? <script type="application/ld+json">{JSON.stringify(blogJsonLd(posts))}</script> : null}
      </Helmet>

      {/* Hero: title, search and topics, on a soft brand-green glow. */}
      <section className="relative isolate overflow-hidden px-6 pt-16 pb-12 sm:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
          style={{ background: 'radial-gradient(ellipse 55% 65% at 50% 0%, #e8f5f3 0%, transparent 100%)' }} /* hero-tint */
        />
        <div className="mx-auto max-w-4xl text-center">
          <p className={eyebrow}>The {BRAND} blog</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Tax and passport guides for Indians in the U.S.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Plain-English guides to NRI taxes, FBAR, the India-U.S. tax treaty, Indian passport renewal, and equity
            and business taxes for founders, from the tax team at {BRAND}.
          </p>

          <form role="search" className="relative mx-auto mt-9 max-w-xl" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="blog-search" className="sr-only">
              Search the guides
            </label>
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(e) => setFilter({ q: e.target.value }, { replace: true })}
              placeholder="Search guides: FBAR, OCI, RSUs, ITR..."
              autoComplete="off"
              enterKeyHint="search"
              className="h-14 w-full rounded-full border border-card-border bg-card pl-13 pr-12 text-base text-foreground shadow-card outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:shadow-card-lg [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setFilter({ q: '' }, { replace: true })}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </form>

          {topics.length > 0 && (
            <div
              role="group"
              aria-label="Filter by topic"
              className="-mx-6 mt-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
            >
              {[{ slug: '', title: 'All guides', count: posts?.length ?? 0 }, ...topics].map((t) => {
                const active = (topic?.slug ?? '') === t.slug
                return (
                  <button
                    key={t.slug || 'all'}
                    type="button"
                    aria-pressed={active}
                    onClick={() => pickTopic(t.slug)}
                    className={`${pillButton} ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-card-border bg-card text-foreground hover:border-primary'
                    }`}
                  >
                    {t.title}
                    <span className={active ? 'text-primary-foreground/75' : 'text-muted-foreground'}>{t.count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6">
        {error && (
          <p className="mt-10 text-muted-foreground">
            {isConfigured
              ? "Couldn't load articles right now. Please refresh in a moment."
              : 'The blog is not connected to Sanity yet: set VITE_SANITY_PROJECT_ID in the deployment environment variables.'}
          </p>
        )}

        {!error && posts?.length === 0 && <p className="mt-10 text-muted-foreground">New articles coming soon.</p>}

        {featured && (
          <section aria-labelledby="latest-heading" className="mt-4">
            <div className="mb-8 text-center">
              <p className={eyebrow}>Latest</p>
              <h2 id="latest-heading" className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
                Fresh from our tax team
              </h2>
            </div>
            <FeaturedPostCard post={featured} />
          </section>
        )}

        <section aria-labelledby="guides-heading" className={featured ? 'mt-20' : 'mt-4'}>
          <div
            className={`mb-8 flex flex-wrap items-end gap-4 ${filtering ? 'justify-between' : 'justify-center text-center'}`}
          >
            <div>
              {!filtering && <p className={`${eyebrow} mb-2`}>Browse</p>}
              <h2 id="guides-heading" className="font-display text-3xl text-foreground sm:text-4xl">
                {heading}
              </h2>
              <p className="mt-2 text-muted-foreground" aria-live="polite">
                {countLine}
              </p>
            </div>
            {filtering && (
              <button
                type="button"
                onClick={() => setFilter({ q: '', topic: '' }, { replace: false })}
                className={`${pillButton} border-card-border bg-card text-foreground hover:border-primary`}
              >
                <CloseIcon className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>

          {filtering && resultCount === 0 ? (
            <div className="rounded-card border border-dashed border-card-border bg-card px-6 py-14 text-center">
              <p className="text-lg font-semibold text-foreground">
                No guides match &ldquo;{query.trim()}&rdquo;{topic ? ` in ${topic.title}` : ''}.
              </p>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Try a shorter word or another topic, or ask our tax team about your situation.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setFilter({ q: '', topic: '' }, { replace: false })}
                  className={`${pillButton} border-card-border bg-card text-foreground hover:border-primary`}
                >
                  Show all guides
                </button>
                <a href={SIGN_UP} className={`${pillButton} border-primary bg-primary text-primary-foreground hover:bg-primary-dark`}>
                  Ask a CPA
                </a>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {posts === null && !error ? (
                <>
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </>
              ) : (
                grid.map((post, i) => <PostCard key={post._id} post={post} hidden={i >= shown} />)
              )}
            </ul>
          )}

          {grid.length > shown && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setExtra({ key: filterKey, count: shown })}
                className={`${pillButton} border-card-border bg-card px-6 py-3 font-semibold text-foreground shadow-card hover:border-primary`}
              >
                Show more guides <span className="text-muted-foreground">({grid.length - shown})</span>
                <ArrowDownIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* Closing call to action, like the reference's end band, in the brand green. */}
        <section className="relative isolate mt-24 overflow-hidden rounded-[28px] bg-primary px-6 py-14 text-primary-foreground sm:px-14 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-primary-mid opacity-60 blur-3xl"
          />
          <h2 className="max-w-2xl font-display text-3xl leading-[1.08] text-primary-foreground! sm:text-5xl">
            Have a question a guide can&rsquo;t answer?
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
            A Big Four-trained CPA can look at your own situation: NRI income, FBAR, RSUs, your India tax return or
            your Indian passport renewal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={SIGN_UP}
              className="inline-flex items-center rounded-full bg-background px-6 py-3 font-semibold text-primary transition-colors hover:bg-hero-tint"
            >
              Get started
            </a>
            <a
              href="/nris"
              className="inline-flex items-center rounded-full border border-primary-foreground/40 px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              See NRI tax services
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
