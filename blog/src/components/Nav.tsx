export function Nav() {
  return (
    // Same frosted white as the marketing navbar's .nav-glass (white/90 + blur).
    <header className="border-b border-black/5 bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2" aria-label="Lesser home">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Lesser" className="h-[52px]" />
        </a>
        <div className="flex items-center gap-4 sm:gap-7">
          <a
            href="/#why"
            className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary sm:block"
          >
            Why Lesser
          </a>
          <a
            href="/#pricing"
            className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary sm:block"
          >
            Pricing
          </a>
          <a
            href="https://lesser.tax/app/auth/sign-up"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  )
}
