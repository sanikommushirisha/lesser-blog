import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchPosts, isConfigured, type PostListItem } from '../lib/sanity'
import { PostCard } from '../components/PostCard'
import { PostCardSkeleton } from '../components/Skeleton'
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

export function BlogList() {
  const seeded = useMemo(() => takeInitialData('/'), [])
  const [posts, setPosts] = useState<PostListItem[] | null>(seeded?.posts ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (seeded?.posts) return
    fetchPosts().then(setPosts).catch(() => setError(true))
  }, [seeded])

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-10 pb-4 sm:px-6">
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

      <h1 className="text-4xl font-bold text-foreground">Tax and passport guides for Indians in the U.S.</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
        Plain-English guides to NRI taxes, FBAR, the India-U.S. tax treaty, Indian passport renewal, and equity and
        business taxes for founders, from the tax team at {BRAND}.
      </p>

      {error && (
        <p className="mt-10 text-muted-foreground">
          {isConfigured
            ? "Couldn't load articles right now — please refresh in a moment."
            : 'The blog is not connected to Sanity yet — set VITE_SANITY_PROJECT_ID in the deployment environment variables.'}
        </p>
      )}

      {!error && posts?.length === 0 && (
        <p className="mt-10 text-muted-foreground">New articles coming soon.</p>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts === null && !error ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : (
          posts?.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </ul>
    </main>
  )
}
