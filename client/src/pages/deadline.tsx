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
  Ban,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import SharedNavbar from "@/components/shared-navbar";
import GoogleReviewsSection from "@/components/google-reviews-section";
import lesserLogo from "@assets/lesser_logo.png";


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

const testimonials = [
  {
    id: "t1",
    quote: "Filed my S-Corp return on March 13 and had it ready by the 14th. My CPA had told me there was no way they could take me on that late. Lesser saved me from needing an extension.",
    name: "Kevin T.",
    role: "Founder, SaaS Startup",
  },
  {
    id: "t2",
    quote: "Uploaded my partnership docs on a Sunday night, had the 1065 and all K-1s back Monday morning. $100 instead of the $2,500 my accountant quoted. No-brainer.",
    name: "Rachel M.",
    role: "Real Estate Investor",
  },
  {
    id: "t3",
    quote: "Every year I scramble to find a CPA before the deadline. This year I just uploaded to Lesser and it was done in 24 hours. CPA-reviewed and everything. Never going back.",
    name: "David L.",
    role: "Managing Partner, Consulting LLC",
  },
];

const beatDeadlineCards = [
  {
    icon: Clock,
    title: "24-Hour Filing",
    description: "Upload today, filed tomorrow. Beat March 15.",
  },
  {
    icon: Ban,
    title: "No Waitlist",
    description: "CPAs are booked. We're not. Start immediately.",
  },
  {
    icon: Users,
    title: "CPA-Reviewed",
    description: "Fast doesn't mean sloppy. Tax pros check everything.",
  },
  {
    icon: DollarSign,
    title: "$100 Flat",
    description: "No rush fees, no premium pricing.",
  },
  {
    icon: FileCheck,
    title: "No Extensions",
    description: "File on time without the paperwork.",
  },
  {
    icon: Eye,
    title: "Review First",
    description: "See your return before we file.",
  },
];

const faqs = [
  {
    question: "Can I really file this close to the deadline?",
    answer: "Yes. 24-hour turnaround means you can upload on March 13 and file on March 14. We handle last-minute filers every year.",
  },
  {
    question: "What if I miss March 15?",
    answer: "We can file an extension, but it's easier to just file now. Upload takes 5 minutes.",
  },
  {
    question: "Is there a rush fee?",
    answer: "No. $100 flat whether you file in January or March 14.",
  },
  {
    question: "Which forms do you support?",
    answer: "We handle Form 1120 (C-Corp), Form 1065 (Partnership/LLC), and Form 1120-S (S-Corp). All include K-1 generation where applicable.",
  },
  {
    question: "Do I really not have to pay until I see my return?",
    answer: "Correct. Upload your documents, we generate your return, you review it in our portal. Only pay $100 if you're satisfied and want to file.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption and follow strict security protocols. Your financial data is never shared with third parties.",
  },
];

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        <defs>
          <pattern id="deadline-hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#deadline-hero-grid)" style={{ animation: 'hero-grid-draw 2s ease-out forwards' }} />
      </svg>

      <div className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.15) 0%, transparent 70%)', animation: 'hero-glow-pulse 6s ease-in-out infinite' }} />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.12) 0%, transparent 70%)', animation: 'hero-glow-pulse 8s ease-in-out infinite 2s' }} />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.08) 0%, transparent 60%)', animation: 'hero-glow-pulse 10s ease-in-out infinite 1s' }} />

      <div className="absolute top-[20%] right-[15%]" style={{ animation: 'hero-float-1 8s ease-in-out infinite' }}>
        <div className="w-16 h-16 rounded-2xl border border-primary/10 bg-primary/[0.03] backdrop-blur-sm rotate-12" style={{ boxShadow: '0 8px 32px rgba(3,79,70,0.06)' }} />
      </div>
      <div className="absolute bottom-[25%] left-[10%]" style={{ animation: 'hero-float-2 10s ease-in-out infinite' }}>
        <div className="w-12 h-12 rounded-xl border border-primary/8 bg-primary/[0.02] backdrop-blur-sm -rotate-6" style={{ boxShadow: '0 8px 32px rgba(3,79,70,0.04)' }} />
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
      data-testid="section-deadline-hero"
    >
      <HeroBackground />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`, transition: 'transform 0.3s ease-out' }}>
        <div className="absolute top-[18%] right-[18%] w-20 h-20 rounded-2xl border border-primary/8 bg-gradient-to-br from-primary/[0.04] to-transparent rotate-12" style={{ boxShadow: '0 12px 40px rgba(3,79,70,0.06)' }} />
        <div className="absolute bottom-[22%] left-[15%] w-14 h-14 rounded-xl border border-primary/6 bg-gradient-to-br from-primary/[0.03] to-transparent -rotate-12" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 mt-[20px] mb-[20px]" style={{ perspective: '1000px' }}>
        <div className="text-center" style={{ transform: `rotateX(${mousePos.y * -1}deg) rotateY(${mousePos.x * 1}deg)`, transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
          <div className="hero-text-reveal mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-300/40 bg-red-50">
            <CalendarClock className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-600">DEADLINE: MARCH 15</span>
          </div>

          <h1
            className="hero-text-reveal text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-6 leading-tight"
            data-testid="text-deadline-hero-heading"
          >
            March 15 Is Coming.
            <br />
            <span className="text-primary">File in 24 Hrs.</span>
          </h1>

          <p
            className="hero-text-reveal-sub text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
            data-testid="text-deadline-hero-subheading"
          >
            Deadline approaching and CPAs are booked? Upload your docs today, get your return tomorrow. Form 1120, 1065, or 1120-S — <span className="font-semibold text-foreground">$100 flat</span>. CPA-reviewed. No waitlist.
          </p>

          <div className="hero-btn-appear flex flex-wrap justify-center items-center gap-4 mb-10">
            <a
              href="https://app.lesser.tax/auth/sign-up"
              className="hero-btn-3d inline-flex items-center gap-2 text-base font-semibold bg-primary text-white rounded-xl px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              data-testid="button-hero-cta"
            >
              File Now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="hero-checks-reveal grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "24hrs", label: "Turnaround" },
              { value: "0", label: "Waitlist" },
              { value: "$100", label: "Flat fee" },
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

function ExpertReviewSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-expert-review">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Expert Review</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-[44px] lg:leading-[1.15] font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              data-testid="text-expert-review-heading"
            >
              Every return reviewed by{" "}
              <span className="text-primary italic">tax professionals</span>
            </h2>
            <p className={`text-lg text-muted-foreground leading-relaxed mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} data-testid="text-expert-review-description">
              Our technology handles the heavy lifting, but experienced CPAs and tax professionals verify every calculation. You get the speed of automation with the confidence of professional oversight.
            </p>

            <ul className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {[
                "CPA-level accuracy guarantee",
                "Error detection before filing",
                "Unlimited revisions included",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3" data-testid={`text-expert-bullet-${i}`}>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground" data-testid="text-review-step-1">Document Processing Complete</p>
                  <p className="text-xs text-muted-foreground">All schedules and allocations verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/[0.04] border border-primary/10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground" data-testid="text-review-step-2">CPA Review in Progress</p>
                  <p className="text-xs text-muted-foreground">Every line checked for accuracy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground" data-testid="text-review-step-3">Ready for Filing</p>
                  <p className="text-xs text-muted-foreground">Return approved and e-file ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BeatDeadlineSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-beat-deadline">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Why Lesser</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-beat-deadline-heading"
          >
            Beat the <span className="text-primary italic">deadline</span>
          </h2>
          <p className={`text-muted-foreground text-lg max-w-xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            No waitlist, no extensions needed
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beatDeadlineCards.map((card, index) => {
            const IconComp = card.icon;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
                data-testid={`card-beat-deadline-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-7 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                    <IconComp className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-extrabold tracking-[-0.03em] text-foreground mb-2" data-testid={`text-beat-deadline-title-${index}`}>{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-social-proof">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Trusted by Businesses</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-[44px] lg:leading-[1.15] font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              data-testid="text-social-proof-heading"
            >
              Over 10,000 businesses have filed with{" "}
              <span className="text-primary italic">Lesser</span>
            </h2>
            <p className={`text-lg text-muted-foreground leading-relaxed mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              From e-commerce brands to consulting firms, small business owners trust us to handle their tax returns accurately and affordably.
            </p>

            <ul className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {[
                "Tech-powered document processing",
                "Every return reviewed by tax professionals",
                "Transparent pricing with no hidden fees",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3" data-testid={`text-social-bullet-${i}`}>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "10,000+", label: "Returns filed", icon: FileText },
                { value: "$100", label: "Flat fee", icon: DollarSign },
                { value: "24hrs", label: "Avg turnaround", icon: Clock },
                { value: "100%", label: "Accuracy guarantee", icon: Shield },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(3,79,70,0.1)] hover:border-primary/20 transition-all duration-300"
                    data-testid={`card-social-stat-${i}`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-primary/8 flex items-center justify-center mb-3">
                      <StatIcon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-deadline-faq">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-faq-heading"
          >
            Deadline{" "}
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
                className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'border-primary/20 shadow-[0_8px_30px_-6px_rgba(3,79,70,0.1)]' : 'border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:border-primary/15 hover:shadow-[0_6px_24px_-4px_rgba(3,79,70,0.08)]'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
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

function TestimonialsSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-deadline-testimonials">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Real Results</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-testimonials-heading"
          >
            Real results from <span className="text-primary italic">real businesses</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => {
            const baseDelay = 200 + index * 150;
            return (
              <div
                key={testimonial.id}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-emerald-600" />
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
      </div>
    </section>
  );
}

function FinalCTASection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden" data-testid="section-deadline-cta">
      <div className="absolute inset-0 bg-foreground" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(3,79,70,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(3,79,70,0.08) 0%, transparent 60%)' }} />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="deadline-cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#deadline-cta-grid)" />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,79,70,0.3) 50%, transparent)' }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-final-cta-heading"
        >
          Don't miss March 15
        </h2>
        <p className={`text-lg text-white/50 mb-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} data-testid="text-final-cta-sub">
          Upload today. Filed tomorrow. $100. No waitlist.
        </p>
        <p className={`text-sm text-white/30 mb-10 transition-all duration-700 delay-250 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          No credit card required to start.
        </p>
        <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://app.lesser.tax/auth/sign-up"
            onClick={(e) => { createRipple(e); }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden cta-btn-shimmer"
            data-testid="button-final-cta"
          >
            <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
              File Now
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </div>
        <div className={`flex flex-wrap items-center justify-center gap-6 mt-10 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {["$100 flat fee", "No rush fees", "CPA-reviewed"].map((item, i) => (
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

function DeadlineFooter() {
  return (
    <footer className="relative bg-foreground overflow-hidden" data-testid="section-deadline-footer">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,79,70,0.2) 50%, transparent)' }} />
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

export default function DeadlinePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>March 15 Business Tax Deadline — File in 24 Hrs | Lesser</title>
        <meta name="description" content="March 15 deadline approaching? File your business tax return in 24 hours. Form 1120, 1065, or 1120-S for $100 flat. CPA-reviewed, no waitlist, no rush fees." />
        <meta property="og:title" content="March 15 Deadline — File Your Business Taxes in 24 Hrs | Lesser" />
        <meta property="og:description" content="Deadline approaching and CPAs are booked? Upload your docs today, get your return tomorrow. $100 flat. CPA-reviewed. No waitlist." />
        <meta property="og:image" content="https://lesser.tax/og-landing.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="March 15 Deadline — File Your Business Taxes in 24 Hrs | Lesser" />
        <meta name="twitter:description" content="Deadline approaching and CPAs are booked? Upload your docs today, get your return tomorrow. $100 flat. CPA-reviewed. No waitlist." />
        <meta name="twitter:image" content="https://lesser.tax/og-landing.jpg" />
      </Helmet>
      <SharedNavbar variant="business" sourcePage="/business/deadline" />
      <HeroSection />
      <ExpertReviewSection />
      <BeatDeadlineSection />
      <SocialProofSection />
      <FAQSection />
      <GoogleReviewsSection />
      <FinalCTASection />
      <DeadlineFooter />
    </div>
  );
}