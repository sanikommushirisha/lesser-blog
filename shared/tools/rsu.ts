// RSU Calculator (LD-43): tax at vest, tax withheld versus tax actually owed,
// and the gain or loss when shares are sold. Federal only, standard deduction,
// all vests and sales in the same tax year (2026).

import {
  CAPITAL_LOSS_LIMIT,
  type FilingStatus,
  NIIT_RATE,
  NIIT_THRESHOLD,
  STANDARD_DEDUCTION,
  SUPPLEMENTAL_1M,
  SUPPLEMENTAL_RATE,
  SUPPLEMENTAL_RATE_OVER_1M,
  federalOrdinaryTax,
  longTermGainsTax,
  num,
} from "./federal";

export interface VestEvent {
  id: string;
  /** YYYY-MM-DD */
  vestDate: string;
  shares: string;
  /** Share price (fair market value) on the vest date. */
  priceAtVest: string;
  /** Optional: price per share at sale and the sale date (all shares of this vest). */
  salePrice: string;
  saleDate: string;
}

export interface RsuInput {
  status: FilingStatus;
  /** Salary and other ordinary income for the year, before the RSUs. */
  salary: string;
  /** Federal withholding rate your employer applies to RSUs, as a percent (22 by default). */
  withholdingPct: string;
  events: VestEvent[];
}

export interface VestRow {
  id: string;
  income: number;
  withheld: number;
}

export interface SaleRow {
  id: string;
  proceeds: number;
  basis: number;
  gain: number;
  longTerm: boolean;
  days: number;
}

export interface RsuResult {
  vestIncome: number;
  rows: VestRow[];
  withheld: number;
  /** Federal income tax the RSU income adds to your return. */
  actualTax: number;
  /** actualTax - withheld: positive means you will owe at filing, negative a credit. */
  gap: number;
  marginal: number;
  effectiveOnRsu: number;
  sales: SaleRow[];
  shortTermGain: number;
  longTermGain: number;
  /** Federal tax on the sales, including the 3.8% net investment income tax. */
  saleTax: number;
  niit: number;
  deductibleLoss: number;
  carryForwardLoss: number;
  hasSales: boolean;
  /** Vest events that were skipped because shares or price were missing. */
  skipped: number;
}

/** Days from a to b for YYYY-MM-DD strings; NaN when either is invalid. */
export function daysBetween(a: string, b: string): number {
  const da = Date.parse(`${a}T00:00:00Z`);
  const db = Date.parse(`${b}T00:00:00Z`);
  return Math.round((db - da) / 86_400_000);
}

/** True when the sale is more than one year after the vest date (long-term). */
export function isLongTerm(vest: string, sale: string): boolean {
  const v = new Date(`${vest}T00:00:00Z`);
  if (Number.isNaN(v.getTime()) || Number.isNaN(Date.parse(`${sale}T00:00:00Z`))) return false;
  const anniversary = Date.UTC(v.getUTCFullYear() + 1, v.getUTCMonth(), v.getUTCDate());
  return Date.parse(`${sale}T00:00:00Z`) > anniversary;
}

function withholdingOn(total: number, rate: number): number {
  const first = Math.min(total, SUPPLEMENTAL_1M);
  const rest = Math.max(0, total - SUPPLEMENTAL_1M);
  return first * rate + rest * SUPPLEMENTAL_RATE_OVER_1M;
}

export function calculateRsu(i: RsuInput): RsuResult {
  const status = i.status;
  const salary = Math.max(0, num(i.salary));
  const rate = i.withholdingPct.trim() === "" ? SUPPLEMENTAL_RATE : Math.min(1, Math.max(0, num(i.withholdingPct) / 100));
  let skipped = 0;

  const rows: VestRow[] = [];
  let vestIncome = 0;
  for (const e of i.events) {
    const shares = num(e.shares);
    const price = num(e.priceAtVest);
    if (shares <= 0 || price <= 0) {
      skipped++;
      continue;
    }
    const income = shares * price;
    vestIncome += income;
    rows.push({ id: e.id, income, withheld: 0 });
  }
  // The 22% (or your rate) applies up to $1 million of supplemental wages in the year, then 37%.
  const withheld = withholdingOn(vestIncome, rate);
  for (const r of rows) r.withheld = vestIncome > 0 ? (withheld * r.income) / vestIncome : 0;

  const std = STANDARD_DEDUCTION[status];
  const baseTaxable = Math.max(0, salary - std);
  const withRsuTaxable = Math.max(0, salary + vestIncome - std);
  const baseTax = federalOrdinaryTax(baseTaxable, status).tax;
  const withRsu = federalOrdinaryTax(withRsuTaxable, status);
  const actualTax = withRsu.tax - baseTax;

  // Sales
  const sales: SaleRow[] = [];
  let st = 0;
  let lt = 0;
  for (const e of i.events) {
    const shares = num(e.shares);
    const price = num(e.priceAtVest);
    const salePrice = e.salePrice.trim() === "" ? NaN : num(e.salePrice);
    if (shares <= 0 || price <= 0 || !Number.isFinite(salePrice) || salePrice < 0 || !e.saleDate) continue;
    const days = daysBetween(e.vestDate, e.saleDate);
    if (!Number.isFinite(days) || days < 0) continue;
    const proceeds = shares * salePrice;
    const basis = shares * price; // basis = value at vest, already taxed as pay
    const gain = proceeds - basis;
    const longTerm = isLongTerm(e.vestDate, e.saleDate);
    if (longTerm) lt += gain;
    else st += gain;
    sales.push({ id: e.id, proceeds, basis, gain, longTerm, days });
  }

  // Net short-term against long-term, then apply the $3,000 loss limit.
  let ordinaryAdd = 0; // short-term gain taxed as ordinary income
  let ltTaxable = 0;
  let loss = 0;
  if (st >= 0 && lt >= 0) {
    ordinaryAdd = st;
    ltTaxable = lt;
  } else if (st < 0 && lt > 0) {
    ltTaxable = Math.max(0, lt + st);
    loss = Math.max(0, -(lt + st));
  } else if (st > 0 && lt < 0) {
    ordinaryAdd = Math.max(0, st + lt);
    loss = Math.max(0, -(st + lt));
  } else {
    loss = -(st + lt);
  }
  const deductibleLoss = Math.min(CAPITAL_LOSS_LIMIT, loss);
  const carryForwardLoss = Math.max(0, loss - deductibleLoss);

  let saleTax = 0;
  let niit = 0;
  if (sales.length > 0) {
    const ordWithSale = Math.max(0, withRsuTaxable + ordinaryAdd - deductibleLoss);
    const ordTax = federalOrdinaryTax(ordWithSale, status).tax - withRsu.tax;
    const ltTax = longTermGainsTax(ordWithSale, ltTaxable, status);
    const netInvestment = Math.max(0, ordinaryAdd + ltTaxable);
    const magi = salary + vestIncome + ordinaryAdd + ltTaxable - deductibleLoss;
    niit = NIIT_RATE * Math.min(netInvestment, Math.max(0, magi - NIIT_THRESHOLD[status]));
    saleTax = ordTax + ltTax + niit;
  }

  return {
    vestIncome,
    rows,
    withheld,
    actualTax,
    gap: actualTax - withheld,
    marginal: withRsu.marginal,
    effectiveOnRsu: vestIncome > 0 ? actualTax / vestIncome : 0,
    sales,
    shortTermGain: st,
    longTermGain: lt,
    saleTax,
    niit,
    deductibleLoss,
    carryForwardLoss,
    hasSales: sales.length > 0,
    skipped,
  };
}

let seq = 0;
export const newVestId = () => `v${++seq}`;

export const RSU_DEFAULTS: RsuInput = {
  status: "single",
  salary: "180000",
  withholdingPct: "22",
  events: [
    { id: "d1", vestDate: "2026-03-15", shares: "100", priceAtVest: "150", salePrice: "", saleDate: "" },
    { id: "d2", vestDate: "2026-06-15", shares: "100", priceAtVest: "160", salePrice: "", saleDate: "" },
    { id: "d3", vestDate: "2026-09-15", shares: "100", priceAtVest: "170", salePrice: "", saleDate: "" },
    { id: "d4", vestDate: "2026-12-15", shares: "100", priceAtVest: "180", salePrice: "", saleDate: "" },
  ],
};
