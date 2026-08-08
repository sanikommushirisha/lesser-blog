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
  Users,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import lesserLogo from "@assets/lesser_logo.png";
import teamDavidImg from "@assets/team_david_clean.png";
import teamVishweshImg from "@assets/team_vishwesh_clean.png";
import teamJithendraImg from "@assets/team_jithendra_clean.png";
import teamRobertImg from "@assets/team_robert_clean.png";
import nriHeroImg from "@assets/nri_hero_professional.png";
import SharedNavbar from "@/components/shared-navbar";
import GoogleReviewsSection from "@/components/google-reviews-section";


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

const keyAreas = [
  {
    id: "fbar",
    icon: Building2,
    title: "Indian Bank Accounts (NRE / NRO)",
    description: "If your total foreign account balance exceeds $10,000 at any point, you must file FBAR (FinCEN Form 114). Penalties for non-filing can be severe — even if no tax is owed.",
    highlight: "We ensure full compliance.",
  },
  {
    id: "fatca",
    icon: FileText,
    title: "FATCA (Form 8938)",
    description: "Indian bank accounts, brokerage accounts, foreign pension accounts, and ownership in Indian entities must be disclosed under FATCA.",
    highlight: "We determine whether you must file — and prepare it accurately.",
  },
  {
    id: "pfic",
    icon: BarChart3,
    title: "PFIC Filings (Indian Mutual Funds)",
    description: "Most Indian mutual funds are classified as PFICs under U.S. tax law. Without proper Form 8621 filing, gains can be taxed at punitive rates with interest penalties.",
    highlight: "We handle PFIC calculations properly — including elections and annual reporting.",
  },
  {
    id: "rental",
    icon: Landmark,
    title: "Indian Rental Income",
    description: "Own property in India? We help with reporting rental income in the U.S., claiming Foreign Tax Credit, avoiding double taxation, and currency conversion handling.",
    highlight: "No double taxation on your Indian property.",
  },
  {
    id: "ftc",
    icon: DollarSign,
    title: "Foreign Tax Credits (India–U.S. Treaty)",
    description: "Paid tax in India? You may be able to reduce your U.S. tax using the Foreign Tax Credit. We ensure proper credit calculation and treaty benefits applied correctly.",
    highlight: "Maximize your treaty benefits.",
  },
  {
    id: "rnor",
    icon: Plane,
    title: "RNOR Planning (Returning to India)",
    description: "Planning to move back? RNOR status impacts tax on foreign income, timing of stock sales, repatriation of U.S. assets, and investment account structures.",
    highlight: "We help you plan your exit strategically — before relocating.",
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

const testimonials = [
  {
    id: "t1",
    quote: "This is the future. The portal is user friendly, tech forward, and made doc upload super easy. I can see exactly where everything is in the process. Having a real CPA in the loop when I need them is great.",
    role: "Director of Product, Public Tech Company",
  },
  {
    id: "t2",
    quote: "I don't have the time and energy to optimize my entire tax picture with options, RSUs, and AMT carryforwards. The Lesser team are truly experts at building tax strategies for equity comp.",
    role: "People Leader, Series C Startup",
  },
  {
    id: "t3",
    quote: "I needed on demand help and your team was responsive throughout. Not only did you provide quick advice, but you were professional, timely, and thoughtful. It was so hard to ask my accountant these questions before.",
    role: "Software Engineer, AI Research Lab",
  },
  {
    id: "t4",
    quote: "My tax advisor was thorough and responsive. They answered all my questions and explained in very clear terms. Professional and timely responses from high quality CPAs.",
    role: "Head of Growth, Series D Startup",
  },
];

const howItWorksSteps = [
  {
    title: "We assess your U.S. residency status",
    desc: "We determine your tax residency, identify required disclosures (FBAR, FATCA, PFIC), and map your India + U.S. filing obligations.",
  },
  {
    title: "We prepare and file accurately",
    desc: "Your dedicated tax professional handles all cross-border forms, treaty calculations, and ensures every filing is accurate and compliant.",
  },
  {
    title: "Ongoing compliance support",
    desc: "We stay with you year-round for continued compliance, planning, and any changes in your residency or financial situation.",
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
    question: "Do you specialize in NRI tax filing?",
    answer: "Yes. We focus on cross-border tax compliance for Indian immigrants in the U.S. Our team understands both U.S. and Indian tax frameworks — from FBAR and FATCA to PFIC and RNOR planning."
  },
  {
    question: "What happens if I haven't filed FBAR in past years?",
    answer: "There are IRS programs available for catching up on missed FBAR filings. We can help you understand your options and get compliant without unnecessary risk. Penalties for willful non-filing can be severe, so it's important to address this proactively."
  },
  {
    question: "Are Indian mutual funds really taxed differently?",
    answer: "Yes. Most Indian mutual funds are classified as PFICs (Passive Foreign Investment Companies) under U.S. tax law. Without proper Form 8621 filing, gains can be taxed at punitive rates with interest penalties. We handle these calculations properly."
  },
  {
    question: "Can you help me plan my return to India?",
    answer: "Absolutely. We help with RNOR (Resident but Not Ordinarily Resident) planning, timing stock sales, structuring investment accounts, and repatriating U.S. assets — all before you relocate."
  },
  {
    question: "Do you work with all visa types?",
    answer: "Yes — we work with F1, H1B, L1, O1 visa holders, Green Card holders, and dual-filers. Your visa type affects your residency status and filing requirements, and we account for all of this."
  },
];

const whoWeServe = [
  { label: "F1, H1B, L1, O1 Visa Holders", icon: Users },
  { label: "Green Card Holders", icon: Shield },
  { label: "Indian Professionals in Tech", icon: Globe },
  { label: "NRIs with Indian Mutual Funds", icon: BarChart3 },
  { label: "Families with NRE/NRO Accounts", icon: Building2 },
  { label: "Planning to Return to India", icon: Plane },
  { label: "Dual-Filers (India + U.S.)", icon: FileText },
];


function HeroSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="relative min-h-[85vh] flex items-center overflow-hidden pt-20" data-testid="section-nri-hero">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary/[0.02] to-primary/[0.05]" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[10%] right-[5%] w-72 h-72 rounded-full section-bg-float" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[15%] left-[3%] w-56 h-56 rounded-full section-bg-float-reverse" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">India–U.S. Tax Experts</span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight leading-[1.1] mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              data-testid="text-hero-heading"
            >
              U.S. & India Tax Filing
              <br />
              <span className="text-primary">for NRIs</span> Living in America
            </h1>

            <p
              className={`text-lg lg:text-xl text-muted-foreground leading-relaxed mb-4 max-w-xl transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              data-testid="text-hero-subtitle"
            >
              Holding Indian bank accounts? Own Indian mutual funds? Planning to move back to India someday?
            </p>

            <p
              className={`text-base text-foreground font-medium mb-8 max-w-xl transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              We help NRIs file correctly in the U.S. — without missing FBAR, FATCA, or PFIC rules.
            </p>

            <div className={`flex flex-wrap gap-4 mb-8 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Button
                asChild
                size="lg"
                className="bg-primary text-white rounded-xl px-8 py-6 text-base font-semibold shadow-xl shadow-primary/20 btn-glow-effect overflow-hidden"
                data-testid="button-hero-cta"
              >
                <a href="https://lesser.tax/app/auth/sign-up">
                  <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
                    Book a Free NRI Tax Consultation
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>
              </Button>
            </div>

            <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {["India–U.S. treaty aware", "FBAR & FATCA compliant", "PFIC expertise"].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/60" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-primary/10">
              <img
                src={nriHeroImg}
                alt="Indian professional in the United States"
                className="w-full h-auto object-cover"
                data-testid="img-hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">100% Compliant</p>
                <p className="text-xs text-muted-foreground">FBAR · FATCA · PFIC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyNrisSection() {
  const { ref, isVisible } = useInView();

  const challenges = [
    "Taxed on worldwide income",
    "Required to report Indian bank accounts",
    "Subject to PFIC rules on Indian mutual funds",
    "Navigating NRE / NRO reporting",
    "Claiming Foreign Tax Credits",
    "Planning RNOR status before moving back",
  ];

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" data-testid="section-why-nris">
      <SectionDecorations />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Why NRIs Need Specialized Help</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              data-testid="text-why-heading"
            >
              Moving to the U.S.{" "}
              <span className="text-primary">changes everything.</span>
            </h2>

            <p
              className={`text-lg text-muted-foreground leading-relaxed mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              data-testid="text-why-desc"
            >
              As an Indian immigrant in the U.S., you may now be:
            </p>

            <div className="space-y-3">
              {challenges.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${300 + index * 80}ms` }}
                  data-testid={`text-challenge-${index}`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border p-8 lg:p-10 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-t-2xl" />

              <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground mb-4" data-testid="text-bridge-heading">
                We bridge both worlds.
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Most U.S. CPAs don't understand Indian tax structures. Most Indian CAs don't understand U.S. reporting.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/[0.03] rounded-xl p-5 border border-primary/10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-primary">🇺🇸</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">U.S. Tax Law</p>
                  <p className="text-xs text-muted-foreground mt-1">IRS compliance & filing</p>
                </div>
                <div className="bg-primary/[0.03] rounded-xl p-5 border border-primary/10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-primary">🇮🇳</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Indian Tax Law</p>
                  <p className="text-xs text-muted-foreground mt-1">Cross-border structures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KeyAreasSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white dark:bg-background overflow-hidden" data-testid="section-key-areas">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Key Areas We Handle</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-areas-heading"
          >
            Comprehensive NRI{" "}
            <span className="text-primary">tax coverage.</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            From FBAR to RNOR — we handle the most complex NRI tax situations with precision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyAreas.map((area, index) => {
            const baseDelay = 200 + index * 120;
            const Icon = area.icon;
            return (
              <div
                key={area.id}
                className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-area-${area.id}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-7 lg:p-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-extrabold tracking-[-0.03em] text-foreground mb-3" data-testid={`text-area-title-${area.id}`}>
                    {area.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {area.description}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {area.highlight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhoWeServeSection() {
  const { ref, isVisible } = useInView();

  // Two-green rule: these cards differentiate by depth within the brand
  // green (#034f46 → #056b5e → #023d35 → #011f1a), not by hue.
  const accentColors = [
    { bg: 'from-[#034f46]/10 to-[#034f46]/5', border: 'border-[#034f46]/20', iconBg: 'bg-[#034f46]', text: 'text-[#034f46]' },
    { bg: 'from-[#056b5e]/10 to-[#056b5e]/5', border: 'border-[#056b5e]/25', iconBg: 'bg-[#056b5e]', text: 'text-[#034f46]' },
    { bg: 'from-[#023d35]/10 to-[#023d35]/5', border: 'border-[#023d35]/20', iconBg: 'bg-[#023d35]', text: 'text-[#023d35]' },
    { bg: 'from-[#011f1a]/10 to-[#011f1a]/5', border: 'border-[#011f1a]/20', iconBg: 'bg-[#011f1a]', text: 'text-[#011f1a]' },
    { bg: 'from-[#034f46]/10 to-[#056b5e]/5', border: 'border-[#034f46]/20', iconBg: 'bg-[#034f46]', text: 'text-[#034f46]' },
    { bg: 'from-[#056b5e]/10 to-[#034f46]/5', border: 'border-[#056b5e]/25', iconBg: 'bg-[#056b5e]', text: 'text-[#034f46]' },
    { bg: 'from-primary/10 to-[#056b5e]/5', border: 'border-primary/20', iconBg: 'bg-primary', text: 'text-primary' },
  ];

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden" data-testid="section-who-we-serve">
      <div className="absolute inset-0 bg-foreground" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(3,79,70,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(3,79,70,0.06) 0%, transparent 60%)' }} />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="serve-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#serve-grid)" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em]">Who we serve</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white tracking-tight mb-5 transition-all duration-700 delay-75 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-serve-heading"
          >
            Built for{" "}
            <span className="relative">
              NRIs like you.
              <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, rgba(3,79,70,0.8), rgba(3,79,70,0.2))' }} />
            </span>
          </h2>
          <p className={`text-lg text-white/50 max-w-2xl mx-auto transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            We work with Indian professionals across every visa type and life stage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {whoWeServe.map((item, index) => {
            const Icon = item.icon;
            const baseDelay = 200 + index * 80;
            const color = accentColors[index % accentColors.length];
            return (
              <div
                key={index}
                className={`group relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-serve-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${color.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] font-semibold text-white leading-snug block">{item.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        <div className={`text-center mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://lesser.tax/app/auth/sign-up"
            onClick={(e) => { createRipple(e); }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden cta-btn-shimmer"
            data-testid="button-serve-cta"
          >
            <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
              Talk to an expert
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="team" className="relative py-20 lg:py-28 bg-white dark:bg-background overflow-hidden" data-testid="section-nri-team">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-team-heading"
          >
            Built by{" "}
            <span className="text-primary">cross-border tax professionals</span>
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
            Trusted by{" "}
            <span className="text-primary">high-impact professionals.</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-testimonials-subheading"
          >
            See why tech professionals trust Lesser with their most complex tax situations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => {
            const baseDelay = 200 + index * 150;
            return (
              <div
                key={testimonial.id}
                className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-8 lg:p-10">
                  <div className={`mb-5 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                    style={{ transitionDelay: `${baseDelay + 200}ms` }}
                  >
                    <svg className="w-10 h-10 text-primary/20 group-hover:text-primary/35 transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
                      <span className="text-sm font-bold text-primary">{testimonial.role.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight" data-testid={`text-role-${testimonial.id}`}>
                        {testimonial.role}
                      </p>
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

function HowItWorksSection() {
  const { ref, isVisible } = useInView();

  const step1Docs = [
    { label: "W-2", icon: FileText },
    { label: "Indian Statements", icon: Building2 },
    { label: "Prior Return", icon: Shield },
  ];

  const step2Items = [
    { label: "FBAR & FATCA disclosure", status: "Identified", color: "emerald" },
    { label: "PFIC calculations", status: "Computed", color: "primary" },
    { label: "Treaty credits mapped", status: "Applied", color: "amber" },
  ];

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">How It Works</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-[52px] lg:leading-[1.1] font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-how-it-works-heading"
          >
            Clear guidance.{" "}
            <span className="text-primary">No surprises.</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            From document upload to year-round compliance — we handle every step.
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
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  01
                </div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-0-title">{howItWorksSteps[0].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-0-desc">
                {howItWorksSteps[0].desc}
              </p>

              <div className="relative rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-5 text-center group-hover:border-primary/30 transition-colors duration-300">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/8 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium mb-3">
                  Upload or <span className="text-primary font-semibold">snap a photo</span>
                </p>
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
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  02
                </div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-1-title">{howItWorksSteps[1].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-1-desc">
                {howItWorksSteps[1].desc}
              </p>

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
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  03
                </div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-2-title">{howItWorksSteps[2].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-2-desc">
                {howItWorksSteps[2].desc}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-review">CPA/EA Review Complete</p>
                    <p className="text-[11px] text-muted-foreground">All cross-border forms verified</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/[0.04] border border-primary/10">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-filed">Filed with IRS</p>
                    <p className="text-[11px] text-muted-foreground">Federal, state & FBAR submitted</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-100">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-advisory">Year-Round Compliance</p>
                    <p className="text-[11px] text-muted-foreground">Ongoing cross-border support</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-amber-500 ml-auto flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`text-center mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <Button
            asChild
            size="lg"
            className="bg-primary text-white rounded-xl px-8 py-6 text-base font-semibold shadow-xl shadow-primary/20 btn-glow-effect overflow-hidden"
            data-testid="button-how-it-works-cta"
          >
            <a href="https://lesser.tax/app/auth/sign-up">
              <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
                Talk to our expert team
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="pricing" className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-nri-pricing">
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
                  </div>

                  <Button
                    asChild
                    className={`w-full transition-all duration-300 overflow-hidden relative ${plan.featured ? 'bg-primary text-white shadow-lg shadow-primary/20 btn-glow-effect' : 'group-hover:border-primary/40 group-hover:text-primary'}`}
                    variant={plan.featured ? 'default' : 'outline'}
                    size="lg"
                    data-testid={`button-plan-${plan.id}`}
                  >
                    <a href="https://lesser.tax/app/auth/sign-up">
                      <span className="btn-magnetic-text relative z-10">Get Started</span>
                    </a>
                  </Button>
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
            <a href="https://lesser.tax/app/auth/sign-up">
              <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
                Get a Free Tax Planning Consultation
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-3" data-testid="text-pricing-cta-sub">We'll recommend the right plan before you commit.</p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-nri-faq">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-faq-heading"
          >
            Frequently Asked{" "}
            <span className="text-primary">Questions</span>
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
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden" data-testid="section-nri-cta">
      <div className="absolute inset-0 bg-foreground" />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(3,79,70,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(3,79,70,0.08) 0%, transparent 60%)' }} />

        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="nri-cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nri-cta-grid)" />
        </svg>
      </div>

      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,79,70,0.3) 50%, transparent)' }} />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-heading"
        >
          U.S.–India tax rules are{" "}
          <span className="relative">
            complex.
            <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, rgba(3,79,70,0.8), rgba(3,79,70,0.2))' }} />
          </span>
        </h2>

        <p
          className={`text-lg text-white/60 mb-3 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          Penalties for mistakes are real. Most NRIs are unknowingly non-compliant.
        </p>

        <p
          className={`text-sm text-white/40 mb-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-urgency"
        >
          FBAR. FATCA. PFIC. RNOR — handled correctly.
        </p>

        <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://lesser.tax/app/auth/sign-up"
            onClick={(e) => { createRipple(e); }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden cta-btn-shimmer"
            data-testid="button-cta-primary"
          >
            <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
              Schedule Your Free NRI Tax Consultation
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

function NriFooter() {
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

export default function NrisPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>NRI Tax Filing - U.S. & India Cross-Border Tax Services | Lesser</title>
        <meta name="description" content="Expert U.S.-India tax filing for NRIs. FBAR, FATCA, PFIC, rental income, foreign tax credits, and RNOR planning. Flat-fee pricing from $99." />
        <meta property="og:title" content="Lesser — U.S. & India Tax Experts for NRIs" />
        <meta property="og:description" content="Comprehensive cross-border tax compliance. FBAR, FATCA, and PFIC expertise for Indian professionals in the U.S." />
        <meta property="og:image" content="https://lesser.tax/og-nri.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lesser — U.S. & India Tax Experts for NRIs" />
        <meta name="twitter:description" content="Comprehensive cross-border tax compliance. FBAR, FATCA, and PFIC expertise for Indian professionals in the U.S." />
        <meta name="twitter:image" content="https://lesser.tax/og-nri.jpg" />
      </Helmet>
      <SharedNavbar variant="individual" sourcePage="/nris" />
      <HeroSection />
      <WhyNrisSection />
      <KeyAreasSection />
      <WhoWeServeSection />
      <TeamSection />
      <GoogleReviewsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <NriFooter />
    </div>
  );
}
