import { 
  CheckCircle2, 
  X,
  ArrowRight,
  FileText,
  ChevronDown,
  MessageSquare,
  Eye,
  Cpu,
  Award,
  Zap,
  HeartHandshake,
  DollarSign,
  AlertTriangle,
  Clock,
  Ban,
  Receipt,
  ShieldCheck,
  Lock,
  FileCheck,
  Upload,
  TrendingUp,
  UserCheck,
  CreditCard,
  Building,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SharedNavbar from "@/components/shared-navbar";
import GoogleReviewsSection from "@/components/google-reviews-section";
import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import lesserLogo from "@assets/lesser_logo.png";
import teamDavidImg from "@assets/team_david_clean.png";
import teamVishweshImg from "@assets/team_vishwesh_clean.png";
import teamJithendraImg from "@assets/team_jithendra_clean.png";
import teamRobertImg from "@assets/team_robert_clean.png";
import socBadge from "@assets/soc_2_1770525581521.png";
import irsBadge from "@assets/irs_1770525648550.png";
import encryptionBadge from "@assets/image_1771470632228.png";


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

function useMagneticButton(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

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

const savingsShowcase = [
  {
    amount: "$1,200",
    label: "tax savings",
    items: ["RSU sale timing", "Capital loss utilization", "HSA undercontribution adjustment"],
  },
  {
    amount: "$17,000",
    label: "tax savings",
    items: ["Stock option exercise timing", "Married filing separately strategy"],
  },
  {
    amount: "$15,000",
    label: "tax savings",
    items: ["401(k) pre-tax contribution maximization", "HSA contribution maximization", "Pre-tax vs Roth allocation"],
  },
  {
    amount: "$25,000",
    label: "tax savings",
    items: ["Appreciated stock donation", "Qualifying stock disposition", "Acceleration of donation strategy ahead of 2026 law change"],
  },
  {
    amount: "$175,000",
    label: "tax savings",
    items: ["Donor-advised fund contribution", "ISO exercise timing optimization", "High-income year timing strategy"],
  },
  {
    amount: "$15,000",
    label: "found deductions",
    items: ["State-specific 529 treatment", "Dependent care contributions"],
  },
  {
    amount: "$35,000",
    label: "AMT reduction",
    items: ["Marriage filing and dual state residency strategy", "ISO/NSO exercise timing", "Backdoor Roth conversion"],
  },
];

const comparisonRows = [
  { num: "01", category: "Expertise", icon: Award, lesser: "Built for equity & complexity", traditional: "Generalist approach" },
  { num: "02", category: "Technology", icon: Zap, lesser: "Intelligent automation, zero friction", traditional: "Manual back-and-forth" },
  { num: "03", category: "Service", icon: HeartHandshake, lesser: "Proactive year-round planning", traditional: "File and forget" },
  { num: "04", category: "Pricing", icon: DollarSign, lesser: "Flat annual fee", traditional: "Hourly billing, no cap" },
];

const modernCpaFeatures = [
  {
    icon: FileText,
    title: "Tax prep without the busywork",
    description: "Connect your financial accounts to share data automatically. Answer a few questions, upload remaining documents, and watch everything come together in real-time. No endless email chains, no wondering where things stand.",
  },
  {
    icon: MessageSquare,
    title: "Direct messaging with zero guilt",
    description: "Flat annual fee means you can message your CPA without calculating the cost per question.",
  },
  {
    icon: Eye,
    title: "Total transparency",
    description: "See your return status, next steps, and timeline. No more black holes.",
  },
  {
    icon: Cpu,
    title: "AI that catches what others miss",
    description: "Our AI platform works alongside your tax team to scan for thousands of potential issues. You get the judgment of world class human expertise with the precision of automation.",
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
    question: "How does pricing work and what's included?",
    answer: "We charge a flat annual fee based on your situation's complexity. Your personalized quote includes everything: federal and state filing, year-round advisory with your CPA, platform access to message us anytime, guidance for estimated quarterly payments, and equity compensation planning. No hourly billing, no surprise charges."
  },
  {
    question: "How do you help with equity compensation and quarterly taxes?",
    answer: "Our team specializes in equity decisions: ISO/NSO exercise timing, AMT calculations, tender offer analysis, and liquidity event planning. We also determine whether you need to make estimated quarterly tax payments and notify you before deadlines to avoid penalties and surprises."
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes. We use bank-level encryption, are SOC 2 compliant, and are an IRS Authorized e-File Provider. Your data is never sold or shared."
  },
  {
    question: "My income is not complex. Can you help me reduce my taxes?",
    answer: "If your income is primarily W-2 and you're already maxing your 401(k) and HSA, there's limited additional tax optimization available. But if you have equity compensation, side income, or investment gains, we can often find meaningful savings."
  },
  {
    question: "How does the service work throughout the year?",
    answer: "You'll work with our team of CPAs via our platform. We handle your annual filing and connect quarterly for proactive planning. This includes reviewing your situation, calculating estimates, and identifying tax-saving opportunities. Message us anytime; we're responsive year-round, not just during tax season."
  },
  {
    question: "Do I get to talk to a real person?",
    answer: "Yes! Every client is matched with a dedicated CPA who knows your situation. You'll have direct access via chat, video calls, and email throughout the year."
  }
];

function AnnouncementBanner() {
  return (
    <div className="bg-foreground text-background text-center py-2.5 px-4 text-sm" data-testid="banner-announcement">
      <span className="text-background/80">Limited availability:</span>{" "}
      <span className="font-medium">Now accepting new clients for 2026 tax season</span>
      <span className="text-background/80"> — Spots filling fast</span>
      <a
        href="https://app.lesser.tax/auth/sign-up"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-3 text-primary font-semibold underline underline-offset-2 cursor-pointer"
        data-testid="link-banner-apply"
      >
        Apply now
      </a>
    </div>
  );
}


function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" style={{ animation: 'hero-grid-draw 2s ease-out forwards' }} />
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

const ROTATING_WORDS = ["tech employees", "business owners", "solopreneurs"];
const WORD_HOLD = 2800;
const CHAR_STAGGER = 40;
const EXIT_DURATION = 400;

function RotatingWords() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering");
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) return;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    const word = ROTATING_WORDS[activeIndex];
    const enterTime = word.length * CHAR_STAGGER + 400;

    t1 = setTimeout(() => setPhase("visible"), enterTime);
    t2 = setTimeout(() => setPhase("exiting"), enterTime + WORD_HOLD);
    t3 = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      setPhase("entering");
    }, enterTime + WORD_HOLD + EXIT_DURATION);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [activeIndex]);

  const word = ROTATING_WORDS[activeIndex];
  const chars = word.split("");

  return (
    <span className="text-primary relative inline-block overflow-hidden" style={{ height: '1.2em', verticalAlign: 'bottom' }} data-testid="text-hero-rotating">
      <span className="inline-block" key={activeIndex}>
        {chars.map((char, i) => (
          <span
            key={`${activeIndex}-${i}`}
            className="inline-block"
            style={{
              transition: phase === "exiting"
                ? `opacity 0.3s ease ${(chars.length - 1 - i) * 20}ms, transform 0.3s ease ${(chars.length - 1 - i) * 20}ms, filter 0.3s ease ${(chars.length - 1 - i) * 20}ms`
                : `opacity 0.45s cubic-bezier(0.16,1,0.3,1) ${i * CHAR_STAGGER}ms, transform 0.45s cubic-bezier(0.16,1,0.3,1) ${i * CHAR_STAGGER}ms, filter 0.45s cubic-bezier(0.16,1,0.3,1) ${i * CHAR_STAGGER}ms`,
              opacity: phase === "entering" ? 0 : phase === "exiting" ? 0 : 1,
              transform: phase === "entering" ? "translateY(50%) rotateX(-40deg)" : phase === "exiting" ? "translateY(-60%)" : "translateY(0) rotateX(0deg)",
              filter: phase === "entering" ? "blur(4px)" : phase === "exiting" ? "blur(3px)" : "blur(0px)",
              display: 'inline-block',
              minWidth: char === " " ? "0.3em" : undefined,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span
        className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
        style={{
          transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
          width: phase === "visible" ? '100%' : '0%',
        }}
      />
    </span>
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
      className="relative bg-white dark:bg-background lg:pt-36 lg:pb-28 overflow-hidden pt-[80px] pb-[40px]"
      onMouseMove={handleMouseMove}
      data-testid="section-hero"
    >
      <HeroBackground />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`, transition: 'transform 0.3s ease-out' }}>
        <div className="absolute top-[18%] right-[18%] w-20 h-20 rounded-2xl border border-primary/8 bg-gradient-to-br from-primary/[0.04] to-transparent rotate-12" style={{ boxShadow: '0 12px 40px rgba(3,79,70,0.06)' }} />
        <div className="absolute bottom-[22%] left-[15%] w-14 h-14 rounded-xl border border-primary/6 bg-gradient-to-br from-primary/[0.03] to-transparent -rotate-12" />
      </div>
      <div className="relative max-w-4xl mx-auto px-6 mt-[80px] mb-[40px]" style={{ perspective: '1000px' }}>
        <div className="text-center" style={{ transform: `rotateX(${mousePos.y * -1}deg) rotateY(${mousePos.x * 1}deg)`, transition: 'transform 0.4s ease-out', transformStyle: 'preserve-3d' }}>
          <h1
            className="hero-text-reveal text-4xl sm:text-5xl lg:text-[75px] font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-8"
            data-testid="text-hero-heading"
          >
            Tax Filing and Planning for
            <br />
            <RotatingWords />
          </h1>

          <p
            className="hero-text-reveal-sub text-lg lg:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto"
            data-testid="text-hero-subheading"
          >
           File your taxes and explore strategies to take control of your financial future. Expert CPAs. Modern software. Audit Guarantee. Faster Response.
          </p>

          <div className="hero-checks-reveal inline-flex flex-col sm:flex-row gap-3 sm:gap-6 mb-12">
            <div className="flex items-center gap-2" data-testid="hero-checkmark-1">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Trusted by professionals at top tech companies</span>
            </div>
            <div className="flex items-center gap-2" data-testid="hero-checkmark-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Filing and year-round tax planning included</span>
            </div>
          </div>

          <div className="hero-btn-appear flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://app.lesser.tax/auth/sign-up"
              className="hero-btn-3d inline-flex items-center gap-2 text-base font-semibold bg-primary text-white rounded-xl px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              data-testid="button-hero-cta"
            >
              Talk to an expert
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const trustedCompanies = [
  "Amazon", "Microsoft", "OpenAI", "Google", "Netflix", "Meta", "Apple",
];

function TrustedByBanner() {
  const { ref, isVisible } = useInView();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    const speed = 0.75;

    const scroll = () => {
      if (container) {
        scrollPosRef.current += speed;
        if (scrollPosRef.current >= container.scrollWidth / 2) {
          scrollPosRef.current = 0;
        }
        container.style.transform = `translateX(-${scrollPosRef.current}px)`;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section ref={ref} className="relative py-14 lg:py-16 bg-muted/20 overflow-hidden" data-testid="section-trusted-by">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(3,79,70,0.06) 30%, rgba(3,79,70,0.08) 50%, rgba(3,79,70,0.06) 70%, transparent 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(3,79,70,0.06) 30%, rgba(3,79,70,0.08) 50%, rgba(3,79,70,0.06) 70%, transparent 100%)' }} />

      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className={`flex items-center justify-center gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to right, transparent, rgba(3,79,70,0.15))' }} />
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-semibold" data-testid="text-trusted-heading">
            Trusted by professionals from
          </p>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to left, transparent, rgba(3,79,70,0.15))' }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-xl">
          <div className="absolute left-0 top-0 bottom-0 w-20 lg:w-32 z-10 pointer-events-none bg-gradient-to-r from-muted/20 via-muted/10 to-transparent" style={{ background: 'linear-gradient(to right, hsl(var(--muted) / 0.6), transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 lg:w-32 z-10 pointer-events-none bg-gradient-to-l from-muted/20 via-muted/10 to-transparent" style={{ background: 'linear-gradient(to left, hsl(var(--muted) / 0.6), transparent)' }} />

          <div className={`overflow-hidden transition-opacity duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div ref={scrollRef} className="flex whitespace-nowrap will-change-transform">
              {[...trustedCompanies, ...trustedCompanies].map((company, index) => (
                <span
                  key={index}
                  className="inline-flex items-center mx-4 select-none group"
                  data-testid={`logo-company-${index}`}
                >
                  <span className="relative text-[28px] lg:text-[34px] font-bold tracking-tight text-foreground/30 transition-colors duration-500 group-hover:text-foreground/60">
                    {company}
                  </span>
                  <span className="ml-8 w-1 h-1 rounded-full bg-primary/20 flex-shrink-0" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SavingsShowcaseSection() {
  const { ref, isVisible } = useInView();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    const speed = 1;

    const scroll = () => {
      if (!isPausedRef.current && container) {
        scrollPosRef.current += speed;
        if (scrollPosRef.current >= container.scrollWidth / 2) {
          scrollPosRef.current = 0;
        }
        container.scrollLeft = scrollPosRef.current;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section ref={ref} id="how-it-works" className="py-20 lg:py-28 bg-white dark:bg-background" data-testid="section-savings-showcase">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center lg:mb-20 pt-[0px] pb-[20px] mt-[0px] mb-[20px]">
          <h2
            className="text-3xl sm:text-4xl lg:text-[60px] lg:leading-[1.08] font-extrabold tracking-[-0.03em] text-foreground tracking-tight transition-all duration-700 opacity-100 translate-y-0 mt-[20px] mb-[20px]"
            data-testid="text-savings-heading"
          >
            Your tax situation isn't simple.
            <br />
            <span className="text-primary">We decode what others miss.</span>
          </h2>
          <p
            className="text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-100 opacity-100 translate-y-0 focus-visible pl-[0px] pr-[0px] text-[18px]"
            data-testid="text-savings-subheading"
          >
            Lesser combines tax expertise from Big Four and elite firms with a fully integrated, AI-powered platform. The result: precise returns, proactive planning, and complete visibility. We handle the complexity so you don't have to.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-2">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-12 lg:w-20 bg-gradient-to-r from-white to-transparent dark:from-background z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 lg:w-20 bg-gradient-to-l from-white to-transparent dark:from-background z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden scrollbar-hide pl-4"
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
            onTouchStart={() => { isPausedRef.current = true; }}
            onTouchEnd={() => { isPausedRef.current = false; }}
            data-testid="savings-scroll-container"
          >
            {[...savingsShowcase, ...savingsShowcase].map((item, index) => (
              <div
                key={index}
                className="group flex-shrink-0 w-[320px] aspect-square bg-white dark:bg-card rounded-2xl overflow-hidden border border-gray-200 dark:border-border shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08),0_4px_24px_-4px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.14)] hover:border-primary/40 hover:-translate-y-1.5 flex flex-col"
                data-testid={`card-saving-${index}`}
              >
                <div className="relative px-7 pt-7 pb-5 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                  <div className="absolute -top-14 -right-14 w-36 h-36 rounded-full bg-primary/[0.03] group-hover:bg-primary/[0.06] transition-colors duration-500" />
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-primary/[0.02] group-hover:bg-primary/[0.04] transition-colors duration-500" />
                  <div className="relative">
                    <span className="text-[44px] font-bold text-primary tracking-tight leading-none block" data-testid={`text-saving-amount-${index}`}>{item.amount}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.18em]" data-testid={`text-saving-label-${index}`}>{item.label}</p>
                    </div>
                  </div>
                </div>
                <div className="px-7 pb-7 pt-4 bg-gradient-to-b from-muted/30 to-muted/10 border-t border-border/20 flex-1">
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-3">Strategies applied</p>
                  <ul className="space-y-2.5">
                    {item.items.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2.5 group/item">
                        <div className="w-4.5 h-4.5 rounded-md bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-primary/15 transition-colors duration-300">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[12.5px] text-foreground/70 leading-snug" data-testid={`text-saving-detail-${index}-${i}`}>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonCard({ row, index, isVisible }: { row: typeof comparisonRows[0]; index: number; isVisible: boolean }) {
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

  const IconComponent = row.icon;
  const baseDelay = index * 150;

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{
        transitionDelay: `${baseDelay}ms`,
        perspective: '800px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      data-testid={`row-comparison-${row.num}`}
    >
      <div
        className="relative h-full rounded-2xl overflow-hidden transition-shadow duration-500"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: 'transform 0.15s ease-out, box-shadow 0.4s ease-out',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '0 20px 60px -12px rgba(3,79,70,0.15), 0 0 0 1px rgba(3,79,70,0.1)'
            : '0 4px 16px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500" style={{
          opacity: isHovered ? 0.08 : 0,
          background: `radial-gradient(circle at ${50 + tilt.y * 8}% ${50 + tilt.x * -8}%, rgba(3,79,70,0.4) 0%, transparent 60%)`,
        }} />

        <div className="relative bg-white dark:bg-card p-7 lg:p-8 h-full">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
              style={{
                background: isHovered
                  ? 'linear-gradient(135deg, rgba(3,79,70,0.15) 0%, rgba(3,79,70,0.05) 100%)'
                  : 'rgba(3,79,70,0.06)',
                transform: isHovered ? `translateZ(20px) rotate(${tilt.y * 0.5}deg)` : 'translateZ(0)',
              }}
            >
              <IconComponent className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 rounded-2xl border border-primary/10 transition-colors duration-500" style={{ borderColor: isHovered ? 'rgba(3,79,70,0.2)' : 'rgba(3,79,70,0.08)' }} />
            </div>
            <h3 className="text-lg font-extrabold tracking-[-0.03em] text-foreground leading-tight" data-testid={`text-comparison-cat-${row.num}`}>{row.category}</h3>
          </div>

          <div className="space-y-3" style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0)', transition: 'transform 0.2s ease-out' }}>
            <div className="relative rounded-xl p-4 overflow-hidden transition-all duration-300" style={{
              background: isHovered ? 'rgba(3,79,70,0.06)' : 'rgba(3,79,70,0.03)',
              border: `1px solid ${isHovered ? 'rgba(3,79,70,0.15)' : 'rgba(3,79,70,0.06)'}`,
            }}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-0.5">Lesser</p>
                  <p className="text-[14px] font-semibold text-foreground leading-snug" data-testid={`text-comparison-lesser-${row.num}`}>{row.lesser}</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-xl p-4 overflow-hidden" style={{
              background: 'rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] mb-0.5">Traditional CPA</p>
                  <p className="text-[14px] text-muted-foreground leading-snug line-through decoration-muted-foreground/20" data-testid={`text-comparison-trad-${row.num}`}>{row.traditional}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white dark:bg-background overflow-hidden" data-testid="section-comparison">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 80% 20%, rgba(3,79,70,0.03) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 40% at 20% 80%, rgba(3,79,70,0.02) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/10 bg-primary/5 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">The Lesser Difference</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-comparison-heading"
          >
            Why choose <span className="text-primary">Lesser?</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-comparison-subheading"
          >
            See how we compare to a traditional CPA across the areas that matter most.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {comparisonRows.map((row, index) => (
            <ComparisonCard key={row.num} row={row} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

const taxSavingsItems = [
  { icon: CreditCard, title: "Contribute to Backdoor Roth IRA", desc: "Your income exceeds the limit. Contribute up to $7,000 via backdoor Roth.", amount: "+$2,134" },
  { icon: Building, title: "Real Estate Depreciation", desc: "Deduct depreciation expenses on rental property over 27.5 years.", amount: "+$4,200" },
  { icon: Home, title: "Home Office Deduction", desc: "Deduct portion of mortgage, utilities, and maintenance for home office.", amount: "+$2,400" },
];

const formTypes = [
  { label: "W-2 Form", icon: FileText },
  { label: "1099 Form", icon: Receipt },
  { label: "2024 Tax Return", icon: FileCheck },
];

function HowItWorksSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-muted/20 dark:bg-muted/5 overflow-hidden" data-testid="section-how-it-works">
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
            Modern tech + human experts,{" "}
            <span className="text-primary italic">so you file with confidence.</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Join tens of thousands of happy filers getting expert-quality returns with zero hassle.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          {/* Step 1: Upload Tax Forms */}
          <div
            className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '300ms' }}
            data-testid="card-step-1"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  01
                </div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-1-title">Upload your tax forms</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-1-desc">
                Snap a pic or upload your tax forms into Lesser. We'll parse your forms and start prepping your return!
              </p>

              <div className="relative rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-6 text-center group-hover:border-primary/30 transition-colors duration-300">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/8 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium mb-1">
                  Take a picture or <span className="text-primary font-semibold">select a file</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {formTypes.map((form, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm hover:border-primary/30 hover:text-primary transition-all duration-200" data-testid={`badge-form-${i}`}>
                      <span className="text-primary/60">+</span>
                      {form.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Maximize Tax Savings */}
          <div
            className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '450ms' }}
            data-testid="card-step-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  02
                </div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-2-title">Maximize your tax savings</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-2-desc">
                We scan your financials and uncover every deduction and credit you're entitled to — strategies most filers miss.
              </p>

              <div className="relative space-y-3">
                <div className="absolute -left-2 -right-2 -bottom-2 h-24 bg-gradient-to-t from-white dark:from-card to-transparent z-10 rounded-b-xl pointer-events-none" />
                {taxSavingsItems.map((item, i) => (
                  <div
                    key={i}
                    className="relative bg-gradient-to-r from-white to-gray-50/80 dark:from-card dark:to-muted/20 rounded-xl border border-gray-100 dark:border-border p-4 flex items-center gap-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
                    style={{ transform: `translateX(${i * 8}px)` }}
                    data-testid={`card-saving-item-${i}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate" data-testid={`text-saving-title-${i}`}>{item.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-1" data-testid={`text-saving-desc-${i}`}>{item.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-muted-foreground font-medium">Tax savings</p>
                      <p className="text-base font-bold text-emerald-600" data-testid={`text-savings-amount-${i}`}>{item.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Expert Review & File */}
          <div
            className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: '600ms' }}
            data-testid="card-step-3"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                  03
                </div>
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-step-3-title">Expert review & file</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-step-3-desc">
                A dedicated CPA reviews every detail, answers your questions, and files with the IRS — guaranteed accurate.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-cpa-review">CPA Review Complete</p>
                    <p className="text-[11px] text-muted-foreground" data-testid="text-status-cpa-review-desc">Your return has been verified</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/[0.04] border border-primary/10">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-filed">Filed with IRS</p>
                    <p className="text-[11px] text-muted-foreground" data-testid="text-status-filed-desc">Federal & state returns submitted</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" data-testid="text-status-advisory">Year-Round Advisory</p>
                    <p className="text-[11px] text-muted-foreground" data-testid="text-status-advisory-desc">Ongoing tax planning access</p>
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
            <a href="https://app.lesser.tax/auth/sign-up">
              <span className="btn-magnetic-text relative z-10 flex items-center gap-2">
                Start filing my taxes
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ModernCpaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const { ref: headingRef, isVisible: headingVisible } = useInView();

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const triggerPoint = windowHeight * 0.65;
      const timelineTop = rect.top;
      const timelineHeight = rect.height;

      if (timelineTop > triggerPoint) {
        setScrollProgress(0);
        setActiveStep(-1);
        return;
      }

      const scrolled = triggerPoint - timelineTop;
      const progress = Math.min(Math.max(scrolled / timelineHeight, 0), 1);
      setScrollProgress(progress);

      const totalSteps = modernCpaFeatures.length;
      const newActiveStep = Math.min(
        Math.floor(progress * totalSteps / 0.85),
        totalSteps - 1
      );
      setActiveStep(progress > 0.02 ? newActiveStep : -1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" data-testid="section-modern-cpa">
      <SectionDecorations />
      <div className="relative max-w-7xl mx-auto px-6">
        <div ref={headingRef} className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-6 transition-all duration-700 ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-modern-cpa-heading"
          >
            This is what a <span className="text-primary">modern CPA</span> relationship feels like.
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-100 ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-modern-cpa-subheading"
          >
            One portal. One team. Everything handled. This is what it feels like when your CPA actually proactively manages your taxes.
          </p>
        </div>

        <div ref={timelineRef} className="relative max-w-4xl mx-auto">
          <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />
          <div
            className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 w-0.5 bg-primary transition-none"
            style={{ height: `${scrollProgress * 100}%` }}
          />

          <div className="space-y-8 lg:space-y-12">
            {modernCpaFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const isEven = index % 2 === 0;
              const isActive = index <= activeStep;
              return (
                <div
                  key={index}
                  className={`relative flex items-start gap-6 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  data-testid={`card-feature-${index}`}
                >
                  <div
                    className={`absolute left-3.5 md:left-1/2 md:-translate-x-1/2 z-10 w-6 h-6 rounded-full border-[3px] transition-all duration-500 ease-out ${isActive ? 'border-primary bg-primary scale-100 shadow-lg shadow-primary/30' : 'border-border bg-card scale-75'}`}
                    style={{ top: '1.75rem' }}
                  >
                    <div className={`absolute inset-0 rounded-full bg-primary/20 transition-all duration-700 ${isActive ? 'animate-ping opacity-75' : 'opacity-0'}`}
                      style={{ animationDuration: '1.5s', animationIterationCount: '1' }}
                    />
                  </div>

                  <div className={`hidden md:block w-1/2 ${isEven ? 'pr-12' : 'pl-12'}`} />

                  <div className={`ml-12 md:ml-0 md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div
                      className={`group bg-card rounded-xl border p-6 lg:p-8 transition-all duration-700 ease-out hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 ${isActive ? 'opacity-100 translate-y-0 border-primary/20 shadow-md' : 'opacity-0 translate-y-8 border-border/50 shadow-none'} ${isActive && !isEven ? 'md:translate-x-0' : ''} ${!isActive && isEven ? 'md:translate-x-6' : ''} ${!isActive && !isEven ? 'md:-translate-x-6' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 ${isActive ? 'bg-primary scale-100' : 'bg-primary/10 scale-75'}`}>
                          <IconComponent className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? 'text-primary opacity-100' : 'text-primary/40 opacity-0'}`}>
                          Step {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className={`text-lg font-extrabold tracking-[-0.03em] text-foreground mb-2 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: isActive ? '100ms' : '0ms' }}
                        data-testid={`text-feature-title-${index}`}
                      >
                        {feature.title}
                      </h3>
                      <p className={`text-sm text-muted-foreground leading-relaxed transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: isActive ? '200ms' : '0ms' }}
                        data-testid={`text-feature-desc-${index}`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

function PricingSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="pricing" className="relative py-20 lg:py-28 bg-white dark:bg-background overflow-hidden" data-testid="section-pricing">
      <SectionDecorations variant="alt" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
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
                className={`group relative bg-white dark:bg-card rounded-2xl overflow-hidden flex flex-col transition-all duration-700 ease-out ${
                  plan.featured
                    ? 'border-2 border-primary shadow-[0_8px_32px_-4px_rgba(3,79,70,0.15)] md:-translate-y-4 hover:shadow-[0_16px_48px_-8px_rgba(3,79,70,0.22)] hover:-translate-y-5'
                    : 'border border-gray-200 dark:border-border shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5'
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
                  <h3 className={`text-xl font-extrabold tracking-[-0.03em] text-foreground mb-1 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                    style={{ transitionDelay: `${baseDelay + 200}ms` }}
                    data-testid={`text-plan-name-${plan.id}`}
                  >
                    {plan.name}
                  </h3>
                  <p className={`text-xs text-muted-foreground mb-5 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${baseDelay + 250}ms` }}
                    data-testid={`text-plan-subtitle-${plan.id}`}
                  >
                    {plan.subtitle}
                  </p>

                  <div className={`mb-5 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${baseDelay + 300}ms` }}
                  >
                    <span className={`text-5xl font-bold tracking-tight ${plan.featured ? 'text-primary' : 'text-foreground'}`} data-testid={`text-plan-price-${plan.id}`}>
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  </div>

                  <p className={`text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${baseDelay + 350}ms` }}
                    data-testid={`text-plan-desc-${plan.id}`}
                  >
                    {plan.description}
                  </p>

                  <div className={`border-t border-border/40 pt-5 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${baseDelay + 400}ms` }}
                  >
                    <ul className="space-y-3 mb-7">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.featured ? 'bg-primary/10' : 'bg-primary/5 group-hover:bg-primary/10'} transition-colors duration-300`}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug" data-testid={`text-plan-feature-${plan.id}-${i}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    className={`w-full transition-all duration-300 overflow-hidden relative ${plan.featured ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 no-default-hover-elevate btn-glow-effect' : 'group-hover:border-primary/40 group-hover:text-primary'}`}
                    variant={plan.featured ? 'default' : 'outline'}
                    size="lg"
                    data-testid={`button-plan-${plan.id}`}
                  >
                    <a href="https://app.lesser.tax/auth/sign-up">
                      <span className="btn-magnetic-text relative z-10">Get Started</span>
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const { ref, isVisible } = useInView();

  const securityItems = [
    { icon: ShieldCheck, title: "SOC 2 Compliant", subtitle: "Enterprise-grade infrastructure audited to SOC 2 standards", testId: "trust-soc-2", floatClass: "security-icon-float", orbitClass: "security-orbit-particle" },
    { icon: FileCheck, title: "IRS Authorized", subtitle: "Certified e-File provider with direct IRS submission", testId: "trust-irs", floatClass: "security-icon-float-delayed", orbitClass: "security-orbit-particle-reverse" },
    { icon: Lock, title: "Bank-Level Encryption", subtitle: "256-bit AES encryption protects all data in transit and at rest", testId: "trust-encryption", floatClass: "security-icon-float-slow", orbitClass: "security-orbit-particle" },
  ];

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-muted/30 overflow-hidden" data-testid="section-security">
      <SectionDecorations />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-security-heading"
          >
            Security built for{" "}
            <span className="text-primary">how you work.</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-security-subheading"
          >
            We protect your data with the same enterprise-grade security standards you expect from modern software. Bank-level encryption and secure infrastructure throughout — so you never have to wonder if your information is safe.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {securityItems.map((item, index) => {
            const baseDelay = 200 + index * 150;
            return (
              <div
                key={index}
                className={`group relative bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
                style={{ transitionDelay: `${baseDelay}ms` }}
                data-testid={item.testId}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-7 text-center">
                  <div className={`relative mx-auto mb-6 w-24 h-24 flex items-center justify-center transition-all duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                    style={{ transitionDelay: `${baseDelay + 200}ms`, perspective: '600px' }}
                  >
                    <div className="absolute inset-0 rounded-2xl security-pulse-ring border-2 border-primary/10" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full bg-primary/30 ${item.orbitClass}`} />
                    </div>

                    <div className="absolute inset-2 rounded-xl security-shimmer" />

                    <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15 border border-primary/15 flex items-center justify-center shadow-lg shadow-primary/10 group-hover:shadow-xl group-hover:shadow-primary/20 transition-shadow duration-500 ${item.floatClass}`}>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/30 to-white/60 dark:via-white/10 dark:to-white/20" />
                      <item.icon className="w-8 h-8 text-primary relative z-10 drop-shadow-sm" strokeWidth={1.5} />
                    </div>

                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#059669] border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <h3 className={`font-extrabold tracking-[-0.03em] text-foreground text-base mb-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                    style={{ transitionDelay: `${baseDelay + 300}ms` }}
                    data-testid={`text-${item.testId}-title`}
                  >
                    {item.title}
                  </h3>

                  <p className={`text-sm text-muted-foreground leading-relaxed transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                    style={{ transitionDelay: `${baseDelay + 400}ms` }}
                  >
                    {item.subtitle}
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

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} id="faq" className="relative py-20 lg:py-28 bg-muted/20 overflow-hidden" data-testid="section-faq">
      <SectionDecorations variant="alt" />

      <div className="absolute top-[15%] left-[3%] w-20 h-20 rounded-full faq-float-accent" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.04) 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="absolute bottom-[10%] right-[5%] w-16 h-16 rounded-full faq-float-accent-reverse" style={{ background: 'radial-gradient(circle, rgba(3,79,70,0.03) 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary faq-dot-pulse" />
            <span className="text-xs font-semibold text-primary tracking-wider uppercase">Got Questions?</span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-foreground tracking-tight mb-5 transition-all duration-700 delay-75 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            data-testid="text-faq-heading"
          >
            Frequently asked{" "}
            <span className="text-primary">questions</span>
          </h2>
          <p className={`text-muted-foreground text-lg transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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
                className={`group relative bg-white dark:bg-card rounded-2xl border overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'border-primary/20 shadow-[0_8px_30px_-6px_rgba(3,79,70,0.1)]' : 'border-gray-200 dark:border-border shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:border-primary/15 hover:shadow-[0_6px_24px_-4px_rgba(3,79,70,0.08)]'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
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
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 40% at 10% 80%, rgba(3,79,70,0.06) 0%, transparent 60%)' }} />

        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>

        <div className="absolute top-[15%] right-[10%] w-20 h-20 rounded-2xl border border-white/5 rotate-12 section-bg-float" />
        <div className="absolute bottom-[20%] left-[8%] w-14 h-14 rounded-xl border border-white/5 -rotate-12 section-bg-float-reverse" />
        <div className="absolute top-[50%] right-[25%] w-8 h-8 rounded-lg border border-white/4 rotate-45 section-bg-float" />
      </div>

      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,79,70,0.3) 50%, transparent)' }} />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em]">Limited availability</span>
        </div>

        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-heading"
        >
          Ready to stop overpaying
          <br />
          <span className="relative">
            on taxes?
            <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: 'linear-gradient(90deg, rgba(3,79,70,0.8), rgba(3,79,70,0.2))' }} />
          </span>
        </h2>
        <p
          className={`text-lg text-white/55 mb-12 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          data-testid="text-cta-subheading"
        >
          Answer a few questions about your tax situation and see your flat annual fee instantly.
        </p>

        <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a
            href="https://app.lesser.tax/auth/sign-up"
            onClick={(e) => { createRipple(e); }}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-[0.98] no-default-hover-elevate overflow-hidden cta-btn-shimmer"
            data-testid="button-cta-primary"
          >
            <span className="btn-magnetic-text relative z-10">
              Talk to an expert
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

function Footer() {
  return (
    <footer className="relative bg-foreground overflow-hidden" data-testid="section-footer">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,79,70,0.2) 50%, transparent)' }} />

      <div className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <img src={lesserLogo} alt="Lesser" className="h-8 brightness-0 invert opacity-70" data-testid="img-footer-logo" />
            <div className="hidden sm:block w-px h-5 bg-white/10" />
            <div className="hidden sm:flex items-center gap-3">
              {[
                { href: "https://x.com/lesser_tax", label: "Twitter", testId: "link-social-twitter", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { href: "https://www.linkedin.com/company/lesser-tax/", label: "LinkedIn", testId: "link-social-linkedin", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { href: "https://www.instagram.com/lessertax/", label: "Instagram", testId: "link-social-instagram", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
              ].map((social) => (
                <a
                  key={social.testId}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  data-testid={social.testId}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/35 transition-all duration-300 hover:bg-white/10 hover:text-white/70"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-3 text-[11px]">
              <a href="/privacy" className="text-white/40 hover:text-white/70 transition-colors" data-testid="link-footer-privacy">Privacy Policy</a>
              <span className="text-white/20">|</span>
              <a href="/terms" className="text-white/40 hover:text-white/70 transition-colors" data-testid="link-footer-terms">Terms of Use</a>
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed text-center sm:text-right max-w-md" data-testid="text-footer-disclaimer">
              &copy; 2026 Lesser. All rights reserved. Tax planning &amp; preparation service. Not legal or financial advice.
            </p>
          </div>
        </div>

        <div className="sm:hidden flex items-center justify-center gap-3 mt-4">
          {[
            { href: "https://x.com/lesser_tax", label: "Twitter", testId: "link-social-twitter-mobile", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { href: "https://www.linkedin.com/company/lesser-tax/", label: "LinkedIn", testId: "link-social-linkedin-mobile", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
            { href: "https://www.instagram.com/lessertax/", label: "Instagram", testId: "link-social-instagram-mobile", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
          ].map((social) => (
            <a
              key={social.testId}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              data-testid={social.testId}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/35 transition-all duration-300 hover:bg-white/10 hover:text-white/70"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <Helmet>
        <title>Lesser - Flat-Fee Tax Planning & Filing for Tech Professionals</title>
        <meta name="description" content="Big Four-trained CPAs. AI-powered platform. Flat-fee pricing from $99/year. Year-round tax strategy for tech professionals with equity compensation — RSUs, ISOs, and stock options." />
        <meta property="og:title" content="Lesser — Your CPA Team for Equity Comp & Complex Taxes" />
        <meta property="og:description" content="Big Four-trained CPAs meet AI-powered tax planning. Flat-fee pricing from $99/year. Built for tech professionals with RSUs, ISOs, and stock options." />
        <meta property="og:image" content="https://lesser.tax/og-landing.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lesser — Your CPA Team for Equity Comp & Complex Taxes" />
        <meta name="twitter:description" content="Big Four-trained CPAs meet AI-powered tax planning. Flat-fee pricing from $99/year. Built for tech professionals with RSUs, ISOs, and stock options." />
        <meta name="twitter:image" content="https://lesser.tax/og-landing.jpg" />
      </Helmet>
      <SharedNavbar variant="individual" sourcePage="/" />
      <HeroSection />
      <TrustedByBanner />
      <ModernCpaSection />
      <TeamSection />
      <HowItWorksSection />
      <ComparisonSection />
      <SavingsShowcaseSection />
      <GoogleReviewsSection />
      <PricingSection />
      <SecuritySection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
