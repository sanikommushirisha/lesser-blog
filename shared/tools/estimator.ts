// Tax Estimator (LD-42): federal and state income tax, FICA, effective and
// marginal rates, and the refund or amount owed. Pure function: same input,
// same output, so the page, the prerender and script/check-tools.ts agree.

import {
  ADDITIONAL_MEDICARE_RATE,
  ADDITIONAL_MEDICARE_THRESHOLD,
  type FilingStatus,
  HSA_LIMIT,
  LIMIT_401K,
  MEDICARE_RATE,
  SS_RATE,
  SS_WAGE_BASE,
  STANDARD_DEDUCTION,
  SUPPLEMENTAL_RATE,
  dependentCredits,
  employeeLimit401k,
  federalOrdinaryTax,
  usd,
} from "./federal";
import { type StateCode, stateIncomeTax } from "./state";

export interface EstimatorInput {
  status: FilingStatus;
  state: StateCode;
  /** Months lived in the state this year, 1 to 12 (part-year residents). */
  months: number;
  /** Children under 17 and other dependents. */
  children: number;
  otherDependents: number;
  /** Your W-2 salary, annual bonus, RSU and ESPP income (all W-2 wages). */
  wages: number;
  bonus: number;
  rsuEspp: number;
  /** Spouse's W-2 wages, only used when filing jointly. */
  spouseWages: number;
  /** Interest, dividends, side income and anything else taxed as ordinary income. */
  otherIncome: number;
  /** Pre-tax 401(k) and HSA contributions for the year (you and your spouse). */
  k401: number;
  hsa: number;
  /** Itemized deductions, or 0 to use the standard deduction. */
  itemized: number;
  /** Income tax withheld or paid for the full year, federal and state. */
  fedWithheld: number;
  stateWithheld: number;
}

export interface EstimatorResult {
  totalIncome: number;
  agi: number;
  deduction: number;
  usedItemized: boolean;
  taxableIncome: number;
  federalTax: number;
  creditsUsed: number;
  stateTax: number;
  stateNote: string;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  fica: number;
  totalIncomeTax: number;
  totalTax: number;
  federalEffective: number;
  combinedEffective: number;
  allInEffective: number;
  federalMarginal: number;
  stateMarginal: number;
  combinedMarginal: number;
  federalBalance: number; // positive = refund, negative = you owe
  stateBalance: number;
  balance: number;
  tips: Tip[];
}

export type Tip = { id: string; text: string };

export function estimateTax(i: EstimatorInput): EstimatorResult {
  const status = i.status;
  const mfj = status === "mfj";
  const spouse = mfj ? Math.max(0, i.spouseWages) : 0;
  const yourWages = Math.max(0, i.wages) + Math.max(0, i.bonus) + Math.max(0, i.rsuEspp);
  const totalIncome = yourWages + spouse + Math.max(0, i.otherIncome);

  const k401 = Math.max(0, i.k401);
  const hsa = Math.max(0, i.hsa);
  const agi = Math.max(0, totalIncome - k401 - hsa);

  const standard = STANDARD_DEDUCTION[status];
  const usedItemized = i.itemized > standard;
  const deduction = usedItemized ? i.itemized : standard;
  const taxableIncome = Math.max(0, agi - deduction);

  const ordinary = federalOrdinaryTax(taxableIncome, status);
  const credits = dependentCredits(agi, status, i.children, i.otherDependents);
  const creditsUsed = Math.min(ordinary.tax, credits);
  const federalTax = ordinary.tax - creditsUsed;

  // Payroll taxes. Social Security is capped per earner; HSA through payroll is exempt (assumed yours).
  const yourFicaWages = Math.max(0, yourWages - hsa);
  const ss = SS_RATE * (Math.min(yourFicaWages, SS_WAGE_BASE) + Math.min(spouse, SS_WAGE_BASE));
  const ficaWages = yourFicaWages + spouse;
  const medicare = MEDICARE_RATE * ficaWages;
  const additionalMedicare = ADDITIONAL_MEDICARE_RATE * Math.max(0, ficaWages - ADDITIONAL_MEDICARE_THRESHOLD[status]);
  const fica = ss + medicare + additionalMedicare;

  const state = stateIncomeTax({
    state: i.state,
    status,
    federalAgi: agi,
    incomeBeforeDeferrals: totalIncome,
    hsa,
    dependents: Math.max(0, i.children) + Math.max(0, i.otherDependents),
    months: i.months,
  });

  const totalIncomeTax = federalTax + state.tax;
  const federalBalance = Math.max(0, i.fedWithheld) - federalTax;
  // No state tax is estimated for TX, WA or another state, so withholding there would only
  // show up as a made-up refund.
  const stateHasTax = i.state === "CA" || i.state === "NY" || i.state === "NJ";
  const stateBalance = stateHasTax ? Math.max(0, i.stateWithheld) - state.tax : 0;

  const result: EstimatorResult = {
    totalIncome,
    agi,
    deduction,
    usedItemized,
    taxableIncome,
    federalTax,
    creditsUsed,
    stateTax: state.tax,
    stateNote: state.note,
    socialSecurity: ss,
    medicare,
    additionalMedicare,
    fica,
    totalIncomeTax,
    totalTax: totalIncomeTax + fica,
    federalEffective: totalIncome > 0 ? federalTax / totalIncome : 0,
    combinedEffective: totalIncome > 0 ? totalIncomeTax / totalIncome : 0,
    allInEffective: totalIncome > 0 ? (totalIncomeTax + fica) / totalIncome : 0,
    federalMarginal: ordinary.marginal,
    stateMarginal: state.marginal,
    combinedMarginal: ordinary.marginal + state.marginal,
    federalBalance,
    stateBalance,
    balance: federalBalance + stateBalance,
    tips: [],
  };
  result.tips = buildTips(i, result);
  return result;
}

function buildTips(i: EstimatorInput, r: EstimatorResult): Tip[] {
  const tips: Tip[] = [];
  const m = r.federalMarginal;
  const room401k = LIMIT_401K * (i.status === "mfj" ? 2 : 1) - Math.max(0, i.k401);
  if (room401k > 500 && m >= 0.22) {
    tips.push({
      id: "k401",
      text: `You can put up to ${usd(LIMIT_401K)} a year into a 401(k) (more at 50 and over). Another ${usd(Math.min(room401k, 5000))} before tax would cut your federal tax by about ${usd(Math.min(room401k, 5000) * m)}.`,
    });
  }
  const hsaLimit = i.status === "mfj" ? HSA_LIMIT.family : HSA_LIMIT.self;
  if (i.hsa < hsaLimit && m >= 0.22) {
    tips.push({
      id: "hsa",
      text: `If you have a high-deductible health plan, an HSA takes up to ${usd(hsaLimit)} (${usd(HSA_LIMIT.family)} for family coverage) off your taxable income, and withdrawals for medical costs are tax-free.`,
    });
  }
  if (i.rsuEspp > 0 && i.fedWithheld < i.rsuEspp * SUPPLEMENTAL_RATE && r.balance < 0) {
    tips.push({
      id: "rsu",
      text: "Employers usually withhold 22% federal tax on RSU income. If your marginal rate is higher, the gap shows up as tax due in April. Check the RSU calculator to see how big it is.",
    });
  }
  if (r.balance < -1000) {
    tips.push({
      id: "owe",
      text: `You may owe about ${usd(-r.balance)}. Raise your W-4 withholding or make an estimated payment before the year ends to avoid an underpayment penalty.`,
    });
  } else if (r.balance > 2500) {
    tips.push({
      id: "refund",
      text: `A refund of about ${usd(r.balance)} means you are lending the IRS money all year. A new W-4 would move it into your paycheck.`,
    });
  }
  if (i.state === "NJ" && i.k401 > 0) {
    tips.push({ id: "nj", text: "New Jersey does not let you subtract 401(k) contributions, so they lower federal tax but not New Jersey tax." });
  }
  if (i.state === "CA" && i.hsa > 0) {
    tips.push({ id: "ca", text: "California does not allow the HSA deduction, so HSA contributions are added back for California tax." });
  }
  // Household total, so a couple can reach twice one person's limit before this warns.
  const highest = employeeLimit401k(61) * (i.status === "mfj" ? 2 : 1);
  if (i.k401 > highest) {
    tips.push({ id: "over", text: `${usd(i.k401)} is above the most the IRS allows for 2026 (${usd(highest)}, with the ages 60 to 63 catch-up). Check the amount.` });
  }
  return tips;
}

export const ESTIMATOR_DEFAULTS = {
  status: "single" as FilingStatus,
  state: "CA" as StateCode,
  months: "12",
  children: "0",
  otherDependents: "0",
  wages: "150000",
  bonus: "15000",
  rsuEspp: "30000",
  spouseWages: "0",
  otherIncome: "2000",
  k401: "20000",
  hsa: "0",
  itemized: "",
  fedWithheld: "34000",
  stateWithheld: "11000",
};
