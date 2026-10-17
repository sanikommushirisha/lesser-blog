import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, RefreshCw, UserRoundSearch } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { fadeUp, Reveal, StaggerGroup } from "@/components/dashboard-motion";
import { PageHero } from "@/components/dashboard-sections";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpertAvatar } from "@/components/tax-expert-avatar";
import { fetchTaxExperts, flagFor, formatPrice, type TaxExpert } from "@/lib/tax-experts";

function ExpertCard({ expert }: { expert: TaxExpert }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link
        href={`/dashboard/tax-experts/${expert.id}`}
        className="flex h-full flex-col rounded-3xl bg-white p-5 ring-1 ring-black/[0.07] transition-shadow hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]"
        data-testid={`card-expert-${expert.id}`}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <ExpertAvatar name={expert.name} photoUrl={expert.photoUrl} className="h-12 w-12" />
            {expert.yearsOfExperience != null && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[hsl(var(--success))] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {expert.yearsOfExperience} yrs
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold tracking-tight text-foreground">{expert.name}</h3>
            {expert.jurisdictions.length > 0 && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Services for{" "}
                {expert.jurisdictions.map((j) => (
                  <span key={j} title={j} className="ml-0.5">
                    {flagFor(j)}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-1 flex-wrap content-start gap-2 border-t border-black/[0.06] pt-4">
          {expert.services.map((s) => (
            <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/80">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-black/[0.06] pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-xl font-extrabold tracking-tight text-foreground">{formatPrice(expert.priceCents)}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  return (
    <Reveal className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] bg-white px-6 py-16 text-center shadow-[0_2px_40px_-16px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.05]">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <UserRoundSearch className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground" data-testid="text-no-experts">
        {failed ? "Couldn't load tax experts" : "No CPAs available right now"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {failed
          ? "Something went wrong on our side. Please try again in a moment."
          : "We're onboarding vetted CPAs for one-on-one consultations. Check back soon."}
      </p>
      {failed && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
          data-testid="button-retry-experts"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </Reveal>
  );
}

export default function DashboardTaxExpertsPage() {
  const { data: experts, isLoading, isError, refetch } = useQuery({
    queryKey: ["tax-experts"],
    queryFn: fetchTaxExperts,
  });

  return (
    <DashboardLayout>
      <PageHero
        eyebrow="Tax Experts"
        title="Talk to a vetted"
        highlight="tax expert"
        intro="Book a one-on-one consultation with a CPA for U.S. and India tax questions. No account needed."
      />
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
          ) : !experts?.length ? (
            <EmptyState failed={isError} onRetry={() => refetch()} />
          ) : (
            <StaggerGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </StaggerGroup>
          )}
        </div>
      </section>
      <ConsultationGuide />
    </DashboardLayout>
  );
}

// Static copy under the expert list. The list itself loads in the browser, so
// this is what search engines read about the page; it also points visitors who
// need a full filing rather than advice to the right service.
const TOPICS: { title: string; body: string; href: string; link: string }[] = [
  {
    title: "U.S. taxes as an NRI or visa holder",
    body: "Residency status, reporting Indian income, FBAR and FATCA, and foreign tax credits on your U.S. return.",
    href: "/nris",
    link: "NRI tax filing",
  },
  {
    title: "Indian income and your India tax return",
    body: "NRO interest, rental income and capital gains in India, TDS refunds and claiming India-U.S. treaty (DTAA) relief.",
    href: "/services/india-tax-filing",
    link: "India tax filing (ITR)",
  },
  {
    title: "Equity compensation",
    body: "When your RSUs, ISOs or ESPP shares are taxed, and how to plan sales, exercises and estimated payments.",
    href: "/",
    link: "Tax planning for tech professionals",
  },
  {
    title: "Your business or rental LLC",
    body: "Choosing an entity, S corp elections, Form 1065 and 1120-S returns, and foreign-owned LLC filings.",
    href: "/business",
    link: "Business tax filing",
  },
];

function ConsultationGuide() {
  return (
    <section className="px-6 pb-24" aria-labelledby="consultation-guide-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="consultation-guide-heading" className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          What you can ask a tax expert
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          A consultation is a one-on-one video or phone call with a CPA or tax expert. Bring your questions and documents, and get
          answers for your own situation. If you need a return filed, we can do that too.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {TOPICS.map((t) => (
            <div key={t.title} className="rounded-3xl bg-white p-6 ring-1 ring-black/[0.07]">
              <h3 className="text-lg font-bold tracking-tight text-foreground">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
              <a href={t.href} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                {t.link}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
