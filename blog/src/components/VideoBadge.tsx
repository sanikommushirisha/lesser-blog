/**
 * White play icon laid over a video post's thumbnail (blog cards, Recent
 * blogs), so the card reads as a video at a glance. Decorative: the link
 * around it already names the post.
 */
export function VideoBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-8 w-8 border' : 'h-16 w-16 border-2'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-7 w-7'
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <span
        className={`flex items-center justify-center rounded-full border-white/90 bg-black/30 text-white shadow-[0_6px_24px_-6px_rgba(0,0,0,0.5)] backdrop-blur-[2px] transition-transform duration-200 group-hover:scale-110 ${box}`}
      >
        <svg viewBox="0 0 24 24" className={`ml-[3px] ${icon}`}>
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" />
        </svg>
      </span>
    </span>
  )
}
