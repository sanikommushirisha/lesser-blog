/**
 * Lead magnets (free PDFs) offered by the blog's email gate: what the server
 * needs to email each one. This is the one list of ids; the pop-up copy and
 * which post shows which PDF live in blog/src/lib/lead-magnets.ts, which
 * imports the ids from here.
 *
 * Each PDF goes in blog/public/guides/ only after the tax team signs it off.
 */
export const LEAD_MAGNETS = {
  "rsu-checklist": {
    title: "RSU and equity tax checklist",
    file: "rsu-tax-checklist.pdf",
  },
  "india-accounts-checklist": {
    title: "FBAR and FATCA checklist for Indian accounts",
    file: "fbar-fatca-indian-accounts-checklist.pdf",
  },
  "moving-back-checklist": {
    title: "Moving back to India tax checklist",
    file: "moving-back-to-india-tax-checklist.pdf",
  },
  "founder-checklist": {
    title: "Immigrant founder filing checklist",
    file: "immigrant-founder-filing-checklist.pdf",
  },
  "nri-checklist": {
    title: "NRI US tax checklist",
    file: "nri-us-tax-checklist.pdf",
  },
} as const;

export type LeadMagnetId = keyof typeof LEAD_MAGNETS;

export const LEAD_MAGNET_IDS = Object.keys(LEAD_MAGNETS) as [LeadMagnetId, ...LeadMagnetId[]];
