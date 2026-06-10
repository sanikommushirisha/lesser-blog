import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import {
  fetchPost,
  fetchMorePosts,
  urlFor,
  readTime,
  formatDate,
  type Post,
  type PostListItem,
} from '../lib/sanity'

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
    image: ({ value }) => (
      <figure className="my-8">
        <img
          src={urlFor(value).width(1440).url()}
          alt={value.alt ?? ''}
          loading="lazy"
          className="w-full rounded-xl"
        />
        {value.caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">{value.caption}</figcaption>
        )}
      </figure>
    ),
  },
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null | undefined>(undefined)
  const [more, setMore] = useState<PostListItem[]>([])

  useEffect(() => {
    if (!slug) return
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
  const ogImage = urlFor(post.seo?.ogImage ?? post.mainImage).width(1200).height(630).url()
  const canonical = `https://blog.lesser.tax/${post.slug}`

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
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            image: [ogImage],
            datePublished: post.publishedAt,
            author: [{ '@type': 'Person', name: post.author.name }],
          })}
        </script>
      </Helmet>

      <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
        ← All articles
      </Link>

      <article className="mt-6">
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
          {post.category.title}
        </span>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-[44px] sm:leading-[1.15]">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {' · '}
          {readTime(post.wordCount)}
        </p>
        <div className="mt-5 flex items-center gap-3">
          <img
            src={urlFor(post.author.avatar).width(80).height(80).url()}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-foreground">{post.author.name}</p>
            {post.author.role && <p className="text-xs text-muted-foreground">{post.author.role}</p>}
          </div>
        </div>

        <img
          src={urlFor(post.mainImage).width(1440).height(810).url()}
          alt={post.mainImage.alt ?? ''}
          className="mt-8 aspect-video w-full rounded-xl object-cover"
        />

        <div className="mt-10">
          <PortableText value={post.body} components={components} />
        </div>
      </article>

      {post.author.bio && (
        <div className="mt-12 rounded-xl bg-muted p-6">
          <div className="flex items-center gap-3">
            <img
              src={urlFor(post.author.avatar).width(96).height(96).url()}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
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
            {more.map((p) => (
              <li key={p._id}>
                <Link to={`/${p.slug}`} className="group flex items-center gap-4">
                  <img
                    src={urlFor(p.mainImage).width(192).height(128).url()}
                    alt=""
                    loading="lazy"
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {p.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(p.publishedAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
