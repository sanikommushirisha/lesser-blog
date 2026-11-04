import { LEAD_MAGNETS, type LeadMagnetId } from "./lead-magnets";

/**
 * Free web tools: the tax rules, the result text and the result email.
 *
 * Results reach readers only by email, so all of this runs on the server. The
 * page sends answers, never a finished result, which means nobody can use the
 * endpoint to send their own text from our address.
 *
 * Every rule and figure comes from a published Lesser Tax post (named next to
 * it), so a change in the law means changing the post and this file together.
 * Tax year 2026 unless noted.
 */

export const TOOLS = {
  "rsu-gap": { name: "RSU withholding gap", offer: "rsu-checklist" },
  "residency-test": { name: "Substantial Presence Test", offer: "nri-checklist" },
  "india-money": { name: "Money from India check", offer: "india-accounts-checklist" },
  "401k-exit": { name: "401(k) cash-out cost", offer: "moving-back-checklist" },
  "founder-forms": { name: "Founder tax forms", offer: "founder-checklist" },
} as const satisfies Record<string, { name: string; offer: LeadMagnetId }>;

export type ToolId = keyof typeof TOOLS;
export const TOOL_IDS = Object.keys(TOOLS) as [ToolId, ...ToolId[]];

export type ToolAnswers = {
  "rsu-gap": { filing: "single" | "joint"; rsu: number; salary: number; bracket: number };
  "residency-test": {
    greencard: "yes" | "no";
    visa: "other" | "exempt";
    current: number;
    prior: number;
    before: number;
  };
  "india-money": {
    usperson: "yes" | "no";
    source: "family" | "person" | "estate" | "loan" | "company" | "trust";
    amount: number;
  };
  "401k-exit": {
    balance: number;
    age: "under" | "over";
    timing: "before" | "after";
    other: number;
  };
  "founder-forms": {
    entity: "smllc" | "mmllc" | "scorp" | "ccorp";
    owner: "us" | "foreign";
  };
};

export type ToolResult = {
  tone: "ok" | "warn";
  title: string;
  body: string;
  rows: [string, string][];
  heading?: string;
  items: string[];
  note?: string;
};

// where-your-paycheck-goes-taxes-h1b (Rev. Proc. 2025-32). Single filers only:
// the posts do not give a complete married filing jointly table.
const BRACKETS_SINGLE: [number, number][] = [
  [12400, 0.1],
  [50400, 0.12],
  [105700, 0.22],
  [201775, 0.24],
  [256225, 0.32],
  [640600, 0.35],
  [Infinity, 0.37],
];
const STANDARD_DEDUCTION_SINGLE = 16100;

const taxableSingle = (wages: number) => Math.max(0, wages - STANDARD_DEDUCTION_SINGLE);

export function marginalRateSingle(wages: number): number {
  const taxable = taxableSingle(wages);
  const bracket = BRACKETS_SINGLE.find(([limit]) => taxable <= limit);
  return bracket ? bracket[1] : 0.37;
}

export function incomeTaxSingle(taxable: number): number {
  let tax = 0;
  let previous = 0;
  for (const [limit, rate] of BRACKETS_SINGLE) {
    const slice = Math.min(taxable, limit) - previous;
    if (slice <= 0) break;
    tax += slice * rate;
    previous = limit;
  }
  return tax;
}

// rsu-taxes-h1b-2026: 22% on supplemental wages, 37% past $1 million.
// Gap = vest income x (marginal rate - withholding rate).
export function rsuGap(rsu: number, marginal: number) {
  const withheld = Math.min(rsu, 1_000_000) * 0.22 + Math.max(0, rsu - 1_000_000) * 0.37;
  const owed = rsu * marginal;
  return { withheld, owed, gap: Math.max(0, owed - withheld) };
}

// substantial-presence-test: 31 days this year and 183 weighted days. No post
// gives a rounding rule, so fractions are kept as they are.
export function presenceTest(current: number, prior: number, before: number) {
  const weighted = current + prior / 3 + before / 6;
  const meets = current >= 31 && weighted >= 183;
  // Form 8840 needs fewer than 183 days in the current year.
  return { weighted, meets, closerConnectionPossible: meets && current < 183 };
}

// us-401k-moving-back-to-india. Before leaving, the cash-out stacks on the
// year's other income. After becoming a nonresident the posts give the
// up-front withholding but not the final tax, so no total is worked out.
export function cashOutBefore(balance: number, other: number, underAge: boolean) {
  const incomeTax =
    incomeTaxSingle(taxableSingle(other + balance)) - incomeTaxSingle(taxableSingle(other));
  const extra = underAge ? balance * 0.1 : 0;
  const total = incomeTax + extra;
  return { incomeTax, extra, total, share: balance > 0 ? total / balance : 0, left: balance - total };
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const percent = (r: number) => `${Math.round(r * 100)}%`;
const twoPlaces = (n: number) => String(Math.round(n * 100) / 100);

function rsuResult(a: ToolAnswers["rsu-gap"]): ToolResult {
  const marginal = a.filing === "single" ? marginalRateSingle(a.salary + a.rsu) : a.bracket;
  const r = rsuGap(a.rsu, marginal);
  const rows: [string, string][] = [
    ["Your top federal bracket", percent(marginal)],
    ["Withheld at vest (estimate)", money(r.withheld)],
    ["Federal income tax on the RSUs", money(r.owed)],
  ];
  if (r.gap <= 0) {
    return {
      tone: "ok",
      title: "No gap at this bracket",
      body: `At a ${percent(marginal)} bracket, the flat vest withholding covers the federal income tax on these RSUs.`,
      rows,
      items: [],
    };
  }
  return {
    tone: "warn",
    title: `Estimated gap: ${money(r.gap)}`,
    body: "This is federal income tax your employer may not withhold on these RSUs.",
    rows,
    heading: "Ways to close it",
    items: [
      "Add extra withholding on Form W-4, Step 4(c).",
      "Make a quarterly estimated payment through IRS Direct Pay.",
      "Compare your prepayments with the safe harbor: 100% of last year's tax, or 110% if last year's AGI was over $150,000.",
    ],
  };
}

function residencyResult(a: ToolAnswers["residency-test"]): ToolResult {
  if (a.greencard === "yes") {
    return {
      tone: "warn",
      title: "You are a resident under the green card test",
      body: "The day count does not decide it for you. Green card status continues until it is given up or terminated, so this calculator does not apply.",
      rows: [],
      items: [],
    };
  }
  const r = presenceTest(a.current, a.prior, a.before);
  const items: string[] = [];
  if (a.visa === "exempt") {
    items.push(
      "On F, J, M or Q status, days as an exempt individual should be left out of the counts, and you file Form 8843 to exclude them. Filing it on time matters.",
    );
  }
  if (r.closerConnectionPossible) {
    items.push("You were here fewer than 183 days this year, so check the closer connection exception on Form 8840.");
  }
  if (r.meets) {
    items.push("An arrival or departure year is usually a dual-status year, with different forms and limits.");
  }
  return {
    tone: r.meets ? "warn" : "ok",
    title: r.meets ? "You meet the Substantial Presence Test" : "You do not meet the test",
    body: r.meets
      ? "You are generally a US resident for tax, and report worldwide income on Form 1040."
      : a.current < 31
        ? "You need at least 31 days in the current year."
        : "You are under 183 weighted days, so you are generally a nonresident and file Form 1040-NR if you have a US filing duty.",
    rows: [
      ["Current year days", String(a.current)],
      ["Prior year days / 3", twoPlaces(a.prior / 3)],
      ["Year before / 6", twoPlaces(a.before / 6)],
      ["Weighted total (183 needed)", twoPlaces(r.weighted)],
    ],
    heading: items.length ? "What to check next" : undefined,
    items,
  };
}

// form-3520-gifts-inheritance-from-parents-india and
// parents-sent-money-for-house-us-reporting.
function indiaMoneyResult(a: ToolAnswers["india-money"]): ToolResult {
  const notIncome =
    "A gift from a nonresident individual is not income, so this is a reporting form and not a tax bill. Later earnings on the money are taxable.";
  const simple = (tone: ToolResult["tone"], title: string, body: string): ToolResult => ({
    tone,
    title,
    body,
    rows: [],
    items: [],
  });
  if (a.usperson === "no") {
    return simple("ok", "Form 3520 does not apply", "If you are a nonresident alien, Form 3520 does not apply to you.");
  }
  if (a.source === "loan") {
    return simple(
      "warn",
      "A documented loan is not a gift",
      "Keep the loan paperwork. A loan with no documents is typically treated as a gift, so run this check again as a gift if you have none.",
    );
  }
  if (a.source === "company") {
    return simple(
      "warn",
      "Check this year's line",
      "Gifts from foreign corporations and partnerships have a much lower line, set every year. Check the current figure at irs.gov/InflationAdjustment or ask a CPA.",
    );
  }
  if (a.source === "trust") {
    return simple(
      "warn",
      "Form 3520 is likely required",
      "Distributions from a foreign trust have no $100,000 line: any amount is reported. Talk to a CPA, because trust rules are different.",
    );
  }
  if (a.amount <= 100000) {
    return simple(
      "ok",
      "No Form 3520 for this total",
      `The calendar-year total of ${money(a.amount)} is not over $100,000. ${notIncome}`,
    );
  }
  return {
    tone: "warn",
    title: "Form 3520 is required",
    body: `The calendar-year total of ${money(a.amount)} is over $100,000, so the full amount is reported. ${notIncome}`,
    rows: [
      ["Normal due date", "April 15 of next year"],
      ["With Form 4868 extension", "October 15"],
      ["Penalty if late, each month", money(a.amount * 0.05)],
      ["Penalty cap (25%)", money(a.amount * 0.25)],
    ],
    heading: "What to do",
    items: [
      "File it separately from your Form 1040, by mail to the IRS in Ogden.",
      "Convert each amount to dollars using the date you received it.",
      "If you missed a past year, the usual fix is to file late with a reasonable-cause statement.",
    ],
  };
}

function cashOutResult(a: ToolAnswers["401k-exit"]): ToolResult {
  const underAge = a.age === "under";
  const stayOption = "Keeping the account, or a direct rollover to a traditional IRA, has no US tax today.";
  if (a.timing === "after") {
    return {
      tone: "warn",
      title: "We can only estimate what is withheld",
      body: "Withholding is a prepayment, not your final tax. Your final US tax depends on your treaty position, which needs a CPA.",
      rows: [
        ["Likely withheld up front (often 30%)", money(a.balance * 0.3)],
        ...(underAge ? [["Additional 10% before age 59 1/2", money(a.balance * 0.1)] as [string, string]] : []),
      ],
      items: [],
      note: `The 10% is commonly understood to still apply after you become a nonresident. ${stayOption}`,
    };
  }
  const r = cashOutBefore(a.balance, a.other, underAge);
  return {
    tone: "warn",
    title: `Estimated federal cost: ${money(r.total)} (${percent(r.share)})`,
    body: "This is a cash-out in one tax year while you are still a US resident. It uses the 2026 single-filer brackets.",
    rows: [
      ["Federal income tax on the cash-out", money(r.incomeTax)],
      ...(underAge ? [["Additional 10% before age 59 1/2", money(r.extra)] as [string, string]] : []),
      ["Left after federal tax", money(r.left)],
    ],
    items: [],
    note: `State tax is not included. ${stayOption} Moving abroad is not an exception to the 10%, but some exceptions exist, such as leaving that employer in or after the year you turn 55.`,
  };
}

function founderResult(a: ToolAnswers["founder-forms"]): ToolResult {
  const foreign = a.owner === "foreign";
  const extend = "Form 7004 extends the time to file, not the time to pay, and must be filed by the original due date.";
  const state = "State filings are not covered here, and some states need their own extension.";
  if (a.entity === "smllc" && !foreign) {
    return {
      tone: "ok",
      title: "No separate LLC return",
      body: "A single-member LLC with a US owner is disregarded. You report it on Schedule C, E or F of your Form 1040.",
      rows: [],
      items: [
        "If you move abroad and become a nonresident, Form 5472 comes into play.",
        "If the LLC has employees, payroll returns are its own.",
        state,
      ],
    };
  }
  if (a.entity === "smllc") {
    return {
      tone: "warn",
      title: "Pro forma Form 1120 plus Form 5472",
      body: "An India-based owner of a single-member LLC files these every year, even with no revenue, when there is a reportable transaction. Reportable transactions have effectively no minimum, so check with a CPA before skipping a year.",
      rows: [
        ["Due", "April 15"],
        ["With Form 7004", "October 15"],
        ["Filing", "Mail or fax, no e-file"],
        ["Penalty for missing it", "$25,000"],
      ],
      items: [extend, "The penalty is also charged for a late or substantially incomplete form.", state],
    };
  }
  if (a.entity === "mmllc") {
    return {
      tone: "warn",
      title: "Form 1065 plus K-1s",
      body: "A multi-member LLC files as a partnership, unless it truly had no income and no deductible expenses.",
      rows: [
        ["Due", "March 15"],
        ["With Form 7004", "September 15"],
        ["Late penalty", "About $255 per partner, per month, up to 12 months"],
      ],
      items: [extend, ...(foreign ? ["Nonresident partners bring withholding rules that a CPA should set up."] : []), state],
    };
  }
  if (a.entity === "scorp" && foreign) {
    return {
      tone: "warn",
      title: "An S corp cannot have a nonresident shareholder",
      body: "A transfer of shares to a nonresident ends the election on the date of transfer. A C corporation has no such limit.",
      rows: [],
      items: ["An LLC with a nonresident member can elect C corporation treatment on Form 8832, not S.", state],
    };
  }
  if (a.entity === "scorp") {
    return {
      tone: "warn",
      title: "Form 1120-S plus K-1s",
      body: "You file every year the S election is in effect, even with no income.",
      rows: [
        ["Due", "March 15"],
        ["With Form 7004", "September 15"],
        ["Late penalty", "About $255 per shareholder, per month, up to 12 months"],
      ],
      items: [
        extend,
        "Working shareholders must be paid reasonable W-2 wages.",
        "Form 2553 is due 2 months and 15 days after the start of the tax year.",
        state,
      ],
    };
  }
  return {
    tone: "warn",
    title: foreign ? "Form 1120 plus Form 5472" : "Form 1120",
    body: "A C corporation files even with zeros.",
    rows: [
      ["Due", "April 15"],
      ["With Form 7004", "October 15"],
      ...(foreign ? [["Form 5472 penalty", "$25,000"] as [string, string]] : []),
    ],
    items: [
      extend,
      ...(foreign
        ? [
            "Form 5472 applies if a foreign owner holds 25% or more.",
            "Dividends to a nonresident shareholder face 30% withholding, or 25% under the India treaty with Form W-8BEN.",
          ]
        : []),
      state,
    ],
  };
}

export function computeResult<T extends ToolId>(tool: T, answers: ToolAnswers[T]): ToolResult {
  switch (tool) {
    case "rsu-gap":
      return rsuResult(answers as ToolAnswers["rsu-gap"]);
    case "residency-test":
      return residencyResult(answers as ToolAnswers["residency-test"]);
    case "india-money":
      return indiaMoneyResult(answers as ToolAnswers["india-money"]);
    case "401k-exit":
      return cashOutResult(answers as ToolAnswers["401k-exit"]);
    default:
      return founderResult(answers as ToolAnswers["founder-forms"]);
  }
}

const SITE_URL = "https://lesser.tax";
const DISCLAIMER = "Educational estimate only. Not tax or legal advice. Your situation may differ.";
const FOOTER =
  "You got this because you asked for it on lesser.tax. To stop our emails, reply with the word unsubscribe.";
const ADDRESS = "Lesser Inc., 353 King St, San Francisco, CA 94158, USA";

/** All text here is fixed copy or a formatted number, never anything a visitor typed. */
export function resultEmail(tool: ToolId, r: ToolResult) {
  const { name, offer } = TOOLS[tool];
  const pdf = LEAD_MAGNETS[offer];
  const pdfUrl = `${SITE_URL}/blog/guides/${pdf.file}`;
  const text = [
    `Your ${name} result`,
    r.title,
    r.body,
    ...r.rows.map(([k, v]) => `${k}: ${v}`),
    ...(r.heading ? [r.heading] : []),
    ...r.items.map((i) => `- ${i}`),
    ...(r.note ? [r.note] : []),
    `Your free ${pdf.title}: ${pdfUrl}`,
    "We will also send you a short tax note for immigrants in tech each week.",
    DISCLAIMER,
    `Lesser Tax\n${FOOTER}\n${ADDRESS}`,
  ].join("\n\n");
  const color = r.tone === "ok" ? "#034f46" : "#9a3412";
  const rows = r.rows.length
    ? `<table style="border-collapse:collapse;width:100%;margin:12px 0">${r.rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;border-bottom:1px solid #e3e0d4;color:#555">${k}</td><td style="padding:8px 0;border-bottom:1px solid #e3e0d4;text-align:right;font-weight:700">${v}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const items = r.items.length ? `<ul style="padding-left:20px">${r.items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "";
  const html = `<div style="font-family:Arial,sans-serif;color:#1a1a1a;font-size:16px;line-height:1.5;max-width:520px">
<p style="color:#555;margin:0 0 4px">Your ${name} result</p>
<p style="font-size:22px;font-weight:700;color:${color};margin:0 0 8px">${r.title}</p>
<p>${r.body}</p>
${rows}
${r.heading ? `<p style="font-weight:700;margin-bottom:4px">${r.heading}</p>` : ""}
${items}
${r.note ? `<p style="font-size:14px;color:#555">${r.note}</p>` : ""}
<p style="margin-top:20px"><a href="${pdfUrl}" style="display:inline-block;background:#034f46;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Get your free ${pdf.title}</a></p>
<p>We will also send you a short tax note for immigrants in tech each week.</p>
<p style="font-size:13px;color:#555">${DISCLAIMER}</p>
<p>Lesser Tax</p>
<p style="font-size:12px;color:#777">${FOOTER}<br>${ADDRESS}</p>
</div>`;
  return { subject: `Your ${name} result`, text, html };
}
