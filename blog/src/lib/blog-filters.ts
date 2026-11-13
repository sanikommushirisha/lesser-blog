// Search and topic filtering for the blog list (USER-33). Runs in the browser
// over the posts the page already has (about a hundred), so filtering is
// instant and needs no extra Sanity query.

import type { PostListItem } from './sanity'

/** A Sanity category as a filter: "Tax Planning" with how many posts it has. */
export interface Topic {
  slug: string
  title: string
  count: number
}

/** Topics in the posts, biggest first. */
export function topicsOf(posts: PostListItem[]): Topic[] {
  const bySlug = new Map<string, Topic>()
  for (const p of posts) {
    const slug = p.category?.slug
    const title = p.category?.title
    if (!slug || !title) continue
    const topic = bySlug.get(slug) ?? { slug, title, count: 0 }
    topic.count += 1
    bySlug.set(slug, topic)
  }
  return [...bySlug.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
}

/** Lowercase, accents and punctuation removed: "15CA/15CB" -> "15ca 15cb". */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9$%]+/g, ' ')
    .trim()
}

export function searchWords(query: string): string[] {
  return normalize(query).split(' ').filter(Boolean)
}

/**
 * Posts in `topic` (every topic when empty) that contain every word of `query`
 * in their title, excerpt, topic or URL. Newest first, except that posts whose
 * title has all the words come before posts that only mention them.
 */
export function filterPosts(posts: PostListItem[], { query, topic }: { query: string; topic: string }): PostListItem[] {
  const words = searchWords(query)
  const inTopic = topic ? posts.filter((p) => p.category?.slug === topic) : posts
  if (!words.length) return inTopic

  const hasAll = (text: string) => words.every((w) => text.includes(w))
  const matches = inTopic.filter((p) =>
    hasAll(normalize(`${p.title} ${p.excerpt ?? ''} ${p.category?.title ?? ''} ${p.slug.replace(/-/g, ' ')}`))
  )
  const inTitle = matches.filter((p) => hasAll(normalize(p.title)))
  return [...inTitle, ...matches.filter((p) => !inTitle.includes(p))]
}
