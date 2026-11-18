// Federal tax figures and helpers for the free tax tools (LD-42, LD-43, LD-44).
// Plain TypeScript with no browser or Node imports: it runs in the browser
// (live results), in the prerender and in script/check-tools.ts.
//
// Every figure is for TAX YEAR 2026 and names its source. Re-check them each
// October when the IRS publishes the next year's inflation adjustments, then
// move TOOLS_FIGURES_CHECKED forward.

export const TAX_YEAR = 2026;
export const TOOLS_FIGURES_CHECKED = "November 2026";

export type FilingStatus = "single" | "mfj" | "hoh";

export const FILING_STATUS_LABEL: Record<FilingStatus, string> = {
  single: "Single",
  mfj: "Married filing jointly",
  hoh: "Head of household",
};

export type Bracket = { upTo: number; rate: number };

// IRS Rev. Proc. 2025-32 (Oct 9, 2025), section 3.01: 2026 ordinary income brackets.
export const FEDERAL_BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: [
    { upTo: 12_400, rate: 0.1 },
    { upTo: 50_400, rate: 0.12 },
    { upTo: 105_700, rate: 0.22 },
    { upTo: 201_775, rate: 0.24 },
    { upTo: 256_225, rate: 0.32 },
    { upTo: 640_600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  mfj: [
    { upTo: 24_800, rate: 0.1 },
    { upTo: 100_800, rate: 0.12 },
    { upTo: 211_400, rate: 0.22 },
    { upTo: 403_550, rate: 0.24 },
    { upTo: 512_450, rate: 0.32 },
    { upTo: 768_700, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  hoh: [
    { upTo: 17_700, rate: 0.1 },
    { upTo: 67_450, rate: 0.12 },
    { upTo: 105_700, rate: 0.22 },
    { upTo: 201_750, rate: 0.24 },
    { upTo: 256_200, rate: 0.32 },
    { upTo: 640_600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

// Rev. Proc. 2025-32: 2026 standard deduction.
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = { single: 16_100, mfj: 32_200, hoh: 24_150 };

// Rev. Proc. 2025-32: 2026 long-term capital gain rates apply by taxable income.
export const LTCG_THRESHOLDS: Record<FilingStatus, { zeroTop: number; fifteenTop: number }> = {
  single: { zeroTop: 49_450, fifteenTop: 545_500 },
  mfj: { zeroTop: 98_900, fifteenTop: 613_700 },
  hoh: { zeroTop: 66_200, fifteenTop: 579_600 },
};

// Child tax credit (IRC 24, as amended in 2025): $2,200 per child under 17, $500 for other
// dependents, reduced by $50 per $1,000 (or part) of income over $200,000 ($400,000 joint).
export const CHILD_CREDIT = 2_200;
export const OTHER_DEPENDENT_CREDIT = 500;
export const CHILD_CREDIT_PHASEOUT_START: Record<FilingStatus, number> = { single: 200_000, hoh: 200_000, mfj: 400_000 };

// Payroll taxes. Social Security wage base: SSA announcement of Oct 24, 2025.
export const SS_RATE = 0.062;
export const SS_WAGE_BASE = 184_500;
export const MEDICARE_RATE = 0.0145;
export const ADDITIONAL_MEDICARE_RATE = 0.009; // IRC 3101(b)(2): not indexed
export const ADDITIONAL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = { single: 200_000, hoh: 200_000, mfj: 250_000 };
export const NIIT_RATE = 0.038; // IRC 1411: not indexed
export const NIIT_THRESHOLD: Record<FilingStatus, number> = { single: 200_000, hoh: 200_000, mfj: 250_000 };

// IRS Notice 2025-67 (Nov 2025): 2026 retirement plan limits.
export const LIMIT_401K = 24_500;
export const CATCH_UP_50 = 8_000;
export const CATCH_UP_60_63 = 11_250;
export const LIMIT_415C = 72_000; // employee + employer, before catch-up
export const ROTH_CATCH_UP_WAGE_THRESHOLD = 150_000; // prior-year FICA wages above this: catch-up must be Roth

// IRS Rev. Proc. 2025-19: 2026 HSA limits (55 and over add $1,000).
export const HSA_LIMIT = { self: 4_400, family: 8_750, catchUp55: 1_000 };

// Federal income tax withholding on supplemental wages (RSUs, bonuses): Treas. Reg. 31.3402(g)-1.
export const SUPPLEMENTAL_RATE = 0.22;
export const SUPPLEMENTAL_RATE_OVER_1M = 0.37;
export const SUPPLEMENTAL_1M = 1_000_000;

export const CAPITAL_LOSS_LIMIT = 3_000;

export function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function progressiveTax(taxable: number, brackets: Bracket[]): { tax: number; marginal: number } {
  const income = Math.max(0, taxable);
  let tax = 0;
  let lower = 0;
  let marginal = brackets[0].rate;
  for (const b of brackets) {
    if (income <= lower) break;
    tax += (Math.min(income, b.upTo) - lower) * b.rate;
    marginal = b.rate;
    lower = b.upTo;
  }
  return { tax, marginal };
}

/** Federal tax on ordinary taxable income, and the marginal rate on the next dollar. */
export function federalOrdinaryTax(taxable: number, status: FilingStatus) {
  return progressiveTax(taxable, FEDERAL_BRACKETS[status]);
}

/** Tax on long-term gains stacked on top of ordinary taxable income (0% / 15% / 20%). */
export function longTermGainsTax(ordinaryTaxable: number, gains: number, status: FilingStatus): number {
  const g = Math.max(0, gains);
  if (g === 0) return 0;
  const { zeroTop, fifteenTop } = LTCG_THRESHOLDS[status];
  const base = Math.max(0, ordinaryTaxable);
  const top = base + g;
  const at0 = Math.max(0, Math.min(top, zeroTop) - Math.min(base, zeroTop));
  const at15 = Math.max(0, Math.min(top, fifteenTop) - Math.max(base, zeroTop));
  const at20 = Math.max(0, top - Math.max(base, fifteenTop));
  return at15 * 0.15 + at20 * 0.2 + at0 * 0;
}

/** Child tax credit and credit for other dependents, before limiting to the tax owed. */
export function dependentCredits(agi: number, status: FilingStatus, children: number, others: number): number {
  const full = Math.max(0, children) * CHILD_CREDIT + Math.max(0, others) * OTHER_DEPENDENT_CREDIT;
  if (full === 0) return 0;
  const over = Math.max(0, agi - CHILD_CREDIT_PHASEOUT_START[status]);
  const reduction = Math.ceil(over / 1_000) * 50;
  return Math.max(0, full - reduction);
}

/** 401(k) employee deferral limit for a person of this age in 2026, including catch-up. */
export function employeeLimit401k(age: number): number {
  if (age >= 60 && age <= 63) return LIMIT_401K + CATCH_UP_60_63;
  if (age >= 50) return LIMIT_401K + CATCH_UP_50;
  return LIMIT_401K;
}

export const usd = (n: number) =>
  (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US", { maximumFractionDigits: 0 });

export const pct = (r: number, digits = 1) => `${(r * 100).toFixed(digits).replace(/\.0+$/, "")}%`;
