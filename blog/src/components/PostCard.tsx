import { Link } from 'react-router-dom'
import { imageUrl, authorAvatarUrl, altText, readTime, formatDate, cardImage, type PostListItem } from '../lib/sanity'
import { parseYouTubeUrl } from '../lib/youtube'
import { VideoBadge } from './VideoBadge'

export function PostCard({ post }: { post: PostListItem }) {
  const image = cardImage(post)
  const cover = imageUrl(image, 960, 640)
  const avatar = authorAvatarUrl(post.author, 56)
  const hasVideo = Boolean(parseYouTubeUrl(post.featuredVideo))

  return (
    <li className="group">
      <Link to={`/${post.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <div className="relative overflow-hidden rounded-2xl">
          {cover ? (
            <img
              src={cover}
              alt={altText(image?.alt, post.slug)}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="aspect-[3/2] w-full bg-secondary" aria-hidden="true" />
          )}
          {hasVideo && <VideoBadge />}
          {post.category && (
            <span className="absolute left-3 top-3 rounded-full bg-background px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm">
              {post.category.title}
            </span>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {' • '}
          {readTime(post.wordCount)}
        </p>
        <h2 className="mt-1.5 line-clamp-2 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        {post.author && (
          <div className="mt-3 flex items-center gap-2.5">
            {avatar ? (
              <img src={avatar} alt={post.author.name ?? ''} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-primary">
                {post.author.name?.charAt(0) ?? '?'}
              </span>
            )}
            <span className="text-sm font-medium text-foreground">{post.author.name}</span>
          </div>
        )}
      </Link>
    </li>
  )
}
