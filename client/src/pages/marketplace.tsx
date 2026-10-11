import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Search } from "lucide-react";
import SharedNavbar from "@/components/shared-navbar";
import AuthModal from "@/components/marketplace/auth-modal";
import { ServiceIllustration } from "@/components/marketplace/service-illustration";
import {
  MARKETPLACE_SERVICES,
  type MarketplaceService,
} from "@/lib/marketplace-services";
import { usePageMeta } from "@/lib/seo";
import { appUrl, fetchPortalUser, type PortalUser } from "@/lib/portal";
import teamDavidImg from "@assets/team_david_clean.png";
import teamVishweshImg from "@assets/team_vishwesh_clean.png";
import teamJithendraImg from "@assets/team_jithendra_clean.png";

// The app's marketplace, on the public site. Live tools ask a signed-out
// visitor to sign in or sign up right here (AuthModal), then open the tool in
// the app; a visitor who is already signed in goes straight there.

const TEAM = [teamDavidImg, teamVishweshImg, teamJithendraImg];

// Keep in step with PAGE_META["/marketplace"] in server/static.ts, which is what
// crawlers get in the first HTML response; this covers in-app navigation.
const META = {
  title: "NRI Services: Indian Passport Renewal & India ITR | Lesser",
  description:
    "Renew your Indian passport from the U.S. and file your India tax return (ITR) online with expert-guided tools. Business formation and GST help coming soon.",
  ogTitle: "Lesser Marketplace: Expert Services for Global Indians",
  ogDescription:
    "Indian passport renewal and India tax filing for NRIs in the U.S., guided step by step and reviewed by experts. More NRI services coming soon.",
  canonical: "https://lesser.tax/marketplace",
  ogImage: "https://lesser.tax/og-nri.jpg",
};

const RELATED_LINKS: { href: string; title: string; desc: string }[] = [
  {
    href: "/nris",
    title: "U.S. tax filing for NRIs",
    desc: "FBAR, FATCA, PFIC and foreign tax credits on your U.S. return.",
  },
  {
    href: "/services/passport-renewal",
    title: "Indian passport renewal guide",
    desc: "Who qualifies, the documents VFS asks for, and our flat fee.",
  },
  {
    href: "/services/india-tax-filing",
    title: "India ITR filing from the U.S.",
    desc: "Interest, rent and capital gains in India, with DTAA benefits.",
  },
  {
    href: "/dashboard/tax-experts",
    title: "Talk to a tax expert",
    desc: "Book a one-on-one consultation with a Lesser CPA.",
  },
  {
    href: "/blog",
    title: "NRI tax and passport guides",
    desc: "Step-by-step articles from the Lesser team.",
  },
];

function RelatedLinks() {
  return (
    <section
      aria-labelledby="related-heading"
      className="rounded-[24px] border border-[#e0e8e5] bg-white px-6 py-8 sm:px-10"
    >
      <h2
        id="related-heading"
        className="text-[22px] font-bold tracking-[-0.5px] text-[#0f0f0f]"
      >
        More help for NRIs in the United States
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#374151]">
        Lesser handles both sides of life across the U.S. and India: your{" "}
        <a href="/nris" className="font-semibold text-primary hover:underline">
          U.S. tax return as an NRI
        </a>
        , your{" "}
        <a
          href="/services/india-tax-filing"
          className="font-semibold text-primary hover:underline"
        >
          Indian income tax return
        </a>
        , and documents like your{" "}
        <a
          href="/services/passport-renewal"
          className="font-semibold text-primary hover:underline"
        >
          Indian passport
        </a>
        .
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RELATED_LINKS.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="group flex h-full flex-col rounded-2xl border border-[#e0e8e5] px-4 py-3 transition-colors hover:border-primary/30 hover:bg-secondary"
            >
              <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#0f0f0f] group-hover:text-primary">
                {l.title}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 text-[13px] leading-snug text-gray-500">
                {l.desc}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MarketplaceHeader({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#e0e8e5] bg-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#034f46]/[0.07] via-[#034f46]/[0.02] to-transparent" />
      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h1 className="text-[30px] font-bold leading-[1.08] tracking-[-1px] text-[#0f0f0f] sm:text-[40px]">
              Expert Services for
              <br />
              <span className="font-['EB_Garamond',serif] italic text-primary">
                Global Indians
              </span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#374151]">
              Renew your Indian passport, file your India tax return and get
              expert help with documentation and legal matters, all online from
              the U.S. Our verified professionals guide NRIs through every step.
            </p>
          </div>
          <div className="flex shrink-0 items-center self-start rounded-[20px] border border-[#e0e8e5] bg-background px-6 py-5">
            <div className="flex -space-x-3">
              {TEAM.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-[52px] w-[52px] rounded-full border-[3px] border-white bg-gray-100 object-cover"
                />
              ))}
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px] border-white bg-white shadow-sm">
                <span className="select-none text-[14px] font-bold text-[#374151]">
                  10+
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-7">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search all services..."
            aria-label="Search all services"
            className="w-full rounded-[14px] border border-[#e0e0e0] bg-white py-[14px] pl-12 pr-4 text-[15px] text-[#1a1a1a] transition-colors placeholder:text-gray-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            data-testid="input-search-marketplace"
          />
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  opening,
  onOpen,
}: {
  service: MarketplaceService;
  opening: boolean;
  onOpen: (s: MarketplaceService) => void;
}) {
  const comingSoon = !service.appPath;

  return (
    <motion.div
      whileHover={comingSoon ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      // The whole card opens the tool on click, like the portal's; the
      // "View details" button is the keyboard and screen-reader path to it.
      onClick={comingSoon || opening ? undefined : () => onOpen(service)}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#e0e8e5] bg-white p-6 text-left transition-shadow ${
        comingSoon
          ? ""
          : "cursor-pointer hover:shadow-[0_12px_40px_rgba(3,79,70,0.10)]"
      }`}
      data-testid={`card-tool-${service.id}`}
    >
      {comingSoon && (
        <span className="absolute right-[-40px] top-[20px] w-[160px] rotate-45 bg-primary py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white">
          Coming Soon
        </span>
      )}
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#f3f6f5] ring-1 ring-[#e2eae7]">
        <ServiceIllustration id={service.id} className="h-10 w-10" />
      </div>
      <h3 className="mb-2 text-[17px] font-bold leading-snug tracking-[-0.3px] text-[#0f0f0f]">
        {service.title}
      </h3>
      <p className="mb-5 flex-1 text-[14px] leading-relaxed text-[#374151]">
        {service.description}
      </p>
      {comingSoon ? (
        <span className="inline-flex items-center text-[13px] font-bold text-gray-400">
          Coming soon
        </span>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={opening}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(service);
            }}
            className="inline-flex items-center gap-1.5 rounded text-[13px] font-bold text-primary transition-colors group-hover:text-[#023d35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={`View details: ${service.title}`}
          >
            {opening ? "Opening…" : "View details"}
            {opening ? (
              <Loader2 className="h-[14px] w-[14px] animate-spin" />
            ) : (
              <ArrowRight className="h-[14px] w-[14px] transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
          {service.learnMorePath && (
            // A real link to the service's own page, so crawlers can follow it.
            <a
              href={service.learnMorePath}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-medium text-gray-500 underline-offset-2 hover:text-primary hover:underline"
              data-testid={`link-learn-more-${service.id}`}
            >
              Learn more<span className="sr-only"> about {service.title}</span>
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MarketplaceService | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  // Who is signed in to the app, looked up once; a click waits for it if needed.
  const userRef = useRef<Promise<PortalUser | null> | null>(null);
  usePageMeta(META);

  useEffect(() => {
    window.scrollTo(0, 0);
    userRef.current = fetchPortalUser();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MARKETPLACE_SERVICES;
    return MARKETPLACE_SERVICES.filter((s) =>
      `${s.title} ${s.description}`.toLowerCase().includes(q),
    );
  }, [query]);

  const goToTool = (s: MarketplaceService) => {
    setOpening(s.id);
    window.location.href = appUrl(s.appPath!);
  };

  const openTool = async (s: MarketplaceService) => {
    setOpening(s.id);
    // Re-asked on every click: the visitor may have signed in or out in another tab.
    const user = await (userRef.current = fetchPortalUser());
    if (user?.emailVerified) {
      goToTool(s);
      return;
    }
    setOpening(null);
    setOtpEmail(user ? user.email : null);
    setSelected(s);
  };

  return (
    <>

      <SharedNavbar variant="individual" sourcePage="/marketplace" />

      <main className="min-h-screen bg-background pb-24 pt-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6">
          <MarketplaceHeader query={query} onQueryChange={setQuery} />

          <section
            aria-labelledby="services-heading"
            className="flex flex-col gap-5"
          >
            <h2
              id="services-heading"
              className="text-[22px] font-bold tracking-[-0.5px] text-[#0f0f0f]"
            >
              {query.trim()
                ? `Services matching “${query.trim()}”`
                : "All services for NRIs"}
            </h2>
            {filtered.length === 0 ? (
              <div
                className="rounded-[20px] border border-[#e0e8e5] bg-white py-16 text-center"
                data-testid="text-no-tools"
              >
                <p className="text-[15px] font-bold text-[#1a1a1a]">
                  No services found
                </p>
                <p className="mt-1 text-[13px] text-gray-500">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    opening={opening === s.id}
                    onOpen={openTool}
                  />
                ))}
              </div>
            )}
          </section>

          <RelatedLinks />
        </div>
      </main>

      {selected && (
        <AuthModal
          open
          onOpenChange={(open) => !open && setSelected(null)}
          toolName={selected.title}
          appPath={selected.appPath!}
          initialOtpEmail={otpEmail}
          onDone={() => goToTool(selected)}
        />
      )}
    </>
  );
}
