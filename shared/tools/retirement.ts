// 401(k) Calculator (LD-44): growth to retirement, tax saved this year, room
// under the 2026 IRS limit, traditional versus Roth, and the return-to-India
// comparison (cash out, keep it, or roll it to an IRA before moving).
// Everything is in nominal dollars with 2026 contribution limits held flat.

import {
  type FilingStatus,
  LIMIT_401K,
  LIMIT_415C,
  ROTH_CATCH_UP_WAGE_THRESHOLD,
  STANDARD_DEDUCTION,
  employeeLimit401k,
  federalOrdinaryTax,
  num,
} from "./federal";

export interface K401Input {
  status: FilingStatus;
  age: string;
  retireAge: string;
  balance: string;
  salary: string;
  contributionPct: string;
  /** Employer matches this percent of what you put in ... */
  matchRatePct: string;
  /** ... up to this percent of your salary. */
  matchCapPct: string;
  returnPct: string;
  salaryGrowthPct: string;
  /** Share of your own contributions (and current balance) that is traditional, 0 to 100. */
  tradSharePct: string;
  /** Your expected tax rate on withdrawals in retirement, percent. */
  retireTaxPct: string;
  /** Your state income tax rate today, percent (0 if none). */
  stateRatePct: string;
}

export interface YearPoint {
  age: number;
  balance: number;
  contributed: number;
}

export interface K401Result {
  valid: boolean;
  problem: string;
  points: YearPoint[];
  finalBalance: number;
  tradBalance: number;
  rothBalance: number;
  totalEmployee: number;
  totalMatch: number;
  growth: number;
  inTodaysDollars: number;
  /** This year */
  employeeNow: number;
  matchNow: number;
  limitNow: number;
  roomLeft: number;
  cappedByLimit: boolean;
  taxSaved: number;
  federalMarginal: number;
  /** Roth catch-up rule (age 50+ and prior-year wages over $150,000). */
  rothCatchUpApplies: boolean;
  /** Traditional versus Roth */
  afterTaxTrad: number;
  afterTaxRoth: number;
  afterTaxTotal: number;
  taxOnTrad: number;
  marginalNow: number;
  tradWins: boolean;
}

const INFLATION = 0.025;

export function projectK401(i: K401Input): K401Result {
  const age = Math.floor(num(i.age));
  const retireAge = Math.floor(num(i.retireAge));
  const salary0 = Math.max(0, num(i.salary));
  const pct = Math.max(0, num(i.contributionPct)) / 100;
  const matchRate = Math.max(0, num(i.matchRatePct)) / 100;
  const matchCap = Math.max(0, num(i.matchCapPct)) / 100;
  const r = num(i.returnPct) / 100;
  const g = num(i.salaryGrowthPct) / 100;
  const trad = Math.min(1, Math.max(0, num(i.tradSharePct) / 100));
  const retireTax = Math.min(1, Math.max(0, num(i.retireTaxPct) / 100));
  const stateRate = Math.min(0.2, Math.max(0, num(i.stateRatePct) / 100));
  const start = Math.max(0, num(i.balance));

  const empty: K401Result = {
    valid: false, problem: "", points: [], finalBalance: 0, tradBalance: 0, rothBalance: 0, totalEmployee: 0,
    totalMatch: 0, growth: 0, inTodaysDollars: 0, employeeNow: 0, matchNow: 0, limitNow: 0, roomLeft: 0,
    cappedByLimit: false, taxSaved: 0, federalMarginal: 0.1, rothCatchUpApplies: false, afterTaxTrad: 0,
    afterTaxRoth: 0, afterTaxTotal: 0, taxOnTrad: 0, marginalNow: 0, tradWins: true,
  };
  if (age < 18 || age > 80) return { ...empty, problem: "Enter your age (18 to 80)." };
  if (retireAge <= age || retireAge > 90) return { ...empty, problem: "Retirement age must be after your current age." };
  if (salary0 <= 0) return { ...empty, problem: "Enter your salary to see the projection." };

  let tradBal = start * trad;
  let rothBal = start * (1 - trad);
  let contributed = start;
  let totalEmployee = 0;
  let totalMatch = 0;
  let employeeNow = 0;
  let matchNow = 0;
  let cappedByLimit = false;
  const points: YearPoint[] = [{ age, balance: start, contributed }];

  for (let a = age; a < retireAge; a++) {
    const salary = salary0 * Math.pow(1 + g, a - age);
    const limit = employeeLimit401k(a);
    const wanted = salary * pct;
    const employee = Math.min(wanted, limit, salary);
    const share = salary > 0 ? employee / salary : 0;
    let match = salary * Math.min(share, matchCap) * matchRate;
    match = Math.max(0, Math.min(match, LIMIT_415C - Math.min(employee, LIMIT_401K)));
    if (a === age) {
      employeeNow = employee;
      matchNow = match;
      cappedByLimit = wanted > limit;
    }
    totalEmployee += employee;
    totalMatch += match;
    contributed += employee + match;
    // Contributions arrive through the year, so they earn about half a year of growth.
    tradBal = tradBal * (1 + r) + (employee * trad + match) * (1 + r / 2);
    rothBal = rothBal * (1 + r) + employee * (1 - trad) * (1 + r / 2);
    points.push({ age: a + 1, balance: tradBal + rothBal, contributed });
  }

  const finalBalance = tradBal + rothBal;
  const years = retireAge - age;

  // Tax saved this year by the traditional part of your own contributions.
  const std = STANDARD_DEDUCTION[i.status];
  const tradNow = employeeNow * trad;
  const before = federalOrdinaryTax(Math.max(0, salary0 - std), i.status);
  const after = federalOrdinaryTax(Math.max(0, salary0 - tradNow - std), i.status);
  const federalSaved = before.tax - after.tax;
  const taxSaved = federalSaved + tradNow * stateRate;

  // Traditional versus Roth, same take-home pay: a Roth dollar costs (1 - marginal) of a traditional dollar.
  const marginalNow = before.marginal + stateRate;
  const taxOnTrad = tradBal * retireTax;
  const afterTaxTrad = tradBal - taxOnTrad;
  const afterTaxRoth = rothBal;

  return {
    valid: true,
    problem: "",
    points,
    finalBalance,
    tradBalance: tradBal,
    rothBalance: rothBal,
    totalEmployee,
    totalMatch,
    growth: finalBalance - contributed,
    inTodaysDollars: finalBalance / Math.pow(1 + INFLATION, years),
    employeeNow,
    matchNow,
    limitNow: employeeLimit401k(age),
    roomLeft: Math.max(0, employeeLimit401k(age) - employeeNow),
    cappedByLimit,
    taxSaved,
    federalMarginal: before.marginal,
    rothCatchUpApplies: age >= 50 && salary0 > ROTH_CATCH_UP_WAGE_THRESHOLD,
    afterTaxTrad,
    afterTaxRoth,
    afterTaxTotal: afterTaxTrad + afterTaxRoth,
    taxOnTrad,
    marginalNow,
    tradWins: retireTax < marginalNow,
  };
}

export const K401_DEFAULTS: K401Input = {
  status: "single",
  age: "32",
  retireAge: "62",
  balance: "60000",
  salary: "160000",
  contributionPct: "12",
  matchRatePct: "50",
  matchCapPct: "6",
  returnPct: "7",
  salaryGrowthPct: "3",
  tradSharePct: "100",
  retireTaxPct: "22",
  stateRatePct: "5",
};

// ---------------------------------------------------------------------------
// Return-to-India mode: cash out, keep it, or roll it to an IRA before moving.
// An illustration, not advice: the treaty position for each payment type should
// be confirmed with a cross-border CPA before acting.

export const US_NRA_WITHHOLDING = 0.3; // IRC 1441: 30% on U.S.-source retirement payments to a nonresident
export const EARLY_WITHDRAWAL_PENALTY = 0.1; // IRC 72(t): before age 59 and a half
export const INDIA_TOP_RATE_WITH_CESS = 0.312; // 30% slab + 4% health and education cess

export interface IndiaInput {
  balance: string;
  /** Your age when you move. */
  ageMove: string;
  /** Age you would start withdrawing if you keep the money invested. */
  ageWithdraw: string;
  returnPct: string;
  /** Indian tax rate on the withdrawal when you are a resident, percent. */
  indiaRatePct: string;
  /** Where the withdrawal lands in India's residency stages. */
  indiaStatus: "rnor" | "resident";
  /** Assume the periodic-payment treaty claim is accepted (U.S. tax 0 while kept). */
  treatyClaim: boolean;
}

export interface IndiaOption {
  id: "cash" | "keep" | "ira";
  label: string;
  /** Value of the money at the withdrawal age, before tax. */
  gross: number;
  usTax: number;
  indiaTax: number;
  penalty: number;
  net: number;
  /** What the net amount is worth at the withdrawal age (cash-out proceeds invested until then). */
  netAtWithdrawAge: number;
  notes: string[];
}

export interface IndiaResult {
  valid: boolean;
  problem: string;
  options: IndiaOption[];
  best: IndiaOption["id"] | null;
  years: number;
}

export function compareIndiaExit(i: IndiaInput): IndiaResult {
  const balance = Math.max(0, num(i.balance));
  const ageMove = num(i.ageMove);
  const ageWithdraw = num(i.ageWithdraw);
  const r = num(i.returnPct) / 100;
  const indiaRate = Math.min(0.5, Math.max(0, num(i.indiaRatePct) / 100));
  const bad = (problem: string): IndiaResult => ({ valid: false, problem, options: [], best: null, years: 0 });
  if (balance <= 0) return bad("Enter your 401(k) balance.");
  if (ageMove < 18 || ageMove > 90) return bad("Enter the age you will move at.");
  if (ageWithdraw < ageMove || ageWithdraw > 95) return bad("The withdrawal age must be your move age or later.");

  const years = ageWithdraw - ageMove;
  const growth = Math.pow(1 + r, years);
  const rnorKeepsAbroad = i.indiaStatus === "rnor";

  // Cash out when you move: U.S. withholding and penalty now, India depends on residency.
  const penaltyNow = ageMove < 59.5 ? balance * EARLY_WITHDRAWAL_PENALTY : 0;
  const usCash = balance * US_NRA_WITHHOLDING;
  // India taxes the rest only if you are a resident or the cash comes into India, with credit for the U.S. 30%.
  const indiaCash = rnorKeepsAbroad ? 0 : Math.max(0, balance * indiaRate - usCash);
  const netCash = balance - usCash - indiaCash - penaltyNow;
  const cash: IndiaOption = {
    id: "cash",
    label: "Cash out when you move",
    gross: balance,
    usTax: usCash,
    indiaTax: indiaCash,
    penalty: penaltyNow,
    net: netCash,
    netAtWithdrawAge: netCash * growth,
    notes: [
      "30% U.S. withholding for a nonresident, a 10% penalty if you are under 59 and a half, and India tax if you are a resident when the money lands.",
      rnorKeepsAbroad
        ? "Assumes you are RNOR and leave the cash outside India, so India does not tax it yet."
        : "India tax is reduced by the U.S. tax already paid (foreign tax credit), never below zero.",
    ],
  };

  // Keep it in the plan (or an IRA) and withdraw later, as a resident of India.
  const value = balance * growth;
  const usRate = i.treatyClaim ? 0 : US_NRA_WITHHOLDING;
  const usKeep = value * usRate;
  const indiaKeep = Math.max(0, value * indiaRate - usKeep);
  const netKeep = value - usKeep - indiaKeep;
  const keepNotes = [
    i.treatyClaim
      ? "Assumes periodic payments (not a lump sum) and a treaty claim under Article 20 of the India-U.S. treaty, so only India taxes them."
      : "Without a treaty claim the U.S. withholds 30%, and India gives credit for it.",
    "Growth inside the account is not taxed until you withdraw.",
  ];
  const keep: IndiaOption = {
    id: "keep",
    label: "Keep it in the 401(k)",
    gross: value,
    usTax: usKeep,
    indiaTax: indiaKeep,
    penalty: 0,
    net: netKeep,
    netAtWithdrawAge: netKeep,
    notes: [...keepNotes, "Some plans make former employees who live abroad withdraw or move the money."],
  };
  const ira: IndiaOption = {
    id: "ira",
    label: "Roll over to an IRA before you move",
    gross: value,
    usTax: usKeep,
    indiaTax: indiaKeep,
    penalty: 0,
    net: netKeep,
    netAtWithdrawAge: netKeep,
    notes: [
      ...keepNotes,
      "A direct rollover is not taxed. An IRA lets you pick your own investments and withdraw on your schedule, which is why most people moving abroad prefer it to leaving it in the plan.",
    ],
  };

  const options = [cash, keep, ira];
  const best = options.reduce((a, b) => (b.netAtWithdrawAge > a.netAtWithdrawAge ? b : a)).id;
  return { valid: true, problem: "", options, best: best === "keep" ? "ira" : best, years };
}

export const INDIA_DEFAULTS: IndiaInput = {
  balance: "250000",
  ageMove: "45",
  ageWithdraw: "60",
  returnPct: "7",
  indiaRatePct: "31.2",
  indiaStatus: "rnor",
  treatyClaim: true,
};
