import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import {
  fetchPost,
  fetchMorePosts,
  imageUrl,
  readTime,
  formatDate,
  type Post,
  type PostListItem,
} from '../lib/sanity'
import { takeInitialData } from '../lib/initial-data'
import { useIntercomForPost } from '../lib/intercom'
import { splitBody, blockText, slugify, type Block, type FaqItem } from '../lib/editorial'
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
    dateModified: post.publishedAt,
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
      logo: { '@type': 'ImageObject', url: 'https://lesser.tax/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }

  const graph: Node[] = [article]

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
    image: ({ value }) => {
      const src = imageUrl(value, 1440)
      if (!src) return null
      return (
        <figure className="my-8">
          <img src={src} alt={value.alt ?? ''} loading="lazy" className="w-full rounded-xl" />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
}

function Avatar({ post, size, className }: { post: Post; size: number; className: string }) {
  const src = imageUrl(post.author?.avatar, size, size)
  if (src) return <img src={src} alt="" className={className + ' object-cover'} />
  return (
    <span className={className + ' flex items-center justify-center bg-secondary text-sm font-medium text-primary'}>
      {post.author?.name?.charAt(0) ?? '?'}
    </span>
  )
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  // Prerendered pages embed this page's data; consume it once so hydration
  // renders the same markup the server did. Client-side navigation gets null
  // here and falls through to the fetch below.
  const seeded = useMemo(() => takeInitialData(`/${slug}`), [slug])
  const [post, setPost] = useState<Post | null | undefined>(seeded ? (seeded.post ?? null) : undefined)
  const [more, setMore] = useState<PostListItem[]>(seeded?.more ?? [])

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
  const heroImage = imageUrl(post.mainImage, 1440, 810)
  const siteUrl = 'https://blog.lesser.tax'
  const canonical = `${siteUrl}/${post.slug}`
  const jsonLd = buildJsonLd(post, {
    siteUrl,
    canonical,
    ogImage,
    metaDescription,
    detectedFaq: sections?.faq,
  })

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pt-10 sm:px-6 xl:grid xl:max-w-[980px] xl:grid-cols-[180px_minmax(0,720px)] xl:gap-12">
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

      <div className="hidden xl:block">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
          ← All articles
        </Link>
        {sections && (
          <div className="mt-8">
            <Toc items={sections.toc} />
          </div>
        )}
      </div>

      <div>
        <div className="xl:hidden">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            ← All articles
          </Link>
        </div>

        <article className="mt-6 xl:mt-0">
          {post.category && (
            <span className="eyebrow">
              {post.category.title}
            </span>
          )}
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.14] tracking-[-0.01em] text-foreground sm:text-[40px]">
            {post.title}
          </h1>

          <div className="mt-5 flex items-center gap-3 border-b border-border pb-4 font-sans">
            <Avatar post={post} size={88} className="h-11 w-11 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold text-foreground">
                {post.author?.name ?? 'Lesser'}
                {post.author?.role && <span className="font-semibold text-primary"> · {post.author.role}</span>}
              </p>
              <p className="text-[12.5px] text-muted-foreground">{readTime(post.wordCount)}</p>
            </div>
            <span className="whitespace-nowrap text-[12.5px] text-muted-foreground">
              Updated {formatDate(post.publishedAt)}
            </span>
          </div>

          {sections?.quickAnswer && <QuickAnswer block={sections.quickAnswer} components={components} />}
          {sections && <Takeaways blocks={sections.takeaways} components={components} />}

          <div className="mb-8 xl:hidden">{sections && <Toc items={sections.toc} />}</div>

          {heroImage && (
            <img
              src={heroImage}
              alt={post.mainImage?.alt ?? ''}
              className="mt-2 aspect-video w-full rounded-md object-cover"
            />
          )}

          <div className="mt-8">
            <PortableText value={(sections?.main ?? post.body) as never} components={components} />
          </div>

          {sections && <Faq items={sections.faq} components={components} />}
          {sections?.sources && <TrustFooter sources={sections.sources} />}
        </article>

        {post.author?.bio && (
          <div className="mt-16 font-sans">
            <p className="eyebrow !text-muted-foreground">Written by</p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar post={post} size={96} className="h-12 w-12 rounded-full" />
              <div>
                <p className="font-medium text-foreground">{post.author.name}</p>
                {post.author.role && <p className="text-sm text-muted-foreground">{post.author.role}</p>}
              </div>
            </div>
            <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{post.author.bio}</p>
          </div>
        )}

        {more.length > 0 && (
          <section className="mt-16 font-sans">
            <p className="eyebrow !text-muted-foreground">Keep reading</p>
            <div className="mt-6 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {more.map((p) => (
                <Link
                  key={p._id}
                  to={`/${p.slug}`}
                  className="group block"
                >
                  <p className="text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {p.title} <span className="inline-block text-primary opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(p.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
