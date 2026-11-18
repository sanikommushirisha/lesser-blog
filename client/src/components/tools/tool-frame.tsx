// Shared page frame of the free tax tools (LD-41 framework): navbar, breadcrumb,
// H1 with an answer-first paragraph, the tool itself, "how it works" facts with
// official sources, a visible FAQ mirrored in FAQPage JSON-LD, the standard
// disclaimer, a "talk to a CPA" call to action, related guides and the footer.
// A new tool plugs in its own inputs and calculation and passes them as children.

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import PageBackdrop from "@/components/page-backdrop";
import QuickAnswer, { type QuickFact, type Source } from "@/components/quick-answer";
import RelatedGuides, { type Guide } from "@/components/related-guides";
import { FaqSection } from "@/components/passport-forms-layout";
import { trackTool } from "@/lib/tool-analytics";
import { TAX_YEAR, TOOLS_FIGURES_CHECKED } from "@shared/tools/federal";
import lesserLogo from "@assets/lesser_logo.png";

export const TOOLS_HUB = "/tools";

export type ToolFrameProps = {
  /** Path of this page, e.g. "/tools/tax-estimator". */
  path: string;
  /** Short id used in analytics and UTM tags, e.g. "tax-estimator". */
  toolId: string;
  /** Breadcrumb name. */
  name: string;
  h1: string;
  /** The 40 to 60 word answer to the page's main query, shown under the H1. */
  answer: ReactNode;
  children: ReactNode;
  about: { question: string; answer: ReactNode; facts: QuickFact[]; factsCaption: string; sources: Source[] };
  faq: [string, string][];
  guides: { heading: string; items: Guide[] };
};

export function signUpUrl(toolId: string) {
  return `https://lesser.tax/app/auth/sign-up?utm_source=tools&utm_medium=${toolId}&utm_campaign=growth-tools`;
}

export function ToolDisclaimer() {
  return (
    <p className="rounded-xl border border-[#e0e8e5] bg-[#f8faf9] px-4 py-3 text-xs leading-relaxed text-muted-foreground" data-testid="tool-disclaimer">
      <strong className="font-semibold text-foreground">Estimates only, not tax advice.</strong> This tool gives general
      information for planning. It is not a tax return, and it uses {TAX_YEAR} federal figures that the IRS and states can
      change. Your result depends on what you enter and on details this tool leaves out. Talk to a CPA before you act on it.
      The numbers you enter stay in your browser.
    </p>
  );
}

export function BookCallCta({ toolId, heading, body }: { toolId: string; heading: string; body: string }) {
  return (
    <section className="rounded-3xl bg-foreground px-6 py-8 text-white sm:px-10" aria-labelledby={`cta-${toolId}`}>
      <h2 id={`cta-${toolId}`} className="text-2xl font-extrabold tracking-[-0.03em]">
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">{body}</p>
      <a
        href={signUpUrl(toolId)}
        data-testid={`cta-book-${toolId}`}
        onClick={() => trackTool("cta_clicked", { tool: toolId, cta: "book_a_call" })}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5"
      >
        Talk to a CPA
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}

export default function ToolFrame(p: ToolFrameProps) {
  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar variant="individual" sourcePage={p.path} />
      <div className="relative">
        <PageBackdrop />
        <main className="relative pt-28 pb-16">
          <section className="mx-auto max-w-6xl px-6">
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
              <a href={TOOLS_HUB} className="hover:text-primary">
                Free tax tools
              </a>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span aria-current="page">{p.name}</span>
            </nav>
            <h1 className="hero-fade-up mb-4 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground md:text-5xl">{p.h1}</h1>
            <p className="mb-2 max-w-3xl text-lg leading-relaxed text-muted-foreground">{p.answer}</p>
            <p className="mb-8 text-sm text-muted-foreground">
              Free, no sign-up. {TAX_YEAR} figures, checked {TOOLS_FIGURES_CHECKED}.
            </p>
            {p.children}
            <div className="mt-6">
              <ToolDisclaimer />
            </div>
          </section>

          <div className="mt-6">
            <QuickAnswer
              id={`about-${p.toolId}`}
              question={p.about.question}
              answer={p.about.answer}
              facts={p.about.facts}
              factsCaption={p.about.factsCaption}
              sources={p.about.sources}
              updated={TOOLS_FIGURES_CHECKED}
            />
          </div>

          <FaqSection items={p.faq} />

          <section className="mx-auto max-w-6xl px-6 pb-6">
            <BookCallCta
              toolId={p.toolId}
              heading="Want a CPA to check your numbers?"
              body="A Big Four-trained CPA at Lesser Tax can review your real situation, find what this estimate leaves out and file your return for a flat fee."
            />
          </section>
        </main>
      </div>
      <RelatedGuides heading={p.guides.heading} guides={p.guides.items} />
      <ToolsFooter />
    </div>
  );
}

export function ToolsFooter() {
  return (
    <footer className="relative overflow-hidden bg-foreground">
      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <img src={lesserLogo} alt="Lesser Tax" width={96} height={96} className="h-8 w-auto opacity-70 brightness-0 invert" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/60">
            <a href={TOOLS_HUB} className="transition-colors hover:text-white">Free tax tools</a>
            <a href="/blog" className="transition-colors hover:text-white">Blog</a>
            <a href="/privacy" className="transition-colors hover:text-white">Privacy</a>
            <a href="/terms" className="transition-colors hover:text-white">Terms</a>
            <a href="mailto:use@lesser.tax" className="transition-colors hover:text-white">use@lesser.tax</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
