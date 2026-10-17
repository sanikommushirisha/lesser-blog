import { ArrowRight } from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";

// Served with a real 404 status (server/static.ts) and noindex, so search
// engines drop the URL; visitors get a way back to the pages they likely wanted.
const LINKS: { href: string; title: string; desc: string }[] = [
  { href: "/", title: "Tax filing and planning", desc: "Flat-fee CPA tax filing for tech professionals." },
  { href: "/nris", title: "NRI tax filing", desc: "U.S. and India taxes: FBAR, FATCA, PFIC and more." },
  { href: "/services/india-tax-filing", title: "India tax filing (ITR)", desc: "File your Indian tax return from the U.S." },
  { href: "/services/passport-renewal", title: "Indian passport renewal", desc: "Renew your Indian passport from the U.S." },
  { href: "/business", title: "Business tax filing", desc: "Form 1120, 1065 or 1120-S for a flat $100." },
  { href: "/blog", title: "Tax guides", desc: "Answers to NRI, passport and business tax questions." },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar variant="individual" sourcePage="/404" />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-foreground">We could not find that page</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The link may be old or mistyped. These are the pages people look for most:
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group block rounded-2xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex items-center gap-2 font-bold text-foreground">
                  {l.title}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{l.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
