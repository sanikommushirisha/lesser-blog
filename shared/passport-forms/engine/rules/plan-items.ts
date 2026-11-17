// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport/plan-items.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/**
 * Checklist items beyond the VFS adult base list (lib/passport/checklist.ts):
 * the forms Lesser fills for special cases and the documents a child's
 * renewal needs. Wording follows the VFS USA checklists (adult, lost,
 * minor) and the Passport Seva annexures.
 */
import type { ChecklistItem } from "./checklist";

export type ExtraItemId =
  | "indiaaff"
  | "police"
  | "damaged"
  | "annexf"
  | "annexd"
  | "annexc"
  | "annexj"
  | "namechangeForm"
  | "newspaper"
  | "marriageCert"
  | "jointPhoto"
  | "minorPassport"
  | "parentsPassports"
  | "parentsStatus"
  | "childStatus"
  | "birthCert"
  | "spousePassport"
  | "custodyPapers"
  | "undertaking"
  | "relativeProof"
  | "noc";

export interface ExtraItem extends Omit<ChecklistItem, "id"> {
  id: ExtraItemId;
}

const item = (id: ExtraItemId, kind: "form" | "task", title: string, tag: string, what: string, onHold: string[], notarize = false): ExtraItem => ({
  id,
  kind,
  title,
  tag,
  what,
  onHold,
  ref: "",
  notarize,
  conditional: true,
});

export const EXTRA_ITEMS: Record<ExtraItemId, ExtraItem> = {
  indiaaff: item("indiaaff", "form", "Self-sworn affidavit for Indian address", "Original", "Needed because your Indian address is changing. We cross out \"have been / have not been\" to match your answer.", ["Not signed"]),
  police: item("police", "task", "Police report for the lost passport", "Self-attested copy", "Not more than 6 months old, approved, naming you and the lost passport number, and saying how it was lost.", ["Report older than 6 months", "Report still pending"]),
  damaged: item("damaged", "task", "The damaged passport", "Original", "Send the damaged passport itself, with copies of its pages.", []),
  annexf: item("annexf", "form", "Annexure F, signed", "Original", "Your declaration about how and when the passport was lost or damaged. We fill it from your answers; you sign the original.", ["Not signed", "Doesn't say how the passport was lost"]),
  annexd: item("annexd", "form", "Annexure D, signed by both parents", "Notarized original", "Both parents declare the child is an Indian citizen and consent to the passport. Both sign in front of a notary.", ["Signed by only one parent", "Not notarized"], true),
  annexc: item("annexc", "form", "Annexure C, signed by the applying parent", "Notarized original", "Because one parent isn't giving consent: the applying parent explains why and takes responsibility. Sign in front of a notary.", ["Not notarized", "Reason not given"], true),
  annexj: item("annexj", "form", "Annexure J, joint photo declaration", "Notarized original", "In place of a marriage certificate: you and your spouse declare you're married, paste a joint photograph and both sign in front of a notary.", ["Signed by only one spouse", "Joint photo missing"], true),
  namechangeForm: item("namechangeForm", "form", "Affidavit of name change", "Notarized original", "Your deed poll: old name, new name, signed in both names in front of a notary, with two witnesses.", ["Not notarized", "Notary stamp expiry corrected by hand"], true),
  newspaper: item("newspaper", "task", "Newspaper ads + 2 documents in the new name", "Self-attested copy", "Because the change isn't due to marriage or divorce: full-page ads in a national daily in India and one in the USA (or a state gazette), plus two public documents in the new name.", ["Ad page cut down so the date isn't visible"]),
  marriageCert: item("marriageCert", "task", "Marriage certificate", "Copy", "To add your spouse's name to the passport.", []),
  jointPhoto: item("jointPhoto", "task", "Joint photograph with your spouse", "Self-attested", "Pasted on Annexure J and signed across by both of you.", []),
  minorPassport: item("minorPassport", "task", "Child's current passport + copies of the first and last page", "Original + copy", "Send the child's original passport with copies of the bio page and the family-details page.", ["Copies sent without the original"]),
  parentsPassports: item("parentsPassports", "task", "Both parents' passports, first and last page", "Self-attested copy", "Copies of each parent's bio page and last page, signed by that parent.", ["Only one parent's passport sent"]),
  parentsStatus: item("parentsStatus", "task", "Both parents' US status", "Colour copy, notarized", "Each parent's green card, visa, EAD or I-797A, as a notarized colour copy.", ["Black-and-white copy"], true),
  childStatus: item("childStatus", "task", "Child's US status", "Colour copy, notarized", "The child's green card, visa or I-797A, as a notarized colour copy.", ["Black-and-white copy"], true),
  birthCert: item("birthCert", "task", "Child's birth certificate", "Copy", "Shows both parents' names.", []),
  spousePassport: item("spousePassport", "task", "Spouse's passport, first and last page", "Copy", "The spouse's name on your government form must match this copy exactly.", ["Spouse's name spelled differently on the form"]),
  undertaking: item("undertaking", "form", "Relative's undertaking for proof of address", "Notarized original", "Your relative confirms you live with them. They sign it in front of a notary; we fill it from your answers.", ["Not notarized", "Their address proof copy not notarized"], true),
  relativeProof: item("relativeProof", "task", "Your relative's address proof", "Colour copy, notarized", "The license, signed lease or recent bill in their name, at the address on your form.", ["Copy not notarized"], true),
  noc: item("noc", "form", "No Objection Letter from the parent abroad", "Notarized original", "The parent outside the USA confirms they have no objection, and signs Annexure D there too, both in front of a local notary.", ["Not notarized", "Annexure D from that parent missing"], true),
  custodyPapers: item("custodyPapers", "task", "Divorce decree and custody papers, or the other parent's death certificate", "Copy", "Whichever explains why the other parent isn't signing Annexure D.", []),
};
