// Checks the tool engines (LD-42, LD-43, LD-44) against an independent
// reference. Run: npx tsx script/check-tools.ts [reference.json cases.json]
//
// With two file arguments it compares the estimator to a reference computed by
// separate code (the sample returns); without them it runs the built-in
// property checks (RSU, capital gains, 401(k), India exit) only.

import { readFileSync } from "node:fs";
import { estimateTax } from "../shared/tools/estimator";
import { longTermGainsTax, progressiveTax, FEDERAL_BRACKETS } from "../shared/tools/federal";
import { calculateRsu, isLongTerm } from "../shared/tools/rsu";
import { compareIndiaExit, projectK401, K401_DEFAULTS, INDIA_DEFAULTS } from "../shared/tools/retirement";

let fails = 0;
let passes = 0;
function ok(name: string, cond: boolean, detail = "") {
  if (cond) passes++;
  else {
    fails++;
    console.log(`FAIL ${name} ${detail}`);
  }
}
const near = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol;

// --- sample returns vs the independent reference -------------------------------
const [refPath, casesPath] = process.argv.slice(2);
if (refPath && casesPath) {
  const ref = JSON.parse(readFileSync(refPath, "utf8")) as Record<string, any>;
  const cases = JSON.parse(readFileSync(casesPath, "utf8")) as any[];
  for (const c of cases) {
    const r = estimateTax({
      status: c.status, state: c.state, months: c.months, children: c.kids, otherDependents: c.oth_dep,
      wages: c.wages, bonus: c.bonus, rsuEspp: c.rsu, spouseWages: c.spouse, otherIncome: c.other,
      k401: c.k401, hsa: c.hsa, itemized: c.itemized, fedWithheld: 0, stateWithheld: 0,
    });
    const e = ref[c.name];
    ok(`${c.name} federal`, near(r.federalTax, e.federalTax), `${r.federalTax} vs ${e.federalTax}`);
    ok(`${c.name} state`, near(r.stateTax, e.stateTax), `${r.stateTax} vs ${e.stateTax}`);
    ok(`${c.name} fica`, near(r.fica, e.fica), `${r.fica} vs ${e.fica}`);
    ok(`${c.name} agi`, near(r.agi, e.agi));
    ok(`${c.name} marginal`, near(r.federalMarginal, e.fedMarginal, 1e-9));
    console.log(`${c.name}: federal ${Math.round(r.federalTax)}, state ${Math.round(r.stateTax)}, FICA ${Math.round(r.fica)}`);
  }
}

// Leftover state withholding must not become a refund in a state with no estimate.
const noState = estimateTax({
  status: "single", state: "TX", months: 12, children: 0, otherDependents: 0, wages: 100_000, bonus: 0, rsuEspp: 0,
  spouseWages: 0, otherIncome: 0, k401: 0, hsa: 0, itemized: 0, fedWithheld: 0, stateWithheld: 11_000,
});
ok("TX ignores state withholding", noState.stateBalance === 0 && near(noState.balance, noState.federalBalance));

// --- anchors from official examples -----------------------------------------------
// 2026 single: $100,000 taxable = 1,240 + 4,560 + 22% of (100,000 - 50,400)
ok("single 100k bracket math", near(progressiveTax(100_000, FEDERAL_BRACKETS.single).tax, 1_240 + 4_560 + 0.22 * 49_600));
// California top bracket: FTB publishes $72,219.84 + 12.3% over $742,953 (rounding in the thresholds is under $1)
ok("CA schedule X at top bracket start", near(progressiveTax(742_953, [
  { upTo: 11_079, rate: 0.01 }, { upTo: 26_264, rate: 0.02 }, { upTo: 41_452, rate: 0.04 }, { upTo: 57_542, rate: 0.06 },
  { upTo: 72_724, rate: 0.08 }, { upTo: 371_479, rate: 0.093 }, { upTo: 445_771, rate: 0.103 }, { upTo: Infinity, rate: 0.113 },
]).tax, 72_219.84, 1));

// --- long-term gains stacking ------------------------------------------------------
ok("ltcg all in 0% band", longTermGainsTax(10_000, 30_000, "single") === 0);
ok("ltcg straddles 0/15", near(longTermGainsTax(40_000, 20_000, "single"), (60_000 - 49_450) * 0.15, 0.01));
ok("ltcg into 20%", near(longTermGainsTax(540_000, 20_000, "single"), 5_500 * 0.15 + 14_500 * 0.2, 0.01));

// --- RSU -----------------------------------------------------------------------------
const ev = (id: string, vestDate: string, shares: string, price: string, sp = "", sd = "") =>
  ({ id, vestDate, shares, priceAtVest: price, salePrice: sp, saleDate: sd });
const r1 = calculateRsu({ status: "single", salary: "180000", withholdingPct: "22", events: [ev("a", "2026-03-15", "1000", "100")] });
ok("rsu income", r1.vestIncome === 100_000);
ok("rsu withheld 22%", near(r1.withheld, 22_000));
// 180k - 16.1k = 163.9k taxable; +100k = 263.9k. Tax(263.9k) - Tax(163.9k)
const t = (x: number) => progressiveTax(x, FEDERAL_BRACKETS.single).tax;
ok("rsu actual tax", near(r1.actualTax, t(263_900) - t(163_900)));
ok("rsu gap", near(r1.gap, t(263_900) - t(163_900) - 22_000));
ok("rsu marginal 35%", r1.marginal === 0.35);
// the 37% supplemental rate applies above $1M of RSU income in the year
const r2 = calculateRsu({ status: "single", salary: "300000", withholdingPct: "22", events: [ev("a", "2026-03-15", "10000", "150")] });
ok("rsu withheld over $1M", near(r2.withheld, 1_000_000 * 0.22 + 500_000 * 0.37));
// long-term and short-term sales
ok("holding period 1 year", !isLongTerm("2026-03-15", "2027-03-15") && isLongTerm("2026-03-15", "2027-03-16"));
const r3 = calculateRsu({
  status: "single", salary: "150000", withholdingPct: "22",
  events: [ev("a", "2025-06-01", "100", "100", "150", "2026-09-01"), ev("b", "2026-02-01", "100", "100", "80", "2026-08-01")],
});
ok("rsu LT gain 5000", near(r3.longTermGain, 5_000));
ok("rsu ST loss 2000", near(r3.shortTermGain, -2_000));
ok("rsu net loss netted against gain, no deduction", r3.deductibleLoss === 0 && r3.saleTax >= 0);
const r4 = calculateRsu({ status: "single", salary: "100000", withholdingPct: "22", events: [ev("a", "2026-02-01", "1000", "100", "50", "2026-08-01")] });
ok("rsu loss limited to 3000", r4.deductibleLoss === 3_000 && near(r4.carryForwardLoss, 47_000));
const r5 = calculateRsu({ status: "single", salary: "100000", withholdingPct: "22", events: [ev("a", "2026-02-01", "0", "100")] });
ok("rsu skips empty rows", r5.skipped === 1 && r5.vestIncome === 0);

// --- 401(k) ----------------------------------------------------------------------------
const k = projectK401({ ...K401_DEFAULTS, age: "30", retireAge: "31", balance: "0", salary: "100000", contributionPct: "10", matchRatePct: "50", matchCapPct: "6", returnPct: "0", tradSharePct: "100" });
ok("401k one year, 0% return = contributions", near(k.finalBalance, 10_000 + 3_000));
const kc = projectK401({ ...K401_DEFAULTS, age: "35", retireAge: "36", salary: "500000", contributionPct: "20", balance: "0", returnPct: "0" });
ok("401k capped at 24,500 under 50", near(kc.employeeNow, 24_500) && kc.cappedByLimit && kc.roomLeft === 0);
const kcc = projectK401({ ...K401_DEFAULTS, age: "61", retireAge: "62", salary: "500000", contributionPct: "20", balance: "0", returnPct: "0" });
ok("401k super catch-up at 61", near(kcc.employeeNow, 24_500 + 11_250) && kcc.rothCatchUpApplies);
const kg = projectK401({ ...K401_DEFAULTS, age: "30", retireAge: "31", salary: "100000", balance: "10000", contributionPct: "0", matchRatePct: "0", returnPct: "10" });
ok("401k growth on balance only", near(kg.finalBalance, 11_000));
// tax saved = tax(salary - std) - tax(salary - contribution - std)
const ks = projectK401({ ...K401_DEFAULTS, age: "30", retireAge: "40", salary: "160000", contributionPct: "10", stateRatePct: "0", tradSharePct: "100" });
ok("401k tax saved", near(ks.taxSaved, t(160_000 - 16_100) - t(160_000 - 16_000 - 16_100)));
ok("401k invalid retire age", !projectK401({ ...K401_DEFAULTS, retireAge: "20" }).valid);

// --- India exit ----------------------------------------------------------------------------
const ix = compareIndiaExit({ ...INDIA_DEFAULTS, balance: "100000", ageMove: "45", ageWithdraw: "45", returnPct: "7", indiaStatus: "rnor" });
const cash = ix.options.find((o) => o.id === "cash")!;
ok("cash out: 30% + 10% penalty, RNOR abroad", near(cash.usTax, 30_000) && near(cash.penalty, 10_000) && near(cash.net, 60_000));
const ixOld = compareIndiaExit({ ...INDIA_DEFAULTS, balance: "100000", ageMove: "60", ageWithdraw: "60", indiaStatus: "resident", indiaRatePct: "31.2" });
const cashOld = ixOld.options.find((o) => o.id === "cash")!;
ok("cash out at 60: no penalty, India tops up to 31.2% with credit", cashOld.penalty === 0 && near(cashOld.indiaTax, 1_200) && near(cashOld.net, 68_800));
const keep = ix.options.find((o) => o.id === "keep")!;
ok("keep with treaty claim: no U.S. tax", keep.usTax === 0);
ok("compare rejects bad ages", !compareIndiaExit({ ...INDIA_DEFAULTS, ageWithdraw: "30", ageMove: "45" }).valid);

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
