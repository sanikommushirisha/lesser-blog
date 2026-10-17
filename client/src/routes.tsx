import { lazy, Suspense, type ComponentType } from "react";

// Every page is its own chunk, so a visitor downloads the code for the page
// they opened rather than the whole site.
//
// Pages are prerendered to HTML at build time (client/src/entry-server.tsx)
// and hydrated in the browser, and hydration has to produce exactly the markup
// the server did. So before rendering, both sides call preloadRoute() for the
// URL, and a loaded page renders synchronously, never through Suspense. Only
// pages reached later by in-app navigation go through React.lazy.

type PageModule = { default: ComponentType<any> };
type Loader = () => Promise<PageModule>;

export const ROUTES: { path: string; load: Loader }[] = [
  { path: "/", load: () => import("@/pages/landing") },
  { path: "/offers/nextdoor", load: () => import("@/pages/nextdoor") },
  { path: "/offers/broadcom", load: () => import("@/pages/broadcom") },
  { path: "/offers/coupa", load: () => import("@/pages/coupa") },
  { path: "/offers/google", load: () => import("@/pages/google") },
  { path: "/offers/infosys", load: () => import("@/pages/infosys") },
  { path: "/offers/riverisland", load: () => import("@/pages/riverisland") },
  { path: "/nris", load: () => import("@/pages/nris") },
  { path: "/business", load: () => import("@/pages/business") },
  { path: "/business/partnerships", load: () => import("@/pages/partnerships") },
  { path: "/business/deadline", load: () => import("@/pages/deadline") },
  { path: "/business/realestate", load: () => import("@/pages/re-pricing") },
  { path: "/services/passport-renewal", load: () => import("@/pages/passport-renewal") },
  { path: "/services/india-tax-filing", load: () => import("@/pages/india-tax-filing") },
  { path: "/marketplace", load: () => import("@/pages/marketplace") },
  { path: "/dashboard", load: () => import("@/pages/dashboard") },
  { path: "/dashboard/investments", load: () => import("@/pages/dashboard-investments") },
  { path: "/dashboard/taxation", load: () => import("@/pages/dashboard-taxation") },
  { path: "/dashboard/marketplace", load: () => import("@/pages/dashboard-marketplace") },
  { path: "/dashboard/tax-experts", load: () => import("@/pages/dashboard-tax-experts") },
  { path: "/dashboard/tax-experts/:id/booking", load: () => import("@/pages/dashboard-tax-expert-booking") },
  { path: "/dashboard/tax-experts/:id", load: () => import("@/pages/dashboard-tax-expert-detail") },
  { path: "/privacy", load: () => import("@/pages/privacy") },
  { path: "/terms", load: () => import("@/pages/terms") },
];

export const loadNotFound: Loader = () => import("@/pages/not-found");

const loaded = new Map<Loader, ComponentType<any>>();
const lazies = new Map<Loader, ComponentType<any>>();

function pattern(path: string) {
  return new RegExp("^" + path.replace(/:[^/]+/g, "[^/]+") + "/?$");
}

/** The loader for a pathname, or the 404 page's. Same order as <Switch>. */
export function loaderFor(pathname: string): Loader {
  return ROUTES.find((r) => pattern(r.path).test(pathname))?.load ?? loadNotFound;
}

/** Loads the page for a pathname so it renders synchronously (no Suspense). */
export async function preloadRoute(pathname: string) {
  const load = loaderFor(pathname);
  if (!loaded.has(load)) loaded.set(load, (await load()).default);
}

/** A route component: the loaded page if available, else React.lazy. */
export function page(load: Loader) {
  return function Page(props: object) {
    const Loaded = loaded.get(load);
    if (Loaded) return <Loaded {...props} />;
    let Lazy = lazies.get(load);
    if (!Lazy) {
      Lazy = lazy(async () => {
        const mod = await load();
        loaded.set(load, mod.default);
        return mod;
      });
      lazies.set(load, Lazy);
    }
    return (
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}
