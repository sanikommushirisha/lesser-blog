import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import {
  fetchPost,
  fetchMorePosts,
  imageUrl,
  authorAvatarUrl,
  altText,
  readTime,
  formatDate,
  type Post,
  type PostListItem,
} from '../lib/sanity'
import { takeInitialData } from '../lib/initial-data'
import { SITE_URL } from '../lib/base'
import { useIntercomForPost } from '../lib/intercom'
import { splitBody, blockText, slugify, type Block, type FaqItem } from '../lib/editorial'
import { RenewalWidget, ScrollExplainer, AskWidget } from '../motion/Widgets'
import { abVariant } from '../motion/events'
import { YouTubePlayer } from '../components/YouTubePlayer'
import { FeaturedVideo } from '../components/FeaturedVideo'
import { RecentPosts } from '../components/RecentPosts'
import { EventPopup } from '../components/EventPopup'
import { parseYouTubeUrl, youTubeThumbnails, youTubeWatchUrl } from '../lib/youtube'
import { Toc, Takeaways, QuickAnswer, Faq, TrustFooter } from '../components/Editorial'

type Node = Record<string, unknown>

function buildJsonLd(
  post: Post,
  opts: {
    siteUrl: string
    canonical: string
    ogImage: string | null
    metaDescription: string
    detectedFaq?: FaqItem[]
  }
) {
  const { siteUrl, canonical, ogImage, metaDescription, detectedFaq } = opts

  const article: Node = {
    '@type': 'Article',
    headline: post.title,
    description: metaDescription,
    ...(ogImage ? { image: ogImage } : {}),
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    ...(post.author
      ? {
          author: {
            '@type': 'Person',
            name: post.author.name,
            ...(post.author.role ? { jobTitle: post.author.role } : {}),
            worksFor: { '@type': 'Organization', name: 'Lesser' },
            url: 'https://lesser.tax/about',
          },
        }
      : {}),
    ...(post.reviewedBy ? { reviewedBy: { '@type': 'Person', name: post.reviewedBy } } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Lesser',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }

  const graph: Node[] = [article]

  // The featured video, so Google can show this page as a video result. The
  // upload date isn't known without the YouTube API; the post's publish date is
  // the closest true statement about when it appeared here.
  const video = parseYouTubeUrl(post.featuredVideo)
  if (video) {
    graph.push({
      '@type': 'VideoObject',
      name: post.title,
      description: metaDescription,
      thumbnailUrl: [imageUrl(post.videoThumbnail, 1280, 720), ...youTubeThumbnails(video.id).slice(1)].filter(Boolean),
      uploadDate: post.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      url: youTubeWatchUrl(video),
    })
  }

  if (post.howTo?.steps?.length) {
    const { name, totalTime, costMin, costMax, steps } = post.howTo
    const cost =
      costMin != null && costMax != null
        ? `${costMin}-${costMax}`
        : costMin != null
          ? String(costMin)
          : costMax != null
            ? String(costMax)
            : null
    graph.push({
      '@type': 'HowTo',
      name: name || post.title,
      ...(totalTime ? { totalTime } : {}),
      ...(cost ? { estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: cost } } : {}),
      step: steps.map((s) => ({ '@type': 'HowToStep', name: s.name, text: s.text, url: canonical })),
    })
  }

  // Structured FAQ wins: the Sanity field when present, else the FAQ section
  // detected in the body (h3 questions under an FAQ h2).
  const faqEntities = post.faq?.length
    ? post.faq.map((f) => ({ question: f.question, answer: f.answer }))
    : (detectedFaq ?? []).map((f) => ({
        question: f.question,
        answer: f.answer.map((b) => blockText(b)).join(' ').trim(),
      }))
  if (faqEntities.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqEntities.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  // Blog > Post only. The category has no archive page to link to, and Google
  // requires an `item` URL on every breadcrumb entry except the last, so a
  // category tier without a URL is invalid ("Missing field item in itemListElement").
  const crumbs: Node[] = [
    { '@type': 'ListItem', position: 1, name: 'Blog', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: post.title, item: canonical },
  ]
  graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs })

  return { '@context': 'https://schema.org', '@graph': graph }
}

/* Voice quote: `"quoted text" - attribution` renders as a typographic pull
   quote with the attribution as a caption. Anything else stays a plain quote. */
function VoiceQuote({ children }: { children?: React.ReactNode }) {
  return (
    <figure className="editorial-voice relative my-8 max-w-[60ch] pl-9">
      <blockquote className="m-0 font-prose text-[19px] italic leading-[1.6] text-foreground [&_a]:text-primary">
        {children}
      </blockquote>
    </figure>
  )
}

/** The post being rendered, for alt-text fallbacks inside the body renderers. */
const PostSlugContext = createContext('')

function BodyImage({ value }: { value: { alt?: string; caption?: string } }) {
  const slug = useContext(PostSlugContext)
  const src = imageUrl(value as never, 1440)
  if (!src) return null
  return (
    <figure className="my-8">
      <img src={src} alt={altText(value.alt, slug)} loading="lazy" className="w-full rounded-xl" />
      {value.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">{value.caption}</figcaption>
      )}
    </figure>
  )
}

function BodyYouTube({ value }: { value: { url?: string; caption?: string } }) {
  const slug = useContext(PostSlugContext)
  const video = parseYouTubeUrl(value.url)
  if (!video) return null
  return (
    <figure className="my-8">
      <YouTubePlayer
        video={video}
        title={value.caption || 'Video'}
        posterAlt={altText(value.caption, slug)}
        className="rounded-xl"
      />
      {value.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">{value.caption}</figcaption>
      )}
    </figure>
  )
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => (
      <h2
        id={slugify(blockText(value as unknown as Block))}
        className="mb-4 mt-11 scroll-mt-6 font-display text-[26px] font-semibold leading-snug tracking-[-0.01em] text-foreground"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 font-display text-[21px] font-semibold text-foreground">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="mb-5 max-w-[66ch] font-prose text-[17.5px] leading-[1.75] text-foreground">{children}</p>
    ),
    blockquote: ({ children }) => <VoiceQuote>{children}</VoiceQuote>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="editorial-list mb-5 list-disc space-y-2 pl-6 font-prose text-[17.5px] leading-[1.75]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="editorial-list mb-5 list-decimal space-y-2 pl-6 font-prose text-[17.5px] leading-[1.75]">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-2 hover:underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    comparisonTable: ({ value }: { value: { headers?: string[]; rows?: { _key?: string; cells?: string[] }[] } }) => {
      const numericCol = (j: number) =>
        j > 0 && (value.rows ?? []).every((r) => !r.cells?.[j] || /^[+\-~$€₹\d]/.test(r.cells[j].trim()))
      const isTotal = (row: { cells?: string[] }) => /total/i.test(row.cells?.[0] ?? '')
      return (
        <div className="my-8 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse font-sans text-sm">
            {value.headers?.some((h) => h) && (
              <thead>
                <tr>
                  {value.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-3 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground ${
                        numericCol(i) ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {value.rows?.map((row, i) => (
                <tr
                  key={row._key ?? i}
                  className={
                    isTotal(row) ? 'border-t border-border' : 'border-b border-border/60 last:border-b-0'
                  }
                >
                  {(row.cells ?? []).map((c, j) => (
                    <td
                      key={j}
                      className={`px-3 py-3 align-top leading-normal ${
                        numericCol(j) ? 'text-right tabular-nums' : ''
                      } ${
                        isTotal(row)
                          ? 'font-semibold text-foreground'
                          : j === 0
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    verifiedFact: ({ value }: { value: { headline?: string; body?: string; sourceLabel?: string; sourceUrl?: string } }) => (
      <aside className="my-7 flex gap-4 border-y border-border py-5 font-sans">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
          ✓
        </span>
        <div>
          {value.headline && <p className="text-lg font-extrabold tracking-tight text-foreground">{value.headline}</p>}
          {value.body && <p className="mb-2 mt-1 text-sm leading-relaxed text-foreground">{value.body}</p>}
          {value.sourceLabel && (
            <p className="text-xs text-muted-foreground">
              Verified against{' '}
              {value.sourceUrl ? (
                <a href={value.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">
                  {value.sourceLabel}
                </a>
              ) : (
                value.sourceLabel
              )}
            </p>
          )}
        </div>
      </aside>
    ),
    marginNote: ({ value }: { value: { text?: string } }) =>
      value.text ? (
        <aside className="my-4 border-l-2 border-primary py-0.5 pl-4 font-sans text-[13px] leading-relaxed text-muted-foreground">
          {value.text}
        </aside>
      ) : null,
    youtube: ({ value }) => <BodyYouTube value={value} />,
    image: ({ value }) => <BodyImage value={value} />,
  },
}

function Avatar({ post, size, className }: { post: Post; size: number; className: string }) {
  const src = authorAvatarUrl(post.author, size)
  if (src) return <img src={src} alt={post.author?.name ?? ''} className={className + ' object-cover'} />
  return (
    <span className={className + ' flex items-center justify-center bg-secondary text-sm font-medium text-primary'}>
      {post.author?.name?.charAt(0) ?? '?'}
    </span>
  )
}

/* ---- motion experiment placements (waves 1-2) ----
   pillar runs the placement A/B: variant a = widget right after the takeaways,
   variant b = injected mid-article after the cost section. SSR renders 'a';
   the client moves it after hydration (crawlers always see the text twin). */
const MOTION: Record<string, { concept: 'renewal' | 'scroll' | 'ask'; ab?: boolean; splitAfterH2?: RegExp; questions?: ('fbar' | 'tatkaal' | 'rsu')[] }> = {
  'indian-passport-renewal-usa': { concept: 'renewal', ab: true, splitAfterH2: /how much does it cost/i },
  'worth-paying-indian-passport-renewal-service': { concept: 'renewal' },
  'tatkaal-passport-renewal-usa-eligibility': { concept: 'scroll', splitAfterH2: /how long does tatkaal take/i },
  'fbar-form-8938-indian-accounts': { concept: 'ask', questions: ['fbar', 'rsu'] },
  'rsu-taxes-h1b-2026': { concept: 'ask', questions: ['rsu', 'tatkaal'] },
}

/** Split main blocks after the section introduced by the h2 matching `re`
 *  (i.e., just before the NEXT h2), so widgets can sit between sections. */
function splitAfterSection(main: Block[], re: RegExp): [Block[], Block[]] {
  const isH2 = (b: Block) => b._type === 'block' && b.style === 'h2'
  let hit = -1
  for (let i = 0; i < main.length; i++) {
    if (hit === -1 && isH2(main[i]) && re.test(blockText(main[i]))) hit = i
    else if (hit !== -1 && isH2(main[i])) return [main.slice(0, i), main.slice(i)]
  }
  return [main, []]
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  // Prerendered pages embed this page's data; consume it once so hydration
  // renders the same markup the server did. Client-side navigation gets null
  // here and falls through to the fetch below.
  const seeded = useMemo(() => takeInitialData(`/${slug}`), [slug])
  const [post, setPost] = useState<Post | null | undefined>(seeded ? (seeded.post ?? null) : undefined)
  const [more, setMore] = useState<PostListItem[]>(seeded?.more ?? [])
  // The featured video's mini player docks here (right column) while floating.
  const videoDock = useRef<HTMLDivElement>(null)
  const [videoDockHeight, setVideoDockHeight] = useState<number | null>(null)

  // The route keys this component by slug, so navigation remounts it with
  // fresh state and this effect only ever runs for the mounted slug.
  useEffect(() => {
    if (!slug || seeded) return
    window.scrollTo(0, 0)
    fetchPost(slug).then(setPost).catch(() => setPost(null))
    fetchMorePosts(slug).then(setMore).catch(() => {})
  }, [slug, seeded])

  useIntercomForPost(
    post ? { title: post.title, slug: post.slug, category: post.category?.title } : null
  )

  const sections = useMemo(
    () => (post?.body ? splitBody(post.body as unknown as Block[]) : null),
    [post]
  )

  const motion = slug ? MOTION[slug] : undefined
  const [variant, setVariant] = useState<'a' | 'b'>('a')
  useEffect(() => {
    // abVariant() reads localStorage, so it must stay client-only: SSR always
    // renders the 'a' default, then this patches in the real bucket post-mount
    // to avoid a hydration mismatch — computing it during render is not an option.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (motion?.ab) setVariant(abVariant('renewal-placement'))
  }, [motion])

  if (post === undefined) {
    return (
      <main className="mx-auto w-full max-w-[720px] animate-pulse px-4 pt-10 sm:px-6" aria-busy="true">
        <div className="h-5 w-28 rounded-md bg-muted" />
        <div className="mt-6 h-10 w-full rounded-md bg-muted" />
        <div className="mt-3 h-10 w-2/3 rounded-md bg-muted" />
        <div className="mt-8 aspect-video w-full rounded-xl bg-muted" />
      </main>
    )
  }

  if (post === null) {
    return (
      <main className="mx-auto w-full max-w-[720px] px-4 pt-16 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">Article not found</h1>
        <p className="mt-3 text-muted-foreground">It may have been moved or unpublished.</p>
        <Link to="/" className="mt-6 inline-block font-medium text-primary hover:text-primary-dark">
          ← All articles
        </Link>
      </main>
    )
  }

  const metaTitle = post.seo?.metaTitle ?? post.title
  const metaDescription = post.seo?.metaDescription ?? post.excerpt
  const ogImage = imageUrl(post.seo?.ogImage, 1200, 630) ?? imageUrl(post.mainImage, 1200, 630)
  const heroImage = imageUrl(post.mainImage, 1600, 900)
  const heroVideo = parseYouTubeUrl(post.featuredVideo)
  const updated = Boolean(post._updatedAt) && formatDate(post._updatedAt) !== formatDate(post.publishedAt)
  const siteUrl = SITE_URL
  const canonical = `${siteUrl}/${post.slug}`
  const jsonLd = buildJsonLd(post, {
    siteUrl,
    canonical,
    ogImage,
    metaDescription,
    detectedFaq: sections?.faq,
  })

  return (
    <>
      <Helmet>
        <title>{`${metaTitle} — Lesser Blog`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonical} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Event promo; only on article pages, client-only, self-scheduling. */}
      <EventPopup />

      {/* Title header: breadcrumb + date above the title, so the featured image
          directly below is the first thing in the article itself. */}
      <header>
        <div className="mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 sm:pt-12 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  {/* Plain <a>: the marketing home is outside the blog's router. */}
                  <a href="/" className="transition-colors hover:text-primary">Home</a>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to="/" className="transition-colors hover:text-primary">Blog</Link>
                </li>
                {post.category && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li className="text-foreground">{post.category.title}</li>
                  </>
                )}
              </ol>
            </nav>
            <time dateTime={updated ? post._updatedAt : post.publishedAt}>
              {updated ? `Updated ${formatDate(post._updatedAt)}` : `Published ${formatDate(post.publishedAt)}`}
            </time>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-[1.12] tracking-[-0.02em] text-foreground sm:text-[44px]">
            {post.title}
          </h1>
        </div>
      </header>

      {/* Full-width layout: [On this page | article | Recent blogs] on wide
          screens, [article | Recent blogs] on laptops, one column on phones.
          The article column takes whatever width is left. */}
      <main className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 sm:pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 lg:px-10 xl:grid-cols-[200px_minmax(0,1fr)_340px] xl:gap-12">
        {/* Sticky: this column stretches to the article's height, so its content
            can follow the reader down the page. Scrolls itself if the list of
            sections is taller than the screen. */}
        <div className="hidden xl:block">
          <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-4">
            <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              ← All articles
            </Link>
            {sections && (
              <div className="mt-8">
                <Toc items={sections.toc} />
              </div>
            )}
          </div>
        </div>

        <div>
        <PostSlugContext.Provider value={post.slug}>
        <article>
          {/* The featured image (or video) opens the article. */}
          {heroVideo ? (
            <FeaturedVideo
              video={heroVideo}
              title={post.title}
              poster={imageUrl(post.videoThumbnail, 1600, 900)}
              posterAlt={altText(post.videoThumbnail?.alt, post.slug)}
              dockSlot={videoDock}
              onFloatHeightChange={setVideoDockHeight}
            />
          ) : (
            heroImage && (
              <img
                src={heroImage}
                alt={altText(post.mainImage?.alt, post.slug)}
                fetchPriority="high"
                className="aspect-video w-full rounded-2xl object-cover shadow-card-lg"
              />
            )
          )}

          <div className="mt-6 flex items-center gap-3 border-b border-border pb-4 font-sans">
            <Avatar post={post} size={88} className="h-11 w-11 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold text-foreground">
                {post.author?.name ?? 'Lesser'}
                {post.author?.role && <span className="font-semibold text-primary"> · {post.author.role}</span>}
              </p>
              <p className="text-[12.5px] text-muted-foreground">{readTime(post.wordCount)}</p>
            </div>
          </div>

          {sections?.quickAnswer && <QuickAnswer block={sections.quickAnswer} components={components} />}
          {sections && <Takeaways blocks={sections.takeaways} components={components} />}

          <div className="mb-8 xl:hidden">{sections && <Toc items={sections.toc} />}</div>

          {motion?.concept === 'renewal' && (!motion.ab || variant === 'a') && (
            <RenewalWidget slug={post.slug} placement="top" variant={motion.ab ? variant : undefined} />
          )}

          <div className="mt-8">
            {motion?.splitAfterH2 && sections ? (
              (() => {
                const [before, after] = splitAfterSection(sections.main, motion.splitAfterH2)
                return (
                  <>
                    <PortableText value={before as never} components={components} />
                    {motion.concept === 'renewal' && motion.ab && variant === 'b' && (
                      <RenewalWidget slug={post.slug} placement="mid" variant={variant} />
                    )}
                    {motion.concept === 'scroll' && <ScrollExplainer slug={post.slug} />}
                    <PortableText value={after as never} components={components} />
                  </>
                )
              })()
            ) : (
              <PortableText value={(sections?.main ?? post.body) as never} components={components} />
            )}
          </div>

          {motion?.concept === 'ask' && <AskWidget slug={post.slug} questions={motion.questions ?? ['fbar']} />}

          {sections && <Faq items={sections.faq} components={components} />}
          {(sections?.sources || post.author) && (
            <TrustFooter
              sources={sections?.sources ?? null}
              author={post.author ?? null}
              avatar={<Avatar post={post} size={96} className="h-12 w-12 rounded-full" />}
            />
          )}
        </article>
        </PostSlugContext.Provider>

        {/* Below the article where there's no right column. */}
        <RecentPosts posts={more} className="mt-16 lg:hidden" />
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-8">
            {/* Space for the floating video; grows with the same timing as its animation. */}
            <div
              ref={videoDock}
              aria-hidden="true"
              style={{ height: videoDockHeight ?? 0 }}
              className="transition-[height] duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
            />
            <RecentPosts posts={more} />
          </div>
        </div>
      </main>
    </>
  )
}
