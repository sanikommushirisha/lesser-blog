import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Shield,
  Users,
  Clock,
  DollarSign,
  Building2,
  FileText,
  Eye,
  Zap,
  CalendarClock,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import SharedNavbar from "@/components/shared-navbar";
import GoogleReviewsSection from "@/components/google-reviews-section";
import lesserLogo from "@assets/lesser_blue_logo_1770346541058.png";


function createRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  ripple.style.left = `${e.clientX - rect.left}px`;
  ripple.style.top = `${e.clientY - rect.top}px`;
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}


function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

const multiEntityFeatures = [
  {
    icon: DollarSign,
    title: "$100 Per LLC",
    description: "5 LLCs = $500, not $7,500.",
  },
  {
    icon: Users,
    title: "K-1s Included",
    description: "Partner K-1s generated automatically.",
  },
  {
    icon: FileText,
    title: "Form 1065",
    description: "Partnership returns done right.",
  },
  {
    icon: Home,
    title: "Depreciation",
    description: "Our team handles rental depreciation.",
  },
  {
    icon: Shield,
    title: "CPA-Reviewed",
    description: "Tax pros verify every number.",
  },
  {
    icon: Clock,
    title: "24-Hour Each",
    description: "All entities filed fast.",
  },
];

const comparisonData = [
  { feature: "Price Per Entity", lesser: "$100", traditional: "$1,500+" },
  { feature: "5 LLCs Total", lesser: "$500", traditional: "$7,500+" },
  { feature: "Turnaround", lesser: "24 hours", traditional: "2-4 weeks" },
  { feature: "K-1 Generation", lesser: "Included", traditional: "Extra cost" },
];

const faqs = [
  {
    question: "Can you handle rental property depreciation?",
    answer: "Yes. Our team processes depreciation schedules and tax professionals verify the calculations. Standard rental depreciation is fully supported.",
  },
  {
    question: "What about multiple partners?",
    answer: "K-1s for all partners are generated automatically. No extra charge per partner.",
  },
  {
    question: "I have 10 LLCs. Can I file them all?",
    answer: "Yes. Each LLC is $100. File them individually or all at once. 24-hour turnaround on each.",
  },
  {
    question: "Do I really not have to pay until I see my return?",
    answer: "Correct. Upload your documents, we generate your return, you review it in our portal. Only pay $100 if you're satisfied and want to file.",
  },
  {
    question: "What documents do I need?",
    answer: "At minimum: your P&L and balance sheet for the tax year. If you have K-1s from other entities, prior year returns, or rental schedules, upload those too. Our team will extract what it needs.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption and follow strict security protocols. Your financial data is never shared with third parties.",
  },
];

const howItWorksSteps = [
  {
    title: "Upload your documents",
    desc: "Drop in your P&L, balance sheet, and any other docs. Our team extracts everything automatically.",
  },
  {
    title: "We build your return",
    desc: "We generate your complete tax return — typically within 24 hours. Every detail reviewed by a CPA.",
  },
  {
    title: "Review and pay",
    desc: "Check every line of your return. Pay $100 only if satisfied.",
  },
];

const testimonials = [
  {
    id: "t1",
    quote: "Filed all 4 rental LLCs for $400 total. My previous CPA charged $5,000 for the same work. The K-1s were delivered to partners within a day.",
    name: "Priya K.",
    role: "Real Estate Investor",
  },
  {
    id: "t2",
    quote: "Per-entity pricing finally makes sense for investors managing multiple LLCs. No more surprise bills. CPA review gives me real peace of mind.",
    name: "James R.",
    role: "Property Manager",
  },
];

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        <defs>
          <pattern id="re-pricing-hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#re-pricing-hero-grid)" style={{ animation: 'hero-grid-draw 2s ease-out forwards' }} />
      </svg>

      <div className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(28,65,247,0.15) 0%, transparent 70%)', animation: 'hero-glow-pulse 6s ease-in-out infinite' }} />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(28,65,247,0.12) 0%, transparent 70%)', animation: 'hero-glow-pulse 8s ease-in-out infinite 2s' }} />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(28,65,247,0.08) 0%, transparent 60%)', animation: 'hero-glow-pulse 10s ease-in-out infinite 1s' }} />

      <div className="absolute top-[20%] right-[15%]" style={{ animation: 'hero-float-1 8s ease-in-out infinite' }}>
        <div className="w-16 h-16 rounded-2xl border border-primary/10 bg-primary/[0.03] backdrop-blur-sm rotate-12" style={{ boxShadow: '0 8px 32px rgba(28,65,247,0.06)' }} />
      </div>
      <div className="absolute bottom-[25%] left-[10%]" style={{ animation: 'hero-float-2 10s ease-in-out infinite' }}>
        <div className="w-12 h-12 rounded-xl border border-primary/8 bg-primary/[0.02] backdrop-blur-sm -rotate-6" style={{ boxShadow: '0 8px 32px rgba(28,65,247,0.04)' }} />
      </div>

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/20"
          style={{
            left: `${15 + i * 14}%`,
            bottom: '0%',
            animation: `hero-particle-drift ${8 + i * 2}s linear infinite ${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative bg-white pt-24 pb-16 lg:pt-28 lg:pb-20 overflow-hidden"
      onMouseMove={handleMouseMove}
      data-testid="section-re-pricing-hero"
    >
      <HeroBackground />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`, transition: 'transform 0.3s ease-out' }}>
        <div className="absolute top-[18%] right-[18%] w-20 h-20 rounded-2xl border border-primary/8 bg-gradient-to-br from-primary/[0.04] to-transparent rotate-12" style={{ boxShadow: '0 12px 40px rgba(28,65,247,0.06)' }} />
        <div className="absolute bottom-[22%] left-[15%] w-14 h-14 rounded-xl border border-primary/6 bg-gradient-to-br from-primary/[0.03] to-transparent -rotate-12" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 mt-[20px] mb-[20px]" style={{ perspective: '1000px' }}>
        <div className="text-center" style={{ transform: `rotateX(${mousePos.y * -1}deg) rotateY(${mousePos.x * 1}deg)`, transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
          <div className="hero-text-reveal mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5">
            <Home className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Real Estate Investors</span>
          </div>

          <h1
            className="hero-text-reveal text-4xl sm:text-5xl lg:text-[58px] font-bold text-foreground tracking-tight mb-6 leading-tight"
            data-testid="text-re-pricing-hero-heading"
          >
            $100 Per Entity. <span className="text-primary">Not $1,500.</span>
          </h1>

          <p
            className="hero-text-reveal-sub text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
            data-testid="text-re-pricing-hero-subheading"
          >
            Own 5 rental LLCs? That's $500 total with Lesser — not the $7,500 your CPA charges. Same Form 1065s. Same K-1s. CPA-reviewed. 24-hour turnaround.
          </p>

          <div className="hero-btn-appear flex flex-wrap justify-center items-center gap-4 mb-10">
            <a
              href="https://lesser.tax/app/auth/sign-up"
              className="hero-btn-3d inline-flex items-center gap-2 text-base font-semibold bg-primary text-white rounded-xl px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              data-testid="button-hero-cta"
            >
              Start Your Return
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="hero-checks-reveal grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "$100", label: "Per entity" },
              { value: "10,000+", label: "Partnerships filed" },
              { value: "24hrs", label: "Turnaround" },
            ].map((stat, i) => (
              <div key={i} data-testid={`text-hero-stat-${i}`}>
                <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MultiEntitySection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-multi-entity">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Multi-Entity Filing</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-multi-entity-heading"
          >
            Built for multi-entity <span className="text-primary italic">investors</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            File all your rental LLCs for $100 each
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {multiEntityFeatures.map((feature, index) => {
            const IconComp = feature.icon;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
                data-testid={`card-feature-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-7 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                    <IconComp className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-comparison">
      <div className="relative max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-comparison-heading"
          >
            Lesser vs <span className="text-primary italic">Your CPA</span>
          </h2>
          <p className={`text-lg text-muted-foreground transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            See why thousands of investors are switching.
          </p>
        </div>

        <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} data-testid="table-comparison">
          <div className="grid grid-cols-3 bg-muted/30 border-b border-gray-200">
            <div className="p-4 sm:p-5"></div>
            <div className="p-4 sm:p-5 text-center border-l border-gray-200">
              <span className="text-sm font-bold text-primary">Lesser</span>
            </div>
            <div className="p-4 sm:p-5 text-center border-l border-gray-200">
              <span className="text-sm font-bold text-muted-foreground">Traditional CPA</span>
            </div>
          </div>
          {comparisonData.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 border-b border-gray-100 last:border-b-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`} data-testid={`row-comparison-${i}`}>
              <div className="p-4 sm:p-5 flex items-center">
                <span className="text-sm font-semibold text-foreground">{row.feature}</span>
              </div>
              <div className="p-4 sm:p-5 text-center border-l border-gray-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{row.lesser}</span>
              </div>
              <div className="p-4 sm:p-5 text-center border-l border-gray-100 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">{row.traditional}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-re-faq">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-faq-heading"
          >
            Real estate investor{" "}
            <span className="text-primary italic">questions</span>
          </h2>
          <p className={`text-muted-foreground text-lg transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Have more questions? Write us at{" "}
            <a href="mailto:use@lesser.tax" className="text-primary font-medium hover:underline underline-offset-4 transition-colors" data-testid="link-email">use@lesser.tax</a>
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'border-primary/20 shadow-[0_8px_30px_-6px_rgba(28,65,247,0.1)]' : 'border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:border-primary/15 hover:shadow-[0_6px_24px_-4px_rgba(28,65,247,0.08)]'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${200 + index * 80}ms` }}
                data-testid={`card-faq-${index}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/60 to-transparent transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
                <button
                  className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  data-testid={`button-faq-${index}`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${isOpen ? 'bg-primary text-white scale-105' : 'bg-primary/8 text-primary group-hover:bg-primary/12'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <span className={`font-semibold pr-4 flex-1 transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-foreground'}`} data-testid={`text-faq-question-${index}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary/10 rotate-180' : 'bg-muted/50 group-hover:bg-primary/5'}`}>
                    <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-400 ease-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-5 sm:px-6 pb-6 pl-[4.25rem] sm:pl-[4.75rem]">
                    <div className="w-8 h-[1px] bg-primary/15 mb-4" />
                    <p className="text-muted-foreground leading-relaxed" data-testid={`text-faq-answer-${index}`}>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-how-it-works">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">How It Works</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-[52px] lg:leading-[1.1] font-bold text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-how-it-works-heading"
          >
            Your tax return in{" "}
            <span className="text-primary italic">three simple steps</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            No accountant meetings. No back-and-forth emails.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          {howItWorksSteps.map((step, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
              data-testid={`card-step-${index}`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="text-xl font-bold text-foreground" data-testid={`text-step-${index}-title`}>{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-step-${index}-desc`}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={`text-center mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://lesser.tax/app/auth/sign-up"
            className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-8 py-4 text-base font-semibold shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            data-testid="button-how-it-works-cta"
          >
            Start Your Return
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-testimonials">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Investor Reviews</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-testimonials-heading"
          >
            What business owners <span className="text-primary italic">say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {testimonials.map((testimonial, index) => {
            const baseDelay = 200 + index * 150;
            return (
              <div
                key={testimonial.id}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600">Verified</span>
                  </div>
                  <div className="mb-4">
                    <svg className="w-8 h-8 text-primary/15" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/>
                    </svg>
                  </div>
                  <blockquote className="text-foreground leading-relaxed mb-6 text-[15px]" data-testid={`text-quote-${testimonial.id}`}>
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3 pt-5 border-t border-border/40">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Shield, title: "100% Accuracy Guarantee", subtitle: "Or we fix it free" },
            { icon: Eye, title: "Review Before You Pay", subtitle: "See your complete return first" },
            { icon: Users, title: "CPA-Reviewed", subtitle: "Tax pros verify every return" },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${500 + index * 150}ms` }}
              data-testid={`card-trust-${index}`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm" data-testid={`text-trust-title-${index}`}>{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeadlineSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-16 lg:py-20 bg-white overflow-hidden" data-testid="section-deadline">
      <div className="relative max-w-4xl mx-auto px-6">
        <div className={`bg-gradient-to-br from-primary/[0.04] to-primary/[0.01] border border-primary/15 rounded-2xl p-8 sm:p-12 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <CalendarClock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4" data-testid="text-deadline-heading">
            Don't miss your filing deadline
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Partnerships and LLCs: <span className="font-bold text-foreground">March 15</span>.
            S-Corps and C-Corps: <span className="font-bold text-foreground">April 15</span>.
            Start now to file on time.
          </p>
          <a
            href="https://lesser.tax/app/auth/sign-up"
            className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-8 py-4 text-base font-semibold shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            data-testid="button-deadline-cta"
          >
            Start Your Return
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden" data-testid="section-re-cta">
      <div className="absolute inset-0 bg-foreground" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(28,65,247,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(28,65,247,0.08) 0%, transparent 60%)' }} />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="re-cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#re-cta-grid)" />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(28,65,247,0.3) 50%, transparent)' }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-heading"
        >
          Stop paying per-entity CPA rates
        </h2>
        <p className={`text-lg text-white/50 mb-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} data-testid="text-cta-sub">
          $100 per LLC. Form 1065 + K-1s included. CPA-reviewed.
        </p>
        <p className={`text-sm text-white/30 mb-10 transition-all duration-700 delay-250 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          No credit card required to start.
        </p>
        <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://lesser.tax/app/auth/sign-up"
            onClick={(e) => { createRipple(e); }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden cta-btn-shimmer"
            data-testid="button-cta-primary"
          >
            <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
              Start Your Return
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </div>
        <div className={`flex flex-wrap items-center justify-center gap-6 mt-10 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {["Flat-fee pricing", "K-1s included", "CPA-reviewed"].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-xs text-white/40 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RePricingFooter() {
  return (
    <footer className="relative bg-foreground overflow-hidden" data-testid="section-re-footer">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(28,65,247,0.2) 50%, transparent)' }} />
      <div className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <img src={lesserLogo} alt="Lesser" className="h-8 brightness-0 invert opacity-70" data-testid="img-footer-logo" />
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
            <span>&copy; {new Date().getFullYear()} Lesser Tax Inc.</span>
            <a href="mailto:use@lesser.tax" className="hover:text-white/50 transition-colors" data-testid="link-footer-email">use@lesser.tax</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RePricingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>$100 Per Entity — RE Investor Tax Filing | Lesser</title>
        <meta name="description" content="Own 5 rental LLCs? File all partnership returns for $100 each — not $1,500. Form 1065 + K-1s included, CPA-reviewed, 24-hour turnaround." />
        <meta property="og:title" content="Lesser — $100 Per Entity for Real Estate Investors" />
        <meta property="og:description" content="File your rental LLC partnership returns for $100 each. Form 1065 + K-1s included. CPA-reviewed, 24hr turnaround. Stop overpaying your CPA." />
        <meta property="og:image" content="https://lesser.tax/og-landing.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lesser — $100 Per Entity for Real Estate Investors" />
        <meta name="twitter:description" content="File your rental LLC partnership returns for $100 each. Form 1065 + K-1s included. CPA-reviewed, 24hr turnaround. Stop overpaying your CPA." />
        <meta name="twitter:image" content="https://lesser.tax/og-landing.jpg" />
      </Helmet>
      <SharedNavbar variant="business" sourcePage="/business/realestate" />
      <HeroSection />
      <MultiEntitySection />
      <ComparisonSection />
      <FAQSection />
      <GoogleReviewsSection />
      <HowItWorksSection />
      <DeadlineSection />
      <CTASection />
      <RePricingFooter />
    </div>
  );
}
