// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport/checklist.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/**
 * The applicant's personal renewal checklist, built from six answers.
 *
 * Source: VFS USA "Adult checklist: re-issue of passport", edition dated
 * 3 Nov 2026 (11.3.26), bundled in public/passport-forms with the lost,
 * damaged, Tatkal and minor editions (lib/passport/checklist-editions.ts).
 * It replaced the May 2026 edition: ONE physical photo now (pasted on the
 * appearance affidavit), A4 paper, photo and signature uploaded online. VFS
 * still hosts an older "Checklist - Re-issue / Fresh of Passport" (Nov 2020)
 * with different rules (2 x 2 inch photos, letter paper); do not use it.
 *
 * Only the adult base list is modelled. Minors, lost / damaged passports and
 * Tatkal follow a different VFS checklist: `altChecklist` names it and the UI
 * links to it while still showing the adult base list.
 */

import { VFS_FEES } from "./vfs-fees";

export const CHECKLIST_VERSION = {
  id: "vfs-usa-adult-reissue-2026-11-03",
  label: "VFS adult re-issue checklist, 3 Nov 2026",
  published: "3 Nov 2026",
  url: "https://services.vfsglobal.com/one-pager/india/united-states-of-america/passport-services/",
} as const;

export type Age = "adult" | "minor";
export type PassportStatus = "valid" | "lost" | "damaged";
export type Change = "name" | "spouse" | "india" | "parents" | "dob";
export type UsStatusDoc = "greencard" | "visa" | "ead" | "i797" | "permit";
export type Speed = "normal" | "tatkal";

export interface RenewalAnswers {
  zip: string;
  /** California only: the county decides Los Angeles or San Francisco. */
  county?: string;
  age: Age;
  pstatus: PassportStatus;
  changes: Change[];
  us: UsStatusDoc;
  speed: Speed;
}

export const DEFAULT_ANSWERS: RenewalAnswers = {
  zip: "",
  age: "adult",
  pstatus: "valid",
  changes: [],
  us: "greencard",
  speed: "normal",
};

/** Forms Lesser fills. `checklist`, `annexure-e` and `appearance` map to Anvil documents; `seva` is the portal guide. */
export type FormItemId = "checklist" | "seva" | "appearance" | "annexure-e";
export type ItemId =
  | FormItemId
  | "photos"
  | "passport"
  | "usstatus"
  | "addr"
  | "fees"
  | "spouse"
  | "namechange"
  | "indiaproof"
  | "parents"
  | "dob";

export interface ChecklistItem {
  id: ItemId;
  kind: "form" | "task";
  title: string;
  /** How the item is sent: "Original", "Colour copy, notarized", ... */
  tag: string;
  what: string;
  /** Common reasons VFS puts an application on hold over this item. */
  onHold: string[];
  /** Where it sits on the VFS checklist. */
  ref: string;
  notarize: boolean;
  /** Added because of an answer to "Is anything changing?". */
  conditional: boolean;
}

export const US_STATUS_DOCS: Record<UsStatusDoc, { option: string; title: string }> = {
  greencard: { option: "Green card", title: "green card, front and back" },
  visa: { option: "Visa", title: "visa (plus I-797A if you have one)" },
  ead: { option: "EAD", title: "EAD card, front and back" },
  i797: { option: "I-797A", title: "I-797A approval notice" },
  permit: { option: "Work/study permit", title: "work or study permit" },
};

/** VFS USA fees for an adult 10-year re-issue. The numbers live in ./vfs-fees.ts (one place for every fee). */
export const FEES = {
  booklet36: VFS_FEES.adult.booklet36,
  jumbo: VFS_FEES.adult.jumbo,
  icwf: VFS_FEES.icwf,
  vfs: VFS_FEES.vfs,
  tatkal: VFS_FEES.tatkal,
  cardSurchargePct: VFS_FEES.cardSurchargePct,
} as const;

export const TOTAL_36 = FEES.booklet36 + FEES.icwf + FEES.vfs;
export const TOTAL_JUMBO = FEES.jumbo + FEES.icwf + FEES.vfs;

export function buildChecklist(a: RenewalAnswers): ChecklistItem[] {
  const tatkal = a.speed === "tatkal";
  const base: ChecklistItem[] = [
    {
      id: "checklist",
      kind: "form",
      title: "VFS checklist, all pages, signed",
      tag: "Cover page",
      what: "VFS's own checklist goes on top of your packet. We put your name, passport number, email and mobile at the top of every page; you sign where it says \"Signature of the Applicant\".",
      onHold: ["Left out of the packet", "Not signed"],
      ref: "Cover page",
      notarize: false,
      conditional: false,
    },
    {
      id: "seva",
      kind: "form",
      title: "Government application, printed",
      tag: "Original",
      what: "Fill it on the Passport Seva portal in capital letters, pick your consulate and \"Re-issue\", and upload your photo and signature: without them VFS returns the application unprocessed. Print it, with the uploaded signature on page 1 and your own signature on the last page.",
      onHold: [
        "Photo and signature not uploaded online",
        "ARN doesn't match the VFS payment receipt",
        "Wrong consulate selected",
        "Name, dates or place of birth differ from your passport",
      ],
      ref: "Item 1",
      notarize: false,
      conditional: false,
    },
    {
      id: "photos",
      kind: "task",
      title: "One photo, 35 × 45 mm",
      tag: "Original",
      what: "Identical to the photo you upload to the government form (630 × 810 px). White background, taken in the last 6 months, face 80 to 85% of the photo, no glasses, coloured shirt. Paste it on the appearance affidavit.",
      onHold: ["Printed photo differs from the uploaded one", "White shirt against the white background", "Glasses or flash glare", "Stapled to the form"],
      ref: "Item 2",
      notarize: false,
      conditional: false,
    },
    {
      id: "passport",
      kind: "task",
      title: "Current passport + copies of the first and last page",
      tag: "Original + copy",
      what: "Send your original passport. Copy the bio page and the family-details page. Have more than one passport? Copy all of them.",
      onHold: ["Copies sent without the original", "Copies cut down or hard to read"],
      ref: "Item 3",
      notarize: false,
      conditional: false,
    },
    {
      id: "appearance",
      kind: "form",
      title: "Affidavit for change of appearance and signature",
      tag: "Original",
      what: "Everyone sends this, even if nothing has changed. Paste one photo and sign the original.",
      onHold: ["Photo missing", "Signature doesn't match your passport"],
      ref: "Item 4",
      notarize: false,
      conditional: false,
    },
    {
      id: "annexure-e",
      kind: "form",
      title: "Annexure E, signed",
      tag: "Original",
      what: "A one-page declaration. We cross out the options that don't apply in points 3 and 7; you sign the original.",
      onHold: ["Options not crossed out", "Not signed"],
      ref: "Item 5",
      notarize: false,
      conditional: false,
    },
    {
      id: "usstatus",
      kind: "task",
      title: `US status: ${US_STATUS_DOCS[a.us].title}`,
      tag: "Colour copy, notarized",
      what: "A colour photocopy, stamped and signed by a notary. Banks and UPS stores usually offer this. On an F-1 or F-2 visa, add your I-20; on a B-1 or B-2, your I-94 or I-797 extension.",
      onHold: [
        "Black-and-white copy",
        "Notary stamp expiry corrected by hand",
        "Expired visa without the I-797C extension receipt",
      ],
      ref: "Item 6",
      notarize: true,
      conditional: false,
    },
    {
      id: "addr",
      kind: "task",
      title: "US address proof",
      tag: "Colour copy",
      what: "Any one: state ID, driver's license, a gas, water or electric bill under 3 months old, a lease signed by both tenant and landlord, mortgage or tax return (1040). It must match the address on your application.",
      onHold: ["PO box address", "Bill older than 3 months", "Expired license or lease", "Lease not signed by the landlord", "License copy cut to card size"],
      ref: "Item 7",
      notarize: false,
      conditional: false,
    },
    {
      id: "fees",
      kind: "task",
      title: "VFS registration, payment and return label",
      tag: "Original",
      what: `Register on the VFS site before you mail anything. Pay $${TOTAL_36} for 36 pages${tatkal ? ` plus $${FEES.tatkal} for Tatkal` : ""}, and enclose the confirmation. Each application needs its own return label, and its address must match your address proof.`,
      onHold: [
        "Mailed without online registration",
        "Personal check (not accepted)",
        "Label address differs from your address proof",
      ],
      ref: "Item 8",
      notarize: false,
      conditional: false,
    },
  ];

  const conditional: Record<Change, ChecklistItem> = {
    spouse: {
      id: "spouse",
      kind: "task",
      title: "Marriage certificate or joint photo declaration",
      tag: "Copy",
      what: "To add your spouse's name: a copy of your marriage certificate, or a joint photograph declaration signed by both of you.",
      onHold: ["Joint photo declaration signed by only one spouse"],
      ref: "Supporting 1",
      notarize: false,
      conditional: true,
    },
    name: {
      id: "namechange",
      kind: "task",
      title: "Name change affidavit + newspaper ads",
      tag: "Notarized original",
      what: "An original, notarized affidavit of name change. If the change isn't due to marriage, remarriage or divorce, also send newspaper ads (one daily in India, one in the USA) and two documents in the new name.",
      onHold: ["Affidavit not notarized", "Newspaper ads missing"],
      ref: "Supporting 2 and 5",
      notarize: true,
      conditional: true,
    },
    india: {
      id: "indiaproof",
      kind: "task",
      title: "Indian address proof",
      tag: "Self-attested copy",
      what: "A self-attested copy of one of: Aadhaar card, a recent statement from a government bank with your photo, driving license, or a utility bill from the last 3 months.",
      onHold: ["Copy not self-attested"],
      ref: "Supporting 3",
      notarize: false,
      conditional: true,
    },
    parents: {
      id: "parents",
      kind: "task",
      title: "Two documents showing your parents' new names",
      tag: "Self-attested copy",
      what: "Two public documents (for example a passport or Aadhaar card) showing each parent's name as you want it printed.",
      onHold: [],
      ref: "Supporting 4",
      notarize: false,
      conditional: true,
    },
    dob: {
      id: "dob",
      kind: "task",
      title: "Proof of date of birth",
      tag: "Self-attested copy",
      what: "Born before 1 Oct 2023: birth certificate, school leaving certificate, PAN card, driving license or voter ID. Born on or after: birth certificate.",
      onHold: [],
      ref: "Supporting 9",
      notarize: false,
      conditional: true,
    },
  };

  const order: Change[] = ["spouse", "name", "india", "parents", "dob"];
  return [...base, ...order.filter((c) => a.changes.includes(c)).map((c) => conditional[c])];
}

/** Cases that follow a different VFS checklist. First match wins. */
export function altChecklist(a: RenewalAnswers): { label: string; url: string } | null {
  const base = "https://visa.vfsglobal.com/one-pager/india/united-states-of-america/passport-services/";
  if (a.age === "minor") return { label: "Minor re-issue checklist (May 2026)", url: base };
  if (a.pstatus === "lost") return { label: "Adult re-issue in lieu of lost passport (May 2026)", url: base };
  if (a.pstatus === "damaged") return { label: "Adult re-issue in lieu of damaged passport (May 2026)", url: base };
  if (a.speed === "tatkal") return { label: "Adult Tatkal checklist (Oct 2026)", url: base };
  return null;
}

export function progress(items: ChecklistItem[], done: Partial<Record<ItemId, boolean>>) {
  const n = items.filter((i) => done[i.id]).length;
  const next = items.find((i) => !done[i.id]) ?? null;
  return { done: n, total: items.length, next };
}

/** Packet order for the envelope (VFS checklist order). */
export function packetOrder(a: RenewalAnswers, addressProof: string | null): string[] {
  return [
    "VFS checklist, all pages, signed · cover page",
    "Passport Seva form with ARN · uploaded signature on page 1, your own on the last page",
    "Current passport (original) + copies of the first and last page",
    "One photo, 35 × 45 mm, identical to your upload · pasted on the affidavit",
    "Appearance and signature affidavit, original · photo pasted, signed",
    "Annexure E, original, signed",
    `US status: ${US_STATUS_DOCS[a.us].title} · colour copy, notarized`,
    `Address proof: ${addressProof ?? "utility bill or license"} · colour copy, must match your form`,
    "VFS payment receipt + prepaid return label (one label per application)",
  ];
}

export const ENVELOPE_MARKING = "RE-ISSUANCE OF PASSPORT IN LIEU OF EXISTING PASSPORT - ADULT";
