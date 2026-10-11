// The Lesser app's marketplace catalogue, as the portal's /marketplace page shows
// it. Mirrors components/marketplace/services.ts in the app (MARKETPLACE_SERVICES);
// when a tool goes live or a new one is added there, update it here too.

export type MarketplaceService = {
  id: string;
  title: string;
  description: string;
  /** App path the tool opens at. Absent while the tool is "Coming Soon". */
  appPath?: string;
  /** The site's own page about this service, linked from the card. */
  learnMorePath?: string;
};

export const MARKETPLACE_SERVICES: MarketplaceService[] = [
  {
    id: "passport-renewal",
    title: "Indian Passport Renewal & Re-issue",
    description:
      "Renew or re-issue your Indian passport from abroad. Guided application, document checklist, and live tracking. Most users finish in about 10 minutes.",
    appPath: "/passport-flow",
    learnMorePath: "/services/passport-renewal",
  },
  {
    id: "india-tax-filing",
    title: "India Tax Filing for NRIs & Residents",
    description:
      "File your Indian income tax return with a guided wizard. Covers salary, capital gains, house property, deductions, and tax-regime selection.",
    appPath: "/india",
    learnMorePath: "/services/india-tax-filing",
  },
  {
    id: "us-business-formation",
    title: "US Business Formation | LLC & C-Corp",
    description:
      "Form a US LLC or C-Corp as an NRI with compliant structuring, EIN registration, and ongoing filing support handled for you.",
  },
  {
    id: "fund-repatriation",
    title: "Fund Repatriation from India",
    description:
      "Move funds from India to your country of residence with full FEMA, FATCA, and RBI compliance, plus the right forms filed on your behalf.",
  },
  {
    id: "lower-tds-property",
    title: "Lower TDS on Property Sale for NRIs",
    description:
      "Apply for a lower TDS certificate (Form 13) to reduce the tax deducted at source on the sale of property in India.",
  },
  {
    id: "gst-registration",
    title: "GST Registration & Filing Compliance",
    description:
      "End-to-end GST registration, return filing, reconciliation, and advisory for businesses operating in India.",
  },
];
