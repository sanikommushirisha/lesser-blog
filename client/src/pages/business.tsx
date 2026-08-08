import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  FileText,
  Shield,
  Zap,
  BarChart3,
  Users,
  Clock,
  RefreshCw,
  Eye,
  Building2,
  CalendarClock,
  CheckSquare,
  XCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import SharedNavbar from "@/components/shared-navbar";
import GoogleReviewsSection from "@/components/google-reviews-section";
import lesserLogo from "@assets/lesser_logo.png";
import teamDavidImg from "@assets/team_david_clean.png";
import teamVishweshImg from "@assets/team_vishwesh_clean.png";
import teamJithendraImg from "@assets/team_jithendra_clean.png";
import teamRobertImg from "@assets/team_robert_clean.png";


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


function SectionDecorations({ variant = "default" }: { variant?: "default" | "alt" | "dark" }) {
  const color = variant === "dark" ? "255,255,255" : "3,79,70";
  const baseOpacity = variant === "dark" ? 0.04 : 0.03;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full section-bg-float" style={{ background: `radial-gradient(circle, rgba(${color},${baseOpacity * 3}) 0%, transparent 70%)` }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full section-bg-float-reverse" style={{ background: `radial-gradient(circle, rgba(${color},${baseOpacity * 2}) 0%, transparent 70%)` }} />
      {variant === "alt" && (
        <>
          <div className="absolute top-[20%] right-[8%] w-8 h-8 rounded-lg border rotate-45 section-bg-float" style={{ borderColor: `rgba(${color},0.06)`, background: `rgba(${color},0.015)` }} />
          <div className="absolute bottom-[30%] left-[5%] w-6 h-6 rounded-full border section-bg-float-reverse" style={{ borderColor: `rgba(${color},0.05)`, background: `rgba(${color},0.01)` }} />
        </>
      )}
    </div>
  );
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

const teamMembers = [
  {
    id: "david",
    name: "David",
    credential: "CPA",
    experience: "8+ years experience",
    specialty: "Business tax planning & financial reporting",
    image: teamDavidImg,
  },
  {
    id: "vishwesh",
    name: "Vishwesh",
    credential: "CPA",
    experience: "10+ years experience",
    specialty: "RSU & equity taxation, complex returns",
    image: teamVishweshImg,
  },
  {
    id: "jithendra",
    name: "Jithendra",
    credential: "IRS EA",
    experience: "6+ years experience",
    specialty: "Cross-border tax, FBAR & FATCA",
    image: teamJithendraImg,
  },
  {
    id: "robert",
    name: "Robert",
    credential: "IRS EA",
    experience: "12+ years experience",
    specialty: "Tax resolution, wills & trusts",
    image: teamRobertImg,
  },
];

const formTypes = [
  {
    form: "Form 1120",
    entity: "C-Corporation",
    description: "Federal corporate income tax return for C-Corps",
    icon: Building2,
  },
  {
    form: "Form 1065",
    entity: "Partnership / LLC",
    description: "Return for multi-member partnerships and LLCs",
    icon: Users,
  },
  {
    form: "Form 1120-S",
    entity: "S-Corporation",
    description: "Pass-through taxation for S-Corps",
    icon: FileText,
  },
];

const features = [
  {
    icon: FileText,
    title: "Complete Federal Return",
    description: "Full preparation of your business tax return with all required schedules and forms, ready for e-file submission to the IRS.",
    badges: ["All schedules included", "E-file ready", "IRS compliant"],
  },
  {
    icon: Users,
    title: "K-1 Generation",
    description: "Automatic generation of Schedule K-1s for all partners or shareholders. We handle the allocation calculations.",
    badges: ["Unlimited K-1s", "Auto-allocation", "Partner portal"],
  },
  {
    icon: Upload,
    title: "AI Document Processing",
    description: "Upload your P&L, balance sheet, bank statements, and prior returns. Our AI extracts and categorizes everything automatically.",
    badges: ["PDF & CSV support", "Smart extraction", "Error detection"],
  },
  {
    icon: Shield,
    title: "CPA Review",
    description: "Every return is reviewed by experienced tax professionals before delivery. We catch what automation misses.",
    badges: ["CPA oversight", "Accuracy check", "Compliance review"],
  },
  {
    icon: Eye,
    title: "Review Before Payment",
    description: "See your complete return line-by-line in our portal before paying anything. Only pay if you're satisfied with the result.",
    badges: ["Full transparency", "No commitment", "Risk-free"],
  },
  {
    icon: RefreshCw,
    title: "Unlimited Revisions",
    description: "Need changes? We'll revise your return as many times as needed until you're completely satisfied. No extra charge.",
    badges: ["Free changes", "Quick turnaround", "Until satisfied"],
  },
];

const howItWorksSteps = [
  {
    title: "Upload your documents",
    desc: "Drop in your P&L, balance sheet, K-1s, and any other docs. Our AI reads and extracts everything automatically.",
  },
  {
    title: "We build your return",
    desc: "We process your documents and generate a complete tax return — typically within 48 hours. Every detail reviewed by a CPA.",
  },
  {
    title: "Review and file",
    desc: "Check your return in our portal. Only pay if everything looks good. No payment required upfront.",
  },
];

const goodFit = [
  "C-Corps filing Form 1120",
  "Partnerships & multi-member LLCs filing Form 1065",
  "S-Corps filing Form 1120-S",
  "Simple financials with straightforward income and expenses",
  "Businesses with clean QuickBooks or bookkeeping records",
];

const notFit = [
  "Single-member LLCs (file on your personal return)",
  "Sole proprietorships (file on your personal return)",
  "Complex returns with international ops, M&A, heavy depreciation",
  "Personal tax returns",
  "Businesses needing year-round tax advisory",
];

const comparisonData = [
  { feature: "Price", lesser: "$100", traditional: "$1,500+" },
  { feature: "Turnaround", lesser: "48 hours", traditional: "2–4 weeks" },
  { feature: "Document Upload", lesser: "Drag & drop portal", traditional: "Email back-and-forth" },
  { feature: "Review Before Pay", lesser: true, traditional: false },
  { feature: "K-1 Generation", lesser: "Included", traditional: "Extra cost" },
  { feature: "Unlimited Revisions", lesser: true, traditional: false },
];

const testimonials = [
  {
    id: "t1",
    quote: "Filed my LLC partnership return in two days. Used to take my CPA three weeks and cost $2,000. This is a no-brainer for any small business owner.",
    name: "Michael C.",
    role: "Co-founder, Logistics Startup",
  },
  {
    id: "t2",
    quote: "Uploaded my QuickBooks export and had a complete 1120-S ready for review the next morning. Incredibly fast and the CPA review gave me real peace of mind.",
    name: "Sarah M.",
    role: "Owner, Design Studio",
  },
];

const faqs = [
  {
    question: "How can you offer flat-fee pricing?",
    answer: "Our platform handles document parsing, transaction categorization, and return generation. You're paying for smart technology backed by CPA oversight — not hours of manual accountant work.",
  },
  {
    question: "Do I really not have to pay until I see my return?",
    answer: "Correct. Upload your documents, we generate your return, you review it in our portal. Only pay $100 if you're satisfied and want to file.",
  },
  {
    question: "What documents do I need to upload?",
    answer: "At minimum: your P&L and balance sheet for the tax year. If you have K-1s from other entities, prior year returns, or other relevant docs, upload those too. Our system will extract what it needs.",
  },
  {
    question: "How fast will my return be ready?",
    answer: "Most returns are completed within 48 hours of uploading your documents. Complex situations may take slightly longer.",
  },
  {
    question: "What if my return is too complex for the flat-fee option?",
    answer: "We'll let you know upfront if your situation requires our full-service team. No surprises — you'll know before you upload.",
  },
  {
    question: "What's the deadline for filing?",
    answer: "Partnerships and multi-member LLCs (Form 1065): March 15. C-Corps (Form 1120) and S-Corps (Form 1120-S): April 15. Extensions are available if needed.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption and follow strict security protocols. Your financial data is never shared with third parties.",
  },
  {
    question: "What if I need to make changes after filing?",
    answer: "We offer unlimited revisions before filing. If you need to amend a return after filing, contact our support team for assistance.",
  },
];

function BusinessHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        <defs>
          <pattern id="biz-hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#biz-hero-grid)" style={{ animation: 'hero-grid-draw 2s ease-out forwards' }} />
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
      <div className="absolute top-[35%] left-[20%]" style={{ animation: 'hero-float-3 12s ease-in-out infinite' }}>
        <div className="w-8 h-8 rounded-lg border border-primary/6 bg-primary/[0.02] rotate-45" />
      </div>
      <div className="absolute bottom-[35%] right-[12%]" style={{ animation: 'hero-float-2 9s ease-in-out infinite 1s' }}>
        <div className="w-10 h-10 rounded-full border border-primary/8 bg-primary/[0.02]" />
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

      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 rounded-full border border-primary/5" style={{ animation: 'hero-ring-expand 8s ease-out infinite' }} />
      </div>
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 rounded-full border border-primary/5" style={{ animation: 'hero-ring-expand 8s ease-out infinite 2.5s' }} />
      </div>
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
      data-testid="section-business-hero"
    >
      <BusinessHeroBackground />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`, transition: 'transform 0.3s ease-out' }}>
        <div className="absolute top-[18%] right-[18%] w-20 h-20 rounded-2xl border border-primary/8 bg-gradient-to-br from-primary/[0.04] to-transparent rotate-12" style={{ boxShadow: '0 12px 40px rgba(3,79,70,0.06)' }} />
        <div className="absolute bottom-[22%] left-[15%] w-14 h-14 rounded-xl border border-primary/6 bg-gradient-to-br from-primary/[0.03] to-transparent -rotate-12" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 mt-[20px] mb-[20px]" style={{ perspective: '1000px' }}>
        <div className="text-center" style={{ transform: `rotateX(${mousePos.y * -1}deg) rotateY(${mousePos.x * 1}deg)`, transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
          <div className="hero-text-reveal mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Business Tax Filing</span>
          </div>

          <h1
            className="hero-text-reveal text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-6"
            data-testid="text-business-hero-heading"
          >
            File Your Business Taxes
          </h1>

          <div className="hero-text-reveal mb-8 flex justify-center" data-testid="text-hero-price-highlight">
            <div className="relative inline-flex items-baseline gap-1">
              <span className="text-7xl sm:text-8xl lg:text-[120px] font-bold text-primary leading-none tracking-tight" style={{ textShadow: '0 4px 24px rgba(3,79,70,0.15)' }}>$100</span>
              <div className="flex flex-col items-start ml-2 mb-2 sm:mb-3">
                <span className="text-lg sm:text-xl font-bold text-foreground leading-tight">flat fee</span>
                <span className="text-sm text-muted-foreground leading-tight">per return</span>
              </div>
            </div>
          </div>

          <p
            className="hero-text-reveal-sub text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
            data-testid="text-business-hero-subheading"
          >
            Form 1120, 1065, or 1120-S — upload your documents and let our team handle the rest. Every return is CPA-reviewed for accuracy.
          </p>

          <div className="hero-checks-reveal inline-flex flex-col sm:flex-row gap-3 sm:gap-6 mb-10">
            <div className="flex items-center gap-2" data-testid="text-hero-benefit-0">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">48hr turnaround</span>
            </div>
            <div className="flex items-center gap-2" data-testid="text-hero-benefit-1">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Review before you pay</span>
            </div>
            <div className="flex items-center gap-2" data-testid="text-hero-benefit-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">CPA-reviewed</span>
            </div>
          </div>

          <div className="hero-btn-appear flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://app.lesser.tax/auth/sign-up"
              className="hero-btn-3d inline-flex items-center gap-2 text-base font-semibold bg-primary text-white rounded-xl px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              data-testid="button-hero-cta"
            >
              Start Your Return
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="hero-text-reveal-sub text-xs text-muted-foreground mt-6" data-testid="text-hero-microtext">
            Federal filing included · State available · No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
}

function TrustSignals() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-16 bg-muted/20 overflow-hidden" data-testid="section-trust-signals">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "100% Accuracy Guarantee", subtitle: "Or we fix it free" },
            { icon: Eye, title: "Review Before You Pay", subtitle: "See your complete return first" },
            { icon: Users, title: "CPA-Reviewed", subtitle: "Tax pros verify every return" },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
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

        <div className={`grid grid-cols-3 gap-6 mt-10 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {[
            { value: "10,000+", label: "Returns filed" },
            { value: "$1,400", label: "Average savings vs CPA" },
            { value: "48hrs", label: "Average turnaround" },
          ].map((stat, i) => (
            <div key={i} data-testid={`text-stat-${i}`}>
              <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormTypesSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-form-types">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Supported Forms</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-forms-heading"
          >
            Every Business Structure, <span className="text-primary italic">One Flat Fee</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {formTypes.map((form, index) => {
            const IconComp = form.icon;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${200 + index * 150}ms` }}
                data-testid={`card-form-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                    <IconComp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-[-0.03em] text-primary mb-1" data-testid={`text-form-name-${index}`}>{form.form}</h3>
                  <p className="text-sm font-semibold text-foreground mb-2">{form.entity}</p>
                  <p className="text-sm text-muted-foreground">{form.description}</p>
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

  const step1Docs = [
    { label: "P&L Statement" },
    { label: "Balance Sheet" },
    { label: "K-1s" },
    { label: "Prior Returns" },
  ];

  const step2Items = [
    { label: "Document parsing complete", status: "Done", color: "emerald" },
    { label: "Return generation in progress", status: "Processing", color: "primary" },
    { label: "CPA review queued", status: "Pending", color: "amber" },
  ];

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-how-it-works">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">How It Works</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-[52px] lg:leading-[1.1] font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-how-it-works-heading"
          >
            Your tax return in{" "}
            <span className="text-primary italic">three steps</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            No accountant meetings. No back-and-forth emails. Just upload and go.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          <div
            className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '300ms' }}
            data-testid="card-step-0"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">01</div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-0-title">{howItWorksSteps[0].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-0-desc">{howItWorksSteps[0].desc}</p>
              <div className="relative rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-5 text-center group-hover:border-primary/30 transition-colors duration-300">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/8 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium mb-3">Drag & drop or <span className="text-primary font-semibold">browse files</span></p>
                <div className="flex flex-wrap justify-center gap-2">
                  {step1Docs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm hover:border-primary/30 hover:text-primary transition-all duration-200" data-testid={`badge-doc-${i}`}>
                      <span className="text-primary/60">+</span>
                      {doc.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '450ms' }}
            data-testid="card-step-1"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">02</div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-1-title">{howItWorksSteps[1].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-1-desc">{howItWorksSteps[1].desc}</p>
              <div className="relative space-y-3">
                {step2Items.map((item, i) => (
                  <div
                    key={i}
                    className="relative bg-gradient-to-r from-white to-gray-50/80 rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
                    style={{ transform: `translateX(${i * 8}px)` }}
                    data-testid={`card-plan-item-${i}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate">{item.label}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-primary/5 text-primary border border-primary/10'
                      }`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '600ms' }}
            data-testid="card-step-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">03</div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-2-title">{howItWorksSteps[2].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-2-desc">{howItWorksSteps[2].desc}</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-review">CPA Review Complete</p>
                    <p className="text-[11px] text-muted-foreground">Your return has been verified</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto flex-shrink-0" />
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/[0.04] border border-primary/10">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-preview">Review Your Return</p>
                    <p className="text-[11px] text-muted-foreground">Line-by-line in your portal</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-100">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-filed">Filed with IRS</p>
                    <p className="text-[11px] text-muted-foreground">Federal & state returns submitted</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-amber-500 ml-auto flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`text-center mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://app.lesser.tax/auth/sign-up"
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

function FeaturesSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-features">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <CheckSquare className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">What You Get</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-features-heading"
          >
            Everything included for{" "}
            <span className="text-primary italic">$100</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Complete business tax filing with no hidden fees.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComp = feature.icon;
            const baseDelay = 200 + index * 100;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-feature-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-7">
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                    <IconComp className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-extrabold tracking-[-0.03em] text-foreground text-base mb-2" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.badges.map((badge, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">{badge}</span>
                    ))}
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

function FitSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-fit">
      <SectionDecorations />
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-fit-heading"
          >
            Is this right for <span className="text-primary italic">you?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={`bg-white rounded-2xl border border-gray-200 p-8 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: '200ms' }}
            data-testid="card-good-fit"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground">Good fit</h3>
            </div>
            <ul className="space-y-3">
              {goodFit.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5" data-testid={`text-good-fit-${i}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`bg-white rounded-2xl border border-gray-200 p-8 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: '350ms' }}
            data-testid="card-not-fit"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground">Not a fit</h3>
            </div>
            <ul className="space-y-3">
              {notFit.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5" data-testid={`text-not-fit-${i}`}>
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
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
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-comparison-heading"
          >
            Lesser vs <span className="text-primary italic">Traditional CPA</span>
          </h2>
          <p className={`text-lg text-muted-foreground transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            See why thousands of businesses are switching.
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
                {typeof row.lesser === 'boolean' ? (
                  row.lesser ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <span className="text-sm font-semibold text-primary">{row.lesser}</span>
                )}
              </div>
              <div className="p-4 sm:p-5 text-center border-l border-gray-100 flex items-center justify-center">
                {typeof row.traditional === 'boolean' ? (
                  row.traditional ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <span className="text-sm text-muted-foreground">{row.traditional}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="team" className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-business-team">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-team-heading"
          >
            Year-round support from{" "}
            <span className="text-primary">experienced professionals</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => {
            const baseDelay = 200 + index * 120;
            return (
              <div
                key={member.id}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 border border-[#e0e8e5] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] flex flex-col ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms`, background: 'hsl(171 39% 94%)' }}
                data-testid={`card-team-${member.id}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative overflow-hidden flex items-end justify-center px-4 mt-6" style={{ height: '150px' }}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                    style={{ objectPosition: 'center 15%' }}
                    data-testid={`img-team-${member.id}`}
                  />
                </div>
                <div className="relative mx-3 mb-3 bg-white dark:bg-card rounded-2xl px-5 py-5 shadow-[0_1px_6px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-500 flex-1 flex flex-col">
                  <h3
                    className={`text-xl lg:text-2xl font-extrabold tracking-[-0.03em] text-foreground leading-tight mb-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                    style={{ transitionDelay: `${baseDelay + 200}ms` }}
                    data-testid={`text-team-name-${member.id}`}
                  >
                    {member.name}
                  </h3>
                  <div className="space-y-2.5 flex-1">
                    {[member.credential, member.experience, member.specialty].map((detail, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                        style={{ transitionDelay: `${baseDelay + 300 + i * 80}ms` }}
                      >
                        <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm text-foreground font-medium">{detail}</span>
                      </div>
                    ))}
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
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" data-testid="section-testimonials">
      <SectionDecorations />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-testimonials-heading"
          >
            What business owners{" "}
            <span className="text-primary">say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Verified</span>
                  </div>
                  <div className={`mb-5 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} style={{ transitionDelay: `${baseDelay + 200}ms` }}>
                    <svg className="w-10 h-10 text-primary/20 group-hover:text-primary/35 transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/>
                    </svg>
                  </div>
                  <blockquote className={`text-foreground leading-relaxed mb-6 text-[15px] transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${baseDelay + 300}ms` }} data-testid={`text-quote-${testimonial.id}`}>
                    "{testimonial.quote}"
                  </blockquote>
                  <div className={`flex items-center gap-3 pt-5 border-t border-border/40 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: `${baseDelay + 450}ms` }}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
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

function DeadlineSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-16 lg:py-20 bg-white overflow-hidden" data-testid="section-deadline">
      <div className="relative max-w-4xl mx-auto px-6">
        <div className={`bg-gradient-to-br from-primary/[0.04] to-primary/[0.01] border border-primary/15 rounded-2xl p-8 sm:p-12 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <CalendarClock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-foreground mb-4" data-testid="text-deadline-heading">
            Don't miss your filing deadline
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Multi-member LLCs and partnerships: <span className="font-bold text-foreground">March 15</span>.
            C-Corps and S-Corps: <span className="font-bold text-foreground">April 15</span>.
            Start now to file on time.
          </p>
          <a
            href="https://app.lesser.tax/auth/sign-up"
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

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-business-faq">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-faq-heading"
          >
            Common{" "}
            <span className="text-primary italic">Questions</span>
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

function CTASection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden" data-testid="section-business-cta">
      <div className="absolute inset-0 bg-foreground" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(3,79,70,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(3,79,70,0.08) 0%, transparent 60%)' }} />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="biz-cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#biz-cta-grid)" />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,79,70,0.3) 50%, transparent)' }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-heading"
        >
          File your business taxes for
          <br />
          <span className="relative text-primary">
            $100
            <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, rgba(3,79,70,0.8), rgba(3,79,70,0.2))' }} />
          </span>
        </h2>
        <p className={`text-sm text-white/40 mb-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} data-testid="text-cta-sub">
          Upload docs. Review your return. Pay only if satisfied.
        </p>
        <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://app.lesser.tax/auth/sign-up"
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
        <div className={`flex items-center justify-center gap-6 mt-10 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {["Flat-fee pricing", "No credit card required", "CPA-reviewed"].map((item, i) => (
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

function BusinessFooter() {
  return (
    <footer className="relative bg-foreground overflow-hidden" data-testid="section-footer">
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

export default function BusinessPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Business Tax Filing - Form 1120, 1065, 1120-S | Lesser</title>
        <meta name="description" content="File your business tax return for $100 flat fee. Form 1120, 1065, or 1120-S. CPA-reviewed, 48hr turnaround, review before you pay." />
        <meta property="og:title" content="Lesser — Business Tax Filing for $100" />
        <meta property="og:description" content="File your business tax return — Form 1120, 1065, or 1120-S. CPA-reviewed, 48hr turnaround. Upload docs and let our team handle the rest." />
        <meta property="og:image" content="https://lesser.tax/og-landing.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lesser — Business Tax Filing for $100" />
        <meta name="twitter:description" content="File your business tax return — Form 1120, 1065, or 1120-S. CPA-reviewed, 48hr turnaround. Upload docs and let our team handle the rest." />
        <meta name="twitter:image" content="https://lesser.tax/og-landing.jpg" />
      </Helmet>
      <SharedNavbar variant="business" sourcePage="/business" />
      <HeroSection />
      <TrustSignals />
      <FormTypesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <FitSection />
      <ComparisonSection />
      <TeamSection />
      <GoogleReviewsSection />
      <DeadlineSection />
      <FAQSection />
      <CTASection />
      <BusinessFooter />
    </div>
  );
}
