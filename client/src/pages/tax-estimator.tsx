// /tools/tax-estimator: federal and state income tax estimate (LD-42), on the
// shared growth-tool frame. Calculation: shared/tools/estimator.ts, which
// script/check-tools.ts checks against an independent reference.

import { useMemo, useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import ToolFrame, { signUpUrl } from "@/components/tools/tool-frame";
import { MoneyField, NumberField, Notice, Panel, ResultRow, SelectField, Segmented } from "@/components/tools/fields";
import { trackTool, useToolEvents } from "@/lib/tool-analytics";
import {
  FILING_STATUS_LABEL,
  type FilingStatus,
  HSA_LIMIT,
  LIMIT_401K,
  SS_WAGE_BASE,
  STANDARD_DEDUCTION,
  TAX_YEAR,
  num,
  pct,
  usd,
} from "@shared/tools/federal";
import { ESTIMATOR_DEFAULTS, estimateTax } from "@shared/tools/estimator";
import { STATE_OPTIONS, STATE_TAX_YEAR, type StateCode } from "@shared/tools/state";
import { GUIDES } from "@/components/related-guides";

type Form = typeof ESTIMATOR_DEFAULTS;

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: String(12 - i), label: i === 0 ? "All 12 months" : `${12 - i} months` }));

export const ESTIMATOR_FAQ: [string, string][] = [
  [
    "How accurate is this tax estimator?",
    `It follows the ${TAX_YEAR} federal brackets, standard deduction, child tax credit and payroll tax rules, and the ${STATE_TAX_YEAR} rates for California, New York and New Jersey, so it is close for a typical W-2 return. It leaves out items such as the alternative minimum tax, stock options other than RSUs and ESPP, rental income, investment income tax and most credits, so treat it as a planning number, not a return.`,
  ],
  [
    "Why is my RSU income taxed differently from my salary?",
    "RSU income is taxed as wages when the shares vest, the same as salary. The difference is withholding: employers usually withhold a flat 22% federal tax on supplemental pay such as RSUs and bonuses, which is lower than the 24% to 37% many tech earners actually owe. That gap is the most common reason for a surprise bill in April.",
  ],
  [
    "Does the estimate include state tax?",
    `Yes for California, New York and New Jersey, using the latest published ${STATE_TAX_YEAR} state schedules, and Washington and Texas have no state tax on wages. Pick Another state to see federal tax only. New York City and Yonkers taxes, and state disability or family leave payroll taxes, are not included.`,
  ],
  [
    "How do I fill this in if I moved states during the year?",
    "Choose the state you live in now and set the number of months you lived there. The tool scales that state's tax for the months you lived there. This is an approximation: a real part-year return taxes income by where and when you earned it.",
  ],
  [
    "How is my refund or amount owed calculated?",
    "It compares the federal and state income tax the tool calculates with the income tax you tell us was withheld for the whole year. Social Security and Medicare tax are shown separately because they are withheld from every paycheck and do not change your refund.",
  ],
  [
    "Should I use the standard or itemized deduction?",
    `Leave itemized deductions blank to use the ${TAX_YEAR} standard deduction ($16,100 single, $32,200 married filing jointly, $24,150 head of household). If you enter itemized deductions, the tool uses whichever is larger, as the IRS lets you do. The state estimate uses each state's standard deduction.`,
  ],
];

export default function TaxEstimatorPage() {
  const [f, setF] = useState<Form>(ESTIMATOR_DEFAULTS);
  const set = <K extends keyof Form>(k: K) => (v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const result = useMemo(
    () =>
      estimateTax({
        status: f.status,
        state: f.state,
        months: num(f.months) || 12,
        children: Math.floor(num(f.children)),
        otherDependents: Math.floor(num(f.otherDependents)),
        wages: num(f.wages),
        bonus: num(f.bonus),
        rsuEspp: num(f.rsuEspp),
        spouseWages: num(f.spouseWages),
        otherIncome: num(f.otherIncome),
        k401: num(f.k401),
        hsa: num(f.hsa),
        itemized: num(f.itemized),
        fedWithheld: num(f.fedWithheld),
        stateWithheld: num(f.stateWithheld),
      }),
    [f],
  );
  const hasIncome = result.totalIncome > 0;
  useToolEvents("tax-estimator", JSON.stringify(f), hasIncome);

  const mfj = f.status === "mfj";
  const hasStateTax = f.state === "CA" || f.state === "NY" || f.state === "NJ";
  const owe = result.balance < 0;

  return (
    <ToolFrame
      path="/tools/tax-estimator"
      toolId="tax-estimator"
      name="Tax estimator"
      h1="Federal and State Tax Estimator for 2026"
      answer={
        <>
          Enter your income, deductions and withholding to estimate your {TAX_YEAR} federal and state income tax, your Social
          Security and Medicare tax, your effective and marginal rate, and whether you should expect a refund or owe money. It
          covers W-2 pay, bonuses, RSUs and ESPP, and the top states for Lesser's clients.
        </>
      }
      about={{
        question: `What are the ${TAX_YEAR} federal tax brackets and standard deduction?`,
        answer: (
          <>
            For {TAX_YEAR}, the federal income tax has seven brackets from 10% to 37%. The standard deduction is $16,100 for
            single filers, $32,200 for married couples filing jointly and $24,150 for heads of household. Social Security tax
            applies to the first {usd(SS_WAGE_BASE)} of each person's wages.
          </>
        ),
        factsCaption: `${TAX_YEAR} tax year figures used by this estimator`,
        facts: [
          { label: "Standard deduction", value: `${usd(STANDARD_DEDUCTION.single)} single, ${usd(STANDARD_DEDUCTION.mfj)} joint, ${usd(STANDARD_DEDUCTION.hoh)} head of household` },
          { label: "Top federal bracket", value: "37% over $640,600 (single), $768,700 (joint)" },
          { label: "401(k) employee limit", value: `${usd(LIMIT_401K)} (plus $8,000 at 50 and over, $11,250 at ages 60 to 63)` },
          { label: "HSA limit", value: `${usd(HSA_LIMIT.self)} self-only, ${usd(HSA_LIMIT.family)} family` },
          { label: "Child tax credit", value: "$2,200 per child under 17, reduced above $200,000 ($400,000 joint)" },
          { label: "Social Security wage base", value: `${usd(SS_WAGE_BASE)} per worker, 6.2% employee rate` },
          { label: "Medicare", value: "1.45%, plus 0.9% on wages over $200,000 ($250,000 joint)" },
          { label: "State rates", value: `${STATE_TAX_YEAR} schedules for CA, NY and NJ (the latest each state has published); none for WA and TX wages` },
        ],
        sources: [
          { label: "IRS Rev. Proc. 2025-32", href: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
          { label: "IRS Notice 2025-67", href: "https://www.irs.gov/pub/irs-drop/n-25-67.pdf" },
          { label: "SSA contribution and benefit base", href: "https://www.ssa.gov/oact/cola/cbb.html" },
          { label: "NY Dept. of Taxation: IT-201-I", href: "https://www.tax.ny.gov/forms/html-instructions/2025/it/it201i-2025.htm" },
        ],
      }}
      faq={ESTIMATOR_FAQ}
      guides={{ heading: "Tax guides for tech professionals", items: GUIDES.tech }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="space-y-6">
          <Panel title="About you">
            <div className="space-y-5">
              <Segmented
                label="Filing status"
                name="status"
                value={f.status}
                onChange={(v: FilingStatus) => set("status")(v)}
                options={(Object.keys(FILING_STATUS_LABEL) as FilingStatus[]).map((k) => ({ value: k, label: FILING_STATUS_LABEL[k] }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField<StateCode> id="state" label="State you live in" value={f.state} onChange={set("state")} options={STATE_OPTIONS.map((s) => ({ value: s.code, label: s.name }))} />
                {hasStateTax && <SelectField id="months" label="Months lived there in 2026" value={f.months} onChange={set("months")} options={MONTHS} hint="Fewer than 12 for a part-year estimate." />}
                <NumberField id="children" label="Children under 17" value={f.children} onChange={set("children")} placeholder="0" />
                <NumberField id="otherDependents" label="Other dependents" value={f.otherDependents} onChange={set("otherDependents")} placeholder="0" />
              </div>
            </div>
          </Panel>

          <Panel title="Income for 2026">
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyField id="wages" label="Your W-2 salary" value={f.wages} onChange={set("wages")} />
              <MoneyField id="bonus" label="Bonus" value={f.bonus} onChange={set("bonus")} />
              <MoneyField id="rsuEspp" label="RSU and ESPP income" value={f.rsuEspp} onChange={set("rsuEspp")} hint="The value of RSUs when they vest, and the discount on ESPP shares you sell." />
              {mfj && <MoneyField id="spouseWages" label="Spouse's W-2 wages" value={f.spouseWages} onChange={set("spouseWages")} hint="Social Security tax is capped for each person." />}
              <MoneyField id="otherIncome" label="Other income" value={f.otherIncome} onChange={set("otherIncome")} hint="Interest, dividends, side income. Taxed as ordinary income here." />
            </div>
          </Panel>

          <Panel title="Deductions and withholding">
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyField id="k401" label="Pre-tax 401(k)" value={f.k401} onChange={set("k401")} hint={mfj ? "You and your spouse together." : undefined} />
              <MoneyField id="hsa" label="HSA contributions" value={f.hsa} onChange={set("hsa")} hint="Through payroll." />
              <MoneyField id="itemized" label="Itemized deductions" value={f.itemized} onChange={set("itemized")} hint={`Leave blank for the ${usd(STANDARD_DEDUCTION[f.status])} standard deduction.`} placeholder="Standard" />
              <div className="hidden sm:block" />
              <MoneyField id="fedWithheld" label="Federal tax withheld" value={f.fedWithheld} onChange={set("fedWithheld")} hint="Total for the year: paid so far plus expected for the rest. See your pay stub." />
              {hasStateTax && <MoneyField id="stateWithheld" label="State tax withheld" value={f.stateWithheld} onChange={set("stateWithheld")} hint="Same, for your state." />}
            </div>
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-live="polite" aria-label="Your estimate">
          <Notice>Showing an example with sample numbers. Replace them with yours.</Notice>
          <Panel className={owe ? "border-red-200" : "border-emerald-200"}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{owe ? "You may owe" : "Estimated refund"}</p>
            <p className={`mt-1 text-4xl font-extrabold tracking-[-0.03em] ${owe ? "text-red-700" : "text-emerald-700"}`} data-testid="result-balance">
              {usd(Math.abs(result.balance))}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Federal {result.federalBalance >= 0 ? "refund" : "owed"} {usd(Math.abs(result.federalBalance))}
              {hasStateTax && <>, state {result.stateBalance >= 0 ? "refund" : "owed"} {usd(Math.abs(result.stateBalance))}</>}.
            </p>
            <dl className="mt-4">
              <ResultRow label="Federal income tax" value={usd(result.federalTax)} hint={result.creditsUsed > 0 ? `after ${usd(result.creditsUsed)} of credits` : undefined} />
              <ResultRow label="State income tax" value={usd(result.stateTax)} />
              <ResultRow label="Social Security and Medicare" value={usd(result.fica)} hint={result.additionalMedicare > 0 ? `includes ${usd(result.additionalMedicare)} additional Medicare` : undefined} />
              <ResultRow label="Total tax" value={usd(result.totalTax)} strong />
            </dl>
          </Panel>

          <Panel title="Your rates">
            <dl>
              <ResultRow label="Effective rate, income tax" value={pct(result.combinedEffective)} hint="federal + state, of total income" />
              <ResultRow label="Effective rate, with payroll tax" value={pct(result.allInEffective)} />
              <ResultRow label="Federal marginal rate" value={pct(result.federalMarginal, 0)} hint="on your next dollar of income" />
              {hasStateTax && <ResultRow label="Combined marginal rate" value={pct(result.combinedMarginal)} />}
              <ResultRow label="Adjusted gross income" value={usd(result.agi)} />
              <ResultRow label={result.usedItemized ? "Itemized deductions" : "Standard deduction"} value={usd(result.deduction)} />
              <ResultRow label="Federal taxable income" value={usd(result.taxableIncome)} />
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{result.stateNote}</p>
          </Panel>

          {result.tips.length > 0 && (
            <Panel title="Ways to lower your tax">
              <ul className="space-y-3">
                {result.tips.map((t) => (
                  <li key={t.id} className="flex gap-2.5 text-sm leading-relaxed text-foreground/80">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{t.text}</span>
                  </li>
                ))}
              </ul>
              <a
                href={signUpUrl("tax-estimator")}
                onClick={() => trackTool("cta_clicked", { tool: "tax-estimator", cta: "tips" })}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                Talk to a CPA about these <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Panel>
          )}
        </aside>
      </div>
    </ToolFrame>
  );
}
