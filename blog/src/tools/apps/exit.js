import { App, M } from '../engine.js';
import * as Tax from '../../../../shared/tool-results';

export default function mount() {
  function ans(s) { return { balance: s.balance, age: s.age, left55: s.left55 ? 'yes' : 'no', filing: s.filing, incomeThisYear: s.incomeThisYear, incomeNextYear: s.incomeNextYear, stillResidentNextYear: s.resident, years: s.years || 1, growth: s.growth }; }
  App.mount({
    defaults: { balance: 0, age: 0, left55: false, filing: 'S', incomeThisYear: 0, resident: 'no', incomeNextYear: 0, years: 15, growth: 6 },
    cta: 'Compare my options', waiting: 'Enter your balance and age to see the cost of cashing out.',
    steps: [
      { name: 'Your account', title: 'Your 401(k)', sub: 'You do not have to empty this when you leave. Start with what is in it.', ready: function (s) { return s.balance > 0 && s.age >= 18 ? '' : 'Enter your balance and age.'; }, blocks: [
        { title: 'Start from your statement', upload: { title: 'Upload a 401(k) statement', hint: 'PDF or text. Read on this device and never uploaded.', parse: function (t, s, F) { var b = F.value(/(ending|closing|current|total)\s*(account\s*)?balance/i) || F.value(/vested\s*(account\s*)?balance/i); if (!b) return []; s.balance = Math.round(b); return ['Balance: ' + M.money(b)]; } } },
        { title: 'Your account', fields: [{ type: 'money', key: 'balance', label: 'Pre-tax balance' }, { type: 'num', key: 'age', label: 'Your age', ph: '38' }, { type: 'toggle', key: 'left55', label: 'I left this employer in or after the year I turned 55', show: function (s) { return s.age >= 55; } }] },
      ] },
      { name: 'Your income', title: 'Your income around the move', sub: 'A cash-out stacks on top of this income in the same tax year.', blocks: [
        { title: 'Filing status', fields: [{ type: 'tiles', key: 'filing', options: [['S', 'Single', 'Not married'], ['MFJ', 'Married, joint', 'One joint return'], ['MFS', 'Married, separate', 'Separate returns'], ['HOH', 'Head of household', 'Unmarried with a dependent']] }] },
        { title: 'This year', fields: [{ type: 'money', key: 'incomeThisYear', label: 'Income this year', hint: 'Salary, RSUs and other income.' }] },
        { title: 'Will you still be a US tax resident next year', fields: [{ type: 'tiles', key: 'resident', options: [['no', 'No', 'I will have moved'], ['yes', 'Yes', 'I will still be a resident']] }, { type: 'money', key: 'incomeNextYear', label: 'Income next year', show: function (s) { return s.resident === 'yes'; } }] },
      ] },
      { name: 'Your future', title: 'If you kept it invested', sub: 'These are your own assumptions, used only to compare the options.', blocks: [{ fields: [{ type: 'num', key: 'years', label: 'Years until you need the money', keepZero: true }, { type: 'num', key: 'growth', label: 'Yearly growth to assume (%)', keepZero: true, hint: 'Investments can lose value.' }] }] },
    ],
    preview: function (s) {
      if (!s.balance) return null;
      var p = Tax.exitPlan(ans(s));
      return { label: 'Cost of cashing out this year', value: M.money(p.lumpCost), warn: true, rows: [['Income tax', M.money(p.lumpTax)], ['Additional 10%', M.money(p.lumpExtra)], ['You keep', M.money(p.lumpNet)], ['Share of balance', Math.round(p.lumpShare * 100) + '%']] };
    },
    result: function (s) {
      var a = ans(s), p = Tax.exitPlan(a), rep = Tax.buildReport('401k-exit', a, Date.now());
      var why = ['A cash-out stacks on top of your ' + M.money(s.incomeThisYear) + ' of income, so it is taxed at those higher rates.'];
      if (p.lumpExtra) why.push('You are under 59 1/2, so an additional 10% applies. Moving abroad is not an exception.');
      else if (s.age < 59.5) why.push('You left this employer in or after the year you turned 55, so the additional 10% is left out.');
      why.push('Keeping the account, or a direct rollover to a traditional IRA, has no US tax today.');
      if (p.canSplit && p.splitSaving > 0) why.push('Spreading it over two tax years could save ' + M.money(p.splitSaving) + '.');
      var plan = [['Do not cash out in a hurry', 'There is no deadline to withdraw just because you are leaving the US.'], ['Consider a direct rollover while you have a US address', 'It is easier to set up before you move, and it has no US tax today.'], ['File Form W-8BEN with the custodian', 'This keeps withholding in line with your treaty position after you move.'], ['Check your RNOR window in India', 'Timing of withdrawals around your RNOR years can change the Indian tax picture.'], ['Add it to Schedule FA once you are an ordinary resident', 'Your 401(k) and IRA are reported in India from that point.']];
      if (p.canSplit && p.splitSaving > 0) plan.unshift(['Split it across two tax years', 'If you must withdraw, this could save ' + M.money(p.splitSaving) + ' in federal tax.']);
      return {
        title: 'Your 401(k) options', sub: M.money(s.balance) + ' balance, age ' + s.age + '.', eyebrow: 'Federal cost of cashing out this year', value: M.money(p.lumpCost), warn: true, note: Math.round(p.lumpShare * 100) + '% of your balance, before state tax.',
        split: { title: 'Where a cash-out goes', parts: [['You keep', Math.max(0, p.lumpNet), '#034f46'], ['Income tax', p.lumpTax, '#b4471f'], ['Additional 10%', p.lumpExtra, '#c9791a']] },
        custom: function (box) {
          var labs = [], k = [], c = [], y;
          for (y = 0; y <= s.years; y++) { labs.push('Yr ' + y); k.push(s.balance * Math.pow(1 + s.growth / 100, y)); c.push(Math.max(0, p.lumpNet) * Math.pow(1 + s.growth / 100, y)); }
          var d = document.createElement('div'); d.className = 'box2';
          d.innerHTML = '<h3>Keep it, or cash out and invest the rest</h3>' + M.line([{ color: '#034f46', values: k }, { color: '#b4471f', values: c }], labs) + '<div class="legend"><span><u style="background:#034f46"></u>Left in the account, before later tax</span><span><u style="background:#b4471f"></u>What is left after a cash-out</span></div>';
          box.appendChild(d);
          var t = document.createElement('div'); t.className = 'box2';
          var rows = [['Leave it in the plan', '$0', '$0', M.money(s.balance)], ['Roll to a traditional IRA', '$0', '$0', M.money(s.balance)], ['Cash out this year', M.money(p.lumpTax), M.money(p.lumpExtra), M.money(p.lumpNet)]];
          if (p.canSplit) rows.push(['Cash out over two years', M.money(p.splitTax), M.money(p.afterExtra), M.money(p.splitNet)]);
          t.innerHTML = '<h3>Your options side by side</h3>' + M.table(['Option', 'Income tax', 'Additional 10%', 'Left today'], rows);
          box.appendChild(t);
        },
        cards: [['If you withdraw after you move', M.lines([['Likely withheld up front', M.money(p.afterWithheld)], ['Additional 10%', M.money(p.afterExtra)]]) + '<p class="fine">Withholding is a prepayment, not your final tax. Your final US tax depends on your treaty position, so we do not estimate it.</p>'], ['If you keep it', M.lines([['Value in ' + s.years + ' years', M.money(p.keptValue)], ['Growth assumed', s.growth + '% a year']]) + '<p class="fine">Your assumption, not a forecast. Later withdrawals are still taxed.</p>']],
        why: why, plan: { title: 'Your plan before you leave', sub: 'Personalised from your answers.', items: plan },
        full: function () { return Tax.reportEmail('401k-exit', rep).html; },
        complex: ['Holding a green card, or close to the exit tax?', 'Covered expatriates have different 401(k) rules. A Lesser Tax CPA can check where you stand.'],
        fine: 'Educational estimate for federal tax. State tax is left out. Not investment, tax or legal advice.',
      };
    },
    included: { title: 'Made for moving back', items: ['All your options side by side', '2026 brackets for every filing status', 'Additional 10% and age 55 rule', 'Two-year split comparison', 'Value if you keep it', 'Withholding after you move', 'RNOR, Schedule FA and RMD points', 'Statement upload, read on your device'] },
    plan: function () { return 'premium'; },
    planWhy: function () { return 'Moving back means foreign income and investments, which starts at Premium.'; },
    report: { title: 'Get your full 401(k) exit plan', items: ['Your options side by side', 'The two-year split comparison', 'Your before-you-leave list', 'Our free moving back to India checklist'] },
  });
}
