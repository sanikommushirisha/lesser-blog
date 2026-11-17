// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/situation.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
// The free forms' situation in the paid passport assistant's terms
// (lib/passport/checklist.ts RenewalAnswers). The free packet takes its
// documents, fees, consulate and checklist edition from the assistant's own
// plan (lib/passport/assistant-plan.ts), so the free forms and the paid service
// can never tell someone different things. "Let Lesser do it" (./handoff.ts)
// seeds a paid case from the same translation.
//
// Part of the engine the marketing site copies (scripts/sync-passport-forms.sh):
// keep it free of app-only imports.

import type { Change, RenewalAnswers, UsStatusDoc } from "./rules/checklist";
import type { PlanOptions } from "./rules/assistant-plan";
import type { Situation } from "./packet";

/** Changes the assistant models. "appearance" and "signature" are answered on the affidavit instead. */
const RENEWAL_CHANGES: readonly Change[] = ["name", "spouse", "india", "parents", "dob"];

/** US status documents the assistant knows. "expired" (visa expired, extension filed) is shown as a visa. */
const RENEWAL_STATUS: readonly UsStatusDoc[] = ["greencard", "visa", "ead", "i797", "permit"];

/**
 * Why Tatkal can't be used for this case, or null. Stricter than the
 * assistant's rule: VFS also refuses Tatkal when an adult's appearance or
 * signature has changed (LD-75), which the assistant does not ask about.
 */
export function tatkalBlock(s: Pick<Situation, "who" | "cond" | "changes">): string | null {
  const has = (c: string) => s.changes.includes(c);
  if (s.cond === "lost") return "a lost passport";
  if (s.cond === "damaged") return "a damaged passport";
  if (has("name")) return "a name change";
  if (has("dob")) return "a change to date or place of birth";
  if (has("parents")) return "a change to parents' names";
  if (s.who === "adult" && (has("appearance") || has("signature"))) return "a change in appearance or signature";
  return null;
}

export function toRenewalAnswers(s: Situation): RenewalAnswers {
  const status = s.status as UsStatusDoc;
  return {
    zip: s.zip,
    ...(s.county ? { county: s.county } : {}),
    age: s.who,
    pstatus: s.cond,
    changes: s.changes.filter((c): c is Change => (RENEWAL_CHANGES as readonly string[]).includes(c)),
    us: RENEWAL_STATUS.includes(status) ? status : "visa",
    // Tatkal only when VFS allows it for this case, so fees and checklist edition agree.
    speed: s.speed === "tatkal" && !tatkalBlock(s) ? "tatkal" : "normal",
  };
}

export function toPlanOptions(s: Situation): PlanOptions {
  return { consent: s.who === "minor" && s.both === "no" ? "one" : "both" };
}

// ── The situation in a link (LD-80: the public sign-up button carries it) ──

const PARAM = "pf_";
const ONE_OF: Record<string, readonly string[]> = {
  who: ["adult", "minor"],
  cond: ["valid", "lost", "damaged"],
  status: ["greencard", "visa", "ead", "i797", "permit", "expired"],
  speed: ["normal", "tatkal"],
  pages: ["36", "60"],
  both: ["yes", "no"],
};
const ALL_CHANGES = ["spouse", "name", "india", "parents", "dob", "appearance", "signature"];

/** "pf_who=adult&pf_cond=lost&pf_changes=name,spouse&..." for a sign-up link. Nothing personal: no names, no numbers. */
export function situationToParams(s: Situation): Record<string, string> {
  const out: Record<string, string> = {
    [`${PARAM}who`]: s.who,
    [`${PARAM}cond`]: s.cond,
    [`${PARAM}status`]: s.status,
    [`${PARAM}speed`]: s.speed,
    [`${PARAM}pages`]: s.pages,
    [`${PARAM}both`]: s.both,
  };
  if (s.changes.length) out[`${PARAM}changes`] = s.changes.join(",");
  if (/^\d{5}$/.test(s.zip)) out[`${PARAM}zip`] = s.zip;
  if (s.county) out[`${PARAM}county`] = s.county;
  return out;
}

/** The situation from a link, or null when it carries none. Unknown values are dropped, never trusted. */
export function situationFromParams(params: URLSearchParams, defaults: Situation): Situation | null {
  if (!Array.from(params.keys()).some((k) => k.startsWith(PARAM))) return null;
  const s: Situation = { ...defaults, changes: [] };
  const rec = s as unknown as Record<string, string>;
  for (const [k, allowed] of Object.entries(ONE_OF)) {
    const v = params.get(PARAM + k);
    if (v && allowed.includes(v)) rec[k] = v;
  }
  s.changes = (params.get(`${PARAM}changes`) ?? "").split(",").filter((c) => ALL_CHANGES.includes(c));
  const zip = params.get(`${PARAM}zip`) ?? "";
  if (/^\d{5}$/.test(zip)) s.zip = zip;
  const county = (params.get(`${PARAM}county`) ?? "").trim();
  if (/^[A-Za-z .]{3,30}$/.test(county)) s.county = county;
  if (s.who === "minor") s.pages = "36";
  return s;
}

