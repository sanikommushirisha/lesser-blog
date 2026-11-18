// State income tax for the tax estimator (LD-42): California, New York, New Jersey,
// Washington and Texas, the states most Lesser clients live in.
//
// These are the latest PUBLISHED state schedules, which are tax year 2025: states
// publish the next year's schedule after the IRS does. The estimator says so on
// the page. Sources: NY Dept. of Taxation and Finance IT-201-I (2025) rate schedule
// and tax computation; CA FTB 2025 Form 540 Schedules X, Y, Z (2024 schedules
// indexed by the CA CPI factor 1.03, which reproduces the FTB's published top bracket
// of $742,953 and 1% joint bracket of $22,158); NJ-1040 (2025) rate tables.
// This is an estimate for planning, not a state return: local taxes (NYC, Yonkers),
// state disability or family-leave payroll taxes and most credits are not included.

import { type Bracket, type FilingStatus, progressiveTax } from "./federal";

export type StateCode = "CA" | "NY" | "NJ" | "WA" | "TX" | "OTHER";

export const STATE_OPTIONS: { code: StateCode; name: string }[] = [
  { code: "CA", name: "California" },
  { code: "WA", name: "Washington" },
  { code: "TX", name: "Texas" },
  { code: "NY", name: "New York" },
  { code: "NJ", name: "New Jersey" },
  { code: "OTHER", name: "Another state (federal only)" },
];

export const STATE_TAX_YEAR = 2025;

export interface StateInput {
  state: StateCode;
  status: FilingStatus;
  /** Federal AGI: wages and other income less pre-tax 401(k) and HSA. */
  federalAgi: number;
  /** All income before any 401(k) or HSA deduction (NJ taxes those deferrals). */
  incomeBeforeDeferrals: number;
  /** HSA contributions (California and New Jersey do not allow the deduction). */
  hsa: number;
  /** Dependents of any age. */
  dependents: number;
  /** Months of the year lived in the state (1 to 12): part-year estimate. */
  months: number;
}

export interface StateResult {
  tax: number;
  marginal: number;
  /** One line shown under the result. */
  note: string;
}

const scale = (b: Bracket[], k: number): Bracket[] => b.map((x) => ({ upTo: x.upTo * k, rate: x.rate }));

// California 2025, Schedule X (single). Joint (Schedule Y) is exactly double; Schedule Z is head of household.
const CA_SINGLE: Bracket[] = [
  { upTo: 11_079, rate: 0.01 },
  { upTo: 26_264, rate: 0.02 },
  { upTo: 41_452, rate: 0.04 },
  { upTo: 57_542, rate: 0.06 },
  { upTo: 72_724, rate: 0.08 },
  { upTo: 371_479, rate: 0.093 },
  { upTo: 445_771, rate: 0.103 },
  { upTo: 742_953, rate: 0.113 },
  { upTo: Infinity, rate: 0.123 },
];
const CA_HOH: Bracket[] = [
  { upTo: 22_173, rate: 0.01 },
  { upTo: 52_530, rate: 0.02 },
  { upTo: 67_716, rate: 0.04 },
  { upTo: 83_805, rate: 0.06 },
  { upTo: 98_990, rate: 0.08 },
  { upTo: 505_208, rate: 0.093 },
  { upTo: 606_251, rate: 0.103 },
  { upTo: 1_010_417, rate: 0.113 },
  { upTo: Infinity, rate: 0.123 },
];
const CA_BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: CA_SINGLE,
  mfj: scale(CA_SINGLE, 2).map((b, i) => (i === CA_SINGLE.length - 1 ? { ...b, upTo: Infinity } : b)),
  hoh: CA_HOH,
};
const CA_STANDARD: Record<FilingStatus, number> = { single: 5_706, mfj: 11_412, hoh: 11_412 }; // FTB, Oct 2025
const CA_PERSONAL_CREDIT: Record<FilingStatus, number> = { single: 153, mfj: 306, hoh: 306 };
const CA_DEPENDENT_CREDIT = 475;
const CA_CREDIT_PHASEOUT_AGI: Record<FilingStatus, number> = { single: 252_203, mfj: 504_411, hoh: 378_310 };
const CA_MHST_START = 1_000_000; // extra 1% above $1 million of taxable income

// New Jersey 2025 gross income tax. Joint, head of household and surviving spouse share one table.
const NJ_SINGLE: Bracket[] = [
  { upTo: 20_000, rate: 0.014 },
  { upTo: 35_000, rate: 0.0175 },
  { upTo: 40_000, rate: 0.035 },
  { upTo: 75_000, rate: 0.05525 },
  { upTo: 500_000, rate: 0.0637 },
  { upTo: 1_000_000, rate: 0.0897 },
  { upTo: Infinity, rate: 0.1075 },
];
const NJ_JOINT: Bracket[] = [
  { upTo: 20_000, rate: 0.014 },
  { upTo: 50_000, rate: 0.0175 },
  { upTo: 70_000, rate: 0.0245 },
  { upTo: 80_000, rate: 0.035 },
  { upTo: 150_000, rate: 0.05525 },
  { upTo: 500_000, rate: 0.0637 },
  { upTo: 1_000_000, rate: 0.0897 },
  { upTo: Infinity, rate: 0.1075 },
];
const NJ_EXEMPTION = 1_000; // each of you and your spouse
const NJ_DEPENDENT_EXEMPTION = 1_500;

// New York 2025 (IT-201-I): rate schedule, standard deduction and the high-income
// "tax computation" that phases out the benefit of the lower brackets.
type NyRow = { over: number; base: number; rate: number };
const NY_SCHEDULE: Record<FilingStatus, NyRow[]> = {
  single: [
    { over: 0, base: 0, rate: 0.04 },
    { over: 8_500, base: 340, rate: 0.045 },
    { over: 11_700, base: 484, rate: 0.0525 },
    { over: 13_900, base: 600, rate: 0.055 },
    { over: 80_650, base: 4_271, rate: 0.06 },
    { over: 215_400, base: 12_356, rate: 0.0685 },
    { over: 1_077_550, base: 71_413, rate: 0.0965 },
    { over: 5_000_000, base: 449_929, rate: 0.103 },
    { over: 25_000_000, base: 2_509_929, rate: 0.109 },
  ],
  mfj: [
    { over: 0, base: 0, rate: 0.04 },
    { over: 17_150, base: 686, rate: 0.045 },
    { over: 23_600, base: 976, rate: 0.0525 },
    { over: 27_900, base: 1_202, rate: 0.055 },
    { over: 161_550, base: 8_553, rate: 0.06 },
    { over: 323_200, base: 18_252, rate: 0.0685 },
    { over: 2_155_350, base: 143_754, rate: 0.0965 },
    { over: 5_000_000, base: 418_263, rate: 0.103 },
    { over: 25_000_000, base: 2_478_263, rate: 0.109 },
  ],
  hoh: [
    { over: 0, base: 0, rate: 0.04 },
    { over: 12_800, base: 512, rate: 0.045 },
    { over: 17_650, base: 730, rate: 0.0525 },
    { over: 20_900, base: 901, rate: 0.055 },
    { over: 107_650, base: 5_672, rate: 0.06 },
    { over: 269_300, base: 15_371, rate: 0.0685 },
    { over: 1_616_450, base: 107_651, rate: 0.0965 },
    { over: 5_000_000, base: 434_163, rate: 0.103 },
    { over: 25_000_000, base: 2_494_163, rate: 0.109 },
  ],
};
const NY_STANDARD: Record<FilingStatus, number> = { single: 8_000, mfj: 16_050, hoh: 11_200 };
const NY_DEPENDENT_EXEMPTION = 1_000;
const NY_RECAPTURE_START = 107_650; // NYS AGI above this starts the phase-in (over $50,000)
// Full benefit recapture per tax-computation worksheet: [taxable income above, base, incremental].
const NY_RECAPTURE: Record<FilingStatus, { over: number; flat?: number; base?: number; incr?: number }[]> = {
  single: [
    { over: 0, flat: 0.06 },
    { over: 215_400, base: 568, incr: 1_831 },
    { over: 1_077_550, base: 2_399, incr: 30_172 },
    { over: 5_000_000, base: 32_571, incr: 32_500 },
  ],
  mfj: [
    { over: 0, flat: 0.055 },
    { over: 161_550, base: 333, incr: 807 },
    { over: 323_200, base: 1_140, incr: 2_747 },
    { over: 2_155_350, base: 3_887, incr: 60_350 },
    { over: 5_000_000, base: 64_237, incr: 32_500 },
  ],
  hoh: [
    { over: 0, flat: 0.06 },
    { over: 269_300, base: 787, incr: 2_289 },
    { over: 1_616_450, base: 3_076, incr: 45_261 },
    { over: 5_000_000, base: 48_337, incr: 32_500 },
  ],
};

function nySchedule(taxable: number, status: FilingStatus): { tax: number; marginal: number } {
  const rows = NY_SCHEDULE[status];
  let row = rows[0];
  for (const r of rows) if (taxable > r.over) row = r;
  return { tax: row.base + (Math.max(0, taxable) - row.over) * row.rate, marginal: row.rate };
}

function nyTax(taxable: number, nyAgi: number, status: FilingStatus): { tax: number; marginal: number } {
  const t = Math.max(0, taxable);
  const sched = nySchedule(t, status);
  if (nyAgi <= NY_RECAPTURE_START || t === 0) return sched;
  const phase = Math.min(1, Math.ceil(((nyAgi - NY_RECAPTURE_START) / 50_000) * 10_000) / 10_000);
  const rows = NY_RECAPTURE[status];
  let row = rows[0];
  for (const r of rows) if (t > r.over) row = r;
  if (row.flat !== undefined) {
    // Bottom step: the benefit of the lower rates is recaptured up to the flat rate.
    const full = Math.max(sched.tax, t * row.flat);
    return { tax: sched.tax + phase * (full - sched.tax), marginal: sched.marginal + phase * Math.max(0, row.flat - sched.marginal) };
  }
  return { tax: sched.tax + (row.base ?? 0) + phase * (row.incr ?? 0), marginal: sched.marginal };
}

const none = (note: string): StateResult => ({ tax: 0, marginal: 0, note });

export function stateIncomeTax(i: StateInput): StateResult {
  const frac = Math.min(12, Math.max(1, Math.round(i.months || 12))) / 12;
  const partYear = frac < 1 ? ` Part-year: full-year tax scaled to ${Math.round(frac * 12)} of 12 months.` : "";
  let r: StateResult;
  switch (i.state) {
    case "TX":
      return none("Texas has no state income tax on wages.");
    case "WA":
      return none("Washington has no state income tax on wages. Its 7% capital gains tax only applies to large long-term gains and is not included.");
    case "OTHER":
      return none("State tax is not included. Add your state's tax to the totals if you live outside CA, NY, NJ, WA or TX.");
    case "CA": {
      const agi = i.federalAgi + i.hsa; // CA does not allow the HSA deduction
      const taxable = Math.max(0, agi - CA_STANDARD[i.status]);
      const { tax, marginal } = progressiveTax(taxable, CA_BRACKETS[i.status]);
      const mhst = Math.max(0, taxable - CA_MHST_START) * 0.01;
      const credits =
        agi > CA_CREDIT_PHASEOUT_AGI[i.status] ? 0 : CA_PERSONAL_CREDIT[i.status] + i.dependents * CA_DEPENDENT_CREDIT;
      r = {
        tax: Math.max(0, tax - credits) + mhst,
        marginal: marginal + (taxable > CA_MHST_START ? 0.01 : 0),
        note: `California ${STATE_TAX_YEAR} rates, standard deduction and exemption credits. State disability insurance is not included.`,
      };
      break;
    }
    case "NJ": {
      // NJ taxes 401(k) deferrals and gives no HSA deduction, so the base is all income.
      const exemptions = NJ_EXEMPTION * (i.status === "mfj" ? 2 : 1) + i.dependents * NJ_DEPENDENT_EXEMPTION;
      const taxable = Math.max(0, i.incomeBeforeDeferrals - exemptions);
      const { tax, marginal } = progressiveTax(taxable, i.status === "single" ? NJ_SINGLE : NJ_JOINT);
      r = {
        tax,
        marginal,
        note: `New Jersey ${STATE_TAX_YEAR} rates. New Jersey taxes 401(k) deferrals and gives no HSA deduction, so they are not subtracted.`,
      };
      break;
    }
    case "NY": {
      const taxable = Math.max(0, i.federalAgi - NY_STANDARD[i.status] - i.dependents * NY_DEPENDENT_EXEMPTION);
      const { tax, marginal } = nyTax(taxable, i.federalAgi, i.status);
      r = {
        tax,
        marginal,
        note: `New York State ${STATE_TAX_YEAR} rates with the high-income phase-in. New York City and Yonkers taxes are not included.`,
      };
      break;
    }
  }
  return { tax: r.tax * frac, marginal: r.marginal, note: r.note + partYear };
}
