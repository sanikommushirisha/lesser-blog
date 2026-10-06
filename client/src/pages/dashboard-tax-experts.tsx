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
    </DashboardLayout>
  );
}
