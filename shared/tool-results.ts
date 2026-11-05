import { LEAD_MAGNETS, type LeadMagnetId } from "./lead-magnets";

/**
 * Free web tools: the tax rules, the personal reports and the report email.
 *
 * Reports reach readers only by email, so all of this runs on the server. The
 * page sends answers, never a finished report, which means nobody can use the
 * endpoint to send their own text from our address.
 *
 * Sources: rules and figures come from published Lesser Tax posts (named next
 * to them). Brackets, standard deductions and the joint Additional Medicare
 * line match the Lesser app (lib/tax-plan/brackets.ts, tax-rules-2025.ts). A
 * change in the law means changing those and this file together.
 */

export const TOOLS = {
  "rsu-gap": { name: "RSU Tax Planner", offer: "rsu-checklist" },
  "residency-test": { name: "US Tax Residency Report", offer: "nri-checklist" },
  "india-money": { name: "Money from India Report", offer: "india-accounts-checklist" },
  "401k-exit": { name: "401(k) Exit Planner", offer: "moving-back-checklist" },
  "founder-forms": { name: "Founder Filing Calendar", offer: "founder-checklist" },
} as const satisfies Record<string, { name: string; offer: LeadMagnetId }>;

export type ToolId = keyof typeof TOOLS;
export const TOOL_IDS = Object.keys(TOOLS) as [ToolId, ...ToolId[]];

export type Filing = "S" | "MFJ" | "MFS" | "HOH";

export type RsuAnswers = {
  filing: Filing;
  lastYearTax: number;
  lastYearAgi: number;
  spouseWages: number;
  spouseWithheld: number;
  otherIncome: number;
  estimatedPaid: number;
  employers: { salary: number; bonus: number; withheld: number }[];
  vests: { employer: number; quarter: string; value: number }[];
};

export type Trip = { from: string; to: string; status: "worker" | "student" | "scholar" | "dependent" };

export type ResidencyAnswers = {
  year: number;
  greencard: "no" | "yes";
  firstStudentYear: number;
  firstScholarYear: number;
  greenCardSteps: "no" | "yes";
  foreignTaxHome: "no" | "yes";
  trips: Trip[];
};

export type Transfer = {
  date: string;
  kind: "gift" | "inheritance" | "loan-documented" | "loan-undocumented" | "company" | "trust";
  donor: "family1" | "family2" | "other1" | "other2";
  recipient: "me" | "spouse" | "joint";
  amount: number;
  currency: "USD" | "INR";
  rate: number;
};

export type MoneyAnswers = { usperson: "yes" | "no"; transfers: Transfer[] };

export type ExitAnswers = {
  balance: number;
  age: number;
  left55: "no" | "yes";
  filing: Filing;
  incomeThisYear: number;
  incomeNextYear: number;
  stillResidentNextYear: "no" | "yes";
  years: number;
  growth: number;
};

export type Owner = { pct: number; status: "citizen" | "greencard" | "visa" | "nonresident" };

export type FounderAnswers = {
  entity: "smllc" | "mmllc" | "scorp" | "ccorp";
  taxYear: number;
  firstDay: string;
  revenue: "no" | "yes";
  ownerMoney: "no" | "yes";
  employees: "no" | "yes";
  monthsLate: number;
  owners: Owner[];
};

export type ToolAnswers = {
  "rsu-gap": RsuAnswers;
  "residency-test": ResidencyAnswers;
  "india-money": MoneyAnswers;
  "401k-exit": ExitAnswers;
  "founder-forms": FounderAnswers;
};

export type Section = {
  heading: string;
  intro?: string;
  rows?: [string, string][];
  table?: { head: string[]; rows: string[][] };
  items?: string[];
  note?: string;
};

export type ToolReport = {
  tone: "ok" | "warn";
  title: string;
  body: string;
  sections: Section[];
};

// ---- Shared tax tables, 2026 -------------------------------------------------

const BRACKETS: Record<Filing, [number, number][]> = {
  S: [[12400, 0.1], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]],
  MFJ: [[24800, 0.1], [100800, 0.12], [211400, 0.22], [403550, 0.24], [512450, 0.32], [768700, 0.35], [Infinity, 0.37]],
  HOH: [[17700, 0.1], [67450, 0.12], [105700, 0.22], [201775, 0.24], [256200, 0.32], [640600, 0.35], [Infinity, 0.37]],
  MFS: [[12400, 0.1], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [384350, 0.35], [Infinity, 0.37]],
};
const STANDARD_DEDUCTION: Record<Filing, number> = { S: 16100, MFS: 16100, HOH: 24150, MFJ: 32200 };
const FILING_LABEL: Record<Filing, string> = {
  S: "Single",
  MFJ: "Married filing jointly",
  MFS: "Married filing separately",
  HOH: "Head of household",
};

const SS_WAGE_BASE = 184500;
const SS_RATE = 0.062;
const SUPPLEMENTAL_RATE = 0.22;
const SUPPLEMENTAL_TOP_RATE = 0.37;
const SUPPLEMENTAL_LINE = 1_000_000;

export function taxable(income: number, filing: Filing): number {
  return Math.max(0, income - STANDARD_DEDUCTION[filing]);
}

export function marginalRate(income: number, filing: Filing): number {
  const t = taxable(income, filing);
  return (BRACKETS[filing].find(([limit]) => t <= limit) ?? [0, 0.37])[1];
}

export function incomeTax(taxableIncome: number, filing: Filing): number {
  let tax = 0;
  let previous = 0;
  for (const [limit, rate] of BRACKETS[filing]) {
    const slice = Math.min(taxableIncome, limit) - previous;
    if (slice <= 0) break;
    tax += slice * rate;
    previous = limit;
  }
  return tax;
}

const money = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const percent = (r: number) => `${Math.round(r * 1000) / 10}%`;
const twoPlaces = (n: number) => String(Math.round(n * 100) / 100);

// ---- Dates (UTC, so results do not shift with the server's time zone) --------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;
const parseDate = (d: string) => Date.parse(`${d}T00:00:00Z`);
const formatDate = (ms: number) => {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};
const utc = (y: number, m: number, d: number) => Date.UTC(y, m, d);

/** Rolls a due date on a weekend to Monday. Federal holidays are not handled. */
export function nextWeekday(ms: number): number {
  const day = new Date(ms).getUTCDay();
  return ms + (day === 6 ? 2 : day === 0 ? 1 : 0) * DAY_MS;
}

// ---- 1. RSU Tax Planner (rsu-taxes-h1b-2026, h-1b-transfer-two-w2s-withholding-rsus) --

/** 22% up to $1 million of supplemental wages from one employer, 37% past it. */
export function vestWithholding(value: number, supplementalSoFar: number): number {
  const atBase = Math.max(0, Math.min(value, SUPPLEMENTAL_LINE - supplementalSoFar));
  return atBase * SUPPLEMENTAL_RATE + (value - atBase) * SUPPLEMENTAL_TOP_RATE;
}

export function planRsu(a: RsuAnswers) {
  const employers = a.employers.map((e, i) => {
    const vests = a.vests.filter((v) => v.employer === i);
    const rsu = vests.reduce((sum, v) => sum + v.value, 0);
    const wages = e.salary + e.bonus + rsu;
    return { ...e, vests, rsu, wages, ssWithheld: SS_RATE * Math.min(wages, SS_WAGE_BASE) };
  });
  const rsu = employers.reduce((sum, e) => sum + e.rsu, 0);
  const ownWages = employers.reduce((sum, e) => sum + e.wages, 0);
  const householdWages = ownWages + (a.filing === "MFJ" ? a.spouseWages : 0);
  const income = householdWages + a.otherIncome;
  const tax = incomeTax(taxable(income, a.filing), a.filing);
  const marginal = marginalRate(income, a.filing);

  let vestWithheld = 0;
  const vestRows = employers.flatMap((e, i) => {
    let supplemental = e.bonus;
    return e.vests.map((v) => {
      const withheld = vestWithholding(v.value, supplemental);
      supplemental += v.value;
      vestWithheld += withheld;
      return {
        employer: i + 1,
        quarter: v.quarter,
        value: v.value,
        withheld,
        owed: v.value * marginal,
        gap: Math.max(0, v.value * marginal - withheld),
      };
    });
  });

  const salaryWithheld = employers.reduce((sum, e) => sum + e.withheld, 0);
  const spouseWithheld = a.filing === "MFJ" ? a.spouseWithheld : 0;
  const prepaid = salaryWithheld + vestWithheld + spouseWithheld + a.estimatedPaid;

  // Owed above $250,000 for joint filers, withheld only past $200,000 at one employer.
  const medicareLine = a.filing === "MFJ" ? 250000 : a.filing === "MFS" ? null : 200000;
  const medicareOwed = medicareLine === null ? 0 : Math.max(0, householdWages - medicareLine) * 0.009;
  const medicareWithheld = employers.reduce((sum, e) => sum + Math.max(0, e.wages - 200000) * 0.009, 0);
  const medicareGap = medicareOwed - medicareWithheld;

  const balance = tax + medicareGap - prepaid;
  const safeHarborPrior = a.lastYearTax * (a.lastYearAgi > 150000 ? 1.1 : 1);
  const safeHarbor = Math.min(tax * 0.9, safeHarborPrior);
  const safeHarborShort = Math.max(0, safeHarbor - prepaid);

  const ssCombined = employers.reduce((sum, e) => sum + e.ssWithheld, 0);
  const excessSs = Math.max(0, ssCombined - SS_RATE * SS_WAGE_BASE);

  return {
    employers, rsu, ownWages, income, tax, marginal, vestRows, vestWithheld, salaryWithheld, spouseWithheld,
    prepaid, medicareOwed, medicareWithheld, medicareGap, medicareLine, balance, safeHarbor, safeHarborShort,
    safeHarborPrior, excessSs, ssCombined,
  };
}

function rsuReport(a: RsuAnswers): ToolReport {
  const p = planRsu(a);
  const owes = p.balance > 0;
  const gapTotal = p.vestRows.reduce((sum, v) => sum + v.gap, 0);
  const sections: Section[] = [
    {
      heading: "Your year at a glance",
      rows: [
        ["Filing status", FILING_LABEL[a.filing]],
        ["Total income used", money(p.income)],
        ["RSU income", money(p.rsu)],
        ["Standard deduction", money(STANDARD_DEDUCTION[a.filing])],
        ["Your top federal bracket", percent(p.marginal)],
        ["Estimated federal income tax", money(p.tax)],
      ],
    },
    {
      heading: "Tax against what you have paid",
      rows: [
        ["Estimated federal income tax", money(p.tax)],
        ...(p.medicareGap > 0 ? [["Additional Medicare not withheld", money(p.medicareGap)] as [string, string]] : []),
        ["Withheld on salary and bonus (your figure)", money(p.salaryWithheld)],
        ["Withheld on RSUs (estimate)", money(p.vestWithheld)],
        ...(p.spouseWithheld ? [["Withheld on spouse's wages", money(p.spouseWithheld)] as [string, string]] : []),
        ...(a.estimatedPaid ? [["Estimated payments made", money(a.estimatedPaid)] as [string, string]] : []),
        [owes ? "Likely balance due at filing" : "Likely refund", money(Math.abs(p.balance))],
      ],
    },
  ];
  if (p.vestRows.length) {
    sections.push({
      heading: "Vest by vest",
      intro: `Each vest compared at your ${percent(p.marginal)} top bracket. Total gap on RSUs: ${money(gapTotal)}.`,
      table: {
        head: ["Vest", "Value", "Withheld", "Tax at your bracket", "Gap"],
        rows: p.vestRows.map((v) => [
          `${v.quarter}${a.employers.length > 1 ? `, employer ${v.employer}` : ""}`,
          money(v.value), money(v.withheld), money(v.owed), money(v.gap),
        ]),
      },
      note: "Vests are shown at your top bracket, so a vest that spans two brackets can show a little high here. The tax totals above use the full brackets.",
    });
  }
  sections.push({
    heading: "Underpayment penalty check",
    intro: "You generally avoid the penalty by prepaying the smaller of 90% of this year's tax or the prior-year figure below.",
    rows: [
      ["90% of this year's tax", money(p.tax * 0.9)],
      [`${a.lastYearAgi > 150000 ? "110%" : "100%"} of last year's tax`, money(p.safeHarborPrior)],
      ["Your safe harbor target", money(p.safeHarbor)],
      ["Prepaid so far (all sources)", money(p.prepaid)],
      p.safeHarborShort > 0 ? ["Short of the target by", money(p.safeHarborShort)] : ["Target met", "Yes"],
    ],
    note: a.lastYearTax === 0 ? "You entered $0 for last year's tax, so check that figure before relying on this." : undefined,
  });
  if (a.employers.length > 1 || p.medicareGap !== 0 || p.medicareLine === null) {
    const items: string[] = [];
    if (p.excessSs > 0) {
      items.push(`Your employers together should withhold about ${money(p.ssCombined)} of Social Security, over the 2026 limit of $11,439. The ${money(p.excessSs)} excess is claimed on Schedule 3.`);
    } else if (a.employers.length > 1) {
      items.push("Add Box 4 across your W-2s when they arrive. A total above $11,439 for 2026 means you overpaid.");
    }
    if (p.medicareGap > 0) items.push(`Additional Medicare Tax of about ${money(p.medicareGap)} is not covered by withholding. It is settled on Form 8959.`);
    if (p.medicareGap < 0) items.push(`About ${money(-p.medicareGap)} of Additional Medicare withheld is more than you owe. It is settled on Form 8959.`);
    if (p.medicareLine === null) items.push("Additional Medicare Tax for married filing separately is not included here.");
    sections.push({ heading: "Social Security and Medicare", items });
  }
  const actions: string[] = [];
  if (owes) {
    actions.push("Add extra withholding on Form W-4, Step 4(c), so the gap closes through payroll.");
    actions.push("Or make estimated payments through IRS Direct Pay.");
  }
  if (p.safeHarborShort > 0) actions.push(`Prepay at least ${money(p.safeHarborShort)} more to reach your safe harbor target.`);
  actions.push("Keep every vest confirmation. Your broker's Form 1099-B can show a $0 basis, which double-taxes the vest if you enter it as it stands.");
  sections.push({ heading: "What to do next", items: actions });
  return {
    tone: owes ? "warn" : "ok",
    title: owes ? `You may owe about ${money(p.balance)} when you file` : `You may get about ${money(-p.balance)} back`,
    body: "This is your 2026 federal estimate. It uses the standard deduction and leaves out state tax, credits and investment income you did not enter.",
    sections,
  };
}

// ---- 2. US Tax Residency Report (substantial-presence-test, dual-status-w8ben-moving-to-us) --

/** Calendar days in the US per year, by status. A day in two trips counts once. */
export function countDays(trips: Trip[], year: number) {
  const first = utc(year - 3, 0, 1);
  const last = utc(year, 11, 31);
  const days = new Map<number, Trip["status"]>();
  for (const t of trips) {
    const from = Math.max(parseDate(t.from), first);
    const to = Math.min(parseDate(t.to), last);
    for (let d = from; d <= to; d += DAY_MS) {
      // Working status wins a shared day: it is the one that counts.
      if (!days.has(d) || t.status === "worker") days.set(d, t.status);
    }
  }
  return days;
}

function isExempt(status: Trip["status"], year: number, a: ResidencyAnswers): boolean {
  if (status === "worker") return false;
  const student = a.firstStudentYear > 0 && year - a.firstStudentYear < 5;
  const scholar = a.firstScholarYear > 0 && year - a.firstScholarYear < 2;
  if (status === "student") return student;
  if (status === "scholar") return scholar;
  return student || scholar;
}

export function residencyByYear(a: ResidencyAnswers, year: number) {
  const days = countDays(a.trips, year);
  const counted = (y: number) => {
    let total = 0;
    let exempt = 0;
    let firstCounted: number | null = null;
    days.forEach((status, day) => {
      if (new Date(day).getUTCFullYear() !== y) return;
      if (isExempt(status, y, a)) exempt += 1;
      else {
        total += 1;
        if (firstCounted === null || day < firstCounted) firstCounted = day;
      }
    });
    return { total, exempt, firstCounted: firstCounted as number | null };
  };
  const current = counted(year);
  const prior = counted(year - 1);
  const before = counted(year - 2);
  const weighted = current.total + prior.total / 3 + before.total / 6;
  return { current, prior, before, weighted, meets: current.total >= 31 && weighted >= 183 };
}

export function residencyPlan(a: ResidencyAnswers) {
  const now = residencyByYear(a, a.year);
  const last = residencyByYear(a, a.year - 1);
  const start = now.meets ? (last.meets ? utc(a.year, 0, 1) : now.current.firstCounted) : null;
  const dualStatus = start !== null && start !== utc(a.year, 0, 1);
  const closerConnection =
    now.meets && now.current.total < 183 && a.foreignTaxHome === "yes" && a.greenCardSteps === "no";
  return { now, last, start, dualStatus, closerConnection };
}

function residencyReport(a: ResidencyAnswers): ToolReport {
  if (a.greencard === "yes") {
    return {
      tone: "warn",
      title: `You are a US tax resident for ${a.year}`,
      body: "You hold a green card, so the green card test decides this and your day count does not. The status continues until it is given up or terminated.",
      sections: [{
        heading: "What this means",
        items: [
          "You file Form 1040 and report worldwide income.",
          "Living abroad does not end this on its own.",
          "If you are planning to give up your green card, check the exit tax rules first.",
        ],
      }],
    };
  }
  const p = residencyPlan(a);
  const { now } = p;
  const forms: string[] = [];
  if (p.closerConnection) forms.push("Form 8840, to claim the closer connection exception, which can make you a nonresident.");
  if (now.meets && !p.closerConnection) {
    forms.push(p.dualStatus ? "Form 1040 marked Dual-Status Return, with Form 1040-NR as the statement." : "Form 1040, reporting worldwide income.");
  } else if (!p.closerConnection) {
    forms.push("Form 1040-NR if you have US income, covering US-source and effectively connected income.");
  }
  if (now.current.exempt > 0) forms.push(`Form 8843 for ${a.year}, to exclude your ${now.current.exempt} exempt days. Without it on time, those days cannot be excluded. Zero income does not excuse it.`);
  const checks: string[] = [];
  if (p.dualStatus) checks.push("In a dual-status year you generally cannot take the standard deduction, file jointly or use head of household unless an election applies.");
  if (now.meets) {
    checks.push("Replace the form your broker holds within 30 days of a residency change, W-8BEN to W-9, or dividend withholding will be wrong.");
    checks.push("If your spouse is not a resident, each of you runs a separate test. A once-in-a-lifetime election can treat a nonresident spouse as a resident to file jointly.");
  }
  if (a.firstStudentYear > 0) checks.push("F-1, J-1 and M-1 nonresident students are generally exempt from Social Security and Medicare on authorized work. That ends once you become a resident or move to H-1B.");
  if (!now.meets) checks.push("If you will meet the test next year, you may be able to choose resident status for part of this year. It needs 31 days in a row here and presence on 75% of the days after that.");
  if (now.meets && now.current.total < 183 && !p.closerConnection) checks.push("The closer connection exception does not look available from your answers. It needs a foreign tax home all year and no steps toward a green card.");
  return {
    tone: now.meets && !p.closerConnection ? "warn" : "ok",
    title: p.closerConnection
      ? `You meet the test, but may qualify as a nonresident for ${a.year}`
      : now.meets ? `You are a US tax resident for ${a.year}` : `You are a nonresident for ${a.year}`,
    body: now.meets
      ? `You have ${twoPlaces(now.weighted)} weighted days, over the 183 needed, and at least 31 days this year.`
      : now.current.total < 31
        ? `You have ${now.current.total} counted days this year, under the 31 needed.`
        : `You have ${twoPlaces(now.weighted)} weighted days, under the 183 needed.`,
    sections: [
      {
        heading: "Your day count",
        table: {
          head: ["Year", "Days in US", "Exempt days", "Counted days", "Weight", "Weighted"],
          rows: [
            [String(a.year), now.current.total + now.current.exempt, now.current.exempt, now.current.total, "All", twoPlaces(now.current.total)],
            [String(a.year - 1), now.prior.total + now.prior.exempt, now.prior.exempt, now.prior.total, "1/3", twoPlaces(now.prior.total / 3)],
            [String(a.year - 2), now.before.total + now.before.exempt, now.before.exempt, now.before.total, "1/6", twoPlaces(now.before.total / 6)],
          ].map((r) => r.map(String)),
        },
        note: "Any part of a day counts, so arrival and departure days are both included. Days as an exempt student or scholar are left out, within the calendar-year limits.",
      },
      ...(p.start !== null
        ? [{
            heading: "When residency starts and ends",
            rows: [
              ["Residency starting date", formatDate(p.start)],
              ["Dual-status year", p.dualStatus ? "Yes" : "No"],
              ["Default end date", `Dec 31, ${a.year}`],
            ] as [string, string][],
            note: p.dualStatus
              ? "You can ignore up to 10 days of presence when fixing the start date if your tax home was abroad on those days, with a signed statement on your return. Those days still count toward 183."
              : undefined,
          }]
        : []),
      { heading: "Forms for this year", items: forms },
      ...(checks.length ? [{ heading: "What to check next", items: checks }] : []),
    ],
  };
}

// ---- 3. Money from India Report (form-3520-gifts-inheritance-from-parents-india) -----

const GIFT_LINE = 100000;

export function moneyPlan(a: MoneyAnswers, today: number) {
  const usd = (t: Transfer) => (t.currency === "USD" ? t.amount : t.rate > 0 ? t.amount / t.rate : 0);
  type Bucket = { year: number; recipient: "me" | "spouse"; donor: Transfer["donor"]; total: number; count: number; crossed: string | null };
  const buckets = new Map<string, Bucket>();
  const flagged = { company: 0, trust: new Set<number>(), companyYears: new Set<number>() };
  const excluded = { loans: 0 };
  const sorted = [...a.transfers].sort((x, y) => parseDate(x.date) - parseDate(y.date));
  for (const t of sorted) {
    const year = new Date(parseDate(t.date)).getUTCFullYear();
    if (t.kind === "loan-documented") { excluded.loans += usd(t); continue; }
    if (t.kind === "company") { flagged.company += usd(t); flagged.companyYears.add(year); continue; }
    if (t.kind === "trust") { flagged.trust.add(year); continue; }
    const recipients: ("me" | "spouse")[] = t.recipient === "joint" ? ["me", "spouse"] : [t.recipient];
    for (const recipient of recipients) {
      const key = `${year}|${recipient}|${t.donor}`;
      const b = buckets.get(key) ?? { year, recipient, donor: t.donor, total: 0, count: 0, crossed: null };
      b.total += usd(t);
      b.count += 1;
      if (b.total > GIFT_LINE && !b.crossed) b.crossed = t.date;
      buckets.set(key, b);
    }
  }
  const all = Array.from(buckets.values()).sort((x, y) => x.year - y.year);
  const required = all.filter((b) => b.total > GIFT_LINE).map((b) => {
    const due = nextWeekday(utc(b.year + 1, 3, 15));
    const late = today > due ? Math.ceil((today - due) / (30.44 * DAY_MS)) : 0;
    const months = Math.min(late, 5);
    return { ...b, due, extended: nextWeekday(utc(b.year + 1, 9, 15)), late, penalty: b.total * 0.05 * months, cap: b.total * 0.25 };
  });
  return { all, required, flagged, excluded };
}

const DONOR_LABEL: Record<Transfer["donor"], string> = {
  family1: "Your family",
  family2: "Spouse's family",
  other1: "Unrelated person 1",
  other2: "Unrelated person 2",
};

function moneyReport(a: MoneyAnswers, today: number): ToolReport {
  if (a.usperson === "no") {
    return {
      tone: "ok",
      title: "Form 3520 does not apply to you",
      body: "If you are a nonresident alien, Form 3520 does not apply. If you start filing Form 1040, run this again, because the rule then applies from that point.",
      sections: [],
    };
  }
  const p = moneyPlan(a, today);
  const late = p.required.filter((r) => r.late > 0);
  const sections: Section[] = [];
  if (p.all.length) {
    sections.push({
      heading: "Your totals by calendar year",
      intro: "Related donors add together. Each recipient is counted separately, and two unrelated families are counted apart.",
      table: {
        head: ["Year", "Received by", "From", "Transfers", "Total", "Over $100,000"],
        rows: p.all.map((b) => [String(b.year), b.recipient === "me" ? "You" : "Spouse", DONOR_LABEL[b.donor], String(b.count), money(b.total), b.total > GIFT_LINE ? "Yes" : "No"]),
      },
      note: a.transfers.some((t) => t.recipient === "joint") ? "Money into a joint account is treated as received by both of you, so it appears under each of you in full here. Ask a CPA how to divide it on your forms." : undefined,
    });
  }
  if (p.required.length) {
    sections.push({
      heading: "Form 3520 filings",
      table: {
        head: ["Tax year", "Filer", "Amount to report", "Crossed the line", "Due", "With extension"],
        rows: p.required.map((r) => [String(r.year), r.recipient === "me" ? "You" : "Spouse", money(r.total), formatDate(parseDate(r.crossed as string)), formatDate(r.due), formatDate(r.extended)]),
      },
      note: "Once a total crosses the line, the full amount is reported, not only the part above $100,000. The extension comes from Form 4868, with no separate request.",
    });
  }
  if (late.length) {
    sections.push({
      heading: "Possible late penalty",
      intro: "The penalty is 5% of the gift for each month it is late, capped at 25%. These figures assume no extension was filed.",
      table: {
        head: ["Tax year", "Filer", "Months late", "Penalty so far", "Cap"],
        rows: late.map((r) => [String(r.year), r.recipient === "me" ? "You" : "Spouse", String(r.late), money(r.penalty), money(r.cap)]),
      },
      note: "The usual fix is to file late with a reasonable-cause statement. Saying you did not know is almost never accepted on its own, so talk to a CPA first.",
    });
  }
  const items: string[] = [];
  if (p.flagged.trust.size) items.push(`Money from an Indian trust in ${Array.from(p.flagged.trust).join(", ")} has no $100,000 line: any amount is reported. Trust rules are different, so talk to a CPA.`);
  if (p.flagged.company > 0) items.push(`${money(p.flagged.company)} came from a company or partnership. That line is much lower and set every year, so check the current figure at irs.gov/InflationAdjustment.`);
  if (p.excluded.loans > 0) items.push(`${money(p.excluded.loans)} is listed as a documented loan, so it is left out. It needs a written note, interest at the AFR and a repayment schedule to stay that way.`);
  if (a.transfers.some((t) => t.kind === "loan-undocumented")) items.push("A loan with no documents and no repayments is typically treated as a gift, so it is counted above.");
  if (items.length) sections.push({ heading: "Items that need a closer look", items });
  sections.push({
    heading: p.required.length ? "How to file and what to keep" : "What to keep",
    items: [
      ...(p.required.length ? ["File Form 3520 separately from your Form 1040, by mail to the IRS in Ogden. Spouses who both received money file separately.", "Convert each amount to dollars using the date you received it."] : []),
      "Keep wire confirmations, bank statements showing the credit, your parents' remittance advice (Form A2 or 15CA/15CB), and a short memo on the family relationship.",
      "A mortgage gift letter does not replace Form 3520.",
      "A gift from a nonresident individual is not income. Later earnings on the money are taxable.",
    ],
  });
  const clean = !p.required.length && !p.flagged.trust.size && !p.flagged.company;
  return {
    tone: clean ? "ok" : "warn",
    title: late.length
      ? `You may have ${late.length === 1 ? "a late Form 3520" : `${late.length} late Forms 3520`}`
      : p.required.length
        ? `You need to file Form 3520 ${p.required.length === 1 ? "once" : `${p.required.length} times`}`
        : clean ? "No Form 3520 needed for these transfers" : "Some transfers need a closer look",
    body: late.length
      ? `Based on your transfers, the penalty so far could be ${money(late.reduce((s, r) => s + r.penalty, 0))}.`
      : `Worked out from your ${a.transfers.length} ${a.transfers.length === 1 ? "transfer" : "transfers"}, by calendar year and recipient.`,
    sections,
  };
}

// ---- 4. 401(k) Exit Planner (us-401k-moving-back-to-india) ---------------------------

export function exitPlan(a: ExitAnswers) {
  // The age-55 exception needs the person to have reached that year.
  const leftAt55 = a.left55 === "yes" && a.age >= 55;
  const underAge = a.age < 59.5 && !leftAt55;
  const taxOn = (amount: number, income: number) =>
    incomeTax(taxable(income + amount, a.filing), a.filing) - incomeTax(taxable(income, a.filing), a.filing);
  const extraOn = (amount: number) => (underAge ? amount * 0.1 : 0);
  const grow = (amount: number) => amount * (1 + a.growth / 100) ** a.years;

  const lumpTax = taxOn(a.balance, a.incomeThisYear);
  const lumpExtra = extraOn(a.balance);
  const lumpCost = lumpTax + lumpExtra;

  const half = a.balance / 2;
  const canSplit = a.stillResidentNextYear === "yes";
  const splitTax = canSplit ? taxOn(half, a.incomeThisYear) + taxOn(half, a.incomeNextYear) : 0;
  const splitCost = splitTax + extraOn(a.balance);

  return {
    underAge, lumpTax, lumpExtra, lumpCost, canSplit, splitTax, splitCost,
    splitSaving: lumpCost - splitCost,
    lumpNet: a.balance - lumpCost,
    splitNet: a.balance - splitCost,
    keptValue: grow(a.balance),
    afterWithheld: a.balance * 0.3,
    afterExtra: extraOn(a.balance),
    lumpShare: a.balance > 0 ? lumpCost / a.balance : 0,
  };
}

function exitReport(a: ExitAnswers): ToolReport {
  const p = exitPlan(a);
  const rows: string[][] = [
    ["Leave it in the plan", "$0", "$0", money(a.balance), "Plan rules, forced cash-out of small balances"],
    ["Direct rollover to a traditional IRA", "$0", "$0", money(a.balance), "Broker policy on Indian addresses"],
    ["Cash out this year", money(p.lumpTax), money(p.lumpExtra), money(p.lumpNet), "Large one-year tax bill, lost compounding"],
  ];
  if (p.canSplit) rows.push(["Cash out over two tax years", money(p.splitTax), money(p.afterExtra), money(p.splitNet), "Needs you to stay a resident next year"]);
  const stack: string[] = [];
  if (p.underAge) stack.push("The additional 10% applies because you are under 59 1/2. Moving abroad is not an exception. Other exceptions exist, including substantially equal periodic payments, disability and some medical expenses.");
  else if (a.age < 59.5) stack.push("You said you left this employer in or after the year you turned 55, so the additional 10% is left out for this employer's plan.");
  return {
    tone: "warn",
    title: `Cashing out this year could cost about ${money(p.lumpCost)}`,
    body: `That is ${percent(p.lumpShare)} of your ${money(a.balance)} balance in federal tax, using 2026 ${FILING_LABEL[a.filing].toLowerCase()} brackets. State tax is not included.`,
    sections: [
      {
        heading: "Your options side by side",
        table: { head: ["Option", "Income tax", "Additional 10%", "Left today", "Main risk"], rows },
        note: "A full cash-out stacks on top of your other income in one tax year, so it is taxed at the rates for that combined income.",
      },
      ...(p.canSplit ? [{
        heading: "Spreading it over two tax years",
        intro: `Taking half this year and half next year while still a US resident could save about ${money(p.splitSaving)} in federal tax.`,
        rows: [
          ["Income this year before the cash-out", money(a.incomeThisYear)],
          ["Income next year before the cash-out", money(a.incomeNextYear)],
          ["Tax if taken all at once", money(p.lumpTax)],
          ["Tax if split evenly", money(p.splitTax)],
        ] as [string, string][],
      }] : []),
      {
        heading: "What keeping it could be worth",
        intro: `At the ${a.growth}% yearly growth you entered, ${money(a.balance)} left invested for ${a.years} years would be about ${money(p.keptValue)}, before any tax on later withdrawals.`,
        note: "The growth rate is your assumption and not a forecast. Investments can lose value.",
      },
      {
        heading: "If you withdraw after you move",
        rows: [
          ["Likely withheld up front (often 30%)", money(p.afterWithheld)],
          ...(p.afterExtra ? [["Additional 10%, commonly understood to still apply", money(p.afterExtra)] as [string, string]] : []),
        ],
        note: "Withholding is a prepayment and not your final tax. The final US tax depends on your treaty position, so we do not estimate it here. A CPA should confirm this before you withdraw.",
      },
      ...(stack.length ? [{ heading: "The additional 10%", items: stack }] : []),
      {
        heading: "Before you leave",
        items: [
          "You can keep a 401(k) or IRA in the US after moving, with no deadline to withdraw.",
          "A direct rollover to a traditional IRA is easier while you still have a US address.",
          "File Form W-8BEN with the custodian so withholding matches your treaty position.",
          "Check your RNOR window in India: you remain not ordinarily resident if you were non-resident in 9 of the 10 preceding years, or in India for 729 days or less in the preceding 7 years.",
          "Once you are an ordinary resident in India, the account goes on Schedule FA.",
          "Required minimum distributions generally begin at age 73, even if you live in India.",
        ],
      },
    ],
  };
}

// ---- 5. Founder Filing Calendar (form-7004..., does-llc-with-no-income-have-file) ----

const ENTITY_LABEL: Record<FounderAnswers["entity"], string> = {
  smllc: "Single-member LLC",
  mmllc: "Multi-member LLC taxed as a partnership",
  scorp: "S corporation",
  ccorp: "C corporation",
};

/** Two months from the first day, less a day, then 15 days (Instructions for Form 2553). */
export function s2553Deadline(firstDay: number): number {
  const d = new Date(firstDay);
  return utc(d.getUTCFullYear(), d.getUTCMonth() + 2, d.getUTCDate()) - DAY_MS + 15 * DAY_MS;
}

export function s2553ReliefDeadline(firstDay: number): number {
  const d = new Date(firstDay);
  return utc(d.getUTCFullYear() + 3, d.getUTCMonth(), d.getUTCDate()) + 75 * DAY_MS;
}

export function founderPlan(a: FounderAnswers) {
  const nonresidents = a.owners.filter((o) => o.status === "nonresident");
  const foreignPct = nonresidents.reduce((sum, o) => sum + o.pct, 0);
  const anyForeign = nonresidents.length > 0;
  const fileYear = a.taxYear + 1;
  const date = (month: number) => nextWeekday(utc(fileYear, month, 15));
  const pctTotal = a.owners.reduce((sum, o) => sum + o.pct, 0);
  const sBlocked = a.entity === "scorp" && anyForeign;
  const needs5472 =
    (a.entity === "smllc" && anyForeign) || (a.entity === "ccorp" && nonresidents.some((o) => o.pct >= 25));
  return { nonresidents, foreignPct, anyForeign, fileYear, date, pctTotal, sBlocked, needs5472 };
}

function founderReport(a: FounderAnswers): ToolReport {
  const p = founderPlan(a);
  const owners = a.owners.length;
  const rows: string[][] = [];
  const penalties: string[][] = [];
  const notes: string[] = [];
  const late = Math.min(a.monthsLate, 12);

  if (p.sBlocked) {
    return {
      tone: "warn",
      title: "Your S election has a problem",
      body: `${p.nonresidents.length === 1 ? "One owner is" : `${p.nonresidents.length} owners are`} a nonresident. An S corporation cannot have a nonresident shareholder.`,
      sections: [{
        heading: "What this means",
        items: [
          "A transfer of shares to a nonresident ends the election on the date of transfer.",
          "Late election relief does not fix ineligibility.",
          "A C corporation has no shareholder restriction and pays a 21% federal rate.",
          "An LLC with a nonresident member can elect C corporation treatment on Form 8832, not S.",
          "A green card holder living abroad still counts as a resident for this test.",
          "Talk to a CPA before filing another Form 1120-S.",
        ],
      }],
    };
  }

  if (a.entity === "smllc" && !p.anyForeign) {
    notes.push("A single-member LLC with a US owner files no separate federal return. Report it on Schedule C, E or F of your Form 1040.");
    notes.push("If you move abroad and become a nonresident, Form 5472 comes into play.");
  }
  if (a.entity === "smllc" && p.anyForeign) {
    rows.push(["Pro forma Form 1120 with Form 5472", formatDate(p.date(3)), formatDate(p.date(9)), "Mail or fax, no e-file"]);
    penalties.push(["Form 5472 missing, late or incomplete", "$25,000", "Per form, with more after 90 days if it continues"]);
    if (a.ownerMoney === "no" && a.revenue === "no") notes.push("You said there was no revenue and no money between you and the LLC. Reportable transactions have effectively no minimum, and the capital contribution alone usually creates one, so check with a CPA before skipping a year.");
    notes.push("You need an EIN first, through Form SS-4.");
  }
  if (a.entity === "mmllc") {
    const exempt = a.revenue === "no" && a.ownerMoney === "no";
    rows.push(["Form 1065 with K-1s", formatDate(p.date(2)), formatDate(p.date(8)), exempt ? "May not be needed: see below" : "Required"]);
    if (late > 0) {
      penalties.push(["Late Form 1065", money(255 * owners * late), `$255 x ${owners} partners x ${late} months`]);
      penalties.push(["Late Schedule K-1", money(340 * owners), `$340 x ${owners} K-1s`]);
    } else penalties.push(["Late Form 1065", `About ${money(255 * owners)} a month`, `$255 x ${owners} partners, up to 12 months`]);
    if (exempt) notes.push("A partnership with truly no income and no deductible expenses may not need Form 1065. Confirm before skipping.");
    if (p.anyForeign) notes.push("Nonresident partners bring withholding rules that a CPA should set up.");
  }
  if (a.entity === "scorp") {
    rows.push(["Form 1120-S with K-1s", formatDate(p.date(2)), formatDate(p.date(8)), "Every year the election is in effect"]);
    if (late > 0) penalties.push(["Late Form 1120-S", money(255 * owners * late), `$255 x ${owners} shareholders x ${late} months`]);
    else penalties.push(["Late Form 1120-S", `About ${money(255 * owners)} a month`, `$255 x ${owners} shareholders, up to 12 months`]);
    notes.push("Working shareholders must be paid reasonable W-2 wages.");
    if (a.firstDay) {
      const first = parseDate(a.firstDay);
      notes.push(`Form 2553 for a first tax year starting ${formatDate(first)} was due by ${formatDate(s2553Deadline(first))}. Late relief under Rev. Proc. 2013-30 runs to ${formatDate(s2553ReliefDeadline(first))}.`);
    }
    notes.push("Some states need a separate S election.");
  }
  if (a.entity === "ccorp") {
    rows.push([p.needs5472 ? "Form 1120 with Form 5472" : "Form 1120", formatDate(p.date(3)), formatDate(p.date(9)), "Even with zeros"]);
    if (p.needs5472) penalties.push(["Form 5472 missing, late or incomplete", "$25,000", "Per form, with more after 90 days if it continues"]);
    if (p.anyForeign) notes.push("Dividends to a nonresident shareholder face 30% withholding, or 25% under the India treaty with Form W-8BEN. The corporation files Forms 1042 and 1042-S for them.");
    notes.push("Any tax due is still due on the original date, even with an extension.");
  }
  if (a.employees === "yes") notes.push("With employees, the company also has its own payroll returns.");
  if (rows.length) notes.push("Form 7004 extends the time to file, not the time to pay. It must be filed by the original due date, once per return.");
  notes.push("State filings are not covered here, and some states need their own extension.");
  if (a.owners.some((o) => o.status === "visa")) notes.push("Owning shares is separate from work authorization. An H-1B holder cannot work for their own company without an approved petition from it.");

  const sections: Section[] = [
    {
      heading: "Your company",
      rows: [
        ["Entity", ENTITY_LABEL[a.entity]],
        ["Tax year", String(a.taxYear)],
        ["Owners", String(owners)],
        ["Nonresident ownership", `${p.foreignPct}%`],
      ],
      note: p.pctTotal !== 100 ? `Your ownership adds up to ${p.pctTotal}%, not 100%, so check those numbers.` : undefined,
    },
  ];
  if (rows.length) {
    sections.push({
      heading: `Your ${p.fileYear} filing calendar`,
      table: { head: ["Filing", "Due", "With Form 7004", "Note"], rows },
      note: "Dates assume a calendar tax year and move to Monday if they fall on a weekend. Check for federal holidays.",
    });
  }
  if (penalties.length) {
    sections.push({
      heading: "What a missed deadline could cost",
      table: { head: ["Penalty", "Amount", "How it adds up"], rows: penalties },
      note: `${a.entity === "mmllc" || a.entity === "scorp" ? "The $255 and $340 amounts come from 2024 instructions and are adjusted each year. " : ""}First Time Abate can remove some penalties after three years of timely filing, but it is not automatic and must be requested.`,
    });
  }
  sections.push({ heading: "What else to know", items: notes });
  return {
    tone: rows.length ? "warn" : "ok",
    title: rows.length ? `Your next deadline is ${rows[0][1]}` : "No separate federal return for this LLC",
    body: `Your filing plan for tax year ${a.taxYear}, based on how the company is taxed and who owns it.`,
    sections,
  };
}

export function buildReport<T extends ToolId>(tool: T, answers: ToolAnswers[T], today: number): ToolReport {
  switch (tool) {
    case "rsu-gap":
      return rsuReport(answers as RsuAnswers);
    case "residency-test":
      return residencyReport(answers as ResidencyAnswers);
    case "india-money":
      return moneyReport(answers as MoneyAnswers, today);
    case "401k-exit":
      return exitReport(answers as ExitAnswers);
    default:
      return founderReport(answers as FounderAnswers);
  }
}

// ---- The email ---------------------------------------------------------------

const SITE_URL = "https://lesser.tax";
const DISCLAIMER = "Educational estimate only. Not tax or legal advice. Your situation may differ, so check with a qualified tax professional before acting.";
const FOOTER = "You got this because you asked for it on lesser.tax. To stop our emails, reply with the word unsubscribe.";
const ADDRESS = "Lesser Inc., 353 King St, San Francisco, CA 94158, USA";

function sectionHtml(s: Section): string {
  const parts = [`<h2 style="font-size:17px;color:#034f46;margin:26px 0 6px">${s.heading}</h2>`];
  if (s.intro) parts.push(`<p style="margin:0 0 8px">${s.intro}</p>`);
  if (s.rows) {
    parts.push(`<table style="border-collapse:collapse;width:100%">${s.rows
      .map(([k, v]) => `<tr><td style="padding:7px 12px 7px 0;border-bottom:1px solid #e3e0d4;color:#555">${k}</td><td style="padding:7px 0;border-bottom:1px solid #e3e0d4;text-align:right;font-weight:700;white-space:nowrap">${v}</td></tr>`)
      .join("")}</table>`);
  }
  if (s.table) {
    const th = s.table.head.map((h) => `<th style="text-align:left;padding:6px 10px 6px 0;border-bottom:2px solid #034f46;font-size:12px;color:#555">${h}</th>`).join("");
    const trs = s.table.rows
      .map((r) => `<tr>${r.map((c) => `<td style="padding:7px 10px 7px 0;border-bottom:1px solid #e3e0d4;font-size:14px">${c}</td>`).join("")}</tr>`)
      .join("");
    parts.push(`<table style="border-collapse:collapse;width:100%"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`);
  }
  if (s.items?.length) parts.push(`<ul style="padding-left:20px;margin:6px 0">${s.items.map((i) => `<li style="margin:4px 0">${i}</li>`).join("")}</ul>`);
  if (s.note) parts.push(`<p style="font-size:13px;color:#555;margin:8px 0 0">${s.note}</p>`);
  return parts.join("\n");
}

function sectionText(s: Section): string {
  return [
    s.heading.toUpperCase(),
    s.intro,
    ...(s.rows ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(s.table ? s.table.rows.map((r) => r.map((c, i) => `${s.table?.head[i]}: ${c}`).join(" | ")) : []),
    ...(s.items ?? []).map((i) => `- ${i}`),
    s.note,
  ].filter(Boolean).join("\n");
}

/** All text here is fixed copy, a formatted number or a date, never anything a visitor typed. */
export function reportEmail(tool: ToolId, r: ToolReport) {
  const { name, offer } = TOOLS[tool];
  const pdf = LEAD_MAGNETS[offer];
  const pdfUrl = `${SITE_URL}/blog/guides/${pdf.file}`;
  const text = [
    `Your ${name}`, r.title, r.body, ...r.sections.map(sectionText),
    `Your free ${pdf.title}: ${pdfUrl}`,
    "We will also send you a short tax note for immigrants in tech each week.",
    DISCLAIMER, `Lesser Tax\n${FOOTER}\n${ADDRESS}`,
  ].join("\n\n");
  const color = r.tone === "ok" ? "#034f46" : "#9a3412";
  const html = `<div style="font-family:Arial,sans-serif;color:#1a1a1a;font-size:15px;line-height:1.5;max-width:600px">
<p style="color:#555;margin:0 0 4px">Your ${name}</p>
<p style="font-size:23px;font-weight:700;line-height:1.25;color:${color};margin:0 0 8px">${r.title}</p>
<p style="margin:0">${r.body}</p>
${r.sections.map(sectionHtml).join("\n")}
<p style="margin:28px 0 8px"><a href="${pdfUrl}" style="display:inline-block;background:#034f46;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Get your free ${pdf.title}</a></p>
<p>We will also send you a short tax note for immigrants in tech each week.</p>
<p style="font-size:13px;color:#555">${DISCLAIMER}</p>
<p>Lesser Tax</p>
<p style="font-size:12px;color:#777">${FOOTER}<br>${ADDRESS}</p>
</div>`;
  return { subject: `Your ${name}: ${r.title}`, text, html };
}
