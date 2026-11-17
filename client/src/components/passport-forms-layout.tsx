// Shared frame of the free passport forms pages (/tools/indian-passport-forms,
// LD-78): navbar, a visible FAQ mirrored in FAQPage JSON-LD, related guides,
// and the footer. Content comes from shared/passport-forms (synced engine).

import type { ReactNode } from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import { FaqJsonLd } from "@/components/json-ld";
import RelatedGuides, { GUIDES } from "@/components/related-guides";
import lesserLogo from "@assets/lesser_logo.png";

export function FormsPageFrame({ sourcePage, children }: { sourcePage: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8f0]">
      <SharedNavbar variant="individual" sourcePage={sourcePage} />
      <main className="pt-28 pb-16">{children}</main>
      <RelatedGuides heading="Indian passport renewal guides" guides={GUIDES.passport} />
      <FormsFooter />
    </div>
  );
}

export function FaqSection({ items }: { items: [string, string][] }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-14" aria-labelledby="pf-faq">
      <h2 id="pf-faq" className="mb-8 text-3xl font-extrabold tracking-[-0.03em] text-foreground md:text-4xl">
        Frequently asked questions
      </h2>
      <FaqJsonLd items={items.map(([question, answer]) => ({ question, answer }))} />
      <div className="space-y-3">
        {items.map(([q, a], i) => (
          <details key={i} className="group rounded-2xl border border-border bg-white p-5 transition-all duration-300 hover:border-primary/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <h3 className="m-0 flex items-start gap-3 text-base font-semibold tracking-normal text-foreground">
                <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                {q}
              </h3>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-90" />
            </summary>
            <p className="mt-4 pl-8 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FormsFooter() {
  return (
    <footer className="relative overflow-hidden bg-foreground">
      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <img src={lesserLogo} alt="Lesser Tax" width={96} height={96} className="h-8 w-auto opacity-70 brightness-0 invert" />
          <div className="flex items-center gap-4 text-xs text-white/60">
            <a href="/services/passport-renewal" className="transition-colors hover:text-white">Passport renewal</a>
            <a href="/privacy" className="transition-colors hover:text-white">Privacy</a>
            <a href="/terms" className="transition-colors hover:text-white">Terms</a>
            <a href="mailto:use@lesser.tax" className="transition-colors hover:text-white">use@lesser.tax</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
