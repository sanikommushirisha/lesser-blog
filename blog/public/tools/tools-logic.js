/*
 * Tax logic for the free tools in /blog/tools. Every rule and figure here comes
 * from a published Lesser Tax post (named next to it), so a change in the law
 * means changing the post and this file together. Tax year 2026 unless noted.
 *
 * Pure functions with no page access, so they can be tested on their own.
 */
(function (root) {
  // where-your-paycheck-goes-taxes-h1b (Rev. Proc. 2025-32). Single filers only:
  // the posts do not give a complete married filing jointly table.
  var BRACKETS_SINGLE = [
    [12400, 0.1],
    [50400, 0.12],
    [105700, 0.22],
    [201775, 0.24],
    [256225, 0.32],
    [640600, 0.35],
    [Infinity, 0.37],
  ];
  var STANDARD_DEDUCTION_SINGLE = 16100;

  function taxableSingle(wages) {
    return Math.max(0, wages - STANDARD_DEDUCTION_SINGLE);
  }

  function marginalRateSingle(wages) {
    var taxable = taxableSingle(wages);
    for (var i = 0; i < BRACKETS_SINGLE.length; i++) {
      if (taxable <= BRACKETS_SINGLE[i][0]) return BRACKETS_SINGLE[i][1];
    }
    return 0.37;
  }

  function incomeTaxSingle(taxable) {
    var tax = 0;
    var previous = 0;
    for (var i = 0; i < BRACKETS_SINGLE.length; i++) {
      var slice = Math.min(taxable, BRACKETS_SINGLE[i][0]) - previous;
      if (slice <= 0) break;
      tax += slice * BRACKETS_SINGLE[i][1];
      previous = BRACKETS_SINGLE[i][0];
    }
    return tax;
  }

  // rsu-taxes-h1b-2026: 22% on supplemental wages, 37% past $1 million.
  // Gap = vest income x (marginal rate - withholding rate).
  var SUPPLEMENTAL_RATE = 0.22;
  var SUPPLEMENTAL_TOP_RATE = 0.37;
  var SUPPLEMENTAL_LINE = 1000000;

  function rsuGap(input) {
    var rsu = input.rsu;
    var withheld =
      Math.min(rsu, SUPPLEMENTAL_LINE) * SUPPLEMENTAL_RATE +
      Math.max(0, rsu - SUPPLEMENTAL_LINE) * SUPPLEMENTAL_TOP_RATE;
    var owed = rsu * input.marginal;
    return { withheld: withheld, owed: owed, gap: Math.max(0, owed - withheld) };
  }

  // substantial-presence-test: 31 days this year and 183 weighted days.
  // No post gives a rounding rule, so fractions are kept as they are.
  function presenceTest(input) {
    var weighted = input.current + input.prior / 3 + input.before / 6;
    var meets = input.current >= 31 && weighted >= 183;
    return {
      weighted: weighted,
      meets: meets,
      // Form 8840 needs fewer than 183 days in the current year.
      closerConnectionPossible: meets && input.current < 183,
    };
  }

  // form-3520-gifts-inheritance-from-parents-india and
  // parents-sent-money-for-house-us-reporting.
  var GIFT_LINE = 100000;
  var PENALTY_PER_MONTH = 0.05;
  var PENALTY_MAX_MONTHS = 5; // 25% cap

  function moneyFromIndia(input) {
    if (!input.usPerson) return { outcome: 'not-us-person' };
    if (input.source === 'loan') return { outcome: 'loan' };
    if (input.source === 'company') return { outcome: 'check-annual-line' };
    if (input.source === 'trust') return { outcome: 'trust' };
    if (input.amount <= GIFT_LINE) return { outcome: 'under-line' };
    return {
      outcome: 'required',
      penaltyPerMonth: input.amount * PENALTY_PER_MONTH,
      penaltyMax: input.amount * PENALTY_PER_MONTH * PENALTY_MAX_MONTHS,
    };
  }

  // us-401k-moving-back-to-india. Before leaving, the cash-out stacks on top of
  // the year's other income. After becoming a nonresident the posts give the
  // up-front withholding but not the final tax, so this does not total one.
  function cashOut(input) {
    var extra = input.underAge ? input.balance * 0.1 : 0;
    if (input.timing === 'after') {
      return { timing: 'after', withheld: input.balance * 0.3, extra: extra };
    }
    var incomeTax =
      incomeTaxSingle(taxableSingle(input.otherIncome + input.balance)) -
      incomeTaxSingle(taxableSingle(input.otherIncome));
    var total = incomeTax + extra;
    return {
      timing: 'before',
      incomeTax: incomeTax,
      extra: extra,
      total: total,
      share: input.balance > 0 ? total / input.balance : 0,
      left: input.balance - total,
    };
  }

  root.LesserTools = {
    marginalRateSingle: marginalRateSingle,
    incomeTaxSingle: incomeTaxSingle,
    rsuGap: rsuGap,
    presenceTest: presenceTest,
    moneyFromIndia: moneyFromIndia,
    cashOut: cashOut,
  };
})(globalThis);
