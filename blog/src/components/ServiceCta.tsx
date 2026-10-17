// Links an article to the Lesser Tax service it is about, near the top and
// again after the article. Plain <a>: the service pages live on the marketing
// site, outside the blog's router. Picked from the slug and category, so every
// post (including new ones) gets a link without editors doing anything.

type Service = { href: string; name: string; pitch: string; cta: string }

const PASSPORT: Service = {
  href: '/services/passport-renewal',
  name: 'Indian passport renewal',
  pitch: 'We fill your VFS forms, check every document and photo, and review the full application before you submit. Flat $140.',
  cta: 'Renew your Indian passport with Lesser Tax',
}
const INDIA_ITR: Service = {
  href: '/services/india-tax-filing',
  name: 'India tax filing (ITR) for NRIs',
  pitch: 'Vetted Chartered Accountants file your Indian return from the U.S., with DTAA relief and TDS refunds handled. From $69.',
  cta: 'File your India tax return',
}
const NRI: Service = {
  href: '/nris',
  name: 'U.S. tax filing for NRIs',
  pitch: 'CPAs who know both systems handle FBAR, FATCA, PFIC, Indian income and foreign tax credits on your U.S. return. From $99.',
  cta: 'Get your NRI taxes done right',
}
const BUSINESS: Service = {
  href: '/business',
  name: 'Business tax filing',
  pitch: 'Form 1120, 1065 or 1120-S prepared on our platform and reviewed by a CPA, for a flat $100 per return.',
  cta: 'File your business tax return for $100',
}
const EQUITY: Service = {
  href: '/',
  name: 'Tax planning for tech professionals',
  pitch: 'Big Four-trained CPAs plan around your RSUs, ISOs and ESPP year-round, with flat-fee pricing from $99 a year.',
  cta: 'Plan your equity taxes with a CPA',
}

const RULES: [RegExp, Service][] = [
  [/passport|oci|vfs|annexure|tatkaal|police-verification/, PASSPORT],
  [/form-5472|corp|llc|2553|7004|8825|3115|1065|1120|partnership/, BUSINESS],
  [/rsu|espp|iso-|nso|qsbs|roth|401k|83b|exit-tax/, EQUITY],
  [/dtaa|treaty|6166|10f|nro|itr|india-rental|rnor|depreciating-rental-property-india/, INDIA_ITR],
]

function serviceFor(slug: string, category?: string): Service {
  const key = `${slug} ${category ?? ''}`.toLowerCase()
  return RULES.find(([re]) => re.test(key))?.[1] ?? NRI
}

/** One line under the summary: "Need help? <link>". */
export function ServiceLink({ slug, category }: { slug: string; category?: string }) {
  const s = serviceFor(slug, category)
  return (
    <p className="mt-6 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 font-sans text-[15px] text-foreground">
      Want an expert to handle this?{' '}
      <a href={s.href} className="font-semibold text-primary underline-offset-2 hover:underline">
        {s.cta}
      </a>
    </p>
  )
}

/** The fuller card after the article body. */
export function ServiceCard({ slug, category }: { slug: string; category?: string }) {
  const s = serviceFor(slug, category)
  return (
    <aside
      aria-label={`${s.name} by Lesser Tax`}
      className="my-12 rounded-2xl border border-primary/15 bg-primary/5 p-6 font-sans sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Lesser Tax · {s.name}</p>
      <p className="mt-3 text-[17px] leading-relaxed text-foreground">{s.pitch}</p>
      <a
        href={s.href}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        {s.cta}
        <span aria-hidden="true">→</span>
      </a>
    </aside>
  )
}
