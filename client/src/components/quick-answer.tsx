import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

// The "answer first" block placed right after a page's hero. Search engines
// lift a short, self-contained answer into featured snippets, and AI search
// (Google AI Overviews, ChatGPT, Perplexity, Claude) quotes passages that
// answer a question on their own, with figures and a source. So: the question
// people search as an <h2>, a 40-60 word answer, the key figures with the tax
// year they apply to, and links to the official sources.
//
// Keep every figure exact and sourced; update CONTENT_UPDATED only after the
// figures on the page were actually checked again.

export const CONTENT_UPDATED = "October 2026";

export type QuickFact = { label: string; value: ReactNode };
export type Source = { label: string; href: string };

export default function QuickAnswer({
  id,
  question,
  answer,
  facts,
  factsCaption,
  sources,
}: {
  id: string;
  question: string;
  answer: ReactNode;
  facts?: QuickFact[];
  factsCaption?: string;
  sources?: Source[];
}) {
  const headingId = `${id}-heading`;
  return (
    <section className="py-14 lg:py-16 bg-white" aria-labelledby={headingId} data-testid={`section-${id}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl border border-[#e0e8e5] bg-primary/[0.02] p-6 sm:p-10">
          <h2 id={headingId} className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-foreground mb-4">
            {question}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-foreground/80 max-w-4xl">{answer}</p>

          {facts && facts.length > 0 && (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-sm sm:text-base border-collapse">
                {factsCaption && (
                  <caption className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-3">
                    {factsCaption}
                  </caption>
                )}
                <tbody>
                  {facts.map((f) => (
                    <tr key={f.label} className="border-t border-[#e0e8e5] align-top">
                      <th scope="row" className="py-3 pr-6 font-semibold text-foreground whitespace-nowrap">
                        {f.label}
                      </th>
                      <td className="py-3 text-foreground/80">{f.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between text-sm text-muted-foreground">
            {sources && sources.length > 0 && (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-semibold text-foreground">Official sources:</span>
                {sources.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {s.label}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ))}
              </p>
            )}
            <p className="shrink-0">
              Updated {CONTENT_UPDATED}. General information, not advice for your situation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
