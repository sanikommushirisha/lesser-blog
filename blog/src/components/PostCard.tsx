import { Link } from 'react-router-dom'
import { urlFor, readTime, formatDate, type PostListItem } from '../lib/sanity'

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <li className="group">
      <Link to={`/${post.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <div className="overflow-hidden rounded-xl">
          <img
            src={urlFor(post.mainImage).width(1440).height(810).url()}
            alt={post.mainImage.alt ?? ''}
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <span className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
          {post.category.title}
        </span>
        <h2 className="mt-2 line-clamp-2 text-2xl font-semibold text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {' · '}
          {readTime(post.wordCount)}
        </p>
        <div className="mt-3 flex items-center gap-2.5">
          <img
            src={urlFor(post.author.avatar).width(64).height(64).url()}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-foreground">{post.author.name}</span>
        </div>
      </Link>
    </li>
  )
}
