// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport/checklist-editions.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/**
 * The VFS USA checklist editions for a passport re-issue, one per case, as
 * published by VFS (adult editions dated 3 Nov 2026, minor editions 1 Nov
 * 2026). The PDFs are bundled in public/passport-forms; the kit fills the
 * header (name, passport no., email, mobile) on every page.
 *
 * Header positions come from each PDF's own text (pdfjs): the value columns
 * start 99 pt right of the "Applicant's Name" / "Email ID" labels, and where
 * the "_ _ _ - _ _ _ - _ _ _ _" mobile placeholder begins on the right. A
 * new edition needs only a new entry here (and a check of a filled page).
 */

export type ChecklistEdition =
  | "adult"
  | "adult-lost"
  | "adult-damaged"
  | "adult-tatkal"
  | "minor"
  | "minor-lost"
  | "minor-damaged"
  | "minor-tatkal";

export interface EditionInfo {
  file: string;
  label: string;
  dated: string;
  pages: number;
  /** Where "(Signature of the Applicant)" is. */
  signPage: number;
  /** What VFS asks you to write on the envelope. */
  envelope: string;
  nameX: number;
  nameY: number;
  emailY: number;
  rightX: number;
  /** 0-based pages with no header (nothing is written there). */
  skipPages?: number[];
}

const ADULT_ENVELOPE = "RE-ISSUANCE OF PASSPORT IN LIEU OF EXISTING PASSPORT - ADULT";
const MINOR_ENVELOPE = "RE-ISSUANCE OF PASSPORT IN LIEU OF EXISTING PASSPORT - MINOR";

export const CHECKLIST_EDITIONS: Record<ChecklistEdition, EditionInfo> = {
  adult: { file: "vfs-checklist-adult-2026-11-03.pdf", label: "VFS adult re-issue checklist", dated: "3 Nov 2026", pages: 5, signPage: 4, envelope: ADULT_ENVELOPE, nameX: 127.2, nameY: 756.6, emailY: 742.9, rightX: 439.3 },
  "adult-lost": { file: "vfs-checklist-adult-lost-2026-11-03.pdf", label: "VFS adult re-issue checklist, lost passport", dated: "3 Nov 2026", pages: 6, signPage: 5, envelope: ADULT_ENVELOPE, nameX: 124, nameY: 755.6, emailY: 737, rightX: 466.3 },
  "adult-damaged": { file: "vfs-checklist-adult-damaged-2026-11-03.pdf", label: "VFS adult re-issue checklist, damaged passport", dated: "3 Nov 2026", pages: 8, signPage: 7, envelope: ADULT_ENVELOPE, nameX: 124, nameY: 725.6, emailY: 707, rightX: 477.2 },
  "adult-tatkal": { file: "vfs-checklist-adult-tatkal-2026-11-03.pdf", label: "VFS adult Tatkal re-issue checklist", dated: "3 Nov 2026", pages: 5, signPage: 4, envelope: "ADULT TATKAL - PASSPORT RE-ISSUANCE", nameX: 119.3, nameY: 730.6, emailY: 712.1, rightX: 467.5 },
  minor: { file: "vfs-checklist-minor-2026-11-01.pdf", label: "VFS minor re-issue checklist", dated: "1 Nov 2026", pages: 6, signPage: 5, envelope: MINOR_ENVELOPE, nameX: 121.1, nameY: 755.5, emailY: 741.1, rightX: 476 },
  "minor-lost": { file: "vfs-checklist-minor-lost-2026-11-01.pdf", label: "VFS minor re-issue checklist, lost passport", dated: "1 Nov 2026", pages: 6, signPage: 5, envelope: MINOR_ENVELOPE, nameX: 122.6, nameY: 757.2, emailY: 734.2, rightX: 475.8 },
  "minor-damaged": { file: "vfs-checklist-minor-damaged-2026-11-01.pdf", label: "VFS minor re-issue checklist, damaged passport", dated: "1 Nov 2026", pages: 6, signPage: 5, envelope: MINOR_ENVELOPE, nameX: 123.4, nameY: 757.4, emailY: 741, rightX: 448.4, skipPages: [5] },
  "minor-tatkal": { file: "vfs-checklist-minor-tatkal-2026-11-01.pdf", label: "VFS minor Tatkal re-issue checklist", dated: "1 Nov 2026", pages: 5, signPage: 5, envelope: "MINOR TATKAL - PASSPORT RE-ISSUANCE", nameX: 122.3, nameY: 754.9, emailY: 736.2, rightX: 474.8 },
};

type Case = { age?: string; pstatus?: string; speed?: string; changes?: string[] };

/** The edition a case uses. Tatkal never applies to a lost or damaged passport. */
export function editionFor(a: Case): ChecklistEdition {
  const who = a.age === "minor" ? "minor" : "adult";
  if (a.pstatus === "lost") return `${who}-lost`;
  if (a.pstatus === "damaged") return `${who}-damaged`;
  const blocked = (a.changes ?? []).some((c) => c === "name" || c === "dob" || c === "parents");
  if (a.speed === "tatkal" && !blocked) return `${who}-tatkal`;
  return who;
}
