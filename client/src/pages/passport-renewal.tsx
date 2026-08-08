import { useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Shield,
  Camera,
  ClipboardCheck,
  AlertCircle,
  Plane,
  HelpCircle,
  Phone,
} from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import lesserLogo from "@assets/lesser_logo.png";

const APP_URL = "https://lesser.tax/app/auth/sign-up";

const INCLUDED = [
  {
    icon: ClipboardCheck,
    title: "Consular & VFS form filling",
    desc: "We guide you through both Passport Seva and VFS portals so every field is correct.",
  },
  {
    icon: FileText,
    title: "Custom document checklist",
    desc: "A checklist tailored to your embassy or VFS centre — no guesswork.",
  },
  {
    icon: Camera,
    title: "Photo guidance",
    desc: "Help meeting the official photo specifications the consulate requires.",
  },
  {
    icon: Shield,
    title: "Full application review",
    desc: "Comprehensive review of your full packet before you courier it for submission.",
  },
];

const CASES = [
  { title: "Expiring Indian passport", desc: "Renew before or after expiry — including 10-year adult and 5-year minor passports." },
  { title: "Lost or damaged passport", desc: "Re-issue support with police report guidance and embassy-specific paperwork." },
  { title: "Name or address change", desc: "Update marital name, address, or other personal details on your passport." },
];

const DOCS = [
  "Address proof",
  "Current passport",
  "Immigration status (visa / GC / citizenship)",
  "Marriage certificate (if married)",
  "Photos to consular spec",
  "Police report (lost passport only)",
];

const STEPS = [
  {
    n: "1",
    title: "Tell us what you need",
    desc: "Share the type of application — renewal, lost, or update — along with your current address.",
  },
  {
    n: "2",
    title: "We prepare everything",
    desc: "Form filling on Passport Seva & VFS, customized document checklist, and photo guidance.",
  },
  {
    n: "3",
    title: "Review & courier",
    desc: "We review your full packet, then you courier it to your VFS centre with confidence.",
  },
];

const FAQS = [
  {
    q: "How long does the process take?",
    a: "Typical end-to-end timeline is 3–4 weeks once your application reaches VFS. Government timelines and fees can vary by location.",
  },
  {
    q: "Which countries do you support?",
    a: "We currently support Indian nationals residing in the United States only.",
  },
  {
    q: "What does the $140 fee cover?",
    a: "It covers our preparation, form filling, document checklist, photo guidance, and full application review. Government and VFS charges (consular fees, VFS service fees, courier, transaction charges) are billed separately by the consulate.",
  },
  {
    q: "Do I need to travel to India?",
    a: "No. The entire process is handled by mail and the VFS centre serving your area. You do not need to travel to India.",
  },
  {
    q: "Can you handle a lost passport case?",
    a: "Yes. We help you compile the police report, affidavits, and supporting documents required for a re-issue.",
  },
  {
    q: "Do you help with notarization?",
    a: "We provide guidance, but notarization itself must be done in person — the Indian Embassy does not accept online notarization.",
  },
];

function PassportFooter() {
  return (
    <footer className="relative bg-foreground overflow-hidden" data-testid="section-footer">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(3,79,70,0.2) 50%, transparent)" }}
      />
      <div className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <img
              src={lesserLogo}
              alt="Lesser"
              className="h-8 brightness-0 invert opacity-70"
              data-testid="img-footer-logo"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
            <span>&copy; {new Date().getFullYear()} Lesser Tax Inc.</span>
            <a
              href="mailto:use@lesser.tax"
              className="hover:text-white/50 transition-colors"
              data-testid="link-footer-email"
            >
              use@lesser.tax
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PassportRenewalPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Apply for Indian Passport Renewal | Lost Passport | Update Passport Details — Lesser</title>
        <meta
          name="description"
          content="Hassle-free Indian passport renewal for NRIs in the United States. Renewals, lost passports, and name/address updates — flat $140."
        />
        <meta
          property="og:title"
          content="Apply for Indian Passport Renewal | Lost Passport | Update Passport Details — Lesser"
        />
        <meta
          property="og:description"
          content="Renew your Indian passport from anywhere. Embassy & VFS form filling, document checklist, photo guidance, and full application review."
        />
      </Helmet>

      <SharedNavbar variant="individual" sourcePage="/services/passport-renewal" />

      {/* Hero */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        data-testid="section-hero"
      >
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
                <Plane className="w-3.5 h-3.5" />
                For Indian NRIs in the United States
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-5 leading-[1.1]"
                data-testid="text-hero-title"
              >
                Apply for Indian Passport Renewal
                <span className="block text-primary mt-2">Lost Passport · Update Details</span>
              </h1>

              <p
                className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl"
                data-testid="text-hero-subtitle"
              >
                Hassle-free renewal for Indian nationals living in the United States. We handle
                embassy-specific requirements, fill out your application accurately, and review
                your full packet before submission.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a
                  href={APP_URL}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.99]"
                  data-testid="button-hero-cta"
                >
                  Start Application
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
                  Talk to us
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2" data-testid="text-hero-stat-time">
                  <Clock className="w-4 h-4 text-primary" />
                  3–4 weeks end-to-end
                </div>
                <div className="flex items-center gap-2" data-testid="text-hero-stat-docs">
                  <FileText className="w-4 h-4 text-primary" />
                  ~6 documents
                </div>
                <div className="flex items-center gap-2" data-testid="text-hero-stat-region">
                  <Globe className="w-4 h-4 text-primary" />
                  United States only
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="relative">
              <div
                className="relative bg-white rounded-2xl border border-border shadow-xl shadow-black/5 p-8"
                data-testid="card-hero-pricing"
              >
                <div
                  className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold tracking-wide"
                  data-testid="badge-flat-fee"
                >
                  FLAT FEE
                </div>
                <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-foreground" data-testid="text-price">$140</span>
                  <span className="text-sm text-muted-foreground">all-inclusive prep fee</span>
                </div>
                <div className="text-xs text-muted-foreground mb-6">
                  Government & VFS charges billed separately by the consulate.
                </div>

                <div className="space-y-3 mb-6">
                  {CASES.map((c) => (
                    <div key={c.title} className="flex items-start gap-3" data-testid={`row-case-${c.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}>
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href={APP_URL}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-primary text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                  data-testid="button-pricing-cta"
                >
                  Start Application
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-muted-foreground text-center mt-3">
                  Available for U.S. residents only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 bg-muted/30" data-testid="section-overview">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">Overview</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground mb-4" data-testid="text-overview-title">
              Renew your passport on time
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Renew your Indian passport from anywhere in the United States. We manage
              embassy-specific requirements, complete the form accurately, and review your full
              application for smooth submission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {INCLUDED.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                data-testid={`card-included-${item.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
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

      {/* Service Summary */}
      <section className="py-20" data-testid="section-summary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">Service Summary</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-summary-title">
              What to expect
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-2xl border border-border p-5" data-testid="card-summary-time">
              <Clock className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">Estimated Time</div>
              <div className="text-lg font-semibold text-foreground">3–4 weeks</div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5" data-testid="card-summary-docs">
              <FileText className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">Docs Needed</div>
              <div className="text-lg font-semibold text-foreground">~6 documents</div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5" data-testid="card-summary-cases">
              <ClipboardCheck className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">Applicable Cases</div>
              <div className="text-sm font-semibold text-foreground leading-snug">
                Expiry, lost passport, address/name update
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5" data-testid="card-summary-pricing">
              <Shield className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground mb-1">Pricing</div>
              <div className="text-lg font-semibold text-foreground">From $140</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Documents Checklist */}
            <div className="bg-white rounded-2xl border border-border p-7" data-testid="card-doc-checklist">
              <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents Checklist
              </h3>
              <ul className="space-y-3">
                {DOCS.map((d) => (
                  <li key={d} className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Highlights */}
            <div className="bg-white rounded-2xl border border-border p-7" data-testid="card-highlights">
              <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Service Highlights
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  Renew your passport without traveling to India
                </li>
                <li className="flex items-start gap-3 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  Full embassy / VFS compliance to avoid delays
                </li>
                <li className="flex items-start gap-3 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  Prevent processing errors and application returns from the consulate
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-primary/70 flex-shrink-0 mt-0.5" />
                  <span>
                    Government charges (consular fees, VFS courier, service & transaction
                    charges) are billed separately. Notarization is not included — the Indian
                    Embassy does not accept online notarization. Timelines and government fees
                    may vary by jurisdiction.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted/30" data-testid="section-process">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">Process</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-process-title">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative bg-white rounded-2xl border border-border p-7 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
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

      {/* FAQ */}
      <section className="py-20" data-testid="section-faq">
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
            Ready to renew your Indian passport?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start your application in minutes. We'll handle the embassy specifics so you can
            mail your packet with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={APP_URL}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              data-testid="button-final-cta"
            >
              Start Application
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
              Talk to us
            </a>
          </div>
        </div>
      </section>

      <PassportFooter />
    </div>
  );
}
