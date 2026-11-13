import { Link } from 'react-router-dom'
import { imageUrl, altText, readTime, formatDate, cardImage, type PostListItem } from '../lib/sanity'
import { parseYouTubeUrl } from '../lib/youtube'
import { VideoBadge } from './VideoBadge'
import { ArrowUpRightIcon } from './Icons'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'

/**
 * The post's topic, in the card text. Not on the image: the cover templates
 * already draw the topic in their top-left corner.
 */
function TopicChip({ post }: { post: PostListItem }) {
  if (!post.category) return null
  return (
    <span className="rounded-full bg-chip-tint px-2.5 py-1 text-xs font-semibold text-primary">{post.category.title}</span>
  )
}

/** "Nov 12, 2026 · Vishveshwar Rao": date and author, in the brand green. */
function Byline({ post }: { post: PostListItem }) {
  return (
    <p className="text-sm font-medium text-primary-mid">
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      {post.author?.name ? ` · ${post.author.name}` : null}
    </p>
  )
}

/**
 * A guide in the blog grid. `hidden` keeps it in the HTML (so crawlers still
 * follow the link) while "Show more" has not revealed it yet.
 */
export function PostCard({ post, hidden = false }: { post: PostListItem; hidden?: boolean }) {
  const image = cardImage(post)
  const cover = imageUrl(image, 960, 640)
  const hasVideo = Boolean(parseYouTubeUrl(post.featuredVideo))

  return (
    <li hidden={hidden}>
      <Link
        to={`/${post.slug}`}
        className={`group flex h-full flex-col overflow-hidden rounded-card border border-card-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-lg ${focusRing}`}
      >
        <div className="relative overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={altText(image?.alt, post.slug)}
              width={600}
              height={400}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="aspect-[3/2] w-full bg-secondary" aria-hidden="true" />
          )}
          {hasVideo && <VideoBadge />}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <TopicChip post={post} />
            <Byline post={post} />
          </div>
          <h3 className="mt-2 line-clamp-3 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-4 pt-6 text-sm">
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              Read the guide
              <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            <span className="text-muted-foreground">{readTime(post.wordCount)}</span>
          </div>
        </div>
      </Link>
    </li>
  )
}

/**
 * The newest guide, shown large above the grid. Its image is the page's
 * largest element on desktop, so it loads eagerly with high priority.
 */
export function FeaturedPostCard({ post }: { post: PostListItem }) {
  const image = cardImage(post)
  const cover = imageUrl(image, 1200, 800)

  return (
    <Link
      to={`/${post.slug}`}
      className={`group grid overflow-hidden rounded-[28px] border border-card-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-lg lg:grid-cols-2 ${focusRing}`}
    >
      <div className="relative overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={altText(image?.alt, post.slug)}
            width={1200}
            height={800}
            fetchPriority="high"
            className="aspect-[3/2] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="aspect-[3/2] h-full w-full bg-secondary" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            Latest
          </span>
          <TopicChip post={post} />
          <Byline post={post} />
        </div>
        <h3 className="mt-5 font-display text-[28px] leading-[1.12] text-foreground transition-colors group-hover:text-primary sm:text-4xl">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-4 line-clamp-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>}
        <div className="mt-8 flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            Read the guide
            <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
          <span className="text-muted-foreground">{readTime(post.wordCount)}</span>
        </div>
      </div>
    </Link>
  )
}
