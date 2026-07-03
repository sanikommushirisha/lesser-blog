import { useEffect, useRef, useState } from 'react'
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

type Node = Record<string, unknown>

function buildJsonLd(
  post: Post,
  opts: { siteUrl: string; canonical: string; ogImage: string | null; metaDescription: string }
) {
  const { siteUrl, canonical, ogImage, metaDescription } = opts

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

  if (post.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: post.faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  const crumbs: Node[] = [{ '@type': 'ListItem', position: 1, name: 'Blog', item: `${siteUrl}/` }]
  if (post.category) {
    crumbs.push({ '@type': 'ListItem', position: 2, name: post.category.title })
  }
  crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: post.title })
  graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs })

  return { '@context': 'https://schema.org', '@graph': graph }
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mt-10 mb-4 text-[28px] font-semibold text-foreground">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 mb-3 text-[22px] font-semibold text-foreground">{children}</h3>,
    normal: ({ children }) => <p className="mb-5 text-lg leading-[1.7] text-foreground">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-[3px] border-primary pl-4 text-lg text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6 text-lg leading-[1.7]">{children}</ul>,
    number: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-lg leading-[1.7]">{children}</ol>,
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
  const seeded = takeInitialData(`/${slug}`)
  const [post, setPost] = useState<Post | null | undefined>(seeded ? (seeded.post ?? null) : undefined)
  const [more, setMore] = useState<PostListItem[]>(seeded?.more ?? [])
  const seededSlug = useRef<string | undefined>(seeded ? slug : undefined)

  useEffect(() => {
    if (!slug) return
    if (seededSlug.current === slug) return
    window.scrollTo(0, 0)
    setPost(undefined)
    fetchPost(slug).then(setPost).catch(() => setPost(null))
    fetchMorePosts(slug).then(setMore).catch(() => {})
  }, [slug])

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
  const jsonLd = buildJsonLd(post, { siteUrl, canonical, ogImage, metaDescription })

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pt-10 sm:px-6">
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

      <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
        ← All articles
      </Link>

      <article className="mt-6">
        {post.category && (
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            {post.category.title}
          </span>
        )}
        <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-[44px] sm:leading-[1.15]">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {' · '}
          {readTime(post.wordCount)}
        </p>
        {post.author && (
          <div className="mt-5 flex items-center gap-3">
            <Avatar post={post} size={80} className="h-10 w-10 rounded-full" />
            <div>
              <p className="text-sm font-medium text-foreground">{post.author.name}</p>
              {post.author.role && <p className="text-xs text-muted-foreground">{post.author.role}</p>}
            </div>
          </div>
        )}

        {heroImage && (
          <img
            src={heroImage}
            alt={post.mainImage?.alt ?? ''}
            className="mt-8 aspect-video w-full rounded-xl object-cover"
          />
        )}

        <div className="mt-10">
          <PortableText value={post.body} components={components} />
        </div>
      </article>

      {post.author?.bio && (
        <div className="mt-12 rounded-xl bg-muted p-6">
          <div className="flex items-center gap-3">
            <Avatar post={post} size={96} className="h-12 w-12 rounded-full" />
            <div>
              <p className="font-medium text-foreground">{post.author.name}</p>
              {post.author.role && <p className="text-sm text-muted-foreground">{post.author.role}</p>}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.author.bio}</p>
        </div>
      )}

      {more.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">Keep reading</h2>
          <ul className="mt-5 space-y-5">
            {more.map((p) => {
              const thumb = imageUrl(p.mainImage, 192, 128)
              return (
                <li key={p._id}>
                  <Link to={`/${p.slug}`} className="group flex items-center gap-4">
                    {thumb ? (
                      <img src={thumb} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="h-16 w-24 shrink-0 rounded-lg bg-secondary" aria-hidden="true" />
                    )}
                    <div>
                      <p className="font-medium text-foreground transition-colors group-hover:text-primary">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(p.publishedAt)}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
