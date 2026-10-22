import type { ComponentProps } from "react";
import QuickAnswer from "./quick-answer";

// Answer-first content for each service page, kept together so the figures
// can be reviewed (and updated each tax season) in one place. Figures are for
// tax year 2026 (returns filed in 2027) unless stated, and each block links
// the official page they come from. No em-dashes in this copy.

type QA = ComponentProps<typeof QuickAnswer>;

const IRS = {
  fbar: { label: "IRS: FBAR", href: "https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar" },
  fbarVs8938: { label: "IRS: Form 8938 vs FBAR", href: "https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements" },
  f8621: { label: "IRS: Form 8621", href: "https://www.irs.gov/forms-pubs/about-form-8621" },
  f1116: { label: "IRS: Form 1116", href: "https://www.irs.gov/forms-pubs/about-form-1116" },
  spt: { label: "IRS: Substantial presence test", href: "https://www.irs.gov/individuals/international-taxpayers/substantial-presence-test" },
  p525: { label: "IRS Publication 525", href: "https://www.irs.gov/publications/p525" },
  p15: { label: "IRS Publication 15", href: "https://www.irs.gov/publications/p15" },
  f8949: { label: "IRS: Form 8949", href: "https://www.irs.gov/forms-pubs/about-form-8949" },
  f1065: { label: "IRS: Form 1065", href: "https://www.irs.gov/forms-pubs/about-form-1065" },
  f1120s: { label: "IRS: Form 1120-S", href: "https://www.irs.gov/forms-pubs/about-form-1120-s" },
  f7004: { label: "IRS: Form 7004", href: "https://www.irs.gov/forms-pubs/about-form-7004" },
  f8825: { label: "IRS: Form 8825", href: "https://www.irs.gov/forms-pubs/about-form-8825" },
  p527: { label: "IRS Publication 527", href: "https://www.irs.gov/publications/p527" },
};
const INDIA_ITR = { label: "Income Tax Department: which ITR form", href: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1" };

export const QUICK_ANSWERS = {
  home: {
    id: "quick-answer",
    question: "What does Lesser Tax do for tech professionals?",
    answer:
      "Lesser Tax is an online tax firm where CPAs and Enrolled Agents prepare and review your federal and state returns and plan with you year-round. We specialize in RSUs, ISOs, ESPP, H-1B and green card situations and income from India. Plans start at $99 a year, with a flat fee agreed before we start.",
    factsCaption: "Equity compensation basics, tax year 2026",
    facts: [
      { label: "RSUs", value: "Taxed as wages when they vest. The value is already on your W-2." },
      { label: "Withholding on RSUs", value: "Usually 22% federal (37% above $1 million of supplemental wages), which can fall short of what a high earner owes." },
      { label: "Selling RSU shares", value: "Brokers often show a $0 or partial cost basis on Form 1099-B. Correct it on Form 8949 or the same income is taxed twice." },
      { label: "ESPP", value: "A qualifying disposition needs 2 years from the offering date and 1 year from purchase. Selling sooner makes the whole bargain element at purchase taxable as wages." },
      { label: "Backdoor Roth IRA", value: "The 2026 IRA contribution limit is $7,500 ($8,600 if you are 50 or older)." },
    ],
    sources: [IRS.p525, IRS.p15, IRS.f8949],
  },
  nri: {
    id: "quick-answer",
    question: "Do NRIs living in the U.S. have to file taxes in both countries?",
    answer:
      "Often, yes. If you are a U.S. tax resident (green card holder, or on H-1B or L-1 and meeting the substantial presence test) you report worldwide income, including Indian interest, rent and capital gains, on your U.S. return. You may also need an Indian return. Tax paid in India is usually credited on Form 1116, so the same income is not taxed twice.",
    factsCaption: "U.S. reporting for Indian assets, tax year 2026",
    facts: [
      { label: "FBAR (FinCEN 114)", value: "Required if your foreign accounts together exceed $10,000 at any time in the year. Due April 15, 2027, automatically extended to October 15, 2027." },
      { label: "Form 8938 (FATCA)", value: "Single filers living in the U.S.: over $50,000 on December 31 or over $75,000 at any time. Married filing jointly: $100,000 or $150,000." },
      { label: "Indian mutual funds", value: "Usually PFICs, reported on Form 8621 each year, with punitive default tax if handled wrongly." },
      { label: "Foreign tax credit", value: "Claim tax paid in India on Form 1116, under the India-U.S. tax treaty." },
    ],
    sources: [IRS.spt, IRS.fbar, IRS.fbarVs8938, IRS.f8621, IRS.f1116],
  },
  indiaItr: {
    id: "quick-answer",
    question: "Do NRIs in the U.S. need to file an Indian income tax return?",
    answer:
      "You must file if your Indian income is above the basic exemption limit, and it is worth filing to claim back excess TDS on NRO interest, rent or property sales. NRIs cannot use ITR-1; most file ITR-2, or ITR-3 with business income. Lesser Tax files your ITR online from the U.S., starting at $69.",
    factsCaption: "Indian income tax for NRIs, FY 2025-26 (AY 2026-27)",
    facts: [
      { label: "Basic exemption", value: "₹4,00,000 under the new regime, ₹2,50,000 under the old regime." },
      { label: "Which form", value: "ITR-2 for salary, interest, rent and capital gains. ITR-3 if you have business or professional income in India." },
      { label: "Due date", value: "Usually July 31 for individuals who do not need an audit. The government sometimes extends it." },
      { label: "Treaty relief", value: "The India-U.S. tax treaty can cut TDS on NRO interest to 15% with a Tax Residency Certificate and Form 10F." },
    ],
    sources: [INDIA_ITR],
  },
  passport: {
    id: "quick-answer",
    question: "How do you renew an Indian passport in the USA?",
    answer:
      "Fill in the renewal form online on the Passport Seva portal, then send the printed application, your current passport and supporting documents to the VFS Global centre that serves your state. Most renewals take 3 to 4 weeks once VFS has the application. Lesser Tax prepares the forms and checks your full packet for a flat $140.",
    facts: [
      { label: "Where to apply", value: "Passport Seva online form, then the VFS Global centre for your consulate's jurisdiction." },
      { label: "Typical timeline", value: "3 to 4 weeks after VFS receives the application. It varies by consulate." },
      { label: "Lesser Tax fee", value: "$140 flat. Consular, VFS and courier fees are paid separately." },
      { label: "Travel to India", value: "Not needed. Everything is done by mail through VFS." },
    ],
    sources: [{ label: "Consulate General of India, New York", href: "https://www.indiainnewyork.gov.in/" }],
  },
  business: {
    id: "quick-answer",
    question: "When are business tax returns due, and what does filing cost?",
    answer:
      "For calendar-year businesses, partnerships (Form 1065) and S corporations (Form 1120-S) file by March 15 and C corporations (Form 1120) by April 15. Form 7004 gives an automatic six-month extension to file, not to pay. Lesser Tax prepares each return on our platform with a CPA review, for $100 per entity.",
    factsCaption: "Tax year 2026 returns (calendar year)",
    facts: [
      { label: "Form 1065 and 1120-S", value: "Due March 15, 2027. Extended due date September 15, 2027." },
      { label: "Form 1120", value: "Due April 15, 2027. Extended due date October 15, 2027." },
      { label: "Single-member LLC", value: "No separate return by default. Income goes on the owner's Form 1040 (Schedule C or E)." },
      { label: "Lesser Tax price", value: "$100 per entity, CPA-reviewed." },
    ],
    sources: [IRS.f1065, IRS.f1120s, IRS.f7004],
  },
  deadline: {
    id: "quick-answer",
    question: "What is the March 15 business tax deadline?",
    answer:
      "March 15 is the due date for calendar-year partnership returns (Form 1065, with partner K-1s) and S corporation returns (Form 1120-S). Miss it without filing Form 7004 and the IRS charges a penalty for each partner or shareholder for every month the return is late. Lesser Tax can file within 24 hours for a flat $100.",
    factsCaption: "Tax year 2026 returns (calendar year)",
    facts: [
      { label: "Due date", value: "March 15, 2027 for Form 1065 and Form 1120-S." },
      { label: "Extension", value: "File Form 7004 by March 15, 2027 to move the filing deadline to September 15, 2027." },
      { label: "Late penalty", value: "Charged per partner or shareholder, per month late, for up to 12 months." },
      { label: "C corporations", value: "Form 1120 is due April 15, 2027." },
    ],
    sources: [IRS.f1065, IRS.f1120s, IRS.f7004],
  },
  partnerships: {
    id: "quick-answer",
    question: "Who has to file Form 1065, and what are K-1s?",
    answer:
      "Every partnership, including a multi-member LLC taxed as a partnership, files Form 1065 for every year it has income, deductions or credits. The return issues a Schedule K-1 to each partner showing their share of income, deductions and credits, which partners report on their own returns. Lesser Tax prepares Form 1065 and all K-1s for $100 per entity, CPA-reviewed.",
    factsCaption: "Tax year 2026 returns (calendar year)",
    facts: [
      { label: "Due date", value: "March 15, 2027, or September 15, 2027 with Form 7004." },
      { label: "Rental partnerships", value: "Rental income and expenses go on Form 8825, attached to Form 1065." },
      { label: "K-1s", value: "Due to every partner by the return's due date, including extensions." },
      { label: "Lesser Tax price", value: "$100 per entity, including all K-1s." },
    ],
    sources: [IRS.f1065, IRS.f8825, IRS.f7004],
  },
  realEstate: {
    id: "quick-answer",
    question: "How are rental property LLCs taxed?",
    answer:
      "A single-member rental LLC is ignored for income tax by default, so the rent goes on the owner's Schedule E. A multi-member LLC files a partnership return (Form 1065) with Form 8825 and gives each member a K-1. Residential rentals are depreciated over 27.5 years. Lesser Tax files each LLC return for $100.",
    facts: [
      { label: "Single-member LLC", value: "Schedule E on the owner's Form 1040. No separate return." },
      { label: "Multi-member LLC", value: "Form 1065 and Form 8825, due March 15, 2027 for tax year 2026." },
      { label: "Depreciation", value: "27.5 years for residential rental buildings (land is not depreciated)." },
      { label: "Lesser Tax price", value: "$100 per LLC, so 5 LLCs cost $500." },
    ],
    sources: [IRS.p527, IRS.f8825, IRS.f1065],
  },
  infosys: {
    id: "quick-answer",
    question: "What taxes do Infosys employees in the U.S. need to plan for?",
    answer:
      "Infosys employees in the U.S. are usually U.S. tax residents taxed on worldwide income. Stock grants are taxed as wages when they vest. Indian bank accounts and investments can trigger FBAR, Form 8938 and PFIC reporting. Tax paid in India can usually be credited on Form 1116. Lesser Tax plans and files both sides, from $99 a year.",
    facts: [
      { label: "Residency", value: "H-1B and L-1 holders who meet the substantial presence test are taxed like U.S. citizens." },
      { label: "Stock grants", value: "Taxed as wages at vesting. Check that your 1099-B cost basis is not double-counted." },
      { label: "Indian accounts", value: "FBAR if they total more than $10,000 at any time in the year." },
      { label: "Indian mutual funds", value: "Usually PFICs, reported on Form 8621." },
    ],
    sources: [IRS.spt, IRS.p525, IRS.fbar, IRS.f8621],
  },
} satisfies Record<string, QA>;
