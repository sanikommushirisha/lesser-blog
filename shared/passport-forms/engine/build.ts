// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/build.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
// Builds the free forms' PDFs (LD-74). Runs in the browser on the public
// pages and in the app; nothing the person types is sent anywhere.
//
// - The VFS checklist is the edition for this exact case (Nov 2026: adult,
//   lost, damaged, Tatkal, minor ...), header filled on every page.
// - Annexure E and the appearance affidavit are the official PDFs, filled and
//   flattened (./fill-official.ts).
// - Forms 5-9 are typeset: Annexure F and the name change affidavit with the
//   wording of VFS USA's own PDFs, C, D and J from the Passport Seva specimens
//   (VFS publishes none), and the
//   government form is an answer sheet (./forms.ts, ./typeset.ts).

import { FORMS as FORMS_UNTYPED } from "./forms";
import { merge } from "./fill-official";
import { fillChecklistHeader } from "./checklist-fill";
import { CHECKLIST_EDITIONS } from "./rules/checklist-editions";
import { buildPacket, dataFor, FORM_BY_ID, OFFICIAL_PDFS, type Details, type Situation } from "./packet";

// forms.ts is the untyped port of the approved prototype.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FORMS: any = FORMS_UNTYPED;

/** Reads a blank official PDF from public/passport-forms by file name. */
export type PdfLoader = (file: string) => Promise<Uint8Array>;

export async function buildFreeForm(id: string, s: Situation, details: Details, load: PdfLoader): Promise<Uint8Array> {
  const d = dataFor(id, s, details);
  if (id === "checklist") {
    const edition = buildPacket(s).edition;
    const header = { fullName: str(d.fullName), passportNo: str(d.passportNo), email: str(d.email), mobile: str(d.mobile) };
    return fillChecklistHeader(await load(CHECKLIST_EDITIONS[edition].file), header, edition);
  }
  return FORMS.build(id, d, (key: string) => load(OFFICIAL_PDFS[key]));
}

/** Every form the case needs, in packet order, as one PDF ("Download all"). */
export async function buildPacketPdf(s: Situation, details: Details, load: PdfLoader): Promise<Uint8Array> {
  const parts: Uint8Array[] = [];
  for (const id of buildPacket(s).forms) parts.push(await buildFreeForm(id, s, details, load));
  return merge(parts);
}

const cache: Record<string, Promise<Uint8Array>> = {};

/**
 * Browser loader for the bundled official PDFs, served from
 * `<base>/passport-forms/<file>` and fetched once per page. The app passes its
 * base path ("/app" in production); the marketing site passes "".
 */
export function officialPdfLoader(base: string): PdfLoader {
  return (file) => {
    const url = `${base}/passport-forms/${file}`;
    cache[url] ??= fetch(url).then((r) => {
      if (!r.ok) {
        delete cache[url];
        throw new Error("We couldn't load the blank form. Check your connection and try again.");
      }
      return r.arrayBuffer().then((b) => new Uint8Array(b));
    });
    return cache[url];
  };
}

/** "<form-slug>-<surname>.pdf", e.g. "annexure-e-sharma.pdf" (LD-74). */
export function formFileName(id: string, details: Details): string {
  const surname = surnameSlug(details.fullName);
  return `${FORM_BY_ID[id].slug}${surname ? `-${surname}` : ""}.pdf`;
}

/** The merged packet, e.g. "indian-passport-forms-sharma.pdf". */
export function packetFileName(details: Details): string {
  const surname = surnameSlug(details.fullName);
  return `indian-passport-forms${surname ? `-${surname}` : ""}.pdf`;
}

function surnameSlug(fullName: unknown): string {
  const words = str(fullName).trim().split(/\s+/).filter(Boolean);
  return (words[words.length - 1] ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
