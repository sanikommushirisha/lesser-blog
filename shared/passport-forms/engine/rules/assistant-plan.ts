// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport/assistant-plan.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/**
 * The renewal plan the passport assistant shows after set-up: which forms and
 * documents this exact case needs, what VFS charges, how long it takes, and
 * which consulate handles it.
 *
 * Built on lib/passport/checklist.ts (the VFS adult re-issue checklist) and
 * lib/passport/consulate.ts, adding what the assistant's design asks for on
 * top: the lost / damaged items, the Indian address affidavit when that
 * address changes, the jumbo booklet and the lost or damaged fee.
 *
 * VFS USA facts used here (research for the redesign, 6 Nov 2026): $146 for a
 * 36-page booklet, $196 for 60 pages, Tatkal adds $125, lost or damaged costs
 * $271 / $321 and can't go Tatkal. Cards add 3.75%; personal checks are refused.
 */
import { VFS_FEES } from "./vfs-fees";
import { buildChecklist, FEES, type ChecklistItem, type RenewalAnswers } from "./checklist";
import { EXTRA_ITEMS, type ExtraItemId } from "./plan-items";
import { editionFor, type ChecklistEdition } from "./checklist-editions";
import { missionForZip, type MissionResult } from "./consulate";

/** Lesser's flat fee for the renewal kit, in US dollars. */
export const LESSER_FEE_USD = 140;
export const LESSER_FEE_CENTS = LESSER_FEE_USD * 100;

export const LOST_OR_DAMAGED_FEE = VFS_FEES.lostOrDamaged;

export type Booklet = "36" | "60";

export type PlanItemId = ChecklistItem["id"] | ExtraItemId;

export interface PlanItem extends Omit<ChecklistItem, "id"> {
  id: PlanItemId;
}

export interface FeeLine {
  label: string;
  usd: number;
}

export interface RenewalPlan {
  /** "Adult re-issue", "Adult re-issue, lost passport", with " · Tatkal" when it applies. */
  caseLabel: string;
  forms: PlanItem[];
  documents: PlanItem[];
  /** Added because of an answer (spouse, name change, lost passport...). */
  extra: PlanItem[];
  total: number;
  fees: FeeLine[];
  vfsTotal: number;
  timeline: { label: string; note: string };
  mission: MissionResult | null;
  /** The standard adult case (valid passport, Normal speed). */
  standardChecklist: boolean;
  /** The VFS checklist edition this case uses (lib/passport/checklist-editions.ts). */
  edition: ChecklistEdition;
}

/** Tatkal isn't allowed for these cases; the reason is what the assistant says. */
export function tatkalBlockedReason(a: Pick<RenewalAnswers, "pstatus" | "changes">): string | null {
  if (a.pstatus === "lost") return "lost passports";
  if (a.pstatus === "damaged") return "damaged passports";
  if (a.changes.includes("name")) return "a name change";
  if (a.changes.includes("dob")) return "a date of birth change";
  if (a.changes.includes("parents")) return "a change to parents' names";
  return null;
}

export function isLostOrDamaged(a: Pick<RenewalAnswers, "pstatus">): boolean {
  return a.pstatus === "lost" || a.pstatus === "damaged";
}

/** Minor (under 15, or 15 to 17 choosing a passport valid until 18): VFS USA fee table, Nov 2026. */
export const MINOR_FEE = VFS_FEES.minor;

/** What VFS charges when the applicant registers and pays on its site. */
export function vfsFees(a: RenewalAnswers, booklet: Booklet, o: Pick<PlanOptions, "childAge" | "minorValidity"> = {}): { lines: FeeLine[]; total: number } {
  const big = booklet === "60";
  const ld = isLostOrDamaged(a);
  const minorFee = a.age === "minor" && (o.childAge !== "15to17" || o.minorValidity !== "adult");
  const passportFee = minorFee
    ? ld
      ? MINOR_FEE.lostOrDamaged
      : MINOR_FEE.normal
    : ld
      ? big
        ? LOST_OR_DAMAGED_FEE.jumbo
        : LOST_OR_DAMAGED_FEE.booklet36
      : big
        ? FEES.jumbo
        : FEES.booklet36;
  const lines: FeeLine[] = [
    { label: minorFee ? `Passport fee (minor${ld ? ", lost or damaged" : ""})` : `Passport fee (${booklet} pages${ld ? ", lost or damaged" : ""})`, usd: passportFee },
    { label: "ICWF", usd: FEES.icwf },
    { label: "VFS service fee", usd: FEES.vfs },
  ];
  if (a.speed === "tatkal" && !tatkalBlockedReason(a)) lines.push({ label: "Tatkal", usd: FEES.tatkal });
  return { lines, total: lines.reduce((sum, l) => sum + l.usd, 0) };
}

/** What a case adds beyond the RenewalAnswers: a child's renewal, and choices behind the extra forms. */
export interface PlanOptions {
  /** Under 15, or 15 to 17 (who may choose a 10-year passport at the adult fee). */
  childAge?: "u15" | "15to17";
  minorValidity?: "minor" | "adult";
  /** One parent isn't giving consent: Annexure C. */
  consent?: "both" | "one";
  /** Adding a spouse: with a marriage certificate, or Annexure J instead. */
  marriageCert?: "yes" | "no";
  /** Name change because of marriage / divorce, or for another reason (newspaper ads). */
  nameReason?: "marriage" | "other";
  /** "relative": US address proof in a relative's name, with their notarized undertaking. */
  addrDoc?: string;
  /** A child's renewal: a parent outside the USA (No Objection Letter). */
  parentAbroad?: "no" | "father" | "mother";
}

const isMinor = (a: RenewalAnswers) => a.age === "minor";

export function buildRenewalPlan(a: RenewalAnswers, booklet: Booklet, o: PlanOptions = {}): RenewalPlan {
  const X = EXTRA_ITEMS;
  const base: PlanItem[] = buildChecklist(a);
  const minor = isMinor(a);
  const forms: PlanItem[] = base.filter((i) => i.kind === "form");
  if (minor) forms.push(X.annexd, ...(o.consent === "one" ? [X.annexc] : []));
  if (a.changes.includes("name")) forms.push(X.namechangeForm);
  if (a.changes.includes("spouse") && o.marriageCert === "no") forms.push(X.annexj);
  if (a.pstatus === "lost" || a.pstatus === "damaged") forms.push(X.annexf);
  if (o.addrDoc === "relative") forms.push(X.undertaking);
  if (minor && (o.parentAbroad === "father" || o.parentAbroad === "mother")) forms.push(X.noc);
  // The self-sworn Indian address affidavit isn't on the Nov 2026 VFS checklists: only the Indian address proof is.

  // A child's packet replaces the adult's own passport and status items with the child's and both parents'.
  const documents: PlanItem[] = minor
    ? [
        base.find((i) => i.id === "photos")!,
        X.minorPassport,
        X.parentsPassports,
        X.childStatus,
        X.parentsStatus,
        X.birthCert,
        base.find((i) => i.id === "addr")!,
        base.find((i) => i.id === "fees")!,
      ]
    : base.filter((i) => i.kind === "task" && !i.conditional);
  const extra: PlanItem[] = base.filter((i) => i.kind === "task" && i.conditional && i.id !== "spouse" && i.id !== "namechange");
  // Nov 2026 checklists: adding a spouse also needs a copy of the spouse's passport.
  if (a.changes.includes("spouse")) extra.unshift(o.marriageCert === "no" ? X.jointPhoto : X.marriageCert, X.spousePassport);
  if (minor && o.consent === "one") extra.push(X.custodyPapers);
  if (o.addrDoc === "relative") extra.push(X.relativeProof);
  if (a.changes.includes("name") && o.nameReason === "other") extra.push(X.newspaper);
  if (a.pstatus === "lost") extra.push(X.police);
  if (a.pstatus === "damaged") extra.push(X.damaged);

  const blocked = tatkalBlockedReason(a);
  const tatkal = a.speed === "tatkal" && !blocked;
  const who = minor ? "Minor re-issue" : "Adult re-issue";
  const caseLabel =
    (a.pstatus === "lost" ? `${who}, lost passport` : a.pstatus === "damaged" ? `${who}, damaged passport` : who) + (tatkal ? " · Tatkal" : "");
  const { lines, total } = vfsFees(a, booklet, o);

  return {
    caseLabel,
    forms,
    documents,
    extra,
    total: forms.length + documents.length + extra.length,
    fees: lines,
    vfsTotal: total,
    timeline: tatkal
      ? { label: "3 to 4 business days", note: "If police verification comes back clear" }
      : { label: "About 3 weeks", note: "After VFS receives your packet" },
    mission: a.zip ? missionForZip(a.zip, a.county) : null,
    standardChecklist: !isLostOrDamaged(a) && !tatkal && !minor,
    edition: editionFor(a),
  };
}

/** The city a mission sits in, for "Mail your packet to VFS San Francisco". */
export function missionCity(m: MissionResult | null): string {
  if (!m) return "";
  return m.name.replace(/^(Embassy of India|Consulate General of India),\s*/, "");
}

/**
 * California is split between Los Angeles and San Francisco by county. Almost
 * every ZIP prefix sits wholly in one side; these two straddle the line, so
 * the assistant asks the county for them (and only them).
 */
export const CA_SPLIT_ZIP3: Record<string, string[]> = {
  "932": ["Kern", "Tulare", "Kings", "Fresno"],
  "935": ["Kern", "San Bernardino", "Inyo", "Mono"],
};

export function needsCountyQuestion(zip: string): boolean {
  return /^\d{5}$/.test(zip) && zip.slice(0, 3) in CA_SPLIT_ZIP3;
}
