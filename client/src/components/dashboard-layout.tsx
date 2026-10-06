import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, MotionConfig } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Home,
  LogIn,
  Menu,
  Search,
  Store,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import lesserLogo from "@assets/lesser_logo.png";

const SIGN_IN_URL = "https://lesser.tax/app/auth/sign-in";

// Apple-style easing: fast start, long gentle settle.
export const EASE = [0.22, 1, 0.36, 1] as const;

// Each tab is its own page; add a route in App.tsx for any new entry.
const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/investments", label: "Investments", icon: CircleDollarSign },
  { href: "/dashboard/taxation", label: "Taxation", icon: FileText },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/tax-experts", label: "Tax Experts", icon: UserCheck },
];

export function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  return (
    <a href="/" className="flex items-center gap-1.5" data-testid="link-logo">
      <img src={lesserLogo} alt="" className={size === "md" ? "h-9 w-9" : "h-8 w-8"} />
      <span className={`font-extrabold tracking-tight text-primary ${size === "md" ? "text-lg" : ""}`}>
        Lesser
      </span>
    </a>
  );
}

function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  onClose,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const [location] = useLocation();

  return (
    <div className="flex h-full flex-col border-r border-black/[0.08] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.05),8px_0_28px_rgba(0,0,0,0.07)]">
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <Logo />}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-black/5"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pb-4">
          <label className="flex items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2 text-sm transition-shadow focus-within:bg-white focus-within:ring-2 focus-within:ring-ring/30">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              data-testid="input-dashboard-search"
            />
          </label>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          // Home only matches exactly; other tabs stay active on their sub-pages.
          const isActive = location === href || (href !== "/dashboard" && location.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${isActive ? "font-semibold text-primary" : "text-foreground/80 hover:bg-black/[0.04]"}`}
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-secondary"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <Icon className="relative h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="relative">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <a
          href={SIGN_IN_URL}
          className={`flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] ${
            collapsed ? "px-2" : "px-4"
          }`}
          title={collapsed ? "Login" : undefined}
          data-testid="link-login"
        >
          <LogIn className="h-4 w-4" />
          {!collapsed && "Login"}
        </a>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen bg-white font-sans antialiased">
        {/* Desktop sidebar; z-10 keeps its shadow above the page content */}
        <aside
          className={`sticky top-0 z-10 hidden h-screen shrink-0 transition-[width] duration-300 md:block ${
            collapsed ? "w-[72px]" : "w-64"
          }`}
        >
          <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Sidebar
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-black/[0.06] bg-white/70 px-4 shadow-sm backdrop-blur-2xl md:hidden">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu">
              <Menu className="h-5 w-5" />
            </button>
            <Logo size="sm" />
          </header>

          {/* overflow-x-clip, not hidden: hidden would break position:sticky inside pages */}
          <main className="overflow-x-clip">{children}</main>
        </div>
      </div>
    </MotionConfig>
  );
}
