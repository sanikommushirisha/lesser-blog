/**
 * Indian passport renewal pricing: one switch for the marketing site
 * (client/) and the blog (blog/).
 *
 * Free until the owner says to start charging (owner decision, 12 Nov 2026).
 * To charge again, set PASSPORT_PAID to true and rebuild; every place that
 * mentions the price reads it from here (passport page price card, summary and
 * FAQ, page meta and Service schema, quick answers, dashboard and marketplace
 * tags, the blog's service call-to-action, the renewal watch page and the
 * blog video caption).
 *
 * The app has its own switch, NEXT_PUBLIC_PASSPORT_PAYMENT_ENABLED in the
 * lesser repo (lib/passport/pricing.ts). Flip both together.
 */
export const PASSPORT_PAID = false;

const FEE = "$140";

export const PASSPORT_PRICE = {
  /** Tags, chips and short labels: "$140 flat" / "Free". */
  short: PASSPORT_PAID ? `${FEE} flat` : "Free",
  /** The big price on the passport page. */
  amount: PASSPORT_PAID ? FEE : "Free",
  /** Next to the big price. */
  amountNote: PASSPORT_PAID ? "all-inclusive prep fee" : "no fee from Lesser Tax",
  /** The badge on the price card. */
  badge: PASSPORT_PAID ? "FLAT FEE" : "FREE",
  /** The summary card. */
  from: PASSPORT_PAID ? `From ${FEE}` : "Free",
  /** End of a sentence: "...review the full application. Flat $140." */
  sentence: PASSPORT_PAID ? `Flat ${FEE}.` : "Free to use.",
  /** Meta description ending (kept within 140 to 160 characters either way). */
  metaEnding: PASSPORT_PAID ? `Flat ${FEE} fee.` : "Free to use.",
  /** Inside a sentence: "...checks your full packet for a flat $140." */
  inSentence: PASSPORT_PAID ? `for a flat ${FEE}` : "at no cost",
  /** schema.org Offer price (USD). "0" is how a free offer is written. */
  schemaPrice: PASSPORT_PAID ? "140" : "0",
  /** Quick answers: what Lesser Tax charges. */
  quickAnswer: PASSPORT_PAID
    ? `${FEE} flat. Consular, VFS and courier fees are paid separately.`
    : "Free. Consular, VFS and courier fees are paid separately.",
  faq: PASSPORT_PAID
    ? {
        q: `What does the ${FEE} fee cover?`,
        a: "It covers our preparation, form filling, document checklist, photo guidance, and full application review. Government and VFS charges (consular fees, VFS service fees, courier, transaction charges) are billed separately by the consulate.",
      }
    : {
        q: "Does Lesser Tax charge for passport renewal?",
        a: "No. Our preparation, form filling, document checklist and photo guidance are free. Government and VFS charges (consular fees, VFS service fees, courier, transaction charges) are paid separately when you register with VFS.",
      },
} as const;
