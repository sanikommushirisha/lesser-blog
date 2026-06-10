export function Nav() {
  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
        <a href="https://lesser.tax" className="flex items-center gap-2" aria-label="Lesser home">
          <img src="/logo.png" alt="Lesser" className="h-9" />
        </a>
        <div className="flex items-center gap-4 sm:gap-7">
          <a
            href="https://lesser.tax/#why"
            className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary sm:block"
          >
            Why Lesser
          </a>
          <a
            href="https://lesser.tax/#pricing"
            className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary sm:block"
          >
            Pricing
          </a>
          <a
            href="https://lesser.tax/get-started"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  )
}
