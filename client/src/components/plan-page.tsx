import { CheckCircle2 } from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import SiteFooter from "@/components/site-footer";
import { FaqJsonLd } from "@/components/json-ld";
import { FREE_SIGN_UP_URL, PLANS, planById, planCta, planSignUpUrl, type PlanId } from "@/lib/plans";

// One page per plan (/pricing/essential, /premium, /private-client): the page
// ads point at, so the plan's price and its sign-up button come first.

const INCLUDED_IN_ALL = ["Federal & State Filing", "Expert CPA Review", "Year-Round Advisory"];

const STEPS = [
  {
    title: "Upload your tax forms",
    text: "Snap a pic or upload your tax forms into Lesser. We parse your forms and start prepping your return.",
  },
  {
    title: "Maximize your tax savings",
    text: "We scan your financials and uncover every deduction and credit you're entitled to, strategies most filers miss.",
  },
  {
    title: "Expert review & file",
    text: "A dedicated CPA reviews every detail, answers your questions, and files with the IRS.",
  },
];

const FAQS = [
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

function PlanButton({ id, testId }: { id: PlanId; testId: string }) {
  const plan = planById(id);
  return (
    <a
      href={planSignUpUrl(id)}
      data-plan={id}
      data-testid={testId}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
    >
      {planCta(plan)}
    </a>
  );
}

function FreeAccountLink() {
  return (
    <p className="text-sm text-muted-foreground">
      Not ready yet?{" "}
      <a href={FREE_SIGN_UP_URL} className="font-semibold text-primary underline-offset-4 hover:underline" data-testid="link-free-account">
        Create a free account
      </a>
    </p>
  );
}

export default function PlanPage({ id }: { id: PlanId }) {
  const plan = planById(id);
  const others = PLANS.filter((p) => p.id !== id);

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <SharedNavbar variant="individual" sourcePage={plan.path} />

      <main className="pt-28 pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <a href="/pricing" className="hover:text-foreground hover:underline">
              Pricing
            </a>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-foreground">{plan.name}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
            <header className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">{plan.name} plan</p>
              <h1
                className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl"
                data-testid="text-plan-title"
              >
                {plan.heading}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">{plan.subtitle}.</p>

              <p className="mt-8 flex items-baseline gap-2" data-testid="text-plan-price">
                <span className="text-6xl font-bold tracking-tight text-foreground">${plan.price}</span>
                <span className="text-lg text-muted-foreground">a year, flat fee</span>
              </p>

              <div className="mt-8 flex flex-col items-start gap-4">
                <PlanButton id={id} testId="button-plan-hero" />
                <FreeAccountLink />
              </div>

              <ul className="mt-10 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {[...INCLUDED_IN_ALL, "No hourly billing"].map((item) => (
                  <li key={item} className="flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </header>

            <section
              className="min-w-0 rounded-2xl border-2 border-primary bg-white p-7 shadow-[0_8px_32px_-4px_rgba(3,79,70,0.15)] dark:bg-card lg:p-8"
              aria-labelledby="whats-included"
            >
              <h2 id="whats-included" className="text-xl font-extrabold tracking-[-0.03em] text-foreground">
                What's included in {plan.name}
              </h2>
              <ul className="mt-6 space-y-3.5">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-[15px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-24" aria-labelledby="how-it-works">
            <h2 id="how-it-works" className="text-center text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
              How it works
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rounded-2xl border border-gray-200 p-7 dark:border-border">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em] text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-24" aria-labelledby="other-plans">
            <h2 id="other-plans" className="text-center text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
              Other plans
            </h2>
            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
              {others.map((p) => (
                <div key={p.id} className="flex flex-col rounded-2xl border border-gray-200 p-7 dark:border-border">
                  <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground">
                    {p.name} <span className="font-semibold text-muted-foreground">${p.price}/yr</span>
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.subtitle}.</p>
                  <a
                    href={p.path}
                    className="mt-5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    data-testid={`link-other-plan-${p.id}`}
                  >
                    See the {p.name} plan
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm">
              <a href="/pricing" className="font-semibold text-primary underline-offset-4 hover:underline">
                Compare all plans side by side
              </a>
            </p>
          </section>

          <section className="mx-auto mt-24 max-w-3xl" aria-labelledby="plan-questions">
            <h2 id="plan-questions" className="text-center text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
              Questions
            </h2>
            <div className="mt-8 divide-y divide-border/60">
              {FAQS.map((faq) => (
                <div key={faq.question} className="py-5">
                  <h3 className="text-base font-bold text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
            <FaqJsonLd items={FAQS} />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Have money or accounts in India? See{" "}
              <a href="/nris" className="font-semibold text-primary hover:underline">
                U.S. and India tax filing for NRIs
              </a>
              , or read our{" "}
              <a href="/blog" className="font-semibold text-primary hover:underline">
                tax guides
              </a>
              .
            </p>
          </section>

          <section
            className="mx-auto mt-24 flex max-w-3xl flex-col items-center gap-4 rounded-2xl bg-primary/5 px-6 py-12 text-center"
            aria-labelledby="start-plan"
          >
            <h2 id="start-plan" className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
              Start with {plan.name}
            </h2>
            <p className="text-muted-foreground">${plan.price} a year. One flat fee, no hourly billing.</p>
            <PlanButton id={id} testId="button-plan-bottom" />
            <FreeAccountLink />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
