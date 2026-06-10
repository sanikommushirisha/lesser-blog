export function PostCardSkeleton() {
  return (
    <li className="animate-pulse" aria-hidden="true">
      <div className="aspect-video w-full rounded-xl bg-muted" />
      <div className="mt-4 h-6 w-24 rounded-full bg-muted" />
      <div className="mt-3 h-7 w-4/5 rounded-md bg-muted" />
      <div className="mt-2 h-4 w-40 rounded-md bg-muted" />
      <div className="mt-3 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="h-4 w-32 rounded-md bg-muted" />
      </div>
    </li>
  )
}
