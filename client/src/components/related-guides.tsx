import { ArrowUpRight } from "lucide-react";

// Links from a service page to the blog guides on the same topic. Real <a>
// links in the prerendered HTML, so crawlers follow them and the guides and
// service pages strengthen each other. Slugs are blog posts under /blog/.

export type Guide = { slug: string; title: string };

export const GUIDES = {
  nri: [
    { slug: "nri-india-income-us-tax-return", title: "Do I report India income on my U.S. tax return?" },
    { slug: "fbar-form-8938-indian-accounts", title: "FBAR and Form 8938 for Indian bank accounts" },
    { slug: "form-8621-indian-mutual-funds-file-it-costs", title: "Form 8621 for Indian mutual funds (PFIC)" },
    { slug: "india-us-tax-treaty-dtaa", title: "India-U.S. tax treaty (DTAA): what it covers" },
    { slug: "form-1116-claiming-credit-tax-paid-india", title: "Form 1116: credit for tax paid in India" },
    { slug: "rnor-status-returning-nri-2026", title: "RNOR status for returning NRIs" },
  ],
  indiaItr: [
    { slug: "india-us-tax-treaty-dtaa", title: "India-U.S. tax treaty (DTAA): how to claim it" },
    { slug: "form-6166-form-10f-claiming-india-us-treaty", title: "Form 6166 and Form 10F: cut NRO TDS to 15%" },
    { slug: "depreciating-rental-property-india-us-return", title: "Indian rental property on your U.S. return" },
    { slug: "rnor-status-returning-nri-2026", title: "RNOR status when you move back to India" },
    { slug: "nri-tax-checklist-usa", title: "NRI tax checklist for your first years in the U.S." },
  ],
  passport: [
    { slug: "indian-passport-renewal-usa", title: "Indian passport renewal in the USA: fees, steps, consulates" },
    { slug: "indian-passport-renewal-documents-checklist", title: "Documents for Indian passport renewal (VFS checklist)" },
    { slug: "indian-passport-renewal-fees-usa", title: "Indian passport renewal fees in the USA" },
    { slug: "indian-passport-renewal-timeline-usa", title: "How long Indian passport renewal takes from the USA" },
    { slug: "indian-passport-photo-requirements-usa", title: "Indian passport photo rules (2x2 inch)" },
    { slug: "lost-indian-passport-usa", title: "Lost Indian passport in the USA: how to replace it" },
  ],
  tech: [
    { slug: "rsu-taxes-h1b-2026", title: "RSU taxes on H-1B: vesting, layoffs and leaving the U.S." },
    { slug: "espp-83b-election-visa-holders-2026", title: "ESPP and 83(b) elections on a visa" },
    { slug: "iso-amt-leaving-us-2026", title: "ISO exercises, AMT and leaving the U.S." },
    { slug: "nsos-h-1b-tax-at-exercise-after-move", title: "NSOs on H-1B: tax at exercise" },
    { slug: "backdoor-roth-h-1b-india-does-with-it", title: "Backdoor Roth on H-1B" },
    { slug: "qsbs-immigrant-founders-2026", title: "QSBS for immigrant founders" },
  ],
  business: [
    { slug: "form-5472-llc-owned-by-founder-india", title: "Form 5472 for an India-owned U.S. LLC" },
    { slug: "corp-vs-llc-founders-h-1b-or-green", title: "S corp vs LLC for H-1B and green card founders" },
    { slug: "c-corp-vs-corp-when-owner-is-nonresident", title: "C corp vs S corp with a nonresident owner" },
    { slug: "form-2553-electing-corp-status-relief-if-missed", title: "Late S corp election (Form 2553) relief" },
    { slug: "form-7004-partnerships-corps-first-time-penalty-abatement", title: "Form 7004 extensions for 1065 and 1120-S" },
  ],
  realEstate: [
    { slug: "form-8825-multi-member-rental-llc", title: "Form 8825 for a multi-member rental LLC" },
    { slug: "form-3115-catching-up-missed-depreciation-rental-before", title: "Form 3115: catch up missed rental depreciation" },
    { slug: "form-7004-partnerships-corps-first-time-penalty-abatement", title: "Form 7004 extensions and late-filing penalties" },
    { slug: "depreciating-rental-property-india-us-return", title: "Depreciating a rental property in India on a U.S. return" },
  ],
} satisfies Record<string, Guide[]>;

export default function RelatedGuides({ heading, guides }: { heading: string; guides: Guide[] }) {
  return (
    <section className="py-16 bg-white" aria-labelledby="related-guides-heading" data-testid="section-related-guides">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 id="related-guides-heading" className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            {heading}
          </h2>
          <a href="/blog" className="text-sm font-semibold text-primary hover:underline">
            All tax guides
          </a>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <li key={g.slug}>
              <a
                href={`/blog/${g.slug}`}
                className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-[#e0e8e5] p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="font-semibold leading-snug text-foreground">{g.title}</span>
                <ArrowUpRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
