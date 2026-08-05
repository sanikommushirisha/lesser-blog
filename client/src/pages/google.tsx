import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  Shield,
  Globe,
  MessageSquare,
  Briefcase,
  BarChart3,
  Lock,
  Zap,
  Repeat,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import SharedNavbar from "@/components/shared-navbar";
import GoogleReviewsSection from "@/components/google-reviews-section";
import googleLogo from "@assets/image_1772826572976.png";
import lesserLogo from "@assets/lesser_blue_logo_1770346541058.png";
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
  const color = variant === "dark" ? "255,255,255" : "28,65,247";
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
            background: `rgba(28, 65, 247, ${0.2 - i * 0.035})`,
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

const compensationCardData = [
  {
    icon: Briefcase,
    title: "Your Compensation Package",
    subtitle: "Multiple income streams require specialized handling",
    details: [
      "Base salary with W-2 reporting",
      "Quarterly GSU/RSU vesting events",
      "ESPP participation and discount taxation",
      "Performance bonuses and deferred comp",
      "Brokerage gains from stock sales",
      "Possible crypto or foreign accounts",
    ],
  },
  {
    icon: TrendingUp,
    title: "Your Biggest Risk",
    subtitle: "Concentration risk and tax inefficiency",
    details: [
      "Too much net worth tied to one stock",
      "Unnecessary taxes on RSU vesting",
      "Missed capital gains optimization",
      "No year-round planning for equity events",
    ],
  },
  {
    icon: Shield,
    title: "What We Do About It",
    subtitle: "Proactive, equity-aware tax strategy",
    details: [
      "Understand your real after-tax exposure",
      "Identify smart diversification strategies",
      "Optimize capital gains timing across events",
      "Build a year-round equity tax plan",
    ],
  },
  {
    icon: BarChart3,
    title: "The Result",
    subtitle: "Measurable outcomes for your finances",
    details: [
      "Lower effective tax rate on equity income",
      "Strategic timing of stock sales and vesting",
      "Multi-state filing handled correctly",
      "Peace of mind with IRS-compliant filings",
    ],
  },
];

const equityStrategies = [
  {
    icon: Repeat,
    title: "Diversify Without a Giant Tax Bill",
    description: "Use Exchange Funds to reduce single-stock concentration while deferring capital gains taxes. Rebalance intelligently — without triggering a massive tax event.",
  },
  {
    icon: Lock,
    title: "Sell During Blackout Periods — Legally",
    description: "Set up 10b5-1 trading plans to automate stock sales — even during restricted windows. Execute diversification on your schedule, not the company's.",
  },
  {
    icon: TrendingUp,
    title: "Optimize Large Capital Gains",
    description: "Use strategic timing and tools like CRTs (Charitable Remainder Trusts) to reduce the tax impact of major liquidity events. Keep more of what you earn.",
  },
  {
    icon: BarChart3,
    title: "RSU & ESPP Expertise",
    description: "We reconcile W-2 and 1099-B reporting, prevent double taxation, optimize tax lots grant-by-grant, and handle ESPP lookback calculations. Every vest is accounted for correctly.",
  },
  {
    icon: Globe,
    title: "Multi-State Filing",
    description: "Moved mid-year? Working remotely? We allocate income accurately across states — avoiding costly overpayments or compliance risks.",
  },
  {
    icon: Shield,
    title: "Foreign Reporting & Cross-Border Compliance",
    description: "From FBAR to FATCA to foreign investments — we ensure proper disclosures and minimize risk. Stay compliant across jurisdictions.",
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
    title: "Share your returns and equity details",
    desc: "Upload your prior tax return and equity statements. We'll parse your documents and start analyzing your compensation structure.",
  },
  {
    title: "Receive a personalized tax plan",
    desc: "We analyze your RSUs, ESPP, capital gains, and multi-state exposure — then deliver a plan tailored to your situation.",
  },
  {
    title: "Expert execution and year-round support",
    desc: "Your CPA implements the strategy, files your returns, and stays available year-round for ongoing planning and questions.",
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
    subtitle: "Google employees with equity compensation & complex income",
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
    subtitle: "Senior leaders & executives who need proactive strategy",
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
    question: "Do you specialize in Google employees?",
    answer: "Yes. We focus on equity-heavy tech professionals. Our CPAs understand the nuances of GSUs, RSUs, ESPPs, and the complex compensation structures common at companies like Google."
  },
  {
    question: "Are these strategies compliant?",
    answer: "All planning and filing is CPA-reviewed and IRS-compliant. We follow best practices and stay current with tax law changes to ensure your returns are accurate and defensible."
  },
  {
    question: "Can you coordinate with my financial advisor?",
    answer: "Yes — we frequently collaborate to align tax and investment strategy. We can work directly with your advisor to ensure your tax plan and financial plan work together."
  },
  {
    question: "What makes you different from a traditional CPA?",
    answer: "We specialize in proactive equity compensation planning — not just year-end filing. We combine Big Four expertise with modern technology to deliver year-round tax strategy, not just a once-a-year return."
  },
];


function GoogleHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        <defs>
          <pattern id="google-hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#google-hero-grid)" style={{ animation: 'hero-grid-draw 2s ease-out forwards' }} />
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
      <div className="absolute top-[35%] left-[20%]" style={{ animation: 'hero-float-3 12s ease-in-out infinite' }}>
        <div className="w-8 h-8 rounded-lg border border-primary/6 bg-primary/[0.02] rotate-45" />
      </div>
      <div className="absolute bottom-[35%] right-[12%]" style={{ animation: 'hero-float-2 9s ease-in-out infinite 1s' }}>
        <div className="w-10 h-10 rounded-full border border-primary/8 bg-primary/[0.02]" />
      </div>
      <div className="absolute top-[60%] right-[25%]" style={{ animation: 'hero-float-1 11s ease-in-out infinite 2s' }}>
        <div className="w-6 h-6 rounded-md border border-primary/6 bg-primary/[0.015] rotate-12" />
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
      className="relative bg-white pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden"
      onMouseMove={handleMouseMove}
      data-testid="section-google-hero"
    >
      <GoogleHeroBackground />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`, transition: 'transform 0.3s ease-out' }}>
        <div className="absolute top-[18%] right-[18%] w-20 h-20 rounded-2xl border border-primary/8 bg-gradient-to-br from-primary/[0.04] to-transparent rotate-12" style={{ boxShadow: '0 12px 40px rgba(28,65,247,0.06)' }} />
        <div className="absolute bottom-[22%] left-[15%] w-14 h-14 rounded-xl border border-primary/6 bg-gradient-to-br from-primary/[0.03] to-transparent -rotate-12" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 mt-[50px] mb-[50px]" style={{ perspective: '1000px' }}>
        <div className="text-center" style={{ transform: `rotateX(${mousePos.y * -1}deg) rotateY(${mousePos.x * 1}deg)`, transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
          <div className="hero-text-reveal mb-5 flex justify-center">
            <img
              src={googleLogo}
              alt="Google"
              className="h-8 sm:h-10"
              data-testid="img-google-logo"
            />
          </div>

          <h1
            className="hero-text-reveal text-4xl sm:text-5xl lg:text-[75px] font-bold text-foreground tracking-tight mb-8"
            data-testid="text-google-hero-heading"
          >
            Tax Filing & Strategic Planning for
            <br />
            <span className="text-primary relative">
              Google Employees
              <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" style={{ animation: 'hero-text-reveal-sub 0.6s ease-out 1.2s both' }} />
            </span>
          </h1>

          <p
            className="hero-text-reveal-sub text-lg lg:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto"
            data-testid="text-google-hero-subheading"
          >
            Reduce taxes on your salary, GSUs, RSUs, and capital gains — with proactive planning and expert execution.
          </p>

          <div className="hero-checks-reveal inline-flex flex-col sm:flex-row gap-3 sm:gap-6 mb-12">
            <div className="flex items-center gap-2" data-testid="text-hero-benefit-0">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Personalized tax-saving opportunities</span>
            </div>
            <div className="flex items-center gap-2" data-testid="text-hero-benefit-1">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Year-round planning and filing included</span>
            </div>
          </div>

          <div className="hero-btn-appear flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://lesser.tax/app/auth/sign-up"
              className="hero-btn-3d inline-flex items-center gap-2 text-base font-semibold bg-primary text-white rounded-xl px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              data-testid="button-hero-cta"
            >
              Talk to Our Expert Team
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="hero-text-reveal-sub text-xs text-muted-foreground mt-6" data-testid="text-hero-microtext">
            Big Four-trained professionals. IRS-compliant. Built for equity compensation.
          </p>
        </div>
      </div>
    </section>
  );
}

function CompensationCard({ item, index, isVisible }: { item: typeof compensationCardData[0]; index: number; isVisible: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: y * -6, y: x * 6 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const IconComponent = item.icon;
  const baseDelay = index * 150;

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{ transitionDelay: `${baseDelay}ms`, perspective: '800px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      data-testid={`card-comp-${index}`}
    >
      <div
        className="relative h-full rounded-2xl overflow-hidden transition-shadow duration-500"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: 'transform 0.15s ease-out, box-shadow 0.4s ease-out',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '0 20px 60px -12px rgba(28,65,247,0.15), 0 0 0 1px rgba(28,65,247,0.1)'
            : '0 4px 16px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500" style={{
          opacity: isHovered ? 0.08 : 0,
          background: `radial-gradient(circle at ${50 + tilt.y * 8}% ${50 + tilt.x * -8}%, rgba(28,65,247,0.4) 0%, transparent 60%)`,
        }} />

        <div className="relative bg-white p-7 lg:p-8 h-full">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
              style={{
                background: isHovered
                  ? 'linear-gradient(135deg, rgba(28,65,247,0.15) 0%, rgba(28,65,247,0.05) 100%)'
                  : 'rgba(28,65,247,0.06)',
                transform: isHovered ? `translateZ(20px) rotate(${tilt.y * 0.5}deg)` : 'translateZ(0)',
              }}
            >
              <IconComponent className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 rounded-2xl border border-primary/10 transition-colors duration-500" style={{ borderColor: isHovered ? 'rgba(28,65,247,0.2)' : 'rgba(28,65,247,0.08)' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight" data-testid={`text-comp-title-${index}`}>{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
            </div>
          </div>

          <div className="space-y-2.5" style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0)', transition: 'transform 0.2s ease-out' }}>
            {item.details.map((detail, i) => (
              <div key={i} className="flex items-center gap-2.5" data-testid={`text-comp-detail-${index}-${i}`}>
                <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground leading-snug">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompensationSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-compensation">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 80% 20%, rgba(28,65,247,0.03) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 40% at 20% 80%, rgba(28,65,247,0.02) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/10 bg-primary/5 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]" data-testid="text-compensation-badge">Your Compensation Is Different</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-compensation-heading"
          >
            Your Income Isn't Just a{" "}
            <span className="text-primary italic">Paycheck.</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-compensation-intro"
          >
            At Google, your compensation is complex. We built our practice to handle every piece of it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {compensationCardData.map((item, index) => (
            <CompensationCard key={index} item={item} index={index} isVisible={isVisible} />
          ))}
        </div>

        <div className={`text-center mt-14 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex flex-col items-center gap-2 bg-white rounded-2xl border border-primary/15 shadow-[0_8px_32px_-4px_rgba(28,65,247,0.08)] px-8 py-6">
            <p className="text-xs text-muted-foreground" data-testid="text-equity-tagline">This isn't generic tax prep.</p>
            <p className="text-base font-bold text-primary" data-testid="text-equity-tagline-bold">This is equity-aware tax strategy.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EquityStrategiesSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-equity-strategies">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Advanced Equity Strategies</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-strategies-heading"
          >
            Built for <span className="text-primary italic">Equity-Heavy</span> Professionals
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equityStrategies.map((strategy, index) => {
            const baseDelay = 200 + index * 100;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={`card-strategy-${index}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-7">
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                    <strategy.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2" data-testid={`text-strategy-title-${index}`}>
                    {strategy.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-strategy-desc-${index}`}>
                    {strategy.description}
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

function TeamSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="team" className="relative py-20 lg:py-28 bg-white dark:bg-background overflow-hidden" data-testid="section-google-team">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
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
                className={`group relative rounded-3xl overflow-hidden transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 border border-blue-100/80 dark:border-border/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] flex flex-col ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms`, background: 'hsl(220 40% 95%)' }}
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
                    className={`text-xl lg:text-2xl font-bold text-foreground leading-tight mb-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
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
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
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
                className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
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
    { label: "1099-B", icon: BarChart3 },
    { label: "RSU Statement", icon: TrendingUp },
    { label: "Prior Return", icon: Shield },
  ];

  const step2Items = [
    { label: "RSU vesting schedule", status: "Optimized", color: "emerald" },
    { label: "Capital gains timing", status: "Analyzed", color: "primary" },
    { label: "Multi-state allocation", status: "Calculated", color: "amber" },
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
            className={`text-3xl sm:text-4xl lg:text-[52px] lg:leading-[1.1] font-bold text-foreground tracking-tight mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-how-it-works-heading"
          >
            Simple. Structured.{" "}
            <span className="text-primary italic">Proactive.</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            From document upload to year-round advisory — we handle every step.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          <div
            className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '300ms' }}
            data-testid="card-step-0"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  01
                </div>
                <h3 className="text-xl font-bold text-foreground" data-testid="text-step-0-title">{howItWorksSteps[0].title}</h3>
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
            className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '450ms' }}
            data-testid="card-step-1"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  02
                </div>
                <h3 className="text-xl font-bold text-foreground" data-testid="text-step-1-title">{howItWorksSteps[1].title}</h3>
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
            className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '600ms' }}
            data-testid="card-step-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  03
                </div>
                <h3 className="text-xl font-bold text-foreground" data-testid="text-step-2-title">{howItWorksSteps[2].title}</h3>
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
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-review">CPA Review Complete</p>
                    <p className="text-[11px] text-muted-foreground">Your return has been verified</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/[0.04] border border-primary/10">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-filed">Filed with IRS</p>
                    <p className="text-[11px] text-muted-foreground">Federal & state returns submitted</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-100">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-advisory">Year-Round Advisory</p>
                    <p className="text-[11px] text-muted-foreground">Ongoing tax planning access</p>
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
    <section ref={ref} id="pricing" className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-google-pricing">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-pricing-heading"
          >
            Transparent, <span className="text-primary italic">Flat-Fee</span> Pricing
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-pricing-subheading"
          >
            All plans include federal & state filing, expert CPA review, and year-round advisory access.
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
                    ? 'border-2 border-primary shadow-[0_8px_32px_-4px_rgba(28,65,247,0.15)] md:-translate-y-4 hover:shadow-[0_16px_48px_-8px_rgba(28,65,247,0.22)] hover:-translate-y-5'
                    : 'border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(28,65,247,0.12)] hover:border-primary/30 hover:-translate-y-1.5'
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
                  <h3 className="text-xl font-bold text-foreground mb-1" data-testid={`text-plan-name-${plan.id}`}>
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
    <section ref={ref} className="relative py-20 lg:py-28 bg-white overflow-hidden" data-testid="section-google-faq">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-faq-heading"
          >
            Frequently Asked{" "}
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
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden" data-testid="section-google-cta">
      <div className="absolute inset-0 bg-foreground" />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(28,65,247,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 100%, rgba(28,65,247,0.08) 0%, transparent 60%)' }} />

        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="g-cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g-cta-grid)" />
        </svg>
      </div>

      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(28,65,247,0.3) 50%, transparent)' }} />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-heading"
        >
          Stop letting taxes dictate your
          <br />
          <span className="relative">
            diversification decisions.
            <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, rgba(28,65,247,0.8), rgba(28,65,247,0.2))' }} />
          </span>
        </h2>

        <p
          className={`text-sm text-white/40 mb-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-urgency"
        >
          Peak vesting season fills quickly.
        </p>

        <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://lesser.tax/app/auth/sign-up"
            onClick={(e) => { createRipple(e); }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden cta-btn-shimmer"
            data-testid="button-cta-primary"
          >
            <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
              Book Your Free Tax Planning Consultation
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </div>

        <div className={`flex items-center justify-center gap-6 mt-10 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {["Flat-fee pricing", "No hourly billing", "Cancel anytime"].map((item, i) => (
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

function GoogleFooter() {
  return (
    <footer className="relative bg-foreground overflow-hidden" data-testid="section-footer">
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

export default function GooglePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Google Employee Tax Planning & Filing | Lesser</title>
        <meta name="description" content="Specialized tax planning for Google employees. Optimize your GSUs, RSUs, and ESPP with Big Four-trained CPAs. Flat-fee pricing and year-round support." />
        <meta property="og:title" content="Lesser — Tax Planning for Google Employees" />
        <meta property="og:description" content="Maximize your Google equity value. Expert CPA tax planning for GSUs, RSUs, and ESPP. Flat-fee, tech-forward service." />
        <meta property="og:image" content="https://lesser.tax/og-landing.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lesser — Tax Planning for Google Employees" />
        <meta name="twitter:description" content="Maximize your Google equity value. Expert CPA tax planning for GSUs, RSUs, and ESPP. Flat-fee, tech-forward service." />
        <meta name="twitter:image" content="https://lesser.tax/og-landing.jpg" />
      </Helmet>
      <SharedNavbar variant="individual" sourcePage="/offers/google" />
      <HeroSection />
      <CompensationSection />
      <EquityStrategiesSection />
      <TeamSection />
      <GoogleReviewsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <GoogleFooter />
    </div>
  );
}
