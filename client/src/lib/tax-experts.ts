// Client for the Lesser app's public tax-expert (CPA consultation) API.
//
// The portfolio is served at lesser.tax/ and the app at lesser.tax/app, so in
// production these are same-origin calls and the app's session cookie rides
// along: a signed-in user is recognised server-side, everyone else books as a
// guest. In development the site's server proxies /app/* to the local app
// (server/dev-app-proxy.ts), so API calls stay same-origin there too.
//
// Endpoints (all under the app base):
//   GET  /api/public/tax-experts                       -> { experts: TaxExpert[] }
//   GET  /api/public/tax-experts/:id                   -> { expert: TaxExpertDetail }
//   GET  /api/public/tax-experts/:id/availability      -> { slots: AvailabilitySlot[] }
//   POST /api/public/tax-experts/:id/checkout          -> { checkoutUrl }  (Stripe Checkout)
//   GET  /api/public/tax-experts/bookings/:sessionId   -> ConsultationBooking

const API_BASE = "/app/api/public/tax-experts";

// App pages (login, sign-up) can't go through the dev proxy, whose HTML would
// load the app's assets from the site's origin, so dev links to the app directly.
const LESSER_APP_URL: string =
  import.meta.env.VITE_LESSER_APP_URL || (import.meta.env.DEV ? "http://localhost:3000" : "/app");

export type TaxExpert = {
  id: string;
  name: string;
  photoUrl: string | null;
  yearsOfExperience: number | null;
  /** Countries served, as onboarding labels them ("United States", "India", ...). */
  jurisdictions: string[];
  services: string[];
  priceCents: number;
};

export type TaxExpertDetail = TaxExpert & {
  firmName: string | null;
  qualification: string | null;
  university: string | null;
  location: string | null;
  bio: string | null;
  /** List price, when the consultation is discounted to priceCents. */
  originalPriceCents: number | null;
  durationMinutes: number;
};

export type AvailabilitySlot = { start: string; end: string };

export type GuestDetails = { name: string; email: string; phone: string };

export type ConsultationBooking = {
  status: "pending_payment" | "paid" | "booked" | "cancelled";
  expert: Pick<TaxExpert, "id" | "name" | "photoUrl">;
  customerName: string;
  customerEmail: string;
  /** Scheduler (Cal.com) link, prefilled with the customer. Only returned once paid. */
  schedulingUrl: string | null;
  /** meetingUrl is null when the consultant's event has no video link (e.g. a phone call). */
  meeting: { start: string; end: string; meetingUrl: string | null } | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Machine-readable reason, e.g. "phone_required". */
    readonly code?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error || res.statusText, res.status, body?.code);
  return body as T;
}

export async function fetchTaxExperts(): Promise<TaxExpert[]> {
  try {
    const { experts } = await request<{ experts: TaxExpert[] }>("");
    return experts ?? [];
  } catch (err) {
    // Until the listing endpoint ships, a 404 just means "no CPAs yet".
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function fetchTaxExpert(id: string): Promise<TaxExpertDetail> {
  const { expert } = await request<{ expert: TaxExpertDetail }>(`/${encodeURIComponent(id)}`);
  return expert;
}

export async function fetchAvailability(id: string): Promise<AvailabilitySlot[]> {
  try {
    const { slots } = await request<{ slots: AvailabilitySlot[] }>(
      `/${encodeURIComponent(id)}/availability`,
    );
    return slots ?? [];
  } catch (err) {
    // Availability isn't served yet for every expert; show "no open slots".
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

/**
 * Starts Stripe Checkout. `guest` is omitted for signed-in users; the server
 * answers 401 if there is no session, so the caller can fall back to guest,
 * and 400 with code "phone_required" when the account has no phone on file,
 * so the caller can ask for one and retry with `phone`.
 */
export async function startCheckout(id: string, guest?: GuestDetails, phone?: string): Promise<string> {
  const returnBase = `${window.location.origin}/dashboard/tax-experts/${encodeURIComponent(id)}`;
  const { checkoutUrl } = await request<{ checkoutUrl: string }>(
    `/${encodeURIComponent(id)}/checkout`,
    {
      method: "POST",
      body: JSON.stringify({
        mode: guest ? "guest" : "user",
        guest,
        phone: guest ? undefined : phone,
        // Stripe substitutes {CHECKOUT_SESSION_ID} on redirect.
        successUrl: `${returnBase}/booking?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: returnBase,
      }),
    },
  );
  return checkoutUrl;
}

export async function fetchBooking(sessionId: string): Promise<ConsultationBooking> {
  return request<ConsultationBooking>(`/bookings/${encodeURIComponent(sessionId)}`);
}

/* ------------------------------------------------------------------ */
/* Display helpers                                                     */
/* ------------------------------------------------------------------ */

/** Same rule as the API: 7 to 15 digits, with + ( ) - . and spaces around them. */
export const isValidPhone = (v: string) =>
  /^[+\d\s().-]+$/.test(v.trim()) && /^\d{7,15}$/.test(v.replace(/\D/g, ""));

// Same country list the app's onboarding offers as "Tax Jurisdictions".
const JURISDICTION_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  India: "🇮🇳",
  "United Kingdom": "🇬🇧",
  Singapore: "🇸🇬",
  Germany: "🇩🇪",
};

export const flagFor = (jurisdiction: string) => JURISDICTION_FLAGS[jurisdiction] ?? "🌐";

export const formatPrice = (cents: number) =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** App auth URL that brings the user back to `returnPath` on the site. */
export function authUrl(kind: "login" | "sign-up", returnPath: string) {
  const next = `${window.location.origin}${returnPath}`;
  return `${LESSER_APP_URL}/auth/${kind}?next=${encodeURIComponent(next)}`;
}
