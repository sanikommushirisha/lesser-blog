// Editorial design-system v2 components (approved mockup: lesser-post-template).
// Everything here renders from data the posts already have; nothing requires
// re-authoring in Sanity.
import { useEffect, useState } from 'react'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { Block, FaqItem, Sections } from '../lib/editorial'

/* ---- sticky table of contents with scrollspy ---- */
export function Toc({ items }: { items: Sections['toc'] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const headings = items
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!headings.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-10% 0px -75% 0px' }
    )
    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [items])

  if (items.length < 2) return null
  return (
    <nav aria-label="On this page" className="text-[13px] xl:block">
      <div className="xl:sticky xl:top-8">
        <p className="eyebrow mb-2 hidden !text-muted-foreground xl:block">On this page</p>
        <div className="flex flex-wrap gap-2 xl:block xl:space-y-3">
          {items.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={
                'block rounded-full bg-secondary px-3 py-1 leading-snug no-underline transition-colors xl:rounded-none xl:bg-transparent xl:p-0 ' +
                (active === t.id
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground')
              }
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

/* ---- key takeaways card ---- */
export function Takeaways({ blocks, components }: { blocks: Block[]; components: PortableTextComponents }) {
  if (!blocks.length) return null
  return (
    <section className="mb-8 border-t border-border pt-5">
      <p className="eyebrow mb-3">Key takeaways</p>
      <div className="editorial-takeaways text-[15px] leading-relaxed">
        <PortableText value={blocks as never} components={components} />
      </div>
    </section>
  )
}

/* ---- quick answer: typographic, hairline-framed, no box ---- */
export function QuickAnswer({ block, components }: { block: Block; components: PortableTextComponents }) {
  return (
    <section className="my-8 border-y border-border py-6">
      <div className="editorial-capsule font-prose text-[19px] leading-[1.65]">
        <PortableText value={[{ ...block, style: 'normal' }] as never} components={components} />
      </div>
    </section>
  )
}

/* ---- FAQ accordion (details/summary keeps it prerender-friendly) ---- */
export function Faq({ items, components }: { items: FaqItem[]; components: PortableTextComponents }) {
  if (!items.length) return null
  return (
    <section id="faq" className="mt-12 scroll-mt-6">
      <h2 className="mb-4 text-[28px] font-semibold text-foreground">FAQ</h2>
      <div className="border-t border-border">
        {items.map((f, i) => (
          <details key={f.id} open={i === 0} className="editorial-faq group border-b border-border">
            <summary className="relative cursor-pointer list-none py-4 pr-8 font-sans text-[15.5px] font-semibold text-foreground">
              {f.question}
              <span
                aria-hidden
                className="absolute right-1 top-1/2 -translate-y-1/2 text-xl font-normal text-primary transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="pb-4 text-[15.5px] text-muted-foreground [&_p]:mb-3 [&_p]:mt-0">
              <PortableText value={f.answer as never} components={components} />
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ---- trust footer ---- */
export function TrustFooter({ sources }: { sources: NonNullable<Sections['sources']> }) {
  if (!sources.chips.length) return null
  return (
    <footer className="mt-16 font-sans">
      <p className="eyebrow !text-muted-foreground">Sources</p>
      <ol className="mt-4 space-y-3">
        {sources.chips.map((c, i) => (
          <li
            key={i}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-x-1 text-[13.5px] leading-relaxed sm:grid-cols-[1.75rem_minmax(0,1fr)_auto] sm:gap-x-4"
          >
            <span className="tabular-nums text-muted-foreground/50">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-muted-foreground">{c.text}</span>
            {c.href ? (
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="col-start-2 whitespace-nowrap text-xs font-medium text-primary no-underline hover:underline sm:col-start-3 sm:justify-self-end"
              >
                {c.label} ↗
              </a>
            ) : (
              <span className="col-start-2 whitespace-nowrap text-xs text-muted-foreground/70 sm:col-start-3 sm:justify-self-end">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      {sources.closer && <p className="mt-5 text-[13px] text-muted-foreground/80">{sources.closer}</p>}
    </footer>
  )
}
