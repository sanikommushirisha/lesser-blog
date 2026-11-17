// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/saved.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
// "Save my details and continue" (LD-80, public pages): when someone finishes
// the free forms on lesser.tax and chooses to continue with Lesser, what they
// typed waits in this browser's storage until they sign up or log in, then
// seeds their new passport case once (it is saved to their account like any
// case) and is removed.
//
// Why storage and not the link: names, passport numbers and addresses must
// never ride in a URL. lesser.tax and lesser.tax/app are one origin, so the
// portal reads what the marketing site wrote. Pure functions over a Storage so
// the marketing copy of this file and the portal behave the same.

import { DEFAULT_SITUATION, type Details, type Situation } from "./packet";
import { situationFromParams, situationToParams } from "./situation";

export const SAVED_KEY = "lesser.pf-handoff.v1";
/** Details are forgotten after a day, signed in or not. */
export const SAVED_TTL_MS = 24 * 60 * 60 * 1000;
/** A login this soon after saving goes straight to the saved forms. */
export const SAVED_LOGIN_WINDOW_MS = 30 * 60 * 1000;

interface Stored {
  v: 1;
  savedAt: number;
  params: string;
  details: Details;
}

export interface SavedHandoff {
  situation: Situation;
  details: Details;
  savedAt: number;
}

/** Only short strings under a few dozen keys: this is typed form text, nothing else. */
function cleanDetails(raw: unknown): Details {
  const out: Details = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>).slice(0, 80)) {
    if (typeof v === "string" && v.trim() && v.length <= 300 && /^[A-Za-z0-9_]{1,40}$/.test(k)) out[k] = v;
  }
  return out;
}

/** True when saved. False when storage is unavailable or there is nothing typed to keep. */
export function saveHandoff(situation: Situation, details: Details, storage: Pick<Storage, "setItem">, now: number = Date.now()): boolean {
  const clean = cleanDetails(details);
  if (!Object.keys(clean).length) return false;
  try {
    const value: Stored = { v: 1, savedAt: now, params: new URLSearchParams(situationToParams(situation)).toString(), details: clean };
    storage.setItem(SAVED_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** What was saved, or null when nothing is, it is older than a day, or it is unreadable. */
export function readHandoff(storage: Pick<Storage, "getItem">, now: number = Date.now()): SavedHandoff | null {
  try {
    const raw = storage.getItem(SAVED_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Stored>;
    if (s.v !== 1 || typeof s.savedAt !== "number" || typeof s.params !== "string") return null;
    if (now - s.savedAt > SAVED_TTL_MS || s.savedAt > now + 60_000) return null;
    const situation = situationFromParams(new URLSearchParams(s.params), DEFAULT_SITUATION);
    const details = cleanDetails(s.details);
    if (!situation || !Object.keys(details).length) return null;
    return { situation, details, savedAt: s.savedAt };
  } catch {
    return null;
  }
}

export function clearHandoff(storage: Pick<Storage, "removeItem">): void {
  try {
    storage.removeItem(SAVED_KEY);
  } catch {
    /* storage unavailable */
  }
}
