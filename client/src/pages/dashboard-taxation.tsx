import { motion } from "framer-motion";
import { ArrowRight, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { fadeUp, StaggerGroup } from "@/components/dashboard-motion";
import {
  FeaturePills,
  GradientBanner,
  PageHero,
  SectionShell,
  SegmentedControl,
  ServiceCards,
  type SectionTab,
  type ServiceCardData,
} from "@/components/dashboard-sections";

const SIGN_UP_URL = "https://lesser.tax/app/auth/sign-up";

const TABS: SectionTab[] = [
  { id: "us-tax", label: "US Tax" },
  { id: "india-tax", label: "India Tax" },
];

// Services and prices mirror the existing Lesser pages each card links to.
const US_SERVICES: ServiceCardData[] = [
  {
    badge: "From $99/year",
    name: "Tax Filing",
    desc: "Federal and state returns for W-2 earners and equity compensation.",
    features: ["Federal & state returns", "RSUs, ISOs, ESPP & stock options", "Expert review before filing"],
    href: SIGN_UP_URL,
    cta: "Get Started",
  },
  {
    badge: "Year-round",
    name: "Tax Planning",
    desc: "Strategic planning to minimize your liability and maximize savings.",
    features: ["Year-round tax strategy", "Equity compensation planning", "Backdoor Roth & retirement planning"],
    href: SIGN_UP_URL,
    cta: "Get Started",
  },
  {
    badge: "$100 flat",
    name: "Business Tax Filing",
    desc: "Entity returns for founders, partnerships and real-estate investors.",
    features: ["Form 1120, 1065 & 1120-S", "CPA-reviewed", "48-hour turnaround"],
    href: "/business",
    cta: "File Business Taxes",
  },
];

const INDIA_SERVICES: ServiceCardData[] = [
  {
    badge: "From $69",
    name: "India Tax Filing",
    desc: "File your Indian ITR from the U.S. — handled by vetted Indian CAs.",
    features: ["Interest & dividend income", "Rental income & capital gains", "DTAA benefits"],
    href: "/services/india-tax-filing",
    cta: "File India Taxes",
  },
  {
    badge: "From $99",
    name: "NRI Tax Filing",
    desc: "Your U.S. return with every cross-border form handled.",
    features: ["FBAR & FATCA reporting", "PFIC & foreign tax credits", "RNOR planning"],
    href: "/nris",
    cta: "File as an NRI",
  },
];

const POPULAR_PICKS: { label: string; href: string }[] = [
  { label: "FBAR & FATCA", href: "/nris" },
  { label: "India ITR Filing", href: "/services/india-tax-filing" },
  { label: "Rental LLCs", href: "/business/realestate" },
  { label: "Partnerships & K-1s", href: "/business/partnerships" },
  { label: "March 15 Deadline", href: "/business/deadline" },
  { label: "Passport Renewal", href: "/services/passport-renewal" },
];

export default function DashboardTaxationPage() {
  return (
    <DashboardLayout>
      <PageHero
        eyebrow="Taxation"
        title="Expert tax solutions for"
        highlight="global Indians"
        intro="Comprehensive tax services for tech professionals and NRIs — navigate complex U.S. and India tax requirements with confidence."
      />
      {/* The wrapper bounds the sticky tab bar to the sections it controls. */}
      <div>
        <SegmentedControl tabs={TABS} layoutId="taxation-tab" />

        <SectionShell
          id="us-tax"
          flag="🇺🇸"
          title="US Tax Solutions"
          badge="Flat-fee pricing"
          subtitle="File and plan your U.S. taxes with Lesser's Big Four-trained CPAs."
        >
          <FeaturePills items={["Federal & state returns", "FBAR filing", "Tax planning"]} />
          <ServiceCards items={US_SERVICES} columns={3} />
        </SectionShell>

        <SectionShell
          id="india-tax"
          flag="🇮🇳"
          title="India Tax Solutions"
          subtitle="Tax services for NRIs with income or assets in India."
        >
          <FeaturePills items={["Expert filing", "DTAA benefits", "Compliance support"]} />
          <ServiceCards items={INDIA_SERVICES} />
        </SectionShell>
      </div>

      <GradientBanner>
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <BarChart3 className="h-5 w-5" />
          </span>
          <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">
            All your tax needs, in one place
          </h2>
        </div>
        <p className="mt-8 text-sm font-semibold text-white/80">Popular picks:</p>
        <StaggerGroup className="mt-3 flex flex-wrap gap-2.5">
          {POPULAR_PICKS.map((pick) => (
            <motion.a
              key={pick.label}
              href={pick.href}
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/20"
            >
              {pick.label}
            </motion.a>
          ))}
        </StaggerGroup>
        <a
          href="/dashboard/marketplace"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.03] active:scale-[0.98]"
          data-testid="button-explore-marketplace"
        >
          Explore Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </GradientBanner>
    </DashboardLayout>
  );
}
