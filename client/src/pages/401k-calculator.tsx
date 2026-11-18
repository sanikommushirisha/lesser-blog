// /tools/401k-calculator: 401(k) growth, tax saved, room under the 2026 IRS
// limit, traditional versus Roth, and the return-to-India comparison (LD-44),
// on the shared growth-tool frame. Calculation: shared/tools/retirement.ts.

import { useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import ToolFrame, { signUpUrl } from "@/components/tools/tool-frame";
import GrowthChart from "@/components/tools/growth-chart";
import { CARD, MoneyField, Notice, NumberField, Panel, PercentField, ResultRow, Segmented } from "@/components/tools/fields";
import { trackTool, useToolEvents } from "@/lib/tool-analytics";
import {
  CATCH_UP_50,
  CATCH_UP_60_63,
  FILING_STATUS_LABEL,
  type FilingStatus,
  LIMIT_401K,
  LIMIT_415C,
  ROTH_CATCH_UP_WAGE_THRESHOLD,
  TAX_YEAR,
  num,
  pct,
  usd,
} from "@shared/tools/federal";
import {
  INDIA_DEFAULTS,
  K401_DEFAULTS,
  type IndiaInput,
  type K401Input,
  compareIndiaExit,
  projectK401,
} from "@shared/tools/retirement";
import { GUIDES } from "@/components/related-guides";

const K401_FAQ: [string, string][] = [
  [
    `What is the 401(k) contribution limit for ${TAX_YEAR}?`,
    `You can contribute up to ${usd(LIMIT_401K)} of your own pay in ${TAX_YEAR}. If you are 50 or older you can add a ${usd(CATCH_UP_50)} catch-up, and ages 60 to 63 get a higher ${usd(CATCH_UP_60_63)} catch-up. Your employer's match does not count toward that limit, but the total from you and your employer is capped at ${usd(LIMIT_415C)}.`,
  ],
  [
    "Should I choose traditional or Roth 401(k)?",
    "Traditional contributions lower your taxable income now and are taxed when you withdraw. Roth contributions are taxed now and come out tax-free. A rough rule: if you expect a lower tax rate in retirement than today, traditional wins, and if you expect a higher one, Roth wins. The calculator compares both using the rate you expect in retirement.",
  ],
  [
    "How does an employer match work in this calculator?",
    "Enter the share of your contribution the employer matches and the cap as a percent of salary. For example, a 50% match up to 6% of salary means that if you contribute at least 6%, the employer adds 3% of your salary. Match money goes in as pre-tax.",
  ],
  [
    "What happens to my 401(k) if I move back to India?",
    "You can cash it out, leave it invested or roll it to an IRA before you go. A cash-out normally triggers 30% U.S. withholding for a nonresident plus a 10% penalty if you are under 59 and a half, and India may tax it too. Keeping it, or rolling it to an IRA, avoids the early tax and lets you withdraw later. Switch on the Return-to-India comparison below to see the numbers.",
  ],
  [
    "Is the projection guaranteed?",
    "No. It assumes the same steady return every year, your contributions rising with your salary, and the 2026 contribution limits staying the same. Real returns vary a lot year to year, and the IRS raises limits over time. Use it to compare choices, not to predict an exact balance.",
  ],
  [
    "What is the Roth catch-up rule?",
    `From ${TAX_YEAR}, if you are 50 or older and earned more than ${usd(ROTH_CATCH_UP_WAGE_THRESHOLD)} in Social Security wages the year before, your catch-up contributions must go into the Roth side of your 401(k). Your plan must offer a Roth option for you to make them.`,
  ],
];

export default function K401CalculatorPage() {
  const [f, setF] = useState<K401Input>(K401_DEFAULTS);
  const set = <K extends keyof K401Input>(k: K) => (v: K401Input[K]) => setF((p) => ({ ...p, [k]: v }));
  const [india, setIndia] = useState(false);
  const [x, setX] = useState<IndiaInput>(INDIA_DEFAULTS);
  const setXf = <K extends keyof IndiaInput>(k: K) => (v: IndiaInput[K]) => setX((p) => ({ ...p, [k]: v }));

  const r = useMemo(() => projectK401(f), [f]);
  const ix = useMemo(() => (india ? compareIndiaExit(x) : null), [india, x]);
  useToolEvents("401k-calculator", JSON.stringify([f, india, india ? x : null]), r.valid);

  const years = num(f.retireAge) - num(f.age);
  const summary = r.valid
    ? `Projected 401(k) balance of ${usd(r.finalBalance)} at age ${f.retireAge}, from ${usd(r.totalEmployee + r.totalMatch + num(f.balance))} put in.`
    : "";

  return (
    <ToolFrame
      path="/tools/401k-calculator"
      toolId="401k-calculator"
      name="401(k) calculator"
      h1="401(k) Calculator: Growth, Tax Savings and Roth vs Traditional"
      answer={
        <>
          See how your 401(k) could grow to retirement, how much tax your contributions save this year, how much room you have
          left under the {usd(LIMIT_401K)} {TAX_YEAR} limit, and whether traditional or Roth leaves you more after tax.
          Moving back to India? Compare cashing out, keeping it or rolling it to an IRA.
        </>
      }
      about={{
        question: `What is the ${TAX_YEAR} 401(k) limit and the catch-up amount?`,
        answer: (
          <>
            For {TAX_YEAR} you can contribute {usd(LIMIT_401K)} of your own pay to a 401(k). Age 50 and over adds {usd(CATCH_UP_50)},
            and ages 60 to 63 add {usd(CATCH_UP_60_63)}. Employer match and your own contributions together cannot pass{" "}
            {usd(LIMIT_415C)} (catch-up not counted).
          </>
        ),
        factsCaption: `${TAX_YEAR} 401(k) figures used by this calculator`,
        facts: [
          { label: "Employee deferral limit", value: usd(LIMIT_401K) },
          { label: "Catch-up, age 50 and over", value: usd(CATCH_UP_50) },
          { label: "Catch-up, ages 60 to 63", value: usd(CATCH_UP_60_63) },
          { label: "Total limit, you plus employer", value: `${usd(LIMIT_415C)} before catch-up` },
          { label: "Roth catch-up wage threshold", value: `Over ${usd(ROTH_CATCH_UP_WAGE_THRESHOLD)} of prior-year Social Security wages` },
          { label: "Early withdrawal penalty", value: "10% before age 59 and a half" },
          { label: "Withholding for a nonresident", value: "30% on U.S.-source retirement payments" },
        ],
        sources: [
          { label: "IRS Notice 2025-67", href: "https://www.irs.gov/pub/irs-drop/n-25-67.pdf" },
          { label: "IRS: 401(k) contribution limits", href: "https://www.irs.gov/retirement-plans/401k-plans" },
          { label: "India-U.S. tax treaty (IRS)", href: "https://www.irs.gov/businesses/international-businesses/india-tax-treaty-documents" },
        ],
      }}
      faq={K401_FAQ}
      guides={{ heading: "Retirement and India tax guides", items: [GUIDES.tech[4], GUIDES.nri[3], GUIDES.nri[5], GUIDES.nri[0], GUIDES.tech[0]] }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="space-y-6">
          <Panel title="You and your job">
            <div className="space-y-5">
              <Segmented
                label="Filing status"
                name="k-status"
                value={f.status}
                onChange={(v: FilingStatus) => set("status")(v)}
                options={(Object.keys(FILING_STATUS_LABEL) as FilingStatus[]).map((k) => ({ value: k, label: FILING_STATUS_LABEL[k] }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField id="age" label="Your age" value={f.age} onChange={set("age")} />
                <NumberField id="retireAge" label="Retirement age" value={f.retireAge} onChange={set("retireAge")} />
                <MoneyField id="balance" label="Current 401(k) balance" value={f.balance} onChange={set("balance")} />
                <MoneyField id="salary" label="Annual salary" value={f.salary} onChange={set("salary")} />
              </div>
            </div>
          </Panel>

          <Panel title="Contributions and growth">
            <div className="grid gap-4 sm:grid-cols-2">
              <PercentField id="contributionPct" label="You contribute" value={f.contributionPct} onChange={set("contributionPct")} hint="Percent of salary, before tax or Roth." />
              <PercentField id="tradSharePct" label="Traditional share" value={f.tradSharePct} onChange={set("tradSharePct")} hint="100 = all traditional, 0 = all Roth." />
              <PercentField id="matchRatePct" label="Employer matches" value={f.matchRatePct} onChange={set("matchRatePct")} hint="Percent of your contribution they match." />
              <PercentField id="matchCapPct" label="Match goes up to" value={f.matchCapPct} onChange={set("matchCapPct")} hint="Percent of your salary." />
              <PercentField id="returnPct" label="Expected yearly return" value={f.returnPct} onChange={set("returnPct")} hint="Before inflation. 6% to 7% is common." />
              <PercentField id="salaryGrowthPct" label="Yearly salary growth" value={f.salaryGrowthPct} onChange={set("salaryGrowthPct")} />
              <PercentField id="retireTaxPct" label="Your tax rate in retirement" value={f.retireTaxPct} onChange={set("retireTaxPct")} hint="On traditional withdrawals." />
              <PercentField id="stateRatePct" label="Your state tax rate now" value={f.stateRatePct} onChange={set("stateRatePct")} hint="0 if your state has no income tax." />
            </div>
          </Panel>

          <Panel title="Moving back to India?">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={india} onChange={(e) => setIndia(e.target.checked)} data-testid="toggle-india" className="mt-1 h-4 w-4 accent-[#034f46]" />
              <span>
                <span className="block text-sm font-bold text-foreground">Compare cash out, keep it, or roll to an IRA</span>
                <span className="block text-sm text-muted-foreground">Models the 10% early-withdrawal penalty, 30% withholding for a nonresident, and India tax with treaty credit.</span>
              </span>
            </label>
            {india && (
              <div className="mt-5 space-y-5 border-t border-[#eef3f1] pt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <MoneyField id="x-balance" label="401(k) balance when you move" value={x.balance} onChange={setXf("balance")} />
                  <NumberField id="x-ageMove" label="Your age when you move" value={x.ageMove} onChange={setXf("ageMove")} />
                  <NumberField id="x-ageWithdraw" label="Age you would withdraw if you keep it" value={x.ageWithdraw} onChange={setXf("ageWithdraw")} />
                  <PercentField id="x-returnPct" label="Expected yearly return" value={x.returnPct} onChange={setXf("returnPct")} />
                  <PercentField id="x-indiaRatePct" label="India tax rate on the withdrawal" value={x.indiaRatePct} onChange={setXf("indiaRatePct")} hint="31.2% is the top 30% slab plus 4% cess." />
                </div>
                <Segmented
                  label="Your India tax status when the money is paid"
                  name="india-status"
                  value={x.indiaStatus}
                  onChange={setXf("indiaStatus")}
                  options={[
                    { value: "rnor", label: "RNOR, money stays abroad" },
                    { value: "resident", label: "Resident, or money comes to India" },
                  ]}
                />
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={x.treatyClaim} onChange={(e) => setXf("treatyClaim")(e.target.checked)} className="mt-1 h-4 w-4 accent-[#034f46]" />
                  <span className="text-sm text-muted-foreground">
                    <span className="block font-semibold text-foreground">Assume the treaty claim for periodic payments is accepted</span>
                    Article 20 of the India-U.S. treaty is commonly read to tax periodic retirement payments only in the country you live in. A lump sum may not qualify. Confirm with a cross-border CPA.
                  </span>
                </label>
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-live="polite" aria-label="Your 401(k) results">
          <Notice>Showing an example with sample numbers. Replace them with yours.</Notice>
          {!r.valid ? (
            <Panel>
              <p className="text-sm text-muted-foreground" data-testid="k401-problem">{r.problem}</p>
            </Panel>
          ) : (
            <>
              <Panel>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projected balance at {f.retireAge}</p>
                <p className="mt-1 text-4xl font-extrabold tracking-[-0.03em] text-primary" data-testid="k401-final">{usd(r.finalBalance)}</p>
                <p className="mt-1 text-sm text-muted-foreground">About {usd(r.inTodaysDollars)} in today's dollars after {years} years of 2.5% inflation.</p>
                <div className="mt-4"><GrowthChart points={r.points} summary={summary} /></div>
                <dl className="mt-4">
                  <ResultRow label="Your contributions" value={usd(r.totalEmployee)} />
                  <ResultRow label="Employer match" value={usd(r.totalMatch)} />
                  <ResultRow label="Starting balance" value={usd(num(f.balance))} />
                  <ResultRow label="Investment growth" value={usd(r.growth)} />
                </dl>
              </Panel>

              <Panel title="This year">
                <dl>
                  <ResultRow label="You contribute" value={usd(r.employeeNow)} />
                  <ResultRow label="Employer match" value={usd(r.matchNow)} />
                  <ResultRow label="Tax saved this year" value={usd(r.taxSaved)} strong tone="good" hint={`at ${pct(r.federalMarginal, 0)} federal on the traditional part`} />
                  <ResultRow label={`Room left under the ${usd(r.limitNow)} limit`} value={usd(r.roomLeft)} hint={r.cappedByLimit ? "Capped: you chose more than the limit" : "Your own contributions only"} />
                </dl>
                {r.rothCatchUpApplies && (
                  <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>At your age and pay, catch-up contributions must be Roth. Your plan has to offer a Roth option.</span>
                  </p>
                )}
              </Panel>

              <Panel title="Traditional vs Roth at retirement">
                <dl>
                  <ResultRow label="Traditional balance" value={usd(r.tradBalance)} />
                  <ResultRow label="Tax on it at your retirement rate" value={`-${usd(r.taxOnTrad)}`} />
                  <ResultRow label="Roth balance (tax-free)" value={usd(r.rothBalance)} />
                  <ResultRow label="After-tax total" value={usd(r.afterTaxTotal)} strong />
                </dl>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid="trad-vs-roth">
                  {r.tradWins
                    ? `Your rate today (${pct(r.marginalNow, 0)}) is higher than your expected rate in retirement (${f.retireTaxPct}%), so traditional leaves you ahead.`
                    : `Your expected retirement rate (${f.retireTaxPct}%) is at or above your rate today (${pct(r.marginalNow, 0)}), so Roth leaves you ahead.`}
                </p>
              </Panel>
            </>
          )}

          {india && ix && (
            <Panel title="Return to India: cash out vs keep">
              {!ix.valid ? (
                <p className="text-sm text-muted-foreground">{ix.problem}</p>
              ) : (
                <div className="space-y-3" data-testid="india-results">
                  {ix.options.map((o) => (
                    <div key={o.id} className={`${CARD} p-4 ${ix.best === o.id ? "border-primary" : ""}`}>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-sm font-bold text-foreground">{o.label}</h3>
                        {ix.best === o.id && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">Most left after tax</span>}
                      </div>
                      <dl className="mt-2">
                        <ResultRow label={o.id === "cash" ? "Amount" : `Value at ${x.ageWithdraw}`} value={usd(o.gross)} />
                        <ResultRow label="U.S. tax" value={usd(o.usTax)} />
                        {o.penalty > 0 && <ResultRow label="10% early withdrawal penalty" value={usd(o.penalty)} />}
                        <ResultRow label="India tax" value={usd(o.indiaTax)} />
                        <ResultRow label="You keep" value={usd(o.net)} strong />
                        {o.id === "cash" && ix.years > 0 && <ResultRow label={`Worth at ${x.ageWithdraw} if invested`} value={usd(o.netAtWithdrawAge)} />}
                      </dl>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                        {o.notes.map((n) => <li key={n}>{n}</li>)}
                      </ul>
                    </div>
                  ))}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    An illustration. Treaty treatment depends on how you withdraw, your residency in each country and your plan.
                    Rules such as Section 89A and RNOR timing change the India side.{" "}
                    <a href="/nris" className="font-semibold text-primary hover:underline">Lesser Tax's NRI CPAs</a> can plan it with you.
                  </p>
                </div>
              )}
            </Panel>
          )}

          <a
            href={signUpUrl("401k-calculator")}
            onClick={() => trackTool("cta_clicked", { tool: "401k-calculator", cta: "results" })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            Talk to a CPA about your 401(k) <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </aside>
      </div>
    </ToolFrame>
  );
}
