import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import type { PortableTextBlock } from '@portabletext/react'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID

export const isConfigured = Boolean(projectId) && projectId !== 'your-project-id'

export const client = createClient({
  projectId: isConfigured ? projectId : 'unconfigured',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2026-06-01',
  useCdn: true,
})

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
  publishedAt,
  _updatedAt,
  category->{title, "slug": slug.current},
  author->{name, avatar, role, bio},
  "wordCount": length(string::split(pt::text(body), " "))
`

export async function fetchPosts(): Promise<PostListItem[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc) { ${postCardFields} }`
  )
}

export async function fetchPost(slug: string): Promise<Post | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] { ${postCardFields}, body, reviewedBy, faq, howTo, seo }`,
    { slug }
  )
}

export async function fetchMorePosts(excludeSlug: string): Promise<PostListItem[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current) && slug.current != $excludeSlug && publishedAt <= now()] | order(publishedAt desc) [0...3] { ${postCardFields} }`,
    { excludeSlug }
  )
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
