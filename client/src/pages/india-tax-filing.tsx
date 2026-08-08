import { useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Globe,
  FileText,
  TrendingUp,
  Building2,
  Briefcase,
  PiggyBank,
  Landmark,
  Lock,
  ClipboardCheck,
  HelpCircle,
  Phone,
  Users,
  Award,
  RefreshCw,
} from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import lesserLogo from "@assets/lesser_logo.png";

const APP_URL = "https://app.lesser.tax/auth/sign-up";

const COVERAGE = [
  {
    icon: PiggyBank,
    title: "Interest & Dividend Income",
    desc: "NRO/NRE interest, mutual fund dividends, and other investment income reported correctly.",
  },
  {
    icon: Building2,
    title: "Real Estate & Inheritance",
    desc: "Rental income, property sales, and inherited assets handled with the right ITR form.",
  },
  {
    icon: TrendingUp,
    title: "Capital Gains",
    desc: "Equity, mutual fund, and property capital gains with indexation and DTAA benefits.",
  },
  {
    icon: Briefcase,
    title: "Business & Professional Income",
    desc: "Freelance, consulting, and business income reporting for Indian operations.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Tell us about yourself",
    desc: "Answer a few questions about your tax situation and securely upload your tax documents.",
  },
  {
    n: "2",
    title: "Get matched with a CA",
    desc: "We connect you with a vetted Indian Chartered Accountant who fits your case.",
  },
  {
    n: "3",
    title: "Connect as needed",
    desc: "Have questions? Connect 1-on-1 over video, call, or email anytime during the filing.",
  },
  {
    n: "4",
    title: "Review & relax",
    desc: "Your CA prepares your ITR — you simply review and approve from anywhere in the U.S.",
  },
];

const REASONS = [
  { icon: Shield, title: "Stay Compliant", desc: "Avoid notices and penalties under the Indian Income Tax Act." },
  { icon: RefreshCw, title: "Claim Refunds", desc: "Recover excess TDS deducted on Indian income — often a meaningful sum." },
  { icon: Award, title: "Future-Proof", desc: "Maintain a clean tax history for visas, loans, and overseas remittances." },
  { icon: Landmark, title: "Income in India", desc: "Required if your Indian income exceeds the basic exemption limit." },
  { icon: Globe, title: "DTAA Benefits", desc: "Use the U.S.–India tax treaty to avoid double taxation on the same income." },
  { icon: FileText, title: "Financial Proof", desc: "ITR returns serve as essential proof for property, loans, and investments in India." },
];

const BENEFITS = [
  "100% online — file from anywhere in the U.S.",
  "Expert-reviewed filings by Indian CAs",
  "Stay compliant with Indian tax laws and avoid penalties",
  "Save on taxes with the right deductions and DTAA benefits",
  "Foreign assets disclosure (Schedule FA) handled correctly",
  "Foreign tax credit coordination between U.S. and India returns",
];

const FAQS = [
  {
    q: "Who needs to file an Indian tax return as an NRI?",
    a: "If your total Indian income exceeds the basic exemption limit, or you have capital gains from Indian assets, you are required to file an ITR in India — even as an NRI living in the U.S.",
  },
  {
    q: "What is the price?",
    a: "Filings start at $69. Final pricing depends on your income types — interest/dividends, rental, capital gains, business, and foreign asset disclosures.",
  },
  {
    q: "Which financial year do you file for?",
    a: "We file for the Indian financial year (April 1 – March 31). The current cycle covers Apr 1, 2024 – Mar 31, 2025.",
  },
  {
    q: "Can you help me claim a TDS refund?",
    a: "Yes. A common reason NRIs file is to recover excess TDS withheld on NRO interest, rental income, or property sales. We claim it back through your ITR.",
  },
  {
    q: "How does DTAA help?",
    a: "The Double Taxation Avoidance Agreement between the U.S. and India ensures you don't pay tax twice on the same income. We coordinate your U.S. and India returns so you get the foreign tax credit.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your documents are transmitted over SSL-encrypted pathways and stored securely. We do not share your data with unaffiliated third parties.",
  },
];

function IndiaTaxFooter() {
  return (
    <footer className="relative bg-foreground overflow-hidden" data-testid="section-footer">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(3,79,70,0.2) 50%, transparent)" }}
      />
      <div className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <img src={lesserLogo} alt="Lesser" className="h-8 brightness-0 invert opacity-70" data-testid="img-footer-logo" />
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
            <span>&copy; {new Date().getFullYear()} Lesser Tax Inc.</span>
            <a href="mailto:use@lesser.tax" className="hover:text-white/50 transition-colors" data-testid="link-footer-email">
              use@lesser.tax
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function IndiaTaxFilingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>India Tax Filing for NRIs in the U.S. — File Your ITR | Lesser</title>
        <meta
          name="description"
          content="The easiest way for U.S.-based NRIs to file Indian taxes. Interest, dividends, rental income, capital gains, and DTAA benefits — handled by vetted Indian CAs. Starting at $69."
        />
        <meta property="og:title" content="India Tax Filing for NRIs in the U.S. | Lesser" />
        <meta
          property="og:description"
          content="File your Indian ITR from anywhere in the U.S. Vetted CAs, full DTAA coordination, capital gains, rental income, and TDS refunds — starting at $69."
        />
      </Helmet>

      <SharedNavbar variant="individual" sourcePage="/services/india-tax-filing" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(3,79,70,0.08) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(3,79,70,0.05) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium mb-6"
                data-testid="badge-hero"
              >
                <Globe className="w-3.5 h-3.5" />
                Full-service Indian ITR for U.S.-based NRIs
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-5 leading-[1.1]"
                data-testid="text-hero-title"
              >
                The easiest way to file
                <span className="block text-primary mt-2">India taxes for NRIs</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl" data-testid="text-hero-subtitle">
                File your Indian Income Tax Return from anywhere in the U.S. Vetted Indian CAs
                handle interest, dividends, rental income, capital gains, foreign asset disclosure,
                and DTAA coordination — start to finish.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a
                  href={APP_URL}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.99]"
                  data-testid="button-hero-cta"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/12098842051"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-border bg-white text-foreground font-medium text-sm transition-all duration-300 hover:bg-muted/50"
                  data-testid="button-hero-talk"
                >
                  <Phone className="w-4 h-4" />
                  Talk to a CA
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2" data-testid="text-hero-stat-digital">
                  <Lock className="w-4 h-4 text-primary" />
                  100% digital
                </div>
                <div className="flex items-center gap-2" data-testid="text-hero-stat-filings">
                  <Users className="w-4 h-4 text-primary" />
                  10,000+ NRI filings
                </div>
                <div className="flex items-center gap-2" data-testid="text-hero-stat-region">
                  <Globe className="w-4 h-4 text-primary" />
                  U.S.-based NRIs only
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl border border-border shadow-xl shadow-black/5 p-8" data-testid="card-hero-pricing">
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold tracking-wide" data-testid="badge-flat-fee">
                  STARTING AT
                </div>
                <div className="text-sm text-muted-foreground mb-1">Filing fee</div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-5xl font-bold text-foreground" data-testid="text-price">$69</span>
                  <span className="text-lg text-muted-foreground line-through">$99</span>
                </div>
                <div className="text-xs text-muted-foreground mb-6">
                  Final pricing depends on your income types and disclosures.
                </div>

                <div className="space-y-3 mb-6">
                  {COVERAGE.slice(0, 4).map((c) => (
                    <div key={c.title} className="flex items-start gap-3" data-testid={`row-coverage-${c.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}>
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm font-medium text-foreground">{c.title}</div>
                    </div>
                  ))}
                </div>

                <a
                  href={APP_URL}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-primary text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                  data-testid="button-pricing-cta"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-muted-foreground text-center mt-3">
                  Available for U.S.-based NRIs only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20 bg-muted/30" data-testid="section-coverage">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">What we cover</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground mb-4" data-testid="text-coverage-title">
              Every income type, every disclosure
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Whatever the source of your Indian income, our CAs file the right ITR with the
              right schedules — including foreign asset disclosure and foreign tax credit
              coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {COVERAGE.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                data-testid={`card-coverage-${item.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20" data-testid="section-process">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">Process</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-process-title">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative bg-white rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                data-testid={`card-step-${s.n}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold mb-5">
                  {s.n}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why file */}
      <section className="py-20 bg-muted/30" data-testid="section-why">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">Why file</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-why-title">
              Why NRIs file Indian taxes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REASONS.map((r) => (
              <div
                key={r.title}
                className="bg-white rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                data-testid={`card-reason-${r.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + Security */}
      <section className="py-20" data-testid="section-benefits">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-border p-8" data-testid="card-benefits">
              <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">Benefits</div>
              <h3 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-6">Filing with Lesser</h3>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-foreground rounded-2xl p-8 relative overflow-hidden" data-testid="card-security">
              <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(3,79,70,0.18) 0%, transparent 70%)" }}
              />
              <div className="relative">
                <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">Security</div>
                <h3 className="text-2xl font-extrabold tracking-[-0.03em] text-white mb-6">Your data is safe</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white mb-1">SSL encryption</div>
                      <div className="text-sm text-white/60 leading-relaxed">
                        Documents are transmitted over SSL-certified pathways and stored
                        securely.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white mb-1">Privacy first</div>
                      <div className="text-sm text-white/60 leading-relaxed">
                        We do not share your data with unaffiliated third parties for their own
                        purposes.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white mb-1">Expert reviewed</div>
                      <div className="text-sm text-white/60 leading-relaxed">
                        Every return is prepared and reviewed by an experienced Indian Chartered
                        Accountant.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30" data-testid="section-faq">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">FAQ</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-faq-title">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-border p-5 transition-all duration-300 hover:border-primary/30"
                data-testid={`faq-${i}`}
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-base font-semibold text-foreground flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {f.q}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="mt-4 pl-8 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-foreground relative overflow-hidden" data-testid="section-final-cta">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(3,79,70,0.18) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(3,79,70,0.12) 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white mb-4" data-testid="text-cta-title">
            Ready to file your Indian taxes?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start in minutes. We'll match you with a vetted Indian CA who handles your full ITR
            and DTAA coordination.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={APP_URL}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              data-testid="button-final-cta"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/12098842051"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10"
              data-testid="button-final-talk"
            >
              <Phone className="w-4 h-4" />
              Talk to a CA
            </a>
          </div>
        </div>
      </section>

      <IndiaTaxFooter />
    </div>
  );
}
