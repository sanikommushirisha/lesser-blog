import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE } from "@/components/dashboard-layout";

// Scroll-reveal building blocks shared by the dashboard pages.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

// Fades and lifts its children into place the first time they scroll into view.
// Pass a small `amount` for very tall blocks, which may never be 30% on screen at once.
export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.3,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function PillButton({ href, children, testId }: { href: string; children: ReactNode; testId: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.55)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
      data-testid={testId}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}

export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle: string }) {
  return (
    <Reveal className="max-w-2xl">
      {eyebrow && <p className="mb-3 text-sm font-semibold text-primary">{eyebrow}</p>}
      <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-foreground md:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
    </Reveal>
  );
}
