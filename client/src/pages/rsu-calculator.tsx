// /tools/rsu-calculator: tax when RSUs vest and when you sell (LD-43), on the
// shared growth-tool frame. Calculation: shared/tools/rsu.ts.

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Plus, Trash2 } from "lucide-react";
import ToolFrame, { signUpUrl } from "@/components/tools/tool-frame";
import { CARD, MoneyField, Notice, NumberField, Panel, PercentField, ResultRow, Segmented, Field, cleanNumber } from "@/components/tools/fields";
import { trackTool, useToolEvents } from "@/lib/tool-analytics";
import { FILING_STATUS_LABEL, type FilingStatus, STANDARD_DEDUCTION, TAX_YEAR, num, pct, usd } from "@shared/tools/federal";
import { RSU_DEFAULTS, type RsuInput, type VestEvent, calculateRsu, newVestId } from "@shared/tools/rsu";
import { GUIDES } from "@/components/related-guides";

const PRESETS = ["22", "24", "32", "35", "37"];
const DATE_INPUT =
  "h-11 w-full rounded-xl border border-[#d5e0dc] bg-white px-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm";

const RSU_FAQ: [string, string][] = [
  [
    "When are RSUs taxed?",
    "RSUs are taxed as ordinary wages on the date they vest, based on the share price that day, whether or not you sell. If you later sell, you pay capital gains tax on any change in price after the vest date. Your cost basis is the value that was taxed at vest.",
  ],
  [
    "Why does my employer withhold 22% on RSUs?",
    "Federal rules let employers withhold a flat 22% on supplemental wages such as RSUs and bonuses, and 37% on supplemental wages above $1 million in a year. If your marginal tax rate is 24%, 32% or 35%, a 22% withholding leaves a gap that you pay when you file. The calculator shows that under-withholding gap.",
  ],
  [
    "What is the cost basis of my RSU shares?",
    "The fair market value on the vest date, per share. Brokers often report a lower basis, or none, on Form 1099-B for shares sold to cover taxes, so you can pay tax twice on the same income unless you correct the basis on Form 8949. The calculator shows the basis to use.",
  ],
  [
    "Is an RSU sale short-term or long-term?",
    "It depends on how long you held the shares after they vested, not on the grant date. Sold within one year of vesting, the gain is short-term and taxed like salary. Held more than one year, it is long-term and taxed at 0%, 15% or 20%.",
  ],
  [
    "Does this include state tax or FICA?",
    "No. This calculator shows federal income tax only. RSU income is also subject to Social Security and Medicare tax, which your employer withholds, and to state income tax. Use the tax estimator for a full picture with state tax and payroll tax.",
  ],
  [
    "Can I enter RSUs that vest in different years?",
    `This version treats all vests and sales as happening in the same tax year (${TAX_YEAR}). If your vests span two years, run it once for each year with that year's salary.`,
  ],
];

export default function RsuCalculatorPage() {
  const [f, setF] = useState<RsuInput>(RSU_DEFAULTS);
  const setTop = <K extends keyof RsuInput>(k: K) => (v: RsuInput[K]) => setF((p) => ({ ...p, [k]: v }));
  const setEvent = (id: string, patch: Partial<VestEvent>) => setF((p) => ({ ...p, events: p.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const addEvent = () =>
    setF((p) => {
      const last = p.events[p.events.length - 1];
      return { ...p, events: [...p.events, { id: newVestId(), vestDate: "", shares: last?.shares ?? "", priceAtVest: last?.priceAtVest ?? "", salePrice: "", saleDate: "" }] };
    });
  const removeEvent = (id: string) => setF((p) => ({ ...p, events: p.events.length > 1 ? p.events.filter((e) => e.id !== id) : p.events }));

  const r = useMemo(() => calculateRsu(f), [f]);
  useToolEvents("rsu-calculator", JSON.stringify(f), r.vestIncome > 0);

  const under = r.gap > 0;
  const std = STANDARD_DEDUCTION[f.status];

  return (
    <ToolFrame
      path="/tools/rsu-calculator"
      toolId="rsu-calculator"
      name="RSU calculator"
      h1="RSU Tax Calculator: Vesting, Withholding and Sale"
      answer={
        <>
          RSUs are taxed as ordinary income when they vest, and your employer usually withholds only 22% federal tax. Enter
          each vest and your salary to see the income recognized, the tax actually owed, how much you are under-withheld, and
          the capital gain or loss if you sell.
        </>
      }
      about={{
        question: "How are RSUs taxed when they vest and when you sell?",
        answer: (
          <>
            At vest, the shares' market value is ordinary income, taxed at your marginal rate (up to 37%) plus Social Security
            and Medicare tax. Your employer withholds a flat 22% federal tax on it. When you sell, the difference between the
            sale price and the vest-day value is a capital gain or loss: short-term within one year, long-term after.
          </>
        ),
        factsCaption: `${TAX_YEAR} figures used by this calculator`,
        facts: [
          { label: "Federal withholding on RSUs", value: "22% flat, 37% on supplemental wages over $1,000,000 in the year" },
          { label: "Ordinary tax rates", value: "10% to 37%, on top of your salary" },
          { label: "Long-term gain rates", value: "0% up to $49,450 of taxable income (single), 15% to $545,500, 20% above" },
          { label: "Net investment income tax", value: "3.8% on gains when income is over $200,000 ($250,000 joint)" },
          { label: "Capital loss limit", value: "$3,000 a year against ordinary income, the rest carries forward" },
          { label: "Cost basis of vested shares", value: "Share price on the vest date" },
        ],
        sources: [
          { label: "IRS Pub. 525: Employee compensation", href: "https://www.irs.gov/publications/p525" },
          { label: "IRS Pub. 15: supplemental wages", href: "https://www.irs.gov/publications/p15" },
          { label: "IRS Rev. Proc. 2025-32", href: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
        ],
      }}
      faq={RSU_FAQ}
      guides={{ heading: "RSU and equity guides", items: GUIDES.tech }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="space-y-6">
          <Panel title="Your tax situation">
            <div className="space-y-5">
              <Segmented
                label="Filing status"
                name="rsu-status"
                value={f.status}
                onChange={(v: FilingStatus) => setTop("status")(v)}
                options={(Object.keys(FILING_STATUS_LABEL) as FilingStatus[]).map((k) => ({ value: k, label: FILING_STATUS_LABEL[k] }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyField id="salary" label="Salary and other income" value={f.salary} onChange={setTop("salary")} hint={`Everything except these RSUs. Taxed after the ${usd(std)} standard deduction.`} />
                <div>
                  <PercentField id="withholdingPct" label="Federal withholding rate on RSUs" value={f.withholdingPct} onChange={setTop("withholdingPct")} hint="22% is the usual default. Check your RSU vest statement." />
                  <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Common withholding rates">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTop("withholdingPct")(p)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${f.withholdingPct === p ? "border-primary bg-primary text-white" : "border-[#d5e0dc] text-foreground hover:border-primary/50"}`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Vest events">
            <p className="mb-4 text-sm text-muted-foreground">
              Add each date shares vested. To see the tax on a sale, also enter the sale price and date (all shares of that vest).
            </p>
            <ul className="space-y-4">
              {f.events.map((e, idx) => (
                <li key={e.id} className={`${CARD} p-4`} data-testid={`vest-${idx}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">Vest {idx + 1}</h3>
                    {f.events.length > 1 && (
                      <button type="button" onClick={() => removeEvent(e.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-red-700" aria-label={`Remove vest ${idx + 1}`}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field id={`vd-${e.id}`} label="Vest date">
                      <input id={`vd-${e.id}`} type="date" value={e.vestDate} onChange={(ev) => setEvent(e.id, { vestDate: ev.target.value })} className={DATE_INPUT} />
                    </Field>
                    <NumberField id={`sh-${e.id}`} label="Shares vesting" value={e.shares} onChange={(v) => setEvent(e.id, { shares: v })} />
                    <MoneyField id={`pv-${e.id}`} label="Price per share at vest" value={e.priceAtVest} onChange={(v) => setEvent(e.id, { priceAtVest: v })} />
                  </div>
                  <div className="mt-3 grid gap-3 border-t border-[#eef3f1] pt-3 sm:grid-cols-3">
                    <MoneyField id={`sp-${e.id}`} label="Sale price per share (optional)" value={e.salePrice} onChange={(v) => setEvent(e.id, { salePrice: cleanNumber(v) })} placeholder="Not sold" />
                    <Field id={`sd-${e.id}`} label="Sale date (optional)">
                      <input id={`sd-${e.id}`} type="date" value={e.saleDate} onChange={(ev) => setEvent(e.id, { saleDate: ev.target.value })} className={DATE_INPUT} />
                    </Field>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={addEvent} data-testid="add-vest" className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#d5e0dc] px-3.5 py-2 text-sm font-semibold text-foreground hover:border-primary/50">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add a vest
            </button>
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-live="polite" aria-label="Your RSU results">
          <Notice>Showing an example with sample numbers. Replace them with yours.</Notice>
          <Panel>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{under ? "Under-withheld, you may owe" : "Withholding covers the tax"}</p>
            <p className={`mt-1 text-4xl font-extrabold tracking-[-0.03em] ${under ? "text-red-700" : "text-emerald-700"}`} data-testid="rsu-gap">
              {usd(Math.abs(r.gap))}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {under
                ? `Your RSUs add ${usd(r.actualTax)} of federal tax but only ${usd(r.withheld)} is withheld.`
                : `Your RSUs add ${usd(r.actualTax)} of federal tax and ${usd(r.withheld)} is withheld.`}
            </p>
            <dl className="mt-4">
              <ResultRow label="Income recognized at vest" value={usd(r.vestIncome)} />
              <ResultRow label="Federal tax withheld" value={usd(r.withheld)} />
              <ResultRow label="Estimated federal tax on RSUs" value={usd(r.actualTax)} />
              <ResultRow label="Your marginal rate with RSUs" value={pct(r.marginal, 0)} />
              <ResultRow label={under ? "Under-withholding gap" : "Over-withheld"} value={usd(Math.abs(r.gap))} strong tone={under ? "bad" : "good"} />
            </dl>
            {under && (
              <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Set this aside, raise your W-4 withholding or make an estimated payment before the year ends to avoid an
                  underpayment penalty. Social Security, Medicare and state tax are extra.
                </span>
              </p>
            )}
            {r.skipped > 0 && <p className="mt-3 text-xs text-muted-foreground">{r.skipped} vest row(s) skipped: enter shares and a price.</p>}
          </Panel>

          {r.rows.length > 1 && (
            <Panel title="Withholding by vest">
              <dl>
                {r.rows.map((row, i) => (
                  <ResultRow key={row.id} label={`Vest ${i + 1}: ${usd(row.income)}`} value={`${usd(row.withheld)} withheld`} />
                ))}
              </dl>
            </Panel>
          )}

          {r.hasSales && (
            <Panel title="If you sell">
              <dl>
                {r.sales.map((s, i) => (
                  <ResultRow
                    key={s.id}
                    label={`Sale ${i + 1}: ${s.longTerm ? "long-term" : "short-term"}`}
                    hint={`held ${s.days} days`}
                    value={`${s.gain >= 0 ? "gain " : "loss "}${usd(Math.abs(s.gain))}`}
                    tone={s.gain >= 0 ? undefined : "good"}
                  />
                ))}
                <ResultRow label="Net short-term" value={usd(r.shortTermGain)} />
                <ResultRow label="Net long-term" value={usd(r.longTermGain)} />
                {r.deductibleLoss > 0 && <ResultRow label="Loss deducted this year" value={usd(r.deductibleLoss)} hint={r.carryForwardLoss > 0 ? `${usd(r.carryForwardLoss)} carries forward` : undefined} />}
                {r.niit > 0 && <ResultRow label="Net investment income tax" value={usd(r.niit)} />}
                <ResultRow label="Estimated federal tax on the sales" value={usd(r.saleTax)} strong />
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Use the vest-day value as your cost basis on Form 8949. If your broker's Form 1099-B shows a lower basis for
                shares sold to cover taxes, correct it there so the same income is not taxed twice.
              </p>
            </Panel>
          )}

          <a
            href={signUpUrl("rsu-calculator")}
            onClick={() => trackTool("cta_clicked", { tool: "rsu-calculator", cta: "results" })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            Get a CPA to plan your RSU taxes <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </aside>
      </div>
    </ToolFrame>
  );
}
