import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Shield,
  Globe,
  FileText,
  Building2,
  Landmark,
  DollarSign,
  Plane,
  Zap,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import SharedNavbar from "@/components/shared-navbar";
import GoogleReviewsSection from "@/components/google-reviews-section";
import lesserLogo from "@assets/lesser_logo.png";
import teamDavidImg from "@assets/team_david_clean.png";
import teamVishweshImg from "@assets/team_vishwesh_clean.png";
import teamJithendraImg from "@assets/team_jithendra_clean.png";
import teamRobertImg from "@assets/team_robert_clean.png";
import testimonialVinayImg from "@assets/testimonial_vinay.png";
import testimonialSrinivasImg from "@assets/testimonial_srinivas.png";
import testimonialGauravImg from "@assets/testimonial_gaurav.png";
import riverIslandHeroImg from "@assets/image_1771963802815.png";


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
  // `HTMLDivElement | null` rather than `HTMLDivElement`: with a bare `null`
  // initial value the returned ref object is readonly, which blocks callers
  // that need to attach this ref alongside one of their own.
  const ref = useRef<HTMLDivElement | null>(null);
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

function Custom3DCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const trailCount = 5;

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    document.body.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, .cursor-hover');
      setHovering(!!isInteractive);
    };

    let raf: number;
    const animate = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, 0.25);
      dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, 0.25);
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.12);
      glowPos.current.x = lerp(glowPos.current.x, mouse.current.x, 0.08);
      glowPos.current.y = lerp(glowPos.current.y, mouse.current.y, 0.08);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x - 4}px, ${dotPos.current.y - 4}px)`;
      }
      if (ringRef.current) {
        const size = hovering ? 50 : 36;
        ringRef.current.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${glowPos.current.x - 60}px, ${glowPos.current.y - 60}px)`;
      }

      trailsRef.current.forEach((trail, i) => {
        if (!trail) return;
        const delay = (i + 1) * 0.04;
        const tx = lerp(parseFloat(trail.dataset.x || '0'), mouse.current.x, 0.08 - delay);
        const ty = lerp(parseFloat(trail.dataset.y || '0'), mouse.current.y, 0.08 - delay);
        trail.dataset.x = String(tx);
        trail.dataset.y = String(ty);
        trail.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
        trail.style.opacity = String(0.3 - i * 0.06);
      });

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', checkHover, { passive: true });
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', checkHover);
      cancelAnimationFrame(raf);
      document.body.style.cursor = '';
    };
  }, [hovering]);

  if (isTouchDevice) return null;

  return (
    <>
      {Array.from({ length: trailCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailsRef.current[i] = el; }}
          data-x="-100" data-y="-100"
          className="fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none"
          style={{
            background: `rgba(3, 79, 70, ${0.2 - i * 0.035})`,
            zIndex: 9996 - i,
            willChange: 'transform',
          }}
        />
      ))}
      <div ref={glowRef} className="cursor-glow" style={{ willChange: 'transform' }} />
      <div ref={ringRef} className={`cursor-ring ${hovering ? 'hovering' : ''}`} style={{ willChange: 'transform' }} />
      <div ref={dotRef} className={`cursor-dot ${hovering ? 'hovering' : ''}`} style={{ willChange: 'transform' }} />
    </>
  );
}

const riskIndicators = [
  { icon: Building2, label: "NRE or NRO accounts" },
  { icon: BarChart3, label: "Indian mutual funds" },
  { icon: Landmark, label: "Rental income in India" },
  { icon: Plane, label: "Plans to move back to India" },
  { icon: Globe, label: "Green Card or H1B status" },
];

const coreAreas = [
  {
    id: "fbar",
    icon: Building2,
    num: "01",
    title: "FBAR (Foreign Bank Reporting)",
    description: "If your Indian accounts exceeded $10,000 at any point — FBAR may be required. Most people don't know this.",
    highlight: "We handle it properly.",
  },
  {
    id: "fatca",
    icon: FileText,
    num: "02",
    title: "FATCA (Form 8938)",
    description: "Certain foreign assets must be reported to the IRS. We calculate thresholds and file accurately.",
    highlight: "Full compliance guaranteed.",
  },
  {
    id: "pfic",
    icon: BarChart3,
    num: "03",
    title: "PFIC (Indian Mutual Funds)",
    description: "Most Indian mutual funds trigger PFIC rules. Handled incorrectly, they can increase taxes dramatically, create IRS exposure, and require Form 8621 filings.",
    highlight: "We prepare PFIC filings correctly.",
  },
  {
    id: "rnor",
    icon: Plane,
    num: "04",
    title: "RNOR Planning (Returning to India)",
    description: "Without RNOR strategy, you may pay unnecessary taxes, miss favorable timing windows, and create avoidable compliance issues.",
    highlight: "We help structure your transition.",
  },
];

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

const localTestimonials = [
  {
    id: "vinay",
    name: "Vinay",
    quote: "I had no idea my NRE accounts needed reporting. Lesser caught everything and filed my FBAR correctly. They saved me from serious penalties.",
    role: "Software Engineer, River Island",
    image: testimonialVinayImg,
  },
  {
    id: "srinivas",
    name: "Srinivas",
    quote: "My Indian mutual funds were creating PFIC exposure I didn't know about. The Lesser team handled the Form 8621 filings and optimized my tax position.",
    role: "Engineering Manager, River Island",
    image: testimonialSrinivasImg,
  },
  {
    id: "gaurav",
    name: "Gaurav",
    quote: "Planning to move back to India was stressful. Lesser helped me structure the transition with RNOR planning so I wouldn't get hit with double taxation.",
    role: "Product Manager, River Island",
    image: testimonialGauravImg,
  },
];

const plans = [
  {
    id: "essential",
    name: "Essential",
    price: 99,
    period: "/yr",
    subtitle: "Ideal for W-2 employees with straightforward tax needs",
    description: "INCLUDES:",
    featured: false,
    features: [
      "Federal & State Filing",
      "W-2 & Bank Interest",
      "Annual CPA Check-in",
      "Basic Deductions Review",
      "Standard Support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 399,
    period: "/yr",
    subtitle: "Tech professionals with equity compensation & complex income",
    description: "EVERYTHING IN ESSENTIAL, PLUS:",
    featured: true,
    features: [
      "RSU / ISO / NSO Planning",
      "Semi-Annual CPA Check-ins",
      "Foreign Reporting (FBAR / FATCA)",
      "Home Mortgage Optimization",
      "Priority Support",
    ],
  },
  {
    id: "private",
    name: "Private Client",
    price: 999,
    period: "/yr",
    subtitle: "Founders, investors & business owners who need proactive strategy",
    description: "EVERYTHING IN PREMIUM, PLUS:",
    featured: false,
    features: [
      "Quarterly CPA Strategy Calls",
      "Business & Rental Income",
      "Trust & Estate Planning",
      "Advanced Tax Strategies",
      "Dedicated Account Manager",
    ],
  },
];

const faqs = [
  {
    question: "Do you specialize in cross-border NRI tax filing?",
    answer: "Yes. Our CPAs and IRS Enrolled Agents are experienced in FBAR, FATCA, PFIC (Form 8621), Indian rental income, Foreign Tax Credits, and RNOR planning. We've handled hundreds of cross-border filings."
  },
  {
    question: "I have NRE/NRO accounts — do I need to file anything?",
    answer: "Likely yes. If the aggregate value of all your foreign accounts exceeds $10,000 at any point during the year, you must file an FBAR (FinCEN 114). FATCA filing (Form 8938) may also apply based on your asset thresholds. Penalties for non-filing can be severe."
  },
  {
    question: "What happens if I have Indian mutual funds?",
    answer: "Most Indian mutual funds are classified as PFICs (Passive Foreign Investment Companies) under U.S. tax law. Without proper Form 8621 filings, gains can be taxed at punitive rates with compounding interest penalties. We handle these filings correctly."
  },
  {
    question: "I'm planning to move back to India. Can you help?",
    answer: "Yes. We specialize in RNOR (Resident but Not Ordinarily Resident) planning to help you transition tax-efficiently. This includes timing of stock sales, repatriation of U.S. assets, and structuring your move to minimize double taxation."
  },
  {
    question: "How does pricing work?",
    answer: "We charge a flat annual fee based on your situation. No hourly billing, no surprise charges. We'll review your case and recommend the right plan before you commit."
  },
];

const urgencyItems = [
  { icon: AlertTriangle, text: "Foreign reporting penalties are real." },
  { icon: Clock, text: "PFIC mistakes compound over time." },
  { icon: Shield, text: "Unfiled FBARs can create serious exposure." },
];


function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { ref, isVisible } = useInView(0.1);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  return (
    <section
      ref={(el: HTMLDivElement | null) => {
        // One element, two refs: heroRef for the mouse-parallax measurements
        // and useInView's ref for the IntersectionObserver.
        heroRef.current = el;
        ref.current = el;
      }}
      className="relative bg-white dark:bg-background overflow-hidden pt-20 pb-10 lg:pt-28 lg:pb-20"
      onMouseMove={handleMouseMove}
      data-testid="section-hero"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
          <defs>
            <pattern id="ri-hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ri-hero-grid)" />
        </svg>
        <div className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[12%] w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.12) 0%, transparent 70%)' }} />
      </div>

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`, transition: 'transform 0.3s ease-out' }}>
        <div className="absolute top-[12%] right-[5%] w-16 h-16 rounded-2xl border border-primary/8 bg-gradient-to-br from-primary/[0.04] to-transparent rotate-12" />
        <div className="absolute bottom-[25%] left-[3%] w-12 h-12 rounded-xl border border-primary/6 bg-gradient-to-br from-primary/[0.03] to-transparent -rotate-12" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 mt-[40px] mb-[20px]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <div className="order-2 lg:order-1">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">River Islands Tax Specialists</span>
            </div>

            <h1
              className={`text-3xl sm:text-4xl lg:text-[48px] xl:text-[56px] font-extrabold tracking-[-0.03em] text-foreground tracking-tight leading-[1.65] mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              data-testid="text-hero-heading"
            >
              Your U.S.–India taxes,
              <br />
              <span className="text-primary relative inline-block mt-3">
                handled correctly
                <span className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/60 via-primary/30 to-transparent rounded-full" />
              </span>
            </h1>

            <p className={`text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} data-testid="text-hero-sub">
              Living in River Islands with Indian bank accounts, mutual funds, or rental income?
              Most CPAs miss these. <span className="font-semibold text-foreground">We don't.</span>
            </p>

            <div className={`flex flex-wrap gap-4 mb-8 transition-all duration-700 delay-250 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {[
                { label: "FBAR", icon: Building2 },
                { label: "FATCA", icon: FileText },
                { label: "PFIC", icon: BarChart3 },
                { label: "RNOR", icon: Plane },
              ].map((tag) => {
                const TagIcon = tag.icon;
                return (
                  <div key={tag.label} className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                    <div className="w-7 h-7 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center">
                      <TagIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{tag.label}</span>
                  </div>
                );
              })}
            </div>

            <div className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Button
                asChild
                size="lg"
                className="bg-primary text-white rounded-xl px-8 py-6 text-base font-semibold shadow-xl shadow-primary/20 btn-glow-effect overflow-hidden"
                data-testid="button-hero-cta"
              >
                <a href="https://app.lesser.tax/auth/sign-up">
                  <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
                    Book Your Free NRI Tax Review
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
              </Button>
            </div>

            <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              {["CPA & IRS EA reviewed", "No obligation", "Flat-fee pricing"].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/50" />
                  <span className="text-xs text-muted-foreground/60 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div
              className={`relative transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.96]'}`}
              style={{ transform: `perspective(1000px) rotateY(${mousePos.x * -2}deg) rotateX(${mousePos.y * 1.5}deg) ${isVisible ? '' : 'translateY(32px) scale(0.96)'}`, transition: 'transform 0.4s ease-out, opacity 1s ease-out' }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] border border-gray-200/60">
                <img
                  src={riverIslandHeroImg}
                  alt="River Islands community in Lathrop — lakefront homes and marina"
                  className="w-full h-auto object-cover aspect-[16/10]"
                  data-testid="img-hero-community"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-white/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-foreground leading-tight">River Islands, Lathrop</p>
                        <p className="text-[10px] text-muted-foreground">San Joaquin County, CA</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/90 backdrop-blur-sm text-white rounded-lg px-3 py-1.5 shadow-lg">
                    <p className="text-[10px] font-bold uppercase tracking-wider">NRI Community</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 z-10" style={{ transform: `translate(${mousePos.x * 4}px, ${mousePos.y * 4}px)`, transition: 'transform 0.3s ease-out' }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground leading-tight">100+ NRI Filings</p>
                    <p className="text-[9px] text-muted-foreground">Cross-border experts</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 z-10" style={{ transform: `translate(${mousePos.x * -3}px, ${mousePos.y * -3}px)`, transition: 'transform 0.3s ease-out' }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground leading-tight">From $99/yr</p>
                    <p className="text-[9px] text-muted-foreground">Flat-fee, no surprises</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function RiskCheckSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-risk-check">
      <SectionDecorations />
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-risk-heading"
          >
            If You Have{" "}
            <span className="text-primary">ANY</span> of These...
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            You likely have cross-border reporting requirements. Missing them can trigger penalties.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 max-w-4xl mx-auto">
          {riskIndicators.map((item, index) => {
            const Icon = item.icon;
            const baseDelay = 200 + index * 100;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden p-5 transition-all duration-500 hover:shadow-[0_8px_24px_-4px_rgba(3,79,70,0.1)] hover:border-primary/20 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-risk-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-red-500 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="text-[15px] font-semibold text-foreground leading-snug">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`text-center mt-10 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-base text-muted-foreground font-medium bg-amber-50/80 border border-amber-200/60 rounded-xl px-6 py-3 inline-flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>If you're unsure — it's better to <span className="font-bold text-foreground">review early</span>.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function CoreAreasSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" data-testid="section-core-areas">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Cross-Border Compliance</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-core-heading"
          >
            Core Areas of{" "}
            <span className="text-primary">Cross-Border Tax Compliance</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {coreAreas.map((area, index) => {
            const Icon = area.icon;
            const baseDelay = 200 + index * 150;
            return (
              <div
                key={area.id}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-area-${area.id}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-7 lg:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                      {area.num}
                    </div>
                    <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid={`text-area-title-${area.id}`}>{area.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid={`text-area-desc-${area.id}`}>
                    {area.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{area.highlight}</span>
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

function TeamSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="team" className="relative py-20 lg:py-28 bg-white dark:bg-background overflow-hidden" data-testid="section-team">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-team-heading"
          >
            We Specialize in{" "}
            <span className="text-primary">Indian Cross-Border Taxes</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Our team understands both U.S. and Indian compliance frameworks.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => {
            const baseDelay = 200 + index * 120;
            return (
              <div
                key={member.id}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 border border-[#e0e8e5] dark:border-border/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] flex flex-col ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
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

function LocalTestimonialsSection() {
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
            Trusted by{" "}
            <span className="text-primary">River Island families.</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            See why Indian professionals in River Island choose Lesser for cross-border tax compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {localTestimonials.map((testimonial, index) => {
            const baseDelay = 200 + index * 150;
            return (
              <div
                key={testimonial.id}
                className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-7 lg:p-8">
                  <div className={`mb-5 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                    style={{ transitionDelay: `${baseDelay + 200}ms` }}
                  >
                    <svg className="w-8 h-8 text-primary/20 group-hover:text-primary/35 transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/>
                    </svg>
                  </div>

                  <blockquote
                    className={`text-foreground leading-relaxed mb-6 text-[15px] transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${baseDelay + 300}ms` }}
                    data-testid={`text-quote-${testimonial.id}`}
                  >
                    "{testimonial.quote}"
                  </blockquote>

                  <div className={`flex items-center gap-3 pt-5 border-t border-border/40 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                    style={{ transitionDelay: `${baseDelay + 450}ms` }}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/15 flex-shrink-0 group-hover:border-primary/30 transition-colors duration-300">
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight" data-testid={`text-name-${testimonial.id}`}>
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-role-${testimonial.id}`}>
                        {testimonial.role}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
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

function PricingSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="pricing" className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-pricing">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-pricing-heading"
          >
            Everything included.{" "}
            <span className="text-primary">One flat fee.</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-pricing-subheading"
          >
            Annual tax preparation and filing, year-round planning, and equity advisory — all included in your personalized plan. No hourly billing. No surprise charges.
          </p>
        </div>

        <div className={`flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-14 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {["Federal & State Filing", "Expert CPA Review", "Year-Round Advisory"].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 border border-primary/10">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, index) => {
            const baseDelay = 200 + index * 150;
            return (
              <div
                key={plan.id}
                className={`group relative bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-700 ease-out ${
                  plan.featured
                    ? 'border-2 border-primary shadow-[0_8px_32px_-4px_rgba(3,79,70,0.15)] md:-translate-y-4 hover:shadow-[0_16px_48px_-8px_rgba(3,79,70,0.22)] hover:-translate-y-5'
                    : 'border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5'
                } ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.featured ? (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
                ) : (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                {plan.featured && (
                  <div className={`absolute -top-px left-1/2 -translate-x-1/2 translate-y-3 z-10 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                    style={{ transitionDelay: `${baseDelay + 300}ms` }}
                  >
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-lg shadow-primary/30" data-testid="badge-popular">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`p-7 lg:p-8 ${plan.featured ? 'pt-10' : ''}`}>
                  <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground mb-1" data-testid={`text-plan-name-${plan.id}`}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-5" data-testid={`text-plan-subtitle-${plan.id}`}>
                    {plan.subtitle}
                  </p>

                  <div className="mb-5">
                    <span className={`text-5xl font-bold tracking-tight ${plan.featured ? 'text-primary' : 'text-foreground'}`} data-testid={`text-plan-price-${plan.id}`}>
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  </div>

                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4" data-testid={`text-plan-desc-${plan.id}`}>
                    {plan.description}
                  </p>

                  <div className="border-t border-border/40 pt-5">
                    <ul className="space-y-3 mb-7">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.featured ? 'bg-primary/10' : 'bg-primary/5 group-hover:bg-primary/10'} transition-colors duration-300`}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={`w-full rounded-xl py-5 font-semibold transition-all duration-300 overflow-hidden ${
                        plan.featured
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 btn-glow-effect'
                          : 'bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 hover:border-primary/30'
                      }`}
                      data-testid={`button-plan-${plan.id}`}
                    >
                      <a href="https://app.lesser.tax/auth/sign-up">
                        <span className="btn-magnetic-text relative z-10 flex items-center justify-center gap-2">
                          {plan.featured ? 'Get Started' : 'Learn More'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`text-center mt-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <Button
            asChild
            size="lg"
            className="bg-primary text-white rounded-xl px-8 py-6 text-base font-semibold shadow-xl shadow-primary/20 btn-glow-effect overflow-hidden"
            data-testid="button-pricing-consultation"
          >
            <a href="https://app.lesser.tax/auth/sign-up">
              <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
                Get a Free Review Before You Pay
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-3" data-testid="text-pricing-cta-sub">We recommend the right plan after reviewing your case.</p>
        </div>
      </div>
    </section>
  );
}

function UrgencySection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-16 lg:py-20 bg-muted/30 overflow-hidden" data-testid="section-urgency">
      <SectionDecorations />
      <div className="relative max-w-4xl mx-auto px-6">
        <div className="grid sm:grid-cols-3 gap-5">
          {urgencyItems.map((item, index) => {
            const Icon = item.icon;
            const baseDelay = 200 + index * 120;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden p-6 text-center transition-all duration-500 hover:shadow-[0_8px_24px_-4px_rgba(3,79,70,0.1)] hover:border-primary/20 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-urgency-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-400 via-red-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center group-hover:bg-red-100 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { ref, isVisible } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} id="faq" className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-faq">
      <SectionDecorations />
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-faq-heading"
          >
            Frequently{" "}
            <span className="text-primary">asked questions</span>
          </h2>
        </div>

        <div className="space-y-4">
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
                    <p className="text-muted-foreground leading-relaxed" data-testid={`text-faq-answer-${index}`}>
                      {faq.answer}
                    </p>
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
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden" data-testid="section-cta">
      <div className="absolute inset-0 bg-foreground" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(3,79,70,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(3,79,70,0.08) 0%, transparent 60%)' }} />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="ri-cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ri-cta-grid)" />
        </svg>
      </div>

      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,79,70,0.3) 50%, transparent)' }} />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-heading"
        >
          Don't Guess With{" "}
          <span className="relative">
            Cross-Border Taxes.
            <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, rgba(3,79,70,0.8), rgba(3,79,70,0.2))' }} />
          </span>
        </h2>

        <p
          className={`text-lg text-white/55 mb-12 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-subheading"
        >
          30-minute consultation. No pressure. Let us review your situation.
        </p>

        <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://app.lesser.tax/auth/sign-up"
            onClick={(e) => { createRipple(e); }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden cta-btn-shimmer"
            data-testid="button-cta-primary"
          >
            <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
              Book Your Free River Island NRI Tax Review
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </div>

        <div className={`flex items-center justify-center gap-6 mt-10 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {["Flat-fee pricing", "No hourly billing", "India–U.S. treaty aware"].map((item, i) => (
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

function RiFooter() {
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

export default function RiverIslandPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>River Islands NRI Tax Filing - Cross-Border U.S.-India Tax Services | Lesser</title>
        <meta name="description" content="Expert U.S.-India tax filing for NRI families in River Islands, Lathrop CA. FBAR, FATCA, PFIC, rental income, and RNOR planning. Flat-fee pricing." />
        <meta property="og:title" content="Lesser — NRI Tax Specialists for River Islands Families" />
        <meta property="og:description" content="Localized U.S.-India tax expertise for the River Islands community in Lathrop, CA. FBAR, FATCA, and PFIC compliance by experts." />
        <meta property="og:image" content="https://lesser.tax/og-riverisland.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lesser — NRI Tax Specialists for River Islands Families" />
        <meta name="twitter:description" content="Localized U.S.-India tax expertise for the River Islands community in Lathrop, CA. FBAR, FATCA, and PFIC compliance by experts." />
        <meta name="twitter:image" content="https://lesser.tax/og-riverisland.jpg" />
      </Helmet>
      <SharedNavbar variant="individual" sourcePage="/offers/riverisland" />
      <HeroSection />
      <RiskCheckSection />
      <CoreAreasSection />
      <TeamSection />
      <GoogleReviewsSection />
      <PricingSection />
      <UrgencySection />
      <FAQSection />
      <CTASection />
      <RiFooter />
    </div>
  );
}
