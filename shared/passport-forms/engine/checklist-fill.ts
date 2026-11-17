// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/checklist-fill.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
// Fills the header (name, passport no., email, mobile) on every page of the
// VFS USA re-issue checklist a case uses: the editions dated 3 Nov 2026
// (adult) and 1 Nov 2026 (minor) in public/passport-forms, positioned per
// edition in lib/passport/checklist-editions.ts. The checklists have no form
// fields, so the values are drawn on the page.
//
// Shared by the paid kit (components/passport-flow/kit/kit-pdfs.ts) and the
// free forms (./build.ts), so both print the same header the same way.

import { CHECKLIST_EDITIONS, type ChecklistEdition } from "./rules/checklist-editions";

export interface ChecklistHeader {
  fullName: string;
  passportNo: string;
  email: string;
  /** Already formatted for the form, e.g. "408-199-7123". */
  mobile: string;
}

export async function fillChecklistHeader(bytes: Uint8Array, d: ChecklistHeader, ed: ChecklistEdition): Promise<Uint8Array> {
  // Loaded on first use, like ./fill-official.ts: pages that only preview never ship pdf-lib.
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const L = CHECKLIST_EDITIONS[ed];
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const ink = rgb(0.05, 0.05, 0.05);
  const fit = (t: string, w: number, size = 9.5) => {
    let s = size;
    while (s > 6 && font.widthOfTextAtSize(t, s) > w) s -= 0.5;
    return s;
  };
  const name = d.fullName.toUpperCase();
  doc.getPages().forEach((pg, i) => {
    if (L.skipPages?.includes(i)) return;
    if (name) pg.drawText(name, { x: L.nameX, y: L.nameY, size: fit(name, 186), font, color: ink });
    if (d.passportNo) pg.drawText(d.passportNo, { x: L.rightX, y: L.nameY, size: 9.5, font, color: ink });
    if (d.email) pg.drawText(d.email, { x: L.nameX, y: L.emailY, size: fit(d.email, 186), font, color: ink });
    if (d.mobile) {
      pg.drawRectangle({ x: L.rightX - 16, y: L.emailY - 2.5, width: 112, height: 12, color: rgb(1, 1, 1) });
      pg.drawText(d.mobile, { x: L.rightX, y: L.emailY, size: 9.5, font, color: ink });
    }
  });
  return doc.save();
}
