// /tools: the hub of Lesser Tax's free calculators and planners (LD-41). Each
// card is a plain link, so crawlers and AI search find every tool from here.

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import PageBackdrop from "@/components/page-backdrop";
import { JsonLd } from "@/components/json-ld";
import { FaqSection } from "@/components/passport-forms-layout";
import RelatedGuides, { GUIDES } from "@/components/related-guides";
import { BookCallCta, ToolDisclaimer, ToolsFooter } from "@/components/tools/tool-frame";
import { ToolIllustration } from "@/components/tools/tool-illustration";
import { BASE_URL } from "@shared/page-meta";
import { TAX_YEAR } from "@shared/tools/federal";

export const TOOLS: { id: string; path: string; name: string; blurb: string }[] = [
  {
    id: "tax-estimator",
    path: "/tools/tax-estimator",
    name: "Tax Estimator",
    blurb: `Estimate your ${TAX_YEAR} federal and state income tax, payroll tax, effective rate and refund or amount owed, with RSUs and bonuses.`,
  },
  {
    id: "rsu-calculator",
    path: "/tools/rsu-calculator",
    name: "RSU Calculator",
    blurb: "See the tax when RSUs vest, whether 22% withholding is enough, and the gain or loss when you sell.",
  },
  {
    id: "401k-calculator",
    path: "/tools/401k-calculator",
    name: "401(k) Calculator",
    blurb: "Project your balance, see tax saved and room under the limit, compare Roth and traditional, and compare options if you move back to India.",
  },
  {
    id: "passport-forms",
    path: "/tools/indian-passport-forms",
    name: "Indian Passport Forms",
    blurb: "Fill every VFS USA form for Indian passport renewal: Annexure E, the appearance affidavit and the checklist. Free, nothing stored.",
  },
];

const HUB_FAQ: [string, string][] = [
  [
    "Are these tax tools really free?",
    "Yes. Every calculator on this page is free to use, with no sign-up. The numbers you type stay in your browser. If you want a CPA to look at your real situation, you can book a call afterwards.",
  ],
  [
    "Can I rely on a calculator instead of a CPA?",
    `No. The tools give planning estimates from ${TAX_YEAR} rules and the figures you enter. They leave out details that change real tax bills, such as the alternative minimum tax, stock options other than RSUs and credits. Use them to decide what to ask, then confirm with a CPA before you act.`,
  ],
  [
    "Which tax year do the tools use?",
    `${TAX_YEAR} federal figures from IRS Revenue Procedure 2025-32 and Notice 2025-67. State figures are the latest each state has published, which is 2025 for California, New York and New Jersey, because states publish after the IRS.`,
  ],
];

// Same card as the marketplace's (pages/marketplace.tsx): white tile, rounded 20px,
// flat illustration, bold title, short description and a "View details" link, lifting
// on hover. The whole card is one real link so crawlers and keyboards follow it.
function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  return (
    <motion.a
      href={tool.path}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#e0e8e5] bg-white p-6 text-left transition-shadow hover:shadow-[0_12px_40px_rgba(3,79,70,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      data-testid={`card-tool-${tool.id}`}
    >
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#f3f6f5] ring-1 ring-[#e2eae7]">
        <ToolIllustration id={tool.id} className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-[17px] font-bold leading-snug tracking-[-0.3px] text-[#0f0f0f]">{tool.name}</h2>
      <p className="mb-5 flex-1 text-[14px] leading-relaxed text-[#374151]">{tool.blurb}</p>
      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary transition-colors group-hover:text-[#023d35]">
        View details
        <ArrowRight className="h-[14px] w-[14px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </motion.a>
  );
}

export default function ToolsHubPage() {
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Lesser Tax free tax tools",
    itemListElement: TOOLS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${BASE_URL}${t.path}` })),
  };
  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar variant="individual" sourcePage="/tools" />
      <div className="relative">
        <PageBackdrop />
        <main className="relative pt-28 pb-16">
          <section className="mx-auto max-w-6xl px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Free tools</p>
            <h1 className="hero-fade-up mb-4 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground md:text-5xl">
              Free Tax Tools and Calculators for Tech Professionals and NRIs
            </h1>
            <p className="mb-10 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Estimate your {TAX_YEAR} taxes, see what your RSUs really cost, plan your 401(k) and fill your Indian passport
              forms. Made by Lesser Tax, a CPA-led tax firm. Free, with no sign-up.
            </p>
            <JsonLd data={list} />
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" data-testid="tools-list">
              {TOOLS.map((t) => (
                <li key={t.path}>
                  <ToolCard tool={t} />
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ToolDisclaimer />
            </div>
          </section>

          <FaqSection items={HUB_FAQ} />

          <section className="mx-auto max-w-6xl px-6 pb-6">
            <BookCallCta
              toolId="hub"
              heading="Rather have a CPA do it?"
              body="Lesser Tax prepares and files returns for tech professionals and NRIs for a flat fee, with a CPA who knows RSUs, FBAR and the India-U.S. treaty."
            />
          </section>
        </main>
      </div>
      <RelatedGuides heading="Tax guides to read next" guides={GUIDES.tech} />
      <ToolsFooter />
    </div>
  );
}
