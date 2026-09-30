import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building,
  Building2,
  CalendarClock,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  MessageCircle,
  Send,
  ShieldCheck,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import lesserLogo from "@assets/lesser_logo.png";
import DashboardLayout, { EASE } from "@/components/dashboard-layout";
import { fadeUp, PillButton, Reveal, SectionHeading, stagger, StaggerGroup } from "@/components/dashboard-motion";

const SIGN_UP_URL = "https://lesser.tax/app/auth/sign-up";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // As the hero scrolls away it drifts up, shrinks slightly and fades — Apple product-page style.
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  return (
    <section id="home" ref={ref} className="relative flex min-h-[92vh] items-center overflow-hidden">
      <motion.div style={{ y: blobY }} className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-40 top-16 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[110px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 top-0 h-[24rem] w-[24rem] rounded-full bg-[hsl(var(--chart-4))]/50 blur-[110px]"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div style={{ y, scale, opacity }} className="relative mx-auto w-full max-w-4xl px-6 py-24 text-center">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur"
          >
            <Star className="h-3.5 w-3.5 fill-[hsl(var(--chart-5))] text-[hsl(var(--chart-5))]" />
            Rated 5.0 on Google
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="mt-7 text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-foreground md:text-7xl"
          >
            The Tax <span className="whitespace-nowrap">Super-App</span>
            <span className="block bg-gradient-to-r from-primary via-[hsl(var(--chart-2))] to-[hsl(var(--chart-3))] bg-clip-text pb-2 text-transparent">
              for Tech Professionals
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            From U.S. and India returns to business filings and NRI services — manage everything in one
            place, with <span className="whitespace-nowrap font-semibold text-foreground">Big Four-trained CPAs</span> and{" "}
            <span className="whitespace-nowrap font-semibold text-foreground">flat-fee pricing</span>.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10">
            <PillButton href={SIGN_UP_URL} testId="button-get-started">
              Get Started
            </PillButton>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-8 text-sm text-muted-foreground">
            AI-powered platform <span className="mx-2 opacity-50">•</span> CPA reviewed
            <span className="mx-2 opacity-50">•</span> <span className="whitespace-nowrap">From $99/year</span>
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-linked statement (word-by-word reveal)                       */
/* ------------------------------------------------------------------ */

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = "Big Four expertise. An AI-powered platform. One flat fee. We handle the complexity so you don't have to.".split(" ");

  return (
    <section className="mx-auto max-w-4xl px-6 py-28 md:py-36">
      <div ref={ref}>
        <p className="text-3xl font-extrabold leading-[1.15] tracking-[-0.03em] text-foreground md:text-5xl">
          {words.map((word, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {word}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Savings strategies ("Investments")                                  */
/* ------------------------------------------------------------------ */

const STRATEGIES: { icon: LucideIcon; title: string; desc: string; badge: string; amount: string }[] = [
  {
    icon: CreditCard,
    title: "Backdoor Roth IRA",
    desc: "Income over the limit? Contribute up to $7,000 a year through a backdoor Roth.",
    badge: "Popular",
    amount: "+$2,134",
  },
  {
    icon: Building,
    title: "Real Estate Depreciation",
    desc: "Deduct depreciation on rental property over 27.5 years — in the U.S. or India.",
    badge: "Tax efficient",
    amount: "+$4,200",
  },
  {
    icon: Home,
    title: "Home Office Deduction",
    desc: "Deduct a portion of mortgage, utilities and maintenance for your home office.",
    badge: "Often missed",
    amount: "+$2,400",
  },
];

function Savings() {
  return (
    <section id="savings" className="scroll-mt-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Tax strategy"
          title="Keep more of what you earn."
          subtitle="Every return comes with a planning review. We find the strategies that fit your income — RSUs, rentals and all — with zero guesswork."
        />

        <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-3">
          {STRATEGIES.map(({ icon: Icon, title, desc, badge, amount }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col rounded-3xl bg-muted p-7 ring-1 ring-black/[0.04]"
              data-testid={`card-strategy-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                  {badge}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-foreground">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <div className="mt-6 flex items-end justify-between border-t border-black/[0.06] pt-5">
                <div>
                  <p className="text-xs text-muted-foreground">Example savings</p>
                  <p className="text-2xl font-extrabold tracking-tight text-[hsl(var(--success))]">{amount}</p>
                </div>
                <a
                  href={SIGN_UP_URL}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>

        <Reveal className="mt-14 text-center">
          <PillButton href={SIGN_UP_URL} testId="button-explore-strategies">
            See How Much You Could Save
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Taxation                                                            */
/* ------------------------------------------------------------------ */

type TaxService = { badge: string; title: string; desc: string; stat: string; href: string };

const TAX_GROUPS: { flag?: string; icon?: LucideIcon; title: string; desc: string; services: TaxService[] }[] = [
  {
    flag: "🇺🇸",
    title: "U.S. Taxes",
    desc: "Federal and state returns for W-2 earners and equity compensation",
    services: [
      {
        badge: "Big Four-trained CPAs",
        title: "Tax Filing",
        desc: "RSUs, ISOs, ESPP and stock options — filed right, with an expert review before submission.",
        stat: "From $99/year",
        href: "/",
      },
      {
        badge: "Strategic",
        title: "Tax Planning",
        desc: "Year-round strategy to lower your liability, not just a once-a-year filing.",
        stat: "Year-round",
        href: "/",
      },
    ],
  },
  {
    flag: "🇮🇳",
    title: "India & Cross-Border",
    desc: "For NRIs with income, accounts or property in India",
    services: [
      {
        badge: "Vetted Indian CAs",
        title: "India Tax Filing",
        desc: "Claim TDS, report interest, rent and capital gains, and file your ITR from the U.S.",
        stat: "From $69",
        href: "/services/india-tax-filing",
      },
      {
        badge: "Compliant",
        title: "NRI Tax Filing",
        desc: "FBAR, FATCA, PFIC, foreign tax credits and RNOR planning on your U.S. return.",
        stat: "From $99",
        href: "/nris",
      },
    ],
  },
  {
    icon: Building2,
    title: "Business Taxes",
    desc: "Entity returns for founders and real-estate investors",
    services: [
      {
        badge: "48hr turnaround",
        title: "Business Tax Filing",
        desc: "Form 1120, 1065 or 1120-S — CPA-reviewed, with no rush fee.",
        stat: "$100 flat",
        href: "/business",
      },
      {
        badge: "Real estate",
        title: "Rental LLCs",
        desc: "Simple, per-entity pricing for your rental property LLCs.",
        stat: "$100/entity",
        href: "/business/realestate",
      },
    ],
  },
];

function Taxation() {
  return (
    <section id="taxation" className="scroll-mt-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Taxation"
          title="Taxes, made simple."
          subtitle="Complete tax solutions for tech professionals and global Indians with cross-border obligations — compliant, and built to maximize your savings."
        />

        <StaggerGroup className="mt-14 grid gap-5 lg:grid-cols-3">
          {TAX_GROUPS.map(({ flag, icon: Icon, title, desc, services }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="rounded-3xl bg-card p-6 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04]"
            >
              <div className="flex items-center gap-4 border-b border-black/[0.06] pb-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-2xl">
                  {flag ?? (Icon && <Icon className="h-5 w-5 text-primary" />)}
                </span>
                <div>
                  <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
                  <p className="text-xs leading-snug text-muted-foreground">{desc}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {services.map((s) => (
                  <a
                    key={s.title}
                    href={s.href}
                    className="group block rounded-2xl bg-muted p-5 transition-all duration-300 hover:bg-secondary hover:shadow-sm"
                    data-testid={`link-tax-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {s.badge}
                    </span>
                    <h4 className="mt-3 font-bold text-foreground">{s.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{s.stat}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </StaggerGroup>

        <Reveal className="mt-14 text-center">
          <PillButton href="/#pricing" testId="button-view-tax-services">
            View All Tax Services
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Marketplace                                                         */
/* ------------------------------------------------------------------ */

const MARKETPLACE: {
  icon: LucideIcon;
  title: string;
  desc: string;
  items: { name: string; href: string }[];
  cta: { label: string; href: string };
}[] = [
  {
    icon: Briefcase,
    title: "Business",
    desc: "Filings for partnerships, LLCs and deadlines",
    items: [
      { name: "Partnerships — Form 1065 + K-1s", href: "/business/partnerships" },
      { name: "Real Estate LLCs — $100/entity", href: "/business/realestate" },
      { name: "March 15 Deadline — file in 24 hours", href: "/business/deadline" },
    ],
    cta: { label: "Explore Business", href: "/business" },
  },
  {
    icon: FileText,
    title: "Documentation",
    desc: "India services for NRIs in the United States",
    items: [
      { name: "Indian Passport Renewal — $140 flat", href: "/services/passport-renewal" },
      { name: "India Tax Filing (ITR)", href: "/services/india-tax-filing" },
      { name: "NRI Tax Filing", href: "/nris" },
    ],
    cta: { label: "Explore Documentation", href: "/services/passport-renewal" },
  },
  {
    icon: Building2,
    title: "Employer Offers",
    desc: "Exclusive pricing for teams we partner with",
    items: [
      { name: "Google", href: "/offers/google" },
      { name: "Broadcom", href: "/offers/broadcom" },
      { name: "Coupa", href: "/offers/coupa" },
      { name: "Infosys", href: "/offers/infosys" },
    ],
    cta: { label: "Explore Offers", href: "/offers/google" },
  },
];

function Marketplace() {
  return (
    <section id="marketplace" className="scroll-mt-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Marketplace"
          title="Every service, one place."
          subtitle="Expert services for tech professionals and global Indians — 100% digital."
        />

        <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-3">
          {MARKETPLACE.map(({ icon: Icon, title, desc, items, cta }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col rounded-3xl bg-muted p-7 ring-1 ring-black/[0.04]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              <ul className="mt-5 flex-1 divide-y divide-black/[0.06]">
                {items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="group flex items-center justify-between py-3 text-sm font-medium text-foreground/90 hover:text-primary"
                    >
                      {item.name}
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={cta.href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                {cta.label} <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </StaggerGroup>

        <Reveal className="mt-14 text-center">
          <PillButton href="/" testId="button-view-marketplace">
            View All Services
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Expert team + chat preview                                          */
/* ------------------------------------------------------------------ */

const TEAM_FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: MessageCircle,
    title: "Real answers from real experts",
    desc: "Ask anything — our CPAs answer your questions and walk you through every decision.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    desc: "Upload documents securely; your information stays private.",
  },
  {
    icon: CalendarClock,
    title: "Year-round support",
    desc: "Tax planning doesn't stop in April. Neither do we.",
  },
];

const CHAT: { from: "team" | "user"; text: ReactNode }[] = [
  { from: "team", text: "Hi! I'm with the Lesser tax team. What can we help you with today?" },
  {
    from: "user",
    text: "My RSUs vested this year and I also have rental income in India. How does that work?",
  },
  {
    from: "team",
    text: (
      <>
        Good news — we handle both on one return:
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <b>RSU cost basis</b> — so vested shares aren't taxed twice
          </li>
          <li>
            <b>Foreign tax credits</b> for tax already paid in India
          </li>
          <li>
            <b>FBAR &amp; FATCA</b> reporting for your Indian accounts
          </li>
          <li>
            <b>Depreciation</b> on the rental property
          </li>
        </ul>
      </>
    ),
  },
];

function ExpertTeam() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              Expert guidance
            </span>
            <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.03em] text-foreground md:text-5xl">
              A tax team that actually talks to you.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Get clear, reliable answers about your taxes — from equity compensation to cross-border income —
              whenever you need them.
            </p>
          </Reveal>

          <StaggerGroup className="mt-10 space-y-6">
            {TEAM_FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </StaggerGroup>

          <Reveal className="mt-10">
            <PillButton href={SIGN_UP_URL} testId="button-talk-to-expert">
              Talk to an Expert
            </PillButton>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] bg-card p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                  <img src={lesserLogo} alt="" className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-bold text-foreground">Lesser Tax Team</p>
                  <p className="text-xs text-muted-foreground">CPAs &amp; tax experts</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
              </span>
            </div>

            <motion.div
              className="space-y-3 py-5"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.6, delayChildren: 0.3 } } }}
            >
              {CHAT.map((msg, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.96 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
                  }}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
            </motion.div>

            <div className="flex gap-2">
              <div className="flex-1 rounded-full bg-muted px-4 py-3 text-sm text-muted-foreground">
                Type your tax question…
              </div>
              <a
                href={SIGN_UP_URL}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                aria-label="Start a conversation"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Your conversations are private and secure</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonial (real Google review, from google-reviews-section.tsx)   */
/* ------------------------------------------------------------------ */

function Testimonial() {
  return (
    <section className="border-t border-black/[0.06] py-24">
      <Reveal className="mx-auto max-w-3xl px-6 text-center">
        <div className="flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-[hsl(var(--chart-5))] text-[hsl(var(--chart-5))]" />
          ))}
        </div>
        <blockquote className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-foreground md:text-3xl">
          “I've had a very positive experience with Lesser Tax. They are highly professional, listened to our
          concerns, and provided solutions accordingly.”
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
            <UserRound className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="font-semibold text-foreground">Srujana Dusari</p>
            <p className="text-sm text-muted-foreground">Google review</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Hero />
      <Statement />
      <Savings />
      <Taxation />
      <Marketplace />
      <ExpertTeam />
      <Testimonial />
    </DashboardLayout>
  );
}
