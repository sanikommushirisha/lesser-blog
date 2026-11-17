// Where the free passport forms live on lesser.tax (LD-78), and how they hand
// off to the app (LD-80). Shared by the marketing site (client/) and the blog.

import { FORM_LIST } from "./engine/packet";
import { situationToParams } from "./engine/situation";
import type { Situation } from "./engine/packet";

export const SITE_URL = "https://lesser.tax";

/** The public forms hub. Each form has a page at `${HUB_PATH}/<slug>`. */
export const HUB_PATH = "/tools/indian-passport-forms";

/** App sign-up. ?service=passport lands a new account in the passport assistant. */
export const APP_SIGNUP_URL = "https://lesser.tax/app/auth/sign-up";

/** Blank official PDFs, served by the marketing site at /passport-forms/<file> (synced from the app). */
export const PDF_BASE = "";

export type FormDef = { id: string; slug: string; name: string; kind: string; signs: string; notary: string; when: string; src: string };

export const FORMS_LIST = FORM_LIST as FormDef[];

export function formById(id: string): FormDef {
  const f = FORMS_LIST.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown passport form: ${id}`);
  return f;
}

export function formBySlug(slug: string): FormDef | undefined {
  return FORMS_LIST.find((x) => x.slug === slug);
}

export const formPath = (id: string) => `${HUB_PATH}/${formById(id).slug}`;

/**
 * Sign-up link for "Let Lesser do it" (LD-80): service=passport, UTM tags
 * naming where it was clicked, and the situation (pf_* params) so the
 * assistant doesn't ask it again. Never anything typed into the forms.
 */
export function signupUrl(situ: Situation, source: string, form?: string, saved?: boolean): string {
  const q = new URLSearchParams({
    service: "passport",
    utm_source: "lesser.tax",
    utm_medium: source === "hub" ? "passport_forms" : "blog",
    utm_campaign: "free_passport_forms",
    utm_content: form ? `${source}:${form}` : source,
    ...situationToParams(situ),
    // The details they typed wait in this browser (engine/saved.ts); the app picks them up after sign-up or login.
    ...(saved ? { pf_saved: "1" } : {}),
  });
  return `${APP_SIGNUP_URL}?${q}`;
}
