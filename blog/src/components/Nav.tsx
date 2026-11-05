import { useEffect, useRef, useState } from 'react'
import { NAV_GROUPS } from '../../../shared/nav-links'

/**
 * Same navigation bar as the marketing site (client/src/components/shared-navbar.tsx):
 * same logo, menus, links and buttons. The blog is a separate app on its own
 * React and Tailwind versions, so the markup lives here while the menu links
 * come from shared/nav-links.ts. Icons are inline because the blog does not
 * depend on the marketing site's icon packages.
 *
 * Plain <a> tags: every link except /blog is outside the blog's router.
 */

const SIGN_UP = 'https://lesser.tax/app/auth/sign-up'
const WHATSAPP = 'https://wa.me/12098842051'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function WhatsApp() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

const pillLink =
  'flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-white hover:text-foreground hover:shadow-sm'

const mobileLink =
  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/5 hover:text-foreground'

export function Nav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileGroup, setMobileGroup] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const enter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    setOpenMenu(label)
  }
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl backdrop-saturate-[1.8]">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <a href="/" className="flex-shrink-0" aria-label="Lesser Tax home">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Lesser Tax"
            width={237}
            height={103}
            className="h-[52px] w-auto transition-transform duration-300 hover:scale-[1.02]"
          />
        </a>

        <div className="hidden items-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-1.5 py-1">
            {NAV_GROUPS.map((group) => {
              const open = openMenu === group.label
              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => enter(group.label)}
                  onMouseLeave={leave}
                  onFocus={() => enter(group.label)}
                  onBlur={leave}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                      open ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {group.label}
                    <Chevron open={open} />
                  </button>
                  <div
                    className={`absolute left-1/2 top-full -translate-x-1/2 pt-2 transition-all duration-200 ${
                      open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                    }`}
                  >
                    <div className="min-w-[260px] overflow-hidden rounded-xl border border-border/60 bg-white shadow-xl shadow-black/10">
                      <div className="p-1.5">
                        {group.items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="group/item flex flex-col gap-0.5 rounded-lg px-3.5 py-2.5 transition-all duration-200 hover:bg-primary/5"
                          >
                            <span className="text-sm font-medium text-foreground transition-colors duration-200 group-hover/item:text-primary">
                              {item.name}
                            </span>
                            <span className="text-xs leading-snug text-muted-foreground">{item.description}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <a href="/marketplace" className={pillLink}>
              Marketplace
            </a>
            <a href="/blog" className={pillLink}>
              Blog
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:bg-muted/50 hover:text-foreground sm:inline-flex"
          >
            <WhatsApp />
          </a>
          <a
            href={SIGN_UP}
            className="hidden items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] sm:inline-flex"
          >
            Get Started
            <Arrow />
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/30 transition-all duration-300 md:hidden"
          >
            <span className="flex w-4 flex-col items-center justify-center gap-[4px]">
              <span className={`block h-[1.5px] w-full origin-center rounded-full bg-foreground transition-all duration-300 ${mobileOpen ? 'translate-y-[5.5px] rotate-45' : ''}`} />
              <span className={`block h-[1.5px] w-full rounded-full bg-foreground transition-all duration-300 ${mobileOpen ? 'scale-x-0 opacity-0' : ''}`} />
              <span className={`block h-[1.5px] w-full origin-center rounded-full bg-foreground transition-all duration-300 ${mobileOpen ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-3 md:hidden">
          <div className="overflow-hidden rounded-2xl border border-border/30 bg-white shadow-xl shadow-black/5">
            <div className="flex flex-col gap-0.5 p-4">
              {NAV_GROUPS.map((group) => {
                const expanded = mobileGroup === group.label
                return (
                  <div key={group.label}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setMobileGroup(expanded ? null : group.label)}
                      className={`${mobileLink} justify-between`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="h-1 w-1 rounded-full bg-primary/40" />
                        {group.label}
                      </span>
                      <Chevron open={expanded} />
                    </button>
                    {expanded && (
                      <div className="flex flex-col gap-0.5 pb-2 pl-8 pr-4">
                        {group.items.map((item) => (
                          <a key={item.href} href={item.href} className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-primary/5">
                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                            <span className="text-[11px] leading-snug text-muted-foreground">{item.description}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <a href="/marketplace" className={mobileLink}>
                <span className="h-1 w-1 rounded-full bg-primary/40" />
                Marketplace
              </a>
              <a href="/blog" className={mobileLink}>
                <span className="h-1 w-1 rounded-full bg-primary/40" />
                Blog
              </a>
              <div className="mx-4 my-2 h-px bg-border/50" />
              <div className="flex flex-col gap-2 px-2 pb-1 pt-1">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  <WhatsApp />
                  Connect on WhatsApp
                </a>
                <a href={SIGN_UP} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                  Get Started
                  <Arrow />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
