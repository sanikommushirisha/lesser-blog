import { App, M } from '../engine.js';
import * as Tax from '../../../../shared/tool-results';

export default function mount() {
  /* W-2 labels, including the wording payroll providers use. */
  var read = function (F) {
    var wages = F.value(/wages,?\s*tips,?\s*(and\s*)?other\s*comp[a-z.]*/i) || F.value(/federal\s*taxable\s*wages/i);
    var fed = F.value(/federal\s*income\s*tax(\s*withheld)?/i), state = F.value(/state\s*income\s*tax(\s*withheld)?/i), ytd = false;
    if (!wages) { wages = F.last(/gross\s*(pay|earnings|wages)/i); if (wages) { ytd = true; fed = F.last(/federal\s*(income\s*)?(tax|withholding)/i); state = F.last(/state\s*(income\s*)?(tax|withholding)/i); } }
    /* Tax withheld can never equal or exceed wages: that means a misread, so leave it for the reader. */
    if (fed && wages && fed >= wages) fed = null;
    if (state && wages && state >= wages) state = null;
    return { wages: wages, fed: fed, state: state, ytd: ytd };
  };
  var RATE = { CA: .093, NY: .0685, NJ: .0637, MA: .05, IL: .0495, CO: .044, GA: .055, WA: 0, TX: 0, FL: 0, OTHER: .05 };
  var STATE = { CA: 'California', NY: 'New York', NJ: 'New Jersey', MA: 'Massachusetts', IL: 'Illinois', CO: 'Colorado', GA: 'Georgia', WA: 'Washington', TX: 'Texas', FL: 'Florida', OTHER: 'Another state' };
  var LT = { S: [49450, 545500], MFS: [49450, 306850], HOH: [66200, 579600], MFJ: [98900, 613700] };
  var NAME = { S: 'Single', MFJ: 'Married filing jointly', MFS: 'Married filing separately', HOH: 'Head of household' };
  function compute(a) {
    var has = function (k) { return a.income.indexOf(k) >= 0; }, adj = function (k) { return a.adjust.indexOf(k) >= 0; };
    var wages = has('wages') ? a.wages : 0, interest = has('interest') ? a.interest : 0, div = has('dividends') ? a.dividends : 0, qual = has('dividends') ? Math.min(a.qualified, div) : 0;
    var st = has('gains') ? a.stGain : 0, lt = has('gains') ? a.ltGain : 0, se = has('self') ? a.selfNet : 0, rent = has('rental') ? a.rental : 0, other = has('other') ? a.other : 0;
    var net = se * .9235, room = Math.max(0, 184500 - wages), seTax = se > 0 ? .124 * Math.min(net, room) + .029 * net : 0;
    var hsa = adj('hsa') ? a.hsa : 0, ira = adj('ira') ? a.ira : 0, loan = adj('loan') ? Math.min(a.loan, 2500) : 0;
    var gains = st + lt, lossUse = gains < 0 ? Math.max(gains, a.filing === 'MFS' ? -1500 : -3000) : 0;
    var ltcg = Math.max(0, lt + Math.min(st, 0)) + qual, stNet = Math.max(0, st + Math.min(lt, 0));
    var ordinary = wages + interest + (div - qual) + stNet + se + rent + other + lossUse;
    var agi = ordinary + ltcg - hsa - ira - loan - seTax / 2;
    var std = { S: 16100, MFS: 16100, HOH: 24150, MFJ: 32200 }[a.filing];
    var txb = Math.max(0, agi - std), pref = Math.min(ltcg, txb), ordTxb = txb - pref;
    var ordTax = Tax.incomeTax(ordTxb, a.filing), L = LT[a.filing];
    var at0 = Math.max(0, Math.min(pref, L[0] - ordTxb)), at15 = Math.max(0, Math.min(pref - at0, L[1] - Math.max(ordTxb, L[0]))), at20 = pref - at0 - at15;
    var ltTax = at15 * .15 + at20 * .2;
    var ctc = a.kids * 2200, line = a.filing === 'MFJ' ? 400000 : 200000;
    ctc = Math.max(0, ctc - Math.ceil(Math.max(0, agi - line) / 1000) * 50);
    var niitLine = { S: 200000, HOH: 200000, MFJ: 250000, MFS: 125000 }[a.filing];
    var inv = interest + div + Math.max(0, st + lt) + rent, niit = .038 * Math.min(inv, Math.max(0, agi - niitLine));
    var medLine = a.filing === 'MFJ' ? 250000 : a.filing === 'MFS' ? Infinity : 200000, addl = Math.max(0, wages + se - medLine) * .009;
    var income = Math.max(0, ordTax + ltTax - ctc);
    var fed = income + seTax + niit + addl, rate = RATE[a.state] || 0, state = rate * txb;
    var fedPaid = a.fedPaid, statePaid = a.statePaid, total = fed + state, paid = fedPaid + statePaid, balance = total - paid;
    var marg = Tax.marginalRate(agi, a.filing), gross = wages + interest + div + Math.max(0, st + lt) + se + rent + other;
    return { wages: wages, se: se, gross: gross, agi: agi, std: std, txb: txb, ordTax: ordTax, ltTax: ltTax, ctc: ctc, niit: niit, addl: addl, seTax: seTax, income: income, fed: fed, state: state, rate: rate, total: total, paid: paid, fedPaid: fedPaid, statePaid: statePaid, balance: balance, marg: marg, eff: gross ? fed / gross : 0, ltcg: ltcg, gains: st + lt, interest: interest, combined: marg + rate, hsa: hsa };
  }
  function ways(a, r) {
    var c = r.combined, out = [];
    if (r.wages > 0) { var room = Math.max(0, 24500 - a.k401); if (room > 0) out.push([Math.round(room * c), 'Pre-tax 401(k): up to ' + M.money(room * c) + ' a year', 'You have ' + M.money(room) + ' of 2026 room left. At your ' + M.pct(c) + ' combined rate, each $10,000 you defer saves about ' + M.money(10000 * c) + '.']); }
    var cap = a.filing === 'MFJ' ? 8750 : 4400, left = Math.max(0, cap - r.hsa);
    if (left > 0) out.push([Math.round(left * c), 'HSA: up to ' + M.money(left * c) + ' if you have a high-deductible plan', 'The 2026 limit is ' + M.money(cap) + ' for your coverage type. Money goes in pre-tax and can come out tax-free for medical costs.']);
    if (r.gains > 0) out.push([Math.round(3000 * c * .5 + Math.min(r.gains, 3000) * .15), 'Tax-loss harvesting on your gains', 'Selling losing positions can offset gains, and up to $3,000 of extra loss can reduce other income. Watch the wash sale rule around RSU vests.']);
    if (r.txb > 0) out.push([Math.round(10000 * c), 'Bunch giving through a donor-advised fund', 'Giving several years of donations at once, ideally in appreciated stock, can make itemizing worthwhile in that year. A $10,000 gift could save up to ' + M.money(10000 * c) + '.']);
    if (r.agi > 165000) out.push([0, 'Backdoor Roth IRA', 'Your income may be too high for a direct Roth, but a backdoor Roth can still get money into tax-free growth. The pro-rata rule applies to any traditional IRA balance.']);
    if (r.balance > 0) out.push([0, 'Fix your withholding now', 'Update Form W-4, Step 4(c), or make an estimated payment so ' + M.money(r.balance) + ' does not land all at once, and to avoid an underpayment penalty.']);
    if (a.income.indexOf('foreign') >= 0) out.push([0, 'Check your Indian accounts', 'Accounts in India can need FBAR or Form 8938 even when no tax is due. Missing them carries heavy penalties.']);
    return out.sort(function (x, y) { return y[0] - x[0]; });
  }
  var has = function (k) { return function (s) { return s.income.indexOf(k) >= 0; }; }, adj = function (k) { return function (s) { return s.adjust.indexOf(k) >= 0; }; };
  App.mount({
    defaults: { filing: 'S', state: '', kids: 0, income: ['wages'], adjust: [], wages: 0, interest: 0, dividends: 0, qualified: 0, stGain: 0, ltGain: 0, selfNet: 0, rental: 0, other: 0, hsa: 0, ira: 0, loan: 0, k401: 0, fedPaid: 0, statePaid: 0 },
    cta: 'Calculate my 2026 estimate',
    waiting: 'Choose your state to unlock the live preview.',
    steps: [
      { name: 'Your details', title: 'Tell us about your 2026', sub: 'Your filing status, household and the kinds of income you had.', ready: function (s) { return s.state ? '' : 'Choose your state to continue.'; }, blocks: [
        { title: 'Filing status', fields: [{ type: 'tiles', key: 'filing', options: [['S', 'Single', 'Not married'], ['MFJ', 'Married, joint', 'One joint return'], ['MFS', 'Married, separate', 'Separate returns'], ['HOH', 'Head of household', 'Unmarried with a dependent']] }] },
        { title: 'Household', sub: 'Where you live and who you support.', fields: [{ type: 'select', key: 'state', label: 'Resident state', options: [['', 'Choose a state']].concat(Object.keys(STATE).map(function (k) { return [k, STATE[k]]; })), hint: 'State tax uses one flat rate for now, so it can run high. Another state uses 5%.' }, { type: 'count', key: 'kids', label: 'Children under 17' }] },
        { title: 'Income types', sub: 'Select everything you expect on your 2026 return.', fields: [{ type: 'tiles', key: 'income', multi: true, options: [['wages', 'Wages', 'W-2 income'], ['rsu', 'RSUs or stock options', 'Already in your W-2'], ['interest', 'Taxable interest', 'Banks, CDs, bonds'], ['dividends', 'Dividends', 'Ordinary and qualified'], ['gains', 'Capital gains or losses', 'Stocks, RSUs sold, crypto'], ['self', 'Self-employed', 'Freelance, 1099, side gig'], ['rental', 'Rental income', 'Net of expenses'], ['other', 'Other income', 'Unemployment, prizes'], ['foreign', 'Money or accounts in India', 'NRE, NRO, PPF, mutual funds']] }] },
        { title: 'Adjustments', sub: 'Deductions that reduce your income, even without itemizing.', fields: [{ type: 'tiles', key: 'adjust', multi: true, options: [['hsa', 'HSA contributions', 'Not through payroll'], ['ira', 'Traditional IRA', 'Deductible contributions'], ['loan', 'Student loan interest', 'Up to $2,500']] }] },
      ] },
      { name: 'Your numbers', title: 'Your 2026 numbers', sub: 'Annual totals. Estimates are fine, and you can come back and change them.', blocks: [
        { title: 'Start from your W-2', upload: { title: 'Upload your W-2 or pay stub', hint: 'A text PDF, not a scan or phone photo. Read on this device and never uploaded.', parse: function (t, s, F) {
          var r = read(F), out = [];
          if (r.wages) { s.wages = Math.round(r.wages); if (s.income.indexOf('wages') < 0) s.income.push('wages'); out.push('Wages: ' + M.money(r.wages)); }
          if (r.fed) { s.fedPaid = Math.round(r.fed); out.push('Federal tax withheld: ' + M.money(r.fed)); }
          if (r.state) { s.statePaid = Math.round(r.state); out.push('State tax withheld: ' + M.money(r.state)); }
          if (r.ytd && out.length) out.push('These are year-to-date figures from a pay stub. Update them to full-year estimates.');
          if (r.wages && !r.fed) out.push('We could not read federal tax withheld, so please enter it below.');
          return r.wages || r.fed ? out : [];
        } } },
        { title: 'Income', fields: [
          { type: 'money', key: 'wages', label: 'Wages and tips', hint: 'W-2, Box 1. RSU income is already in here.', show: has('wages') },
          { type: 'money', key: 'k401', label: 'Your 401(k) contributions', hint: 'W-2, Box 12, code D.', show: has('wages') },
          { type: 'money', key: 'interest', label: 'Taxable interest', hint: '1099-INT, Box 1.', show: has('interest') },
          { type: 'money', key: 'dividends', label: 'Total ordinary dividends', hint: '1099-DIV, Box 1a.', show: has('dividends') },
          { type: 'money', key: 'qualified', label: 'Of which qualified', hint: '1099-DIV, Box 1b.', show: has('dividends') },
          { type: 'money', key: 'stGain', label: 'Short-term net gain', hint: 'Held one year or less.', show: has('gains') },
          { type: 'money', key: 'ltGain', label: 'Long-term net gain', hint: 'Held more than one year.', show: has('gains') },
          { type: 'money', key: 'selfNet', label: 'Self-employment profit', hint: 'After business expenses.', show: has('self') },
          { type: 'money', key: 'rental', label: 'Net rental income', show: has('rental') },
          { type: 'money', key: 'other', label: 'Other income', show: has('other') },
        ] },
        { title: 'Adjustments', show: function (s) { return s.adjust.length; }, fields: [
          { type: 'money', key: 'hsa', label: 'HSA contributions', hint: 'Not through payroll.', show: adj('hsa') },
          { type: 'money', key: 'ira', label: 'Traditional IRA', hint: 'Deductible amount.', show: adj('ira') },
          { type: 'money', key: 'loan', label: 'Student loan interest', hint: 'Capped at $2,500.', show: adj('loan') },
        ] },
        { title: 'Taxes already paid', sub: 'Withholding from your W-2s and 1099s, plus estimated payments.', fields: [
          { type: 'money', key: 'fedPaid', label: 'Federal tax withheld and paid', hint: 'W-2, Box 2, plus payments made.' },
          { type: 'money', key: 'statePaid', label: 'State tax withheld and paid', hint: 'W-2, Box 17, plus payments made.', show: function (s) { return RATE[s.state] > 0; } },
        ] },
      ] },
    ],
    preview: function (s) {
      if (!s.state) return null;
      var r = compute(s), owes = r.balance > 0;
      return { label: owes ? 'Estimated balance due' : 'Estimated refund', value: M.money(Math.abs(r.balance)), warn: owes, rows: [['Federal tax', M.money(r.fed)], [STATE[s.state] + ' tax', M.money(r.state)], ['Already paid', M.money(r.paid)]] };
    },
    result: function (s) {
      var r = compute(s), owes = r.balance > 0, w = ways(s, r), dollars = w.filter(function (x) { return x[0] > 0; }).slice(0, 4), tot = dollars.reduce(function (a, x) { return a + x[0]; }, 0);
      var why = [];
      why.push(owes ? 'What you have paid so far falls short of your projected tax, so a balance is due.' : 'You have paid more than your projected tax, so a refund is likely.');
      if (r.marg >= .24) why.push('Part of your income reaches the ' + M.pct(r.marg) + ' federal bracket, which lifts your overall tax.');
      if (s.income.indexOf('wages') >= 0 && r.marg > .22) why.push('If you have RSUs, vests are usually withheld at a flat 22%, below your ' + M.pct(r.marg) + ' bracket. That is a common reason for a surprise bill.');
      if (r.ltcg > 0) why.push('Long-term gains and qualified dividends use the lower 0, 15 and 20% rates, not your ordinary bracket.');
      if (r.niit > 0) why.push('The 3.8% Net Investment Income Tax adds ' + M.money(r.niit) + ' because your income is above the threshold.');
      if (r.addl > 0) why.push('Additional Medicare Tax adds ' + M.money(r.addl) + ' on wages above the threshold.');
      if (r.ctc > 0) why.push('The Child Tax Credit reduces your tax by ' + M.money(r.ctc) + '.');
      if (r.seTax > 0) why.push('Self-employment tax adds ' + M.money(r.seTax) + ' on your business profit.');
      if (r.state > 0) why.push(STATE[s.state] + ' tax is about ' + M.money(r.state) + ' in this simplified estimate.');
      var keep = Math.max(0, r.gross - r.total), table = [['Total income', M.money(r.gross)], ['Adjusted gross income', M.money(r.agi)], ['Standard deduction', M.money(r.std)], ['Taxable income', M.money(r.txb)], ['Tax on ordinary income', M.money(r.ordTax)], ['Tax on long-term gains', M.money(r.ltTax)], ['Child Tax Credit', M.money(-r.ctc)], ['Self-employment tax', M.money(r.seTax)], ['Net Investment Income Tax', M.money(r.niit)], ['Additional Medicare Tax', M.money(r.addl)], ['Total federal tax', M.money(r.fed)]];
      return {
        title: 'Your 2026 estimate', sub: NAME[s.filing] + ' &middot; ' + STATE[s.state] + ' &middot; based on the numbers you entered.',
        eyebrow: (owes ? 'Estimated balance due' : 'Estimated refund') + ' &middot; federal and state', value: M.money(Math.abs(r.balance)), warn: owes, note: 'Total tax ' + M.money(r.total) + ' against ' + M.money(r.paid) + ' already paid.',
        split: { title: 'Where your ' + M.money(r.gross) + ' goes', parts: [['Federal income tax', r.income, '#034f46'], ['Other federal', r.seTax + r.niit + r.addl, '#7fbfae'], [STATE[s.state] + ' tax', r.state, '#c9791a'], ['You keep', keep, '#a8cfa0']] },
        cards: [['Federal', M.lines([[(r.fed - r.fedPaid > 0 ? 'Federal balance due' : 'Federal refund'), M.money(Math.abs(r.fed - r.fedPaid))], ['Total federal tax', M.money(r.fed)], ['Marginal rate', M.pct(r.marg)], ['Effective rate', M.pct(r.eff)]])], [STATE[s.state], M.lines([[(r.state - r.statePaid > 0 ? 'State balance due' : 'State refund'), M.money(Math.abs(r.state - r.statePaid))], ['State income tax', M.money(r.state)], ['Rate used', M.pct(r.rate)]])]],
        why: why, whyTitle: 'Why your estimate looks like this',
        plan: { title: 'Ways to pay less, based on your numbers', sub: 'Estimated yearly savings at your combined federal and state rate.', total: tot ? M.money(tot) + ' a year' : '', totalNote: 'Across your top ' + dollars.length + ' strategies. Your free report explains how to do each one.', items: w.map(function (x) { return [x[1], x[2]]; }) },
        full: function () { return '<h3>Line-by-line federal estimate</h3>' + M.lines(table) + '<h3 style="margin-top:18px">All your strategies</h3>' + w.map(function (x, i) { return '<p><b>' + (i + 1) + '. ' + x[1] + '</b><br>' + x[2] + '</p>'; }).join('') + '<p class="fine">Educational estimate only. Not tax or legal advice.</p>'; },
        complex: ['Own a business, hold K-1s or rental property?', 'This quick estimate cannot model entity choice, depreciation or passive losses. A Lesser Tax CPA can.'],
        fine: 'This is an estimate for planning only, not tax advice and not a filed return. It uses the standard deduction and a simplified flat state rate, and leaves out itemized deductions, AMT, the QBI deduction, education and energy credits, and local taxes.',
      };
    },
    included: { title: 'Built on the 2026 rules', items: ['Brackets for every filing status', '$16,100 and $32,200 standard deductions', '$2,200 Child Tax Credit with phase-out', '0, 15 and 20% capital gains rates', 'Self-employment tax', '3.8% NIIT and 0.9% Additional Medicare', 'Simplified state estimate for tech hubs', 'Runs in your browser'] },
    plan: function (s) { if (s.income.indexOf('self') >= 0 || s.income.indexOf('rental') >= 0) return 'private-client'; if (['rsu', 'gains', 'dividends', 'foreign'].some(function (k) { return s.income.indexOf(k) >= 0; })) return 'premium'; return 'essential'; },
    planWhy: function (s) { if (s.income.indexOf('self') >= 0 || s.income.indexOf('rental') >= 0) return 'You have business or rental income, which needs proactive strategy.'; if (['rsu', 'gains', 'dividends', 'foreign'].some(function (k) { return s.income.indexOf(k) >= 0; })) return 'You have stocks, investments or money in India, which Premium is built for.'; return 'Your income is straightforward, so Essential fits.'; },
    report: { title: 'Get your 2026 Tax Estimate and Savings Report', items: ['Line-by-line federal and state breakdown', 'Every strategy, with what to do next', 'Your numbers, ready for any tax pro', 'Our free NRI US tax checklist'] },
  });
}
