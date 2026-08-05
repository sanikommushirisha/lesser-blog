import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState, useEffect, useRef } from "react";
import lesserLogo from "@assets/lesser_blue_logo_1770346541058.png";

function createRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "btn-ripple";
  ripple.style.left = `${e.clientX - rect.left}px`;
  ripple.style.top = `${e.clientY - rect.top}px`;
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

const NAV_GROUPS = [
  {
    label: "Individual",
    items: [
      { name: "Personal Tax Filing", description: "For W-2 earners & equity compensation", href: "/" },
      { name: "NRI Tax Filing", description: "Cross-border U.S.–India tax services", href: "/nris" },
    ],
  },
  {
    label: "Business",
    items: [
      { name: "Business Tax Filing", description: "Form 1120, 1065, 1120-S", href: "/business" },
      { name: "Partnerships", description: "Form 1065 + K-1s for RE investors", href: "/business/partnerships" },
      { name: "Real Estate", description: "$100/entity for rental LLCs", href: "/business/realestate" },
      { name: "March 15 Deadline", description: "File in 24 hrs before the deadline", href: "/business/deadline" },
    ],
  },
  {
    label: "Services",
    items: [
      { name: "Indian Passport Renewal", description: "For Indian NRIs in the United States", href: "/services/passport-renewal" },
      { name: "India Tax Filing", description: "File your Indian ITR — for U.S.-based NRIs", href: "/services/india-tax-filing" },
    ],
  },
  {
    label: "Offers",
    items: [
      { name: "Nextdoor", description: "Exclusive offer for Nextdoor employees", href: "/offers/nextdoor" },
      { name: "Broadcom", description: "Exclusive offer for Broadcom employees", href: "/offers/broadcom" },
      { name: "Coupa", description: "Exclusive offer for Coupa employees", href: "/offers/coupa" },
      { name: "Google", description: "Exclusive offer for Google employees", href: "/offers/google" },
      { name: "Infosys", description: "Exclusive offer for Infosys employees", href: "/offers/infosys" },
      { name: "River Island", description: "Tax services for River Island residents", href: "/offers/riverisland" },
    ],
  },
];

interface SharedNavbarProps {
  variant: "individual" | "business";
  sourcePage: string;
}

export default function SharedNavbar({ variant, sourcePage }: SharedNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const ctaLabel = variant === "business" ? "Start Your Return" : "Get Started";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${scrolled ? "nav-glass py-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)]" : "bg-transparent py-1"}`}
        data-testid="nav-main"
      >
        <div
          className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(28,65,247,0.08) 20%, rgba(28,65,247,0.12) 50%, rgba(28,65,247,0.08) 80%, transparent 100%)" }}
        />

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <a href="/" className="flex-shrink-0 group" data-testid="img-nav-logo">
            <img src={lesserLogo} alt="Lesser" className="h-[60px] transition-transform duration-300 group-hover:scale-[1.02]" />
          </a>

          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 bg-muted/40 rounded-full px-1.5 py-1 border border-border/50">
              {NAV_GROUPS.map((group) => (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(group.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-muted-foreground rounded-full transition-all duration-300 hover:text-foreground hover:bg-white dark:hover:bg-white/10 hover:shadow-sm"
                    data-testid={`link-nav-${group.label.toLowerCase()}`}
                  >
                    {group.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === group.label ? "rotate-180" : ""}`} />
                  </button>

                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${openDropdown === group.label ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
                  >
                    <div className="bg-white rounded-xl border border-border/60 shadow-xl shadow-black/8 overflow-hidden min-w-[260px]">
                      <div className="p-1.5">
                        {group.items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="flex flex-col gap-0.5 px-3.5 py-2.5 rounded-lg transition-all duration-200 hover:bg-primary/5 group/item"
                            data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <span className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors duration-200">
                              {item.name}
                            </span>
                            <span className="text-xs text-muted-foreground leading-snug">
                              {item.description}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <a
                href="/blog"
                className="flex items-center px-4 py-1.5 text-sm font-medium text-muted-foreground rounded-full transition-all duration-300 hover:text-foreground hover:bg-white dark:hover:bg-white/10 hover:shadow-sm"
                data-testid="link-nav-blog"
              >
                Blog
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://wa.me/12098842051"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground rounded-full transition-all duration-300 hover:bg-muted/50"
              data-testid="link-nav-whatsapp"
              aria-label="WhatsApp"
            >
              <SiWhatsapp className="w-4 h-4" />
            </a>

            <a
              href="https://lesser.tax/app/auth/sign-up"
              onClick={(e) => { createRipple(e); }}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.98] no-default-hover-elevate relative overflow-hidden"
              data-testid="button-nav-cta"
            >
              <span className="btn-magnetic-text relative z-10 flex items-center gap-1.5">
                {ctaLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>

            <button
              className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full border border-border/50 bg-muted/30 transition-all duration-300 hover:bg-muted/60"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-nav-hamburger"
            >
              <div className="flex flex-col items-center justify-center w-4 gap-[4px]">
                <span className={`block w-full h-[1.5px] bg-foreground rounded-full transition-all duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[2.75px]" : ""}`} />
                <span className={`block w-full h-[1.5px] bg-foreground rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block w-full h-[1.5px] bg-foreground rounded-full transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[2.75px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
          data-testid="nav-mobile-menu"
        >
          <div className="nav-glass mx-4 mb-3 rounded-2xl border border-border/30 shadow-xl shadow-black/5 overflow-hidden">
            <div className="flex flex-col p-4 gap-0.5">
              {NAV_GROUPS.map((group) => {
                const isExpanded = mobileExpanded === group.label;
                return (
                  <div key={group.label}>
                    <button
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl transition-all duration-300 hover:text-foreground hover:bg-primary/5"
                      onClick={() => setMobileExpanded(isExpanded ? null : group.label)}
                      data-testid={`link-nav-${group.label.toLowerCase()}-mobile`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                        {group.label}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="pl-8 pr-4 pb-2 flex flex-col gap-0.5">
                        {group.items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-primary/5"
                            data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}-mobile`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                            <span className="text-[11px] text-muted-foreground leading-snug">{item.description}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              <a
                href="/blog"
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl transition-all duration-300 hover:text-foreground hover:bg-primary/5"
                data-testid="link-nav-blog-mobile"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-1 h-1 rounded-full bg-primary/40" />
                Blog
              </a>

              <div className="h-px bg-border/50 my-2 mx-4" />

              <div className="flex flex-col gap-2 px-2 pt-1 pb-1">
                <a
                  href="https://wa.me/12098842051"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border/50 text-muted-foreground transition-all duration-300 hover:bg-muted/50 sm:hidden"
                  data-testid="link-nav-whatsapp-mobile"
                >
                  <SiWhatsapp className="w-4 h-4" />
                  Connect on WhatsApp
                </a>
                <a
                  href="https://lesser.tax/app/auth/sign-up"
                  onClick={() => { setMobileOpen(false); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 sm:hidden"
                  data-testid="button-nav-cta-mobile"
                >
                  {ctaLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

    </>
  );
}
