import { Link } from 'react-router-dom'
import { imageUrl, formatDate, cardImage, altText, type PostListItem } from '../lib/sanity'
import { parseYouTubeUrl } from '../lib/youtube'
import { VideoBadge } from './VideoBadge'

/**
 * "Recent blogs" card on the article page: the latest posts (excluding the one
 * being read), each with its thumbnail, title and date. Sits in the right
 * column on wide screens and after the article on smaller ones.
 */
export function RecentPosts({ posts, className = '' }: { posts: PostListItem[]; className?: string }) {
  if (!posts.length) return null
  return (
    <aside
      aria-labelledby="recent-blogs-heading"
      className={`rounded-2xl border border-card-border bg-card p-6 font-sans shadow-card-lg ${className}`}
    >
      <h2 id="recent-blogs-heading" className="text-xl font-bold text-foreground">
        Recent blogs
      </h2>
      <ul className="mt-4 space-y-5 border-t border-border pt-5">
        {posts.map((p) => {
          const image = cardImage(p)
          const thumb = imageUrl(image, 320, 200)
          const isVideo = Boolean(parseYouTubeUrl(p.featuredVideo))
          return (
            <li key={p._id}>
              <Link to={`/${p.slug}`} className="group flex gap-4">
                {thumb ? (
                  <span className="relative w-28 shrink-0">
                    <img
                      src={thumb}
                      alt={altText(image?.alt, p.slug)}
                      loading="lazy"
                      className="aspect-[8/5] w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
                    />
                    {isVideo && <VideoBadge size="sm" />}
                  </span>
                ) : (
                  <span className="aspect-[8/5] w-28 shrink-0 rounded-lg bg-secondary" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  {/* h3 under the card's h2 for a correct outline. `!`: index.css styles
                      every heading (800 weight, tight tracking) outside a layer. */}
                  <h3 className="line-clamp-2 font-sans text-[15px] font-semibold! leading-snug tracking-normal! text-foreground transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                  <time dateTime={p.publishedAt} className="mt-1.5 block text-xs text-muted-foreground">
                    {formatDate(p.publishedAt)}
                  </time>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-primary-dark">
        View all articles →
      </Link>
    </aside>
  )
}
