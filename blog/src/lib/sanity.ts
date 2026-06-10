import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import type { PortableTextBlock } from '@portabletext/react'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2026-06-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format')
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
  category: { title: string }
  author: Author
  wordCount: number
}

export interface Post extends Omit<PostListItem, 'wordCount'> {
  body: PortableTextBlock[]
  wordCount: number
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
  category->{title},
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
    `*[_type == "post" && slug.current == $slug][0] { ${postCardFields}, body, seo }`,
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
