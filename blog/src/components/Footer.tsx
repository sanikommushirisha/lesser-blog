export function Footer() {
  return (
    // Dark footer matching the marketing site's (bg-foreground, white text at reduced opacity).
    <footer className="mt-20 bg-foreground">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Lesser" className="h-10 brightness-0 invert" />
          <p className="mt-3 text-sm text-white/60">
            Flat-fee tax planning &amp; filing for tech professionals.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white!">Quick links</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li><a href="/" className="transition-colors hover:text-white">Home</a></li>
            <li><a href="/#pricing" className="transition-colors hover:text-white">Pricing</a></li>
            <li><a href="/blog" className="transition-colors hover:text-white">Blog</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white!">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li><a href="/privacy" className="transition-colors hover:text-white">Privacy policy</a></li>
            <li><a href="/terms" className="transition-colors hover:text-white">Terms of service</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1100px] px-4 py-5 text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} Lesser. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
