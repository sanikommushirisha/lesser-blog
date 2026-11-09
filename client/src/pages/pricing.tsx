import { CheckCircle2, Minus } from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import SiteFooter from "@/components/site-footer";
import PlanCards, { FreeAccountNote } from "@/components/plan-cards";
import { FaqJsonLd } from "@/components/json-ld";
import { PLANS, planCta, planSignUpUrl } from "@/lib/plans";

const INCLUDED_IN_ALL = ["Federal & State Filing", "Expert CPA Review", "Year-Round Advisory"];

// true = included, false = not included, text = what that plan gets.
type Cell = boolean | string;

const COMPARISON: { group: string; rows: { label: string; cells: [Cell, Cell, Cell] }[] }[] = [
  {
    group: "Filing",
    rows: [
      { label: "Federal & state filing", cells: [true, true, true] },
      { label: "W-2 & bank interest", cells: [true, true, true] },
      { label: "Basic deductions review", cells: [true, true, true] },
      { label: "Business & rental income", cells: [false, false, true] },
    ],
  },
  {
    group: "Your CPA",
    rows: [
      { label: "CPA check-ins", cells: ["Annual", "Semi-annual", "Quarterly strategy calls"] },
      { label: "Support", cells: ["Standard", "Priority", "Priority"] },
      { label: "Dedicated account manager", cells: [false, false, true] },
    ],
  },
  {
    group: "Planning",
    rows: [
      { label: "RSU / ISO / NSO planning", cells: [false, true, true] },
      { label: "Foreign reporting (FBAR / FATCA)", cells: [false, true, true] },
      { label: "Home mortgage optimization", cells: [false, true, true] },
      { label: "Trust & estate planning", cells: [false, false, true] },
      { label: "Advanced tax strategies", cells: [false, false, true] },
    ],
  },
];

const FAQS = [
  {
    question: "Which plan is right for me?",
    answer:
      "Essential is ideal for W-2 employees with straightforward tax needs. Premium is for tech professionals with equity compensation and complex income. Private Client is for founders, investors and business owners who need proactive strategy.",
  },
  {
    question: "Is there any hourly billing?",
    answer: "No. Each plan is one flat annual fee, with no hourly billing and no surprise charges.",
  },
  {
    question: "Does every plan include filing?",
    answer: "Yes. Federal and state filing and expert CPA review are part of every plan.",
  },
  {
    question: "Do I get to talk to a real person?",
    answer:
      "Yes! Every client is matched with a dedicated CPA who knows your situation. You'll have direct access via chat, video calls, and email throughout the year.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Yes. We use bank-level encryption, are SOC 2 compliant, and are an Authorized IRS e-file Provider. Your data is never sold or shared.",
  },
];

function ComparisonCell({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <CheckCircle2 className="mx-auto h-5 w-5 text-primary" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

function ComparisonTable() {
  return (
    <div className="relative overflow-x-auto rounded-2xl border border-gray-200 dark:border-border" data-testid="table-compare-plans">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200 dark:border-border">
            <th scope="col" className="w-[34%] p-5 text-sm font-semibold text-muted-foreground">
              What you get
            </th>
            {PLANS.map((plan) => (
              <th key={plan.id} scope="col" className="w-[22%] p-5 text-center align-top">
                <a
                  href={plan.path}
                  className={`block text-base font-extrabold underline-offset-4 hover:underline ${plan.featured ? "text-primary" : "text-foreground"}`}
                >
                  {plan.name}
                </a>
                <span className="mt-1 block text-sm font-medium text-muted-foreground">
                  ${plan.price}
                  {plan.period}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        {COMPARISON.map((section) => (
          <tbody key={section.group}>
            <tr className="bg-primary/5">
              <th scope="colgroup" colSpan={4} className="px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                {section.group}
              </th>
            </tr>
            {section.rows.map((row) => (
              <tr key={row.label} className="border-b border-gray-100 dark:border-border">
                <th scope="row" className="px-5 py-3.5 text-sm font-medium text-foreground">
                  {row.label}
                </th>
                {row.cells.map((cell, i) => (
                  <td key={PLANS[i].id} className="px-5 py-3.5 text-center">
                    <ComparisonCell value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
        <tfoot>
          <tr>
            <td className="p-5" />
            {PLANS.map((plan) => (
              <td key={plan.id} className="p-4 text-center align-top">
                <a
                  href={planSignUpUrl(plan.id)}
                  data-plan={plan.id}
                  data-testid={`button-compare-${plan.id}`}
                  className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    plan.featured
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-primary/30 text-primary hover:bg-primary/5"
                  }`}
                >
                  {planCta(plan)}
                </a>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <SharedNavbar variant="individual" sourcePage="/pricing" />

      <main className="pt-32 pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <header className="mx-auto max-w-3xl text-center">
            <h1
              className="text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl"
              data-testid="text-pricing-title"
            >
              Tax filing and planning. <span className="block text-primary">One flat fee.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Choose the plan that fits your income, from W-2 wages to RSUs, foreign accounts and your own business. No hourly
              billing. No surprise charges.
            </p>
          </header>

          <ul className="mt-8 mb-14 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {INCLUDED_IN_ALL.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <section aria-labelledby="choose-plan">
            <h2 id="choose-plan" className="sr-only">
              Choose your plan
            </h2>
            <PlanCards />
            <FreeAccountNote className="mt-10" />
          </section>

          <section className="mt-20" aria-labelledby="compare-plans">
            <h2 id="compare-plans" className="mb-8 text-center text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
              Compare plans
            </h2>
            <ComparisonTable />
          </section>

          <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="pricing-questions">
            <h2 id="pricing-questions" className="mb-8 text-center text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
              Pricing questions
            </h2>
            <div className="divide-y divide-border/60">
              {FAQS.map((faq) => (
                <div key={faq.question} className="py-5">
                  <h3 className="text-base font-bold text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
            <FaqJsonLd items={FAQS} />
          </section>

          <section className="mx-auto mt-16 max-w-3xl text-center" aria-labelledby="more-services">
            <h2 id="more-services" className="text-xl font-extrabold tracking-[-0.02em] text-foreground">
              Looking for something else?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We also handle{" "}
              <a href="/nris" className="font-semibold text-primary hover:underline">
                U.S. and India tax filing for NRIs
              </a>
              ,{" "}
              <a href="/services/india-tax-filing" className="font-semibold text-primary hover:underline">
                India tax return filing
              </a>{" "}
              and{" "}
              <a href="/business" className="font-semibold text-primary hover:underline">
                business tax filing
              </a>
              . You can also browse the{" "}
              <a href="/marketplace" className="font-semibold text-primary hover:underline">
                Lesser Tax Marketplace
              </a>{" "}
              or read our{" "}
              <a href="/blog" className="font-semibold text-primary hover:underline">
                tax guides
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
