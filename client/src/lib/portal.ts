// The Lesser app (the "portal"): where it lives and its auth API.
//
// In production the site is lesser.tax/ and the app lesser.tax/app, so API
// calls under /app are same-origin and the app's session cookie (path "/") is
// set for the whole host. In development the site's server proxies /app/* to
// the local app (server/dev-app-proxy.ts), so the cookie lands on localhost,
// which the app on localhost:3000 also reads: cookies ignore the port.

const API_BASE = "/app/api/auth";

// App pages can't go through the dev proxy, whose HTML would load the app's
// assets from the site's origin, so dev links to the app directly.
export const LESSER_APP_URL: string =
  import.meta.env.VITE_LESSER_APP_URL || (import.meta.env.DEV ? "http://localhost:3000" : "/app");

/** Absolute URL of an app page, e.g. appUrl("/passport-flow"). */
export const appUrl = (path: string) => `${LESSER_APP_URL}${path}`;

export type PortalUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.message || body?.error || "Something went wrong. Please try again.");
    Object.assign(err, { status: res.status, body });
    throw err;
  }
  return body as T;
}

/** The signed-in user, or null. Also null when the app can't be reached. */
export async function fetchPortalUser(): Promise<PortalUser | null> {
  try {
    const { user } = await call<{ user: PortalUser | null }>("/me");
    return user;
  } catch {
    return null;
  }
}

export const login = (email: string, password: string) =>
  call<{ ok: true }>("/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const signup = (email: string, password: string) =>
  call<{ ok: true; userId: string }>("/signup", { method: "POST", body: JSON.stringify({ email, password }) });

export const logout = () => call<unknown>("/logout", { method: "POST" }).catch(() => undefined);

/** Emails a fresh 6-digit code. Rejects with body.retryAfter while a recent code is still live. */
export const sendOtp = () => call<unknown>("/otp/send", { method: "POST" });

export const verifyOtp = (code: string) =>
  call<{ verified: true }>("/otp/verify", { method: "POST", body: JSON.stringify({ code }) });

/**
 * Google sign-in is a full-page round trip through the app (it sets its CSRF
 * state cookie on that top-level request), which then lands on `next`, an
 * app path.
 */
export const googleSignInUrl = (next: string) =>
  `${LESSER_APP_URL}/api/auth/google/start?next=${encodeURIComponent(next)}`;
