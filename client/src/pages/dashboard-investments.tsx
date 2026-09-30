import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CircleCheck,
  Coins,
  Gem,
  Globe,
  Landmark,
  LineChart,
  PiggyBank,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import DashboardLayout, { EASE } from "@/components/dashboard-layout";
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

const CONSULT_URL = "https://calendly.com/lesser-tax/consultationcall-with-lesserteam";
const CONTACT_URL = "mailto:use@lesser.tax";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

// PLACEHOLDER: generic strategy types. Replace with real partners (name, copy, link) once confirmed.
const PMS_PROVIDERS: ServiceCardData[] = [
  {
    name: "Quantitative Strategies",
    desc: "Data-driven, systematic investing with a risk-adjusted approach to returns.",
    features: ["Cross-border investing", "High-growth themes", "NRI-first solutions", "Invest back home"],
    href: CONSULT_URL,
    monogram: true,
  },
  {
    name: "Quality Compounders",
    desc: "Research-driven portfolios of high-quality companies, built for long-term wealth.",
    features: ["India's top-quality companies", "Regulated investments", "Deep research", "Long-term compounding"],
    href: CONSULT_URL,
    monogram: true,
  },
];

// PLACEHOLDER: generic fund types. Replace with real GIFT City funds once confirmed.
const GIFT_PROVIDERS: ServiceCardData[] = [
  {
    name: "Indian Equity Funds",
    desc: "Invest in select Indian stocks with a growth and governance focus.",
    features: ["India growth story", "Simple access", "Flexi-cap advantage", "Research-led strategy"],
    href: CONSULT_URL,
    monogram: true,
  },
  {
    name: "Feeder Funds & ETFs",
    desc: "Feeder funds that invest into India's domestic mutual funds and ETFs.",
    features: ["India growth story", "GIFT City", "Tax benefits at fund level", "Digital onboarding"],
    href: CONSULT_URL,
    monogram: true,
  },
];

const COLLECTIONS: { icon: LucideIcon; name: string }[] = [
  { icon: Users, name: "NRI Favourites" },
  { icon: BarChart3, name: "Low-cost Indexing" },
  { icon: Star, name: "5-star Funds" },
  { icon: PiggyBank, name: "Better than FDs" },
  { icon: Sparkles, name: "Recent NFOs" },
  { icon: Gem, name: "Precious Metals" },
];

// PLACEHOLDER: fund categories instead of named funds with return figures.
const FUND_TYPES: { icon: LucideIcon; name: string; type: string }[] = [
  { icon: TrendingUp, name: "Large Cap", type: "Equity" },
  { icon: LineChart, name: "Flexi Cap", type: "Equity" },
  { icon: BarChart3, name: "Nifty 50 Index", type: "Index" },
  { icon: ShieldCheck, name: "Tax Saver (ELSS)", type: "Equity" },
  { icon: Scale, name: "Balanced Advantage", type: "Hybrid" },
  { icon: Coins, name: "Gold & Silver FoF", type: "Commodity" },
];

const SMART_STEPS = [
  "Know your risk score in 5 simple questions",
  "Share your investment preferences",
  "Get a flexible portfolio — swap funds, adjust allocation or rebalance anytime",
  "Invest and relax",
];

const TABS: SectionTab[] = [
  { id: "pms", label: "PMS" },
  { id: "mutual-funds", label: "Mutual Funds" },
  { id: "gift-city", label: "GIFT City" },
];

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function PmsSection() {
  return (
    <SectionShell
      id="pms"
      icon={Sparkles}
      title="Portfolio Management Services"
      subtitle="Expert-led strategies to grow your wealth smartly."
    >
      <FeaturePills items={["Expert management", "Custom strategies", "Hybrid", "High-touch service", "Research access"]} />
      <ServiceCards items={PMS_PROVIDERS} />
    </SectionShell>
  );
}

function MutualFundsSection() {
  return (
    <SectionShell
      id="mutual-funds"
      icon={Landmark}
      title="Mutual Funds"
      subtitle="Access India's top-performing mutual funds."
    >
      <StaggerGroup className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Collections */}
        <motion.div variants={fadeUp} className="flex flex-col overflow-hidden rounded-3xl ring-1 ring-black/[0.07]">
          <div className="bg-muted p-5">
            <h3 className="text-lg font-bold tracking-tight text-foreground">Lesser Collections</h3>
            <p className="mt-1 text-sm text-muted-foreground">Funds curated for your specific investment needs</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 p-4">
            {COLLECTIONS.map(({ icon: Icon, name }) => (
              <motion.a
                key={name}
                href={CONSULT_URL}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/[0.07] hover:ring-primary/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold leading-tight text-foreground">{name}</span>
              </motion.a>
            ))}
          </div>
          <div className="px-4 pb-4">
            <a
              href={CONSULT_URL}
              className="flex items-center justify-center gap-1 rounded-full bg-muted py-3 text-sm font-semibold text-foreground hover:bg-black/[0.07]"
            >
              View All Categories <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* Popular fund types */}
        <motion.div variants={fadeUp} className="flex flex-col overflow-hidden rounded-3xl ring-1 ring-black/[0.07]">
          <div className="bg-muted p-5">
            <h3 className="text-lg font-bold tracking-tight text-foreground">Popular Fund Types</h3>
            <p className="mt-1 text-sm text-muted-foreground">The fund categories global Indians invest in most</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {FUND_TYPES.map(({ icon: Icon, name, type }) => (
              <motion.a
                key={name}
                href={CONSULT_URL}
                whileHover={{ y: -3 }}
                className="flex flex-col rounded-2xl bg-white p-3 ring-1 ring-black/[0.07] hover:ring-primary/30"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-3 text-xs font-semibold leading-tight text-foreground">{name}</span>
                <span className="mt-1 text-[11px] font-semibold text-[hsl(var(--success))]">{type}</span>
              </motion.a>
            ))}
          </div>
          <div className="px-4 pb-4">
            <a
              href={CONSULT_URL}
              className="group flex items-center justify-center gap-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              See All Funds <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>

        {/* Smart investing */}
        <motion.div
          variants={fadeUp}
          className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[hsl(var(--chart-2))] p-5 text-primary-foreground"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">Smart Investing</h3>
              <p className="text-sm text-white/75">A personalised portfolio, built around you</p>
            </div>
          </div>
          <motion.ol
            className="relative mt-5 flex-1 space-y-2.5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.25, delayChildren: 0.3 } } }}
          >
            {SMART_STEPS.map((step) => (
              <motion.li
                key={step}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
                }}
                className="flex items-start gap-3 rounded-2xl bg-white/10 p-3.5 text-sm font-medium"
              >
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--chart-4))]" />
                {step}
              </motion.li>
            ))}
          </motion.ol>
          <a
            href={CONSULT_URL}
            className="group relative mt-5 flex items-center justify-center gap-1 rounded-full bg-white py-3 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
            data-testid="button-create-portfolio"
          >
            Create Your Portfolio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </StaggerGroup>
    </SectionShell>
  );
}

function GiftCitySection() {
  return (
    <SectionShell
      id="gift-city"
      icon={Globe}
      title="GIFT City Investments"
      subtitle="Invest in India seamlessly — no Indian bank account, no TDS and no tax headaches."
    >
      <FeaturePills items={["Tax benefits", "No TDS for NRIs", "Foreign currency", "Global markets", "Simplified KYC"]} />
      <ServiceCards items={GIFT_PROVIDERS} />
    </SectionShell>
  );
}

function ContactBanner() {
  return (
    <GradientBanner className="text-center">
      <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">Need a custom solution?</h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
        Our experts are ready to help with specialised requirements for NRIs. Get personalised assistance for your
        unique situation.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={CONSULT_URL}
          className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.03] active:scale-[0.98]"
          data-testid="button-talk-to-expert"
        >
          <Users className="h-4 w-4" /> Talk to an Expert
        </a>
        <a
          href={CONTACT_URL}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/50 transition-colors hover:bg-white/10"
          data-testid="button-contact-us"
        >
          <CalendarDays className="h-4 w-4" /> Contact Us
        </a>
      </div>
    </GradientBanner>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardInvestmentsPage() {
  return (
    <DashboardLayout>
      <PageHero
        eyebrow="Investments"
        title="Grow your wealth with"
        highlight="India's best investment options"
        intro="Access high-growth, tax-efficient investments tailored for global Indians."
      />
      {/* The wrapper bounds the sticky tab bar to the sections it controls. */}
      <div>
        <SegmentedControl tabs={TABS} layoutId="investment-tab" />
        <PmsSection />
        <MutualFundsSection />
        <GiftCitySection />
      </div>
      <ContactBanner />
    </DashboardLayout>
  );
}
