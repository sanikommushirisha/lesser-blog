export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-muted">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <img src="/logo.png" alt="Lesser" className="h-8" />
          <p className="mt-3 text-sm text-muted-foreground">
            Flat-fee tax planning &amp; filing for tech professionals.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quick links</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="https://lesser.tax" className="transition-colors hover:text-primary">Home</a></li>
            <li><a href="https://lesser.tax/#pricing" className="transition-colors hover:text-primary">Pricing</a></li>
            <li><a href="/" className="transition-colors hover:text-primary">Blog</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="https://lesser.tax/privacy" className="transition-colors hover:text-primary">Privacy policy</a></li>
            <li><a href="https://lesser.tax/terms" className="transition-colors hover:text-primary">Terms of service</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-[1100px] px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Lesser. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
