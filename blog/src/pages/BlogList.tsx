import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchPosts, isConfigured, type PostListItem } from '../lib/sanity'
import { PostCard } from '../components/PostCard'
import { PostCardSkeleton } from '../components/Skeleton'
import { takeInitialData } from '../lib/initial-data'

export function BlogList() {
  const seeded = useRef(takeInitialData('/'))
  const [posts, setPosts] = useState<PostListItem[] | null>(seeded.current?.posts ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (seeded.current?.posts) return
    fetchPosts().then(setPosts).catch(() => setError(true))
  }, [])

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-10 pb-4 sm:px-6">
      <Helmet>
        <title>Blog — Lesser</title>
        <meta
          name="description"
          content="Tax strategy, equity compensation, and filing guides from the Lesser team."
        />
        <link rel="canonical" href="https://blog.lesser.tax/" />
        <meta property="og:title" content="Blog — Lesser" />
        <meta property="og:url" content="https://blog.lesser.tax/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <h1 className="text-4xl font-bold text-foreground">Blogs</h1>

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
