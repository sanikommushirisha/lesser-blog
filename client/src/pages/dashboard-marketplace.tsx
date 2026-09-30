import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  BookUser,
  Briefcase,
  Building,
  CalendarClock,
  ClipboardList,
  Eye,
  FileText,
  Globe,
  Home,
  Landmark,
  LifeBuoy,
  MessageSquare,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import DashboardLayout, { EASE } from "@/components/dashboard-layout";
import { fadeUp, Reveal, SectionHeading, StaggerGroup } from "@/components/dashboard-motion";
import { GradientBanner, PageHero, SegmentedControl } from "@/components/dashboard-sections";
import teamDavidImg from "@assets/team_david_clean.png";
import teamVishweshImg from "@assets/team_vishwesh_clean.png";
import teamJithendraImg from "@assets/team_jithendra_clean.png";
import teamRobertImg from "@assets/team_robert_clean.png";

const SIGN_IN_URL = "https://lesser.tax/app/auth/sign-in";
const CONSULT_URL = "https://calendly.com/lesser-tax/consultationcall-with-lesserteam";

type Service = { icon: LucideIcon; name: string; desc: string; tag: string; href: string };
type Category = { id: string; label: string; icon: LucideIcon; subtitle: string; services: Service[] };

// Lesser's real services; each links to its existing page. Prices match those pages.
const CATEGORIES: Category[] = [
  {
    id: "taxation",
    label: "Taxation",
    icon: FileText,
    subtitle: "Individual and cross-border tax filing",
    services: [
      {
        icon: FileText,
        name: "Personal Tax Filing",
        desc: "Flat-fee filing for W-2 earners with RSUs, ISOs, ESPP and stock options — reviewed by a CPA.",
        tag: "From $99/yr",
        href: "/",
      },
      {
        icon: Globe,
        name: "US-India Tax Compliance for NRIs",
        desc: "Stay compliant with FBAR, FATCA and PFIC, claim foreign tax credits and plan for RNOR status.",
        tag: "From $99",
        href: "/nris",
      },
      {
        icon: Landmark,
        name: "India Tax Filing (ITR)",
        desc: "File your Indian return from the U.S. — interest, rent, capital gains and DTAA benefits, by vetted CAs.",
        tag: "From $69",
        href: "/services/india-tax-filing",
      },
    ],
  },
  {
    id: "business",
    label: "Business",
    icon: Briefcase,
    subtitle: "Entity returns for founders and investors",
    services: [
      {
        icon: Briefcase,
        name: "Business Tax Filing",
        desc: "Form 1120, 1065 or 1120-S — CPA-reviewed with a 48-hour turnaround and no rush fee.",
        tag: "$100 flat",
        href: "/business",
      },
      {
        icon: Users,
        name: "Partnerships & K-1s",
        desc: "Form 1065 and K-1s for partnerships and real-estate investors.",
        tag: "$100/entity",
        href: "/business/partnerships",
      },
      {
        icon: Building,
        name: "Real Estate LLCs",
        desc: "Simple per-entity pricing for your rental property LLCs.",
        tag: "$100/entity",
        href: "/business/realestate",
      },
      {
        icon: CalendarClock,
        name: "March 15 Deadline Filing",
        desc: "Upload your documents today and get your business return in 24 hours.",
        tag: "$100 flat",
        href: "/business/deadline",
      },
    ],
  },
  {
    id: "documentation",
    label: "Documentation",
    icon: BookUser,
    subtitle: "India documents for NRIs in the United States",
    services: [
      {
        icon: BookUser,
        name: "Indian Passport Renewal",
        desc: "Renewals, lost passports and name or address updates — forms prepared and reviewed for you.",
        tag: "$140 flat",
        href: "/services/passport-renewal",
      },
    ],
  },
  {
    id: "offers",
    label: "Offers",
    icon: BadgePercent,
    subtitle: "Exclusive pricing for teams and communities we partner with",
    services: [
      ...["Google", "Broadcom", "Coupa", "Infosys", "Nextdoor"].map((company) => ({
        icon: BadgePercent,
        name: `${company} Employees`,
        desc: `An exclusive Lesser offer for ${company} employees.`,
        tag: "Employee offer",
        href: `/offers/${company.toLowerCase()}`,
      })),
      {
        icon: Home,
        name: "River Island Residents",
        desc: "Tax services for River Island residents.",
        tag: "Community offer",
        href: "/offers/riverisland",
      },
    ],
  },
];

const TEAM = [teamDavidImg, teamVishweshImg, teamJithendraImg, teamRobertImg];

const WHY_LESSER: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: UserCheck, title: "Big Four-trained experts", desc: "CPAs and IRS enrolled agents with 6–12+ years of experience." },
  { icon: Wallet, title: "Flat-fee pricing", desc: "Know the price up front — no hourly billing, no surprises." },
  { icon: MessageSquare, title: "Direct messaging", desc: "Message your CPA anytime without counting the cost per question." },
  { icon: Eye, title: "Total transparency", desc: "See your status, next steps and timeline at every stage." },
];

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ClipboardList, title: "Select a service", desc: "Pick the exact service you need." },
  { icon: FileText, title: "Share your details", desc: "Answer a few questions and upload your documents." },
  { icon: ShieldCheck, title: "Expert review", desc: "Your CPA prepares and reviews everything." },
  { icon: LifeBuoy, title: "Get support", desc: "Ongoing help whenever you need it." },
];

function TeamAside() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
      className="rounded-[2rem] bg-white/70 p-8 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.05] backdrop-blur"
    >
      <div className="flex justify-center -space-x-5">
        {TEAM.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            className="h-20 w-20 rounded-full object-cover ring-4 ring-white"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.5 + i * 0.1 }}
          />
        ))}
      </div>
      <p className="mt-5 text-center text-sm font-semibold text-foreground">CPAs &amp; IRS enrolled agents</p>
      <p className="text-center text-xs text-muted-foreground">Big Four-trained · 6–12+ years' experience</p>
    </motion.div>
  );
}

function ServiceGrid({ category }: { category: Category }) {
  const Icon = category.icon;
  return (
    <section id={category.id} className="scroll-mt-28 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">{category.label}</h2>
            <p className="mt-1 text-muted-foreground">{category.subtitle}</p>
          </div>
        </Reveal>
        <StaggerGroup className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {category.services.map((s) => {
            const ServiceIcon = s.icon;
            return (
              <motion.a
                key={s.name}
                href={s.href}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group flex flex-col rounded-3xl bg-white p-6 ring-1 ring-black/[0.07] transition-shadow hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]"
                data-testid={`card-market-${s.name.toLowerCase().replace(/\W+/g, "-")}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
                    <ServiceIcon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{s.tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold leading-snug tracking-tight text-foreground">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  View details
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.a>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}

function WhyLesser() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Why Lesser" title="Experts you can actually reach." subtitle="Big Four expertise, an AI-powered platform and one flat fee." />
        <StaggerGroup className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_LESSER.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-foreground md:text-5xl">How it works</h2>
        </Reveal>
        <motion.ol
          className="mt-12 grid gap-5 md:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
        >
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <motion.li
              key={title}
              variants={fadeUp}
              className="relative rounded-3xl bg-muted p-6 text-center"
            >
              <span className="absolute left-5 top-5 text-xs font-bold text-muted-foreground">0{i + 1}</span>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-primary md:block" />
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

export default function DashboardMarketplacePage() {
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.map((c) => ({
      ...c,
      services: q ? c.services.filter((s) => `${s.name} ${s.desc}`.toLowerCase().includes(q)) : c.services,
    })).filter((c) => c.services.length > 0);
  }, [query]);

  const tabs = useMemo(
    () => categories.map((c) => ({ id: c.id, label: `${c.label} (${c.services.length})` })),
    [categories],
  );

  return (
    <DashboardLayout>
      <PageHero
        eyebrow="Marketplace"
        title="Expert services for"
        highlight="global Indians"
        intro="Expert help with taxation, business filings and documentation. Our CPAs provide personalised solutions for all your needs — 100% digital."
        aside={<TeamAside />}
      />

      <Reveal className="mx-auto max-w-6xl px-6">
        <label className="flex items-center gap-3 rounded-2xl bg-muted px-5 py-4 transition-shadow focus-within:bg-white focus-within:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] focus-within:ring-1 focus-within:ring-black/[0.06]">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all services…"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            data-testid="input-search-services"
          />
        </label>
      </Reveal>

      {/* The wrapper bounds the sticky tab bar to the service sections. */}
      <div>
        {tabs.length > 0 && <SegmentedControl key={tabs.map((t) => t.id).join()} tabs={tabs} layoutId="market-tab" />}

        {categories.map((c) => (
          <ServiceGrid key={c.id} category={c} />
        ))}
        {categories.length === 0 && (
          <p className="px-6 py-20 text-center text-muted-foreground" data-testid="text-no-results">
            No services match “{query}”.
          </p>
        )}
      </div>

      <WhyLesser />
      <HowItWorks />

      <GradientBanner className="text-center">
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">
          Need help choosing the right service?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
          Browse the services above or check on a return that's already in progress. Not sure where to start? Book a
          call with our team.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={SIGN_IN_URL}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.03] active:scale-[0.98]"
            data-testid="button-track-returns"
          >
            Track My Returns <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href={CONSULT_URL}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/50 transition-colors hover:bg-white/10"
            data-testid="button-talk-to-expert"
          >
            <Users className="h-4 w-4" /> Talk to an Expert
          </a>
        </div>
      </GradientBanner>
    </DashboardLayout>
  );
}
