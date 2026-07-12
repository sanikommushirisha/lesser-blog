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
        <div className="flex flex-wrap gap-2 xl:block">
          {items.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={
                'block rounded-full border border-border bg-card px-3 py-1 leading-snug no-underline transition-colors xl:rounded-none xl:border-0 xl:border-l-2 xl:bg-transparent xl:px-0 xl:py-1.5 xl:pl-3 ' +
                (active === t.id
                  ? 'border-primary text-primary xl:border-l-primary xl:font-semibold'
                  : 'text-muted-foreground hover:text-primary xl:border-l-border')
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
  return (
    <footer className="mt-12 border-t-2 border-border pt-5 font-sans">
      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
          ✓
        </span>
        Every claim in this guide links to an official source
      </p>
      <p className="mb-3 mt-2 text-[13px] text-muted-foreground">
        {sources.count} {sources.count === 1 ? 'source' : 'sources'}
        {sources.closer ? ` · ${sources.closer}` : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.chips.map((c, i) =>
          c.href ? (
            <a
              key={i}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground no-underline transition-colors hover:border-primary hover:text-primary"
            >
              {c.label}
            </a>
          ) : (
            <span key={i} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              {c.label}
            </span>
          )
        )}
      </div>
    </footer>
  )
}
