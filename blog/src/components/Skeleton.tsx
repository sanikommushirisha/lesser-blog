/** Placeholder with the shape of a blog-grid PostCard, while posts load. */
export function PostCardSkeleton() {
  return (
    <li className="animate-pulse overflow-hidden rounded-card border border-card-border bg-card" aria-hidden="true">
      <div className="aspect-[3/2] w-full bg-muted" />
      <div className="p-6">
        <div className="h-4 w-40 rounded-md bg-muted" />
        <div className="mt-3 h-6 w-11/12 rounded-md bg-muted" />
        <div className="mt-1.5 h-6 w-2/3 rounded-md bg-muted" />
        <div className="mt-4 h-4 w-full rounded-md bg-muted" />
        <div className="mt-1.5 h-4 w-5/6 rounded-md bg-muted" />
        <div className="mt-8 h-4 w-28 rounded-md bg-muted" />
      </div>
    </li>
  )
}
