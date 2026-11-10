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
  function ans(s, move) {
    return { filing: s.filing, lastYearTax: s.lastYearTax, lastYearAgi: s.lastYearAgi, spouseWages: s.filing === 'MFJ' ? s.spouseWages : 0, spouseWithheld: s.filing === 'MFJ' ? s.spouseWithheld : 0, otherIncome: s.otherIncome, estimatedPaid: s.estimatedPaid, employers: s.employers, vests: s.vests.map(function (v, i) { return { employer: Number(v.employer) < s.employers.length ? Number(v.employer) : 0, quarter: v.quarter, value: v.value * (i === 0 ? 1 : 1 + (move || 0) / 100) }; }) };
  }
  App.mount({
    /* What the report request sends: the server rebuilds the report from these answers. */
    tool: 'rsu-gap',
    answers: function (s) { return ans(s); },
    defaults: { filing: 'S', lastYearTax: 0, lastYearAgi: 0, spouseWages: 0, spouseWithheld: 0, otherIncome: 0, estimatedPaid: 0, employers: [{ salary: 0, bonus: 0, withheld: 0 }], vests: [{ employer: '0', quarter: 'Q1', value: 0 }] },
    cta: 'See my RSU plan',
    onChange: function (s) { /* Vests entered after a W-2 upload come out of that W-2's totals. */
      if (!s.fromW2 || !s.fromW2.wages) return;
      var rsu = s.vests.reduce(function (a, v) { return a + v.value; }, 0);
      s.employers[0].salary = Math.round(Math.max(0, s.fromW2.wages - rsu));
      if (s.fromW2.fed) s.employers[0].withheld = Math.round(Math.max(0, s.fromW2.fed - rsu * .22));
    }, waiting: 'Add your pay and vests to see what you may owe.',
    steps: [
      { name: 'You', title: 'Start with your filing details', sub: 'These set your brackets and your penalty rules.', blocks: [
        { title: 'Filing status', fields: [{ type: 'tiles', key: 'filing', options: [['S', 'Single', 'Not married'], ['MFJ', 'Married, joint', 'One joint return'], ['MFS', 'Married, separate', 'Separate returns'], ['HOH', 'Head of household', 'Unmarried with a dependent']] }] },
        { title: 'Last year', sub: 'Used for your underpayment penalty safe harbor.', fields: [{ type: 'money', key: 'lastYearTax', label: 'Total tax last year', hint: 'Form 1040, line 24.' }, { type: 'money', key: 'lastYearAgi', label: 'Adjusted gross income last year', hint: 'Form 1040, line 11.' }] },
        { title: 'Your spouse', show: function (s) { return s.filing === 'MFJ'; }, fields: [{ type: 'money', key: 'spouseWages', label: 'Spouse\'s wages' }, { type: 'money', key: 'spouseWithheld', label: 'Federal tax withheld on them' }] },
      ] },
      { name: 'Your pay', title: 'Add every employer this year', sub: 'Changed jobs? Add each one, because withholding and Social Security start over at each employer.', blocks: [
        { title: 'Start from your W-2 or pay stub', upload: { title: 'Upload a W-2 or pay stub', hint: 'A text PDF, not a scan or phone photo. Read on this device and never uploaded.', parse: function (t, s, F) {
          var r = read(F), out = [], rsu = s.vests.reduce(function (a, v) { return a + v.value; }, 0);
          s.fromW2 = { wages: r.wages || 0, fed: r.fed || 0 };
          if (r.wages) { s.employers[0].salary = Math.round(Math.max(0, r.wages - rsu)); out.push('Wages: ' + M.money(r.wages)); }
          if (r.fed) { s.employers[0].withheld = Math.round(Math.max(0, r.fed - rsu * .22)); out.push('Federal tax withheld: ' + M.money(r.fed)); }
          if (r.wages) out.push('A W-2 already includes RSU income and withholding. When you add vests next, we take them out so they are not counted twice.');
          if (r.ytd && r.wages) out.push('These are year-to-date figures from a pay stub. Update them to full-year estimates.');
          if (r.wages && !r.fed) out.push('We could not read federal tax withheld, so please enter it below.');
          return r.wages || r.fed ? out : [];
        } } },
        { title: 'Employers', rows: 'employers', item: 'Employer', min: 1, max: 4, add: 'Add another employer', blank: { salary: 0, bonus: 0, withheld: 0 }, fields: [{ type: 'money', key: 'salary', label: 'Salary this year' }, { type: 'money', key: 'bonus', label: 'Cash bonus' }, { type: 'money', key: 'withheld', label: 'Federal tax withheld on salary and bonus', hint: 'Full-year estimate. Leave out RSU withholding.' }] },
      ] },
      { name: 'Your RSUs', title: 'Add each vest', sub: 'Use the value on the vest date, and add expected vests for the rest of the year.', ready: function (s) { return s.vests.some(function (v) { return v.value > 0; }) ? '' : 'Add at least one vest value.'; }, blocks: [
        { title: 'Vests', rows: 'vests', item: 'Vest', min: 1, max: 24, add: 'Add a vest', blank: { employer: '0', quarter: 'Q2', value: 0 }, fields: [{ type: 'select', key: 'quarter', label: 'Quarter', options: [['Q1', 'Q1'], ['Q2', 'Q2'], ['Q3', 'Q3'], ['Q4', 'Q4']] }, { type: 'select', key: 'employer', label: 'Employer', options: function (s) { return s.employers.map(function (e, i) { return [String(i), 'Employer ' + (i + 1)]; }); } }, { type: 'money', key: 'value', label: 'Value at vest' }] },
        { title: 'Anything else', fields: [{ type: 'money', key: 'otherIncome', label: 'Other income' }, { type: 'money', key: 'estimatedPaid', label: 'Estimated tax payments made' }] },
      ] },
    ],
    preview: function (s) {
      var p = Tax.planRsu(ans(s));
      if (!p.income) return null;
      var owes = p.balance > 0;
      return { label: owes ? 'Likely balance due' : 'Likely refund', value: M.money(Math.abs(p.balance)), warn: owes, rows: [['Federal tax', M.money(p.tax)], ['Withheld on pay', M.money(p.salaryWithheld + p.spouseWithheld)], ['Withheld on RSUs', M.money(p.vestWithheld)], ['Top bracket', M.pct(p.marginal)]] };
    },
    result: function (s) {
      var p = Tax.planRsu(ans(s)), owes = p.balance > 0, gap = p.vestRows.reduce(function (a, v) { return a + v.gap; }, 0);
      var why = ['Your top federal bracket is ' + M.pct(p.marginal) + ', while vests are usually withheld at a flat 22%.', 'That difference leaves ' + M.money(gap) + ' of tax on your RSUs not covered at vest.'];
      if (s.employers.length > 1) why.push('Each employer withholds as if it were your only job, so two W-2s often under-withhold.');
      if (p.excessSs > 0) why.push('You overpaid Social Security by ' + M.money(p.excessSs) + ' across employers. You claim that back on Schedule 3.');
      if (p.medicareGap > 0) why.push('Additional Medicare Tax of ' + M.money(p.medicareGap) + ' is not covered by withholding.');
      var plan = [];
      if (owes) plan.push(['Raise withholding on Form W-4, Step 4(c)', 'Spread ' + M.money(p.balance) + ' over your remaining paychecks so it does not land all at once.']);
      if (p.safeHarborShort > 0) plan.push(['Prepay ' + M.money(p.safeHarborShort) + ' more to avoid a penalty', 'Your safe harbor target is ' + M.money(p.safeHarbor) + '. Estimated payments go through IRS Direct Pay.']);
      if (p.excessSs > 0) plan.push(['Claim your ' + M.money(p.excessSs) + ' Social Security overpayment', 'Add Box 4 across your W-2s and enter the excess on Schedule 3.']);
      plan.push(['Fix the $0 basis trap when you sell', 'Your Form 1099-B can show a $0 basis. Enter it as is and you pay tax on the vest twice.']);
      plan.push(['Check the vest calendar before selling at a loss', 'A vest within 30 days either side can disallow the loss as a wash sale.']);
      return {
        title: 'Your 2026 RSU plan', sub: M.money(p.rsu) + ' in RSUs across ' + s.employers.length + (s.employers.length === 1 ? ' employer' : ' employers') + '.',
        eyebrow: owes ? 'Likely balance due at filing' : 'Likely refund', value: M.money(Math.abs(p.balance)), warn: owes, note: 'Tax of ' + M.money(p.tax + Math.max(0, p.medicareGap)) + ' against ' + M.money(p.prepaid) + ' prepaid.',
        split: { title: 'Where your tax is covered', parts: [['Withheld on pay', p.salaryWithheld + p.spouseWithheld, '#034f46'], ['Withheld on RSUs', p.vestWithheld, '#7fbfae'], ['Estimated payments', s.estimatedPaid, '#a8cfa0'], ['Not yet covered', Math.max(0, p.balance), '#b4471f']] },
        custom: function (box) {
          var moves = [-50, -25, 0, 25, 50, 75, 100], vals = moves.map(function (m) { return Math.max(0, Tax.planRsu(ans(s, m)).balance); });
          var c = document.createElement('div'); c.className = 'box2';
          c.innerHTML = '<h3>If the stock moves</h3><p class="fine">What you could owe at filing if your remaining vests rise or fall.</p>' + M.line([{ color: '#b4471f', values: vals }], moves.map(function (m) { return (m > 0 ? '+' : '') + m + '%'; }));
          box.appendChild(c);
        },
        cards: [['Penalty check', M.lines([['Safe harbor target', M.money(p.safeHarbor)], ['Prepaid so far', M.money(p.prepaid)], [p.safeHarborShort > 0 ? 'Short by' : 'Target met', p.safeHarborShort > 0 ? M.money(p.safeHarborShort) : 'Yes']])], ['Social Security and Medicare', M.lines([['Social Security withheld', M.money(p.ssCombined)], ['2026 limit', '$11,439'], ['Additional Medicare gap', M.money(Math.max(0, p.medicareGap))]])]],
        why: why, plan: { title: 'Your action plan', sub: 'Personalised from your numbers.', items: plan },
        full: function () { return Tax.reportEmail('rsu-gap', Tax.buildReport('rsu-gap', ans(s), Date.now())).html; },
        complex: ['Have ISOs, NSOs, ESPP or an upcoming IPO?', 'Those need AMT and timing work that this planner does not model. A Lesser Tax CPA can run it with you.'],
        fine: 'Educational estimate for federal tax only. It uses the standard deduction and leaves out state tax, credits and itemized deductions.',
      };
    },
    included: { title: 'Made for RSU holders', items: ['Every employer and vest', 'All filing statuses, 2026 brackets', '22% and 37% vest withholding', 'Underpayment safe harbor check', 'Social Security overpayment check', 'Additional Medicare check', 'What-if on stock price', 'W-2 upload, read on your device'] },
    plan: function () { return 'premium'; },
    planWhy: function () { return 'RSUs need stock and capital gains work, which starts at Premium.'; },
    report: { title: 'Get your full RSU tax plan', items: ['Your vest-by-vest gap table', 'Your exact safe harbor target', 'Social Security and Medicare checks', 'Our free RSU and equity tax checklist'] },
  });
}
