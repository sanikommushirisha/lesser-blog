// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/packet.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
// Situation -> packet logic for the free Indian passport forms (VFS USA).
// Which of the 9 forms a case needs comes from the approved "Lesser Free
// Passport Forms" prototype. Everything VFS decides (documents to gather,
// fees, the consulate, which checklist edition) comes from the paid
// assistant's plan (lib/passport/assistant-plan.ts, VFS checklists of Nov
// 2026), so the free forms and the paid service always agree.

import { FORMS as FORMS_UNTYPED } from "./forms";
import { buildRenewalPlan, needsCountyQuestion } from "./rules/assistant-plan";
import { CHECKLIST_EDITIONS, type ChecklistEdition } from "./rules/checklist-editions";
import { missionForZip, VFS_JURISDICTION_URL, type MissionResult } from "./rules/consulate";
import { tatkalBlock, toPlanOptions, toRenewalAnswers } from "./situation";

export { tatkalBlock };

// forms.ts is a verbatim port of the prototype and is not type-annotated.
const FORMS: any = FORMS_UNTYPED;

export interface Situation {
  who: "adult" | "minor";
  cond: "valid" | "lost" | "damaged";
  changes: string[];
  status: string;
  speed: "normal" | "tatkal";
  pages: "36" | "60";
  zip: string;
  /** California ZIPs that straddle the Los Angeles / San Francisco line: the county decides. */
  county?: string;
  both: "yes" | "no";
}

export type Details = Record<string, string>;

export const DEFAULT_SITUATION: Situation = {
  who: "adult",
  cond: "valid",
  changes: [],
  status: "greencard",
  speed: "normal",
  pages: "36",
  zip: "",
  both: "yes",
};

export const CHANGES: [string, string][] = [
  ["spouse", "Spouse name"],
  ["name", "My name"],
  ["india", "Indian address"],
  ["parents", "Parents' names"],
  ["dob", "Date or place of birth"],
  ["appearance", "My appearance"],
  ["signature", "My signature"],
];

export const STATUS: [string, string][] = [
  ["greencard", "Green card"],
  ["visa", "Visa"],
  ["ead", "EAD"],
  ["i797", "I-797A"],
  ["permit", "Work or study permit"],
  ["expired", "Expired visa, extension filed"],
];

/** The assistant has no "expired visa, extension filed" status; its documents are named here. */
const EXPIRED_STATUS_DOC = "US status: expired visa + I-797A + I-797C extension receipt";

/** Official sites the forms send people to (LD-81). Always opened in a new tab. */
export const LINKS = {
  /** Passport Seva (GPSP 2.0) online form for applicants abroad. */
  gov: "https://mportal.passportindia.gov.in/mission/",
  /** VFS registration and payment. */
  vfs: "https://services.vfsglobal.com/usa/en/ind/interim",
  /** VFS jurisdiction lookup. */
  jur: VFS_JURISDICTION_URL,
  /** VFS application tracking. */
  track: "https://services.vfsglobal.com/usa/en/ind/track-application",
  onepager: "https://visa.vfsglobal.com/one-pager/india/united-states-of-america/passport-services/",
};

// ── consulate by ZIP (shared with the assistant: lib/passport/consulate.ts) ──
/** The consulate for a ZIP. California is decided by county; see `needsCounty`. */
export function missionFor(zip: string | undefined, county?: string): MissionResult | null {
  return zip ? missionForZip(zip, county) : null;
}

/** True for the two California ZIP prefixes (932, 935) that straddle the LA / SF line: ask the county. */
export function needsCounty(zip: string | undefined): boolean {
  return needsCountyQuestion(zip || "");
}

// ── packet ───────────────────────────────────────────────────────────────────
export type DocRow = [name: string, how: string, note: string];

export interface Packet {
  /** The VFS checklist edition this case uses, e.g. "VFS adult re-issue checklist, lost passport (3 Nov 2026)". */
  cl: string;
  edition: ChecklistEdition;
  /** The standard adult case (valid passport, normal speed). Every case's checklist is filled either way. */
  std: boolean;
  forms: string[];
  docs: DocRow[];
  extra: DocRow[];
  fees: [string, number][];
  total: number;
  tatkal: boolean;
  block: string | null;
  minor: boolean;
  mission: MissionResult | null;
}

export function hasChange(s: Situation, c: string): boolean {
  return s.changes.indexOf(c) >= 0;
}

export function buildPacket(s: Situation): Packet {
  const minor = s.who === "minor";
  const block = tatkalBlock(s);
  const tatkal = s.speed === "tatkal" && !block;
  const answers = toRenewalAnswers(s);
  const plan = buildRenewalPlan(answers, s.pages, toPlanOptions(s));
  const edition = CHECKLIST_EDITIONS[plan.edition];

  // The 9 free forms: forms 1-4 for everyone, answers add 5-9 (LD-76).
  const forms = ["govform", "checklist", "annexe", "affidavit"];
  if (hasChange(s, "name")) forms.push("namechange");
  if (hasChange(s, "spouse")) forms.push("annexj");
  if (s.cond !== "valid") forms.push("annexf");
  if (minor) {
    forms.push("annexd");
    if (s.both === "no") forms.push("annexc");
  }

  const row = (i: { id: string; title: string; tag: string; what: string }): DocRow => [
    s.status === "expired" && i.id === "usstatus" ? EXPIRED_STATUS_DOC : i.title,
    i.tag,
    i.what,
  ];

  return {
    cl: `${edition.label} (${edition.dated})`,
    edition: plan.edition,
    std: plan.standardChecklist,
    forms,
    docs: plan.documents.map(row),
    extra: plan.extra.map(row),
    fees: plan.fees.map((f) => [f.label, f.usd] as [string, number]),
    total: plan.vfsTotal,
    tatkal,
    block,
    minor,
    mission: plan.mission,
  };
}

// ── field registry helpers ───────────────────────────────────────────────────
export const FIELDS = FORMS.FIELDS;
export const FORM_BY_ID = FORMS.BY;
export const FORM_LIST = FORMS.LIST;

export function isRequired(key: string, d: Details): boolean {
  const r = FIELDS[key].req;
  return typeof r === "function" ? !!r(d) : !!r;
}

/** Fields shown for a set of forms, grouped by form section, each field once. */
export function groupsFor(ids: string[]): { title: string; form: string; keys: string[] }[] {
  const seen: Record<string, boolean> = {};
  const out: { title: string; form: string; keys: string[] }[] = [];
  ids.forEach((id) => {
    FORM_BY_ID[id].fields.forEach((g: [string, string[]]) => {
      const keys = g[1].filter((k) => {
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      });
      if (keys.length) out.push({ title: g[0], form: FORM_BY_ID[id].name, keys });
    });
  });
  return out;
}

export function validate(ids: string[], d: Details): Record<string, string> {
  const e: Record<string, string> = {};
  groupsFor(ids).forEach((g) => {
    g.keys.forEach((k) => {
      const f = FIELDS[k];
      const v = String(d[k] == null ? "" : d[k]).trim();
      if (k === "spouseName" && d.married !== "yes" && ids.indexOf("annexj") < 0) return;
      if (isRequired(k, d) && !v) e[k] = "Needed for " + g.form + ".";
      else if (v && f.pat && !f.pat.test(v)) e[k] = f.patMsg;
    });
  });
  if (/p\.?\s*o\.?\s*box/i.test(d.street || "")) e.street = "PO boxes aren’t accepted. Use your street address.";
  return e;
}

const CHANGE_LABEL = Object.fromEntries(CHANGES);

/** The details object handed to a form's filler: answers + situation facts, shaped per form. */
export function dataFor(id: string, s: Situation, d: Details): Record<string, any> {
  const out: Record<string, any> = {
    ...d,
    speed: s.speed,
    pages: s.pages,
    changesText: s.changes.map((c) => CHANGE_LABEL[c]).join(", "),
  };
  if (id === "checklist" || id === "annexe" || id === "affidavit") {
    const dig = (out.mobile || "").replace(/\D/g, "");
    Object.assign(out, {
      married: out.married === "yes",
      relation: FORMS.rel(d),
      mobile: dig.length === 10 ? dig.slice(0, 3) + "-" + dig.slice(3, 6) + "-" + dig.slice(6) : out.mobile,
      appearanceChanged: hasChange(s, "appearance"),
      signatureChanged: hasChange(s, "signature"),
      passportNo: (out.passportNo || "").toUpperCase(),
    });
  }
  if (id === "govform" && !out.reissueReason) {
    out.reissueReason =
      s.cond === "lost"
        ? "Lost Passport"
        : s.cond === "damaged"
          ? "Damaged Passport"
          : s.changes.length
            ? "Change In Existing Personal Particulars"
            : "Validity Expired Within 3 Years/Due To Expire";
  }
  return out;
}

/**
 * Where each official PDF template is served from (public/passport-forms).
 * The VFS checklist is per case: CHECKLIST_EDITIONS[packet.edition].file.
 */
export const OFFICIAL_PDFS: Record<string, string> = {
  annexe: "annexure-e.pdf",
  affidavit: "affidavit-appearance-signature.pdf",
};
