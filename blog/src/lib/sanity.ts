import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import type { PortableTextBlock } from '@portabletext/react'
import { DEMO_POST, DEMO_SLUG } from './demo-post'
import { asset } from './base'

/**
 * Local testing only: adds a demo video post (src/lib/demo-post.ts) and
 * tolerates Sanity being unreachable (e.g. localhost not in its CORS list), so
 * the demo is always testable. On under `npm run dev:blog`, and in local builds
 * (localhost:5000) when blog/.env.local sets VITE_DEMO_POSTS=true. That file is
 * gitignored, so deploy builds never include it; scripts/prerender.mjs also
 * refuses a deploy build that contains the demo.
 */
const DEMO = import.meta.env.DEV || import.meta.env.VITE_DEMO_POSTS === 'true'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID

export const isConfigured = Boolean(projectId) && projectId !== 'your-project-id'

export const client = createClient({
  projectId: isConfigured ? projectId : 'unconfigured',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2026-06-01',
  useCdn: true,
})

/**
 * Dev-only fetch that never holds the demo back: a refused request (localhost
 * not in Sanity's CORS list) is retried by the client for several seconds, so
 * give up after 1.5s and show what we have.
 */
const devClient = client.withConfig({ maxRetries: 0 })
function devFetch<T>(query: string, params: Record<string, string> = {}): Promise<T[]> {
  // The build-time prerender (Node) has no CORS problem: let it wait for real posts.
  if (typeof window === 'undefined') return client.fetch<T[]>(query, params)
  return Promise.race([
    devClient.fetch<T[]>(query, params).catch(() => [] as T[]),
    new Promise<T[]>((resolve) => setTimeout(() => resolve([]), 1500)),
  ])
}

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format')
}

export function imageUrl(
  source: (SanityImageSource & { asset?: unknown }) | null | undefined,
  width: number,
  height?: number
): string | null {
  if (!source || (typeof source === 'object' && !('asset' in source) && !('_ref' in source))) {
    return null
  }
  try {
    let b = urlFor(source).width(width)
    if (height) b = b.height(height)
    return b.url()
  } catch {
    return null
  }
}

/**
 * The old blue logo, uploaded in Sanity as the "Lesser Tax" author's picture.
 * Until that picture is replaced in the Studio, the site shows the current
 * green logo (public/lesser-logo-mark.png) in its place. Matches this one
 * image only: any other picture uploaded for an author is shown as-is.
 */
const OLD_LOGO_REF = 'image-6a8f31f68882bf161637f8fde988fd2b0a9d2fcb-2084x2084-png'

/** URL for an author's picture (square), with the old logo swapped out. */
export function authorAvatarUrl(author: Pick<Author, 'avatar'> | null | undefined, size: number): string | null {
  const ref = (author?.avatar as { asset?: { _ref?: string } } | undefined)?.asset?._ref
  if (ref === OLD_LOGO_REF) return asset('/lesser-logo-mark.png')
  return imageUrl(author?.avatar, size, size)
}

export interface Author {
  name: string
  avatar: SanityImageSource
  role?: string
  bio?: string
}

export interface PostListItem {
  _id: string
  title: string
  slug: string
  excerpt: string
  mainImage: SanityImageSource & { alt?: string }
  /** YouTube link shown in place of the featured image on the article page. */
  featuredVideo?: string
  /** Our cover for the featured video (card + poster). */
  videoThumbnail?: SanityImageSource & { alt?: string }
  publishedAt: string
  _updatedAt: string
  category: { title: string; slug?: string }
  author: Author
  wordCount: number
}

export interface FaqItem {
  question: string
  answer: string
}

export interface HowTo {
  name?: string
  totalTime?: string
  costMin?: number
  costMax?: number
  steps?: { name: string; text: string }[]
}

export interface Post extends Omit<PostListItem, 'wordCount'> {
  body: PortableTextBlock[]
  wordCount: number
  reviewedBy?: string
  faq?: FaqItem[]
  howTo?: HowTo
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: SanityImageSource
  }
}

const postCardFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  featuredVideo,
  videoThumbnail,
  publishedAt,
  _updatedAt,
  category->{title, "slug": slug.current},
  author->{name, avatar, role, bio},
  "wordCount": length(string::split(pt::text(body), " "))
`

export async function fetchPosts(): Promise<PostListItem[]> {
  const query = `*[_type == "post" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc) { ${postCardFields} }`
  if (DEMO) return [DEMO_POST, ...(await devFetch<PostListItem>(query))]
  return client.fetch(query)
}

export async function fetchPost(slug: string): Promise<Post | null> {
  if (DEMO && slug === DEMO_SLUG) return DEMO_POST
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] { ${postCardFields}, body, reviewedBy, faq, howTo, seo }`,
    { slug }
  )
}

/** The 5 newest posts other than `excludeSlug`, for the article's "Recent blogs" card. */
export async function fetchMorePosts(excludeSlug: string): Promise<PostListItem[]> {
  const query = `*[_type == "post" && defined(slug.current) && slug.current != $excludeSlug && publishedAt <= now()] | order(publishedAt desc) [0...5] { ${postCardFields} }`
  if (DEMO) {
    const real = await devFetch<PostListItem>(query, { excludeSlug })
    return [...(excludeSlug === DEMO_SLUG ? [] : [DEMO_POST]), ...real].slice(0, 5)
  }
  return client.fetch(query, { excludeSlug })
}

/**
 * The image a post is represented by in lists: the video thumbnail for a video
 * post (when one was uploaded), else the featured image.
 */
export function cardImage(post: Pick<PostListItem, 'mainImage' | 'featuredVideo' | 'videoThumbnail'>) {
  return post.featuredVideo && post.videoThumbnail ? post.videoThumbnail : post.mainImage
}

/**
 * Alt text for a post's image: the editor's alt text when set, else the post's
 * URL slug in words ("form-5472-for-founders" -> "form 5472 for founders"),
 * so no post image ships without a description.
 */
export function altText(alt: string | null | undefined, slug: string): string {
  const own = alt?.trim()
  if (own) return own
  return (slug.split('/').filter(Boolean).pop() ?? '').replace(/-+/g, ' ').trim()
}

export function readTime(wordCount: number): string {
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
