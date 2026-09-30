import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";
import { fadeUp, Reveal, StaggerGroup } from "@/components/dashboard-motion";

// Section-level building blocks shared by the Investments and Taxation pages.

export type SectionTab = { id: string; label: string };

// Tracks which section is in view, for the segmented control.
function useActiveSection(tabs: SectionTab[]) {
  const [active, setActive] = useState(tabs[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    tabs.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tabs]);
  return [active, setActive] as const;
}

// Apple-style segmented control that stays pinned while you scroll the sections.
export function SegmentedControl({ tabs, layoutId }: { tabs: SectionTab[]; layoutId: string }) {
  const [active, setActive] = useActiveSection(tabs);
  return (
    <div className="sticky top-16 z-20 flex justify-center px-6 py-3 md:top-4">
      {/* Scrolls sideways on narrow screens when the tabs don't fit. */}
      <div className="flex max-w-full overflow-x-auto rounded-full bg-white/80 p-1 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.06] backdrop-blur-xl [scrollbar-width:none]">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => {
              setActive(id);
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors md:px-8 ${
              active === id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${id}`}
          >
            {active === id && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SectionShell({
  id,
  icon: Icon,
  flag,
  title,
  badge,
  subtitle,
  children,
}: {
  id: string;
  icon?: LucideIcon;
  flag?: string;
  title: string;
  badge?: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 px-6 py-10">
      {/* Small reveal threshold: on phones these blocks are taller than the screen. */}
      <Reveal
        amount={0.05}
        className="mx-auto max-w-6xl rounded-[2rem] bg-white p-6 shadow-[0_2px_40px_-16px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.05] md:p-10"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-3xl text-primary">
            {flag ?? (Icon && <Icon className="h-6 w-6" />)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground md:text-4xl">{title}</h2>
              {badge && (
                <span className="rounded-full bg-[hsl(var(--success))]/10 px-3 py-1 text-xs font-bold text-[hsl(var(--success))]">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-base text-muted-foreground md:text-lg">{subtitle}</p>
          </div>
        </div>
        {children}
      </Reveal>
    </section>
  );
}

export function FeaturePills({ items }: { items: string[] }) {
  return (
    <StaggerGroup className="mt-8 flex flex-wrap gap-2.5">
      {items.map((item) => (
        <motion.span
          key={item}
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {item}
        </motion.span>
      ))}
    </StaggerGroup>
  );
}

export type ServiceCardData = {
  name: string;
  desc: string;
  features: string[];
  href: string;
  cta?: string;
  badge?: string;
  // Initials tile beside the name, used for provider-style cards.
  monogram?: boolean;
};

export function ServiceCards({ items, columns = 2 }: { items: ServiceCardData[]; columns?: 2 | 3 }) {
  return (
    <StaggerGroup
      className={`mt-8 grid gap-5 md:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : "lg:max-w-4xl"}`}
    >
      {items.map((item) => (
        <motion.div
          key={item.name}
          variants={fadeUp}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-black/[0.07] transition-shadow hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]"
          data-testid={`card-service-${item.name.toLowerCase().replace(/\W+/g, "-")}`}
        >
          <div className="flex items-center gap-4 bg-muted p-5">
            {item.monogram && (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-primary shadow-sm">
                {item.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            )}
            <div>
              {item.badge && (
                <span className="mb-2 inline-block rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm">
                  {item.badge}
                </span>
              )}
              <h3 className="text-lg font-bold tracking-tight text-foreground">{item.name}</h3>
              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{item.desc}</p>
            </div>
          </div>
          <ul className="flex-1 space-y-3 p-5">
            {item.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-foreground/90">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="px-5 pb-5">
            <a
              href={item.href}
              className="group flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {item.cta ?? "Explore"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>
      ))}
    </StaggerGroup>
  );
}

// Green gradient banner with slowly breathing circles, used to close a page.
export function GradientBanner({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className="px-6 pb-24 pt-10">
      <Reveal
        className={`relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[hsl(var(--chart-2))] px-6 py-14 text-primary-foreground md:px-14 ${className}`}
      >
        <motion.div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/[0.07]"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-white/[0.07]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative">{children}</div>
      </Reveal>
    </section>
  );
}

// Page-top hero shared by the tab pages: eyebrow, two-tone headline, intro.
export function PageHero({
  eyebrow,
  title,
  highlight,
  intro,
  aside,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  intro: string;
  aside?: ReactNode;
}) {
  return (
    <section className="relative px-6 pb-10 pt-16 md:pt-24">
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-[100px]"
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/3 top-10 h-72 w-72 rounded-full bg-[hsl(var(--chart-4))]/30 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_auto]">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }}
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold text-primary">
            {eyebrow}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-3 text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] text-foreground md:text-6xl"
          >
            {title}
            <span className="block bg-gradient-to-r from-primary via-[hsl(var(--chart-2))] to-[hsl(var(--chart-3))] bg-clip-text pb-2 text-transparent">
              {highlight}
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {intro}
          </motion.p>
        </motion.div>
        {aside}
      </div>
    </section>
  );
}
