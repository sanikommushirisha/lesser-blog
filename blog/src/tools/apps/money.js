import { App, M } from '../engine.js';
import * as Tax from '../../../../shared/tool-results';

export default function mount() {
  function ans(s) { return { usperson: s.usperson, transfers: s.transfers.filter(function (t) { return t.date && t.amount > 0; }).map(function (t) { return { date: t.date, kind: t.kind, donor: t.donor, recipient: t.recipient, amount: t.amount, currency: t.currency, rate: t.currency === 'INR' ? t.rate : 0 }; }) }; }
  App.mount({
    defaults: { usperson: 'yes', transfers: [{ date: '', kind: 'gift', donor: 'family1', recipient: 'me', currency: 'USD', amount: 0, rate: 86 }] },
    cta: 'See my Form 3520 report', waiting: 'Add a transfer to see your total against the $100,000 line.',
    steps: [
      { name: 'You', title: 'First, how you file', sub: 'Form 3520 applies to US persons, which usually means anyone filing Form 1040.', blocks: [{ title: 'Do you file Form 1040 in the US', fields: [{ type: 'tiles', key: 'usperson', options: [['yes', 'Yes', 'I file Form 1040'], ['no', 'No', 'I am a nonresident alien']] }] }] },
      { name: 'Your transfers', title: 'Add each transfer you received', sub: 'Add every transfer, for any year. Totals run by calendar year, not the Indian financial year.', ready: function (s) { if (s.usperson === 'no') return ''; if (s.transfers.some(function (t) { return t.currency === 'INR' && t.amount > 0 && !(t.rate > 0); })) return 'Enter the rupees per dollar rate for each rupee transfer.'; return ans(s).transfers.length ? '' : 'Add a date and amount for at least one transfer.'; }, blocks: [
        { title: 'Start from your statement', upload: { title: 'Upload a statement or remittance record', hint: 'A text PDF, CSV or text file. Read on this device and never uploaded.', parse: function (t, s) {
          var out = [];
          t.split(/\n/).forEach(function (l) {
            if (!/remit|wire|inward|swift|neft|transfer/i.test(l)) return;
            /* The first amount after the date is the transfer. Later ones are the running balance. */
            var m = l.match(/(\d{4})-(\d{2})-(\d{2})|(\d{1,2})\/(\d{1,2})\/(\d{4})/), a = M.amounts(l);
            if (!m || !a.length) return;
            out.push({ date: m[1] ? m[0] : m[6] + '-' + m[4].padStart(2, '0') + '-' + m[5].padStart(2, '0'), kind: 'gift', donor: 'family1', recipient: 'me', amount: a[0], currency: /INR|Rs\.?\s/i.test(l) ? 'INR' : 'USD', rate: 86 });
          });
          if (!out.length) return [];
          s.transfers = out.slice(0, 30);
          return [s.transfers.length + ' incoming transfers added', 'Check who each one came from'];
        } } },
        { title: 'Transfers', rows: 'transfers', item: 'Transfer', min: 1, max: 40, add: 'Add another transfer', blank: { date: '', kind: 'gift', donor: 'family1', recipient: 'me', currency: 'USD', amount: 0, rate: 86 }, fields: [
          { type: 'date', key: 'date', label: 'Date received' },
          { type: 'select', key: 'kind', label: 'What was it', options: [['gift', 'Gift'], ['inheritance', 'Inheritance'], ['loan-documented', 'Loan with written note'], ['loan-undocumented', 'Loan, no paperwork'], ['company', 'From a company or partnership'], ['trust', 'From a trust']] },
          { type: 'select', key: 'donor', label: 'From', options: [['family1', 'Your family'], ['family2', 'Spouse\'s family'], ['other1', 'Unrelated person 1'], ['other2', 'Unrelated person 2']] },
          { type: 'select', key: 'recipient', label: 'Received by', options: [['me', 'You'], ['spouse', 'Your spouse'], ['joint', 'Joint account']] },
          { type: 'select', key: 'currency', label: 'Currency', options: [['USD', 'US dollars'], ['INR', 'Indian rupees']] },
          { type: 'money', key: 'amount', label: 'Amount', show: function (r) { return r.currency === 'USD'; } },
          { type: 'inr', key: 'amount', label: 'Amount', show: function (r) { return r.currency === 'INR'; } },
          { type: 'num', key: 'rate', label: 'Rupees per dollar that day', keepZero: true, show: function (r) { return r.currency === 'INR'; } },
        ] },
      ] },
    ],
    preview: function (s) {
      if (s.usperson === 'no') return { label: 'Your status', value: 'Not required', rows: [['Form 3520', 'Does not apply']] };
      var a = ans(s); if (!a.transfers.length) return null;
      var p = Tax.moneyPlan(a, Date.now()), top = p.all.slice().sort(function (x, y) { return y.total - x.total; })[0];
      if (!top) return { label: 'Counted toward the line', value: '$0', rows: [['Reporting line', '$100,000']] };
      return { label: 'Highest yearly total (' + top.year + ')', value: M.money(top.total), warn: top.total > 100000, rows: [['Reporting line', '$100,000'], [top.total > 100000 ? 'Over by' : 'Room left', M.money(Math.abs(100000 - top.total))], ['Forms needed', p.required.length]] };
    },
    result: function (s) {
      var a = ans(s), rep = Tax.buildReport('india-money', a, Date.now());
      if (s.usperson === 'no') return { title: rep.title, sub: rep.body, eyebrow: 'Form 3520', value: 'Not required', note: 'Nonresident aliens do not file it.', full: function () { return Tax.reportEmail('india-money', rep).html; }, fine: 'Educational only. Not tax or legal advice.' };
      var p = Tax.moneyPlan(a, Date.now()), late = p.required.filter(function (r) { return r.late > 0; }), pen = late.reduce(function (x, r) { return x + r.penalty; }, 0);
      var review = !p.required.length && (p.flagged.trust.size > 0 || p.flagged.company > 0);
      var why = ['Related donors add together, so gifts from both parents count as one total.', 'Each recipient is counted separately, and the test resets every calendar year.', 'A gift from a nonresident individual is not income, so this is a reporting form and not a tax bill.'];
      if (p.required.length) why.unshift('Once a total goes over $100,000, the full amount is reported, not only the part above the line.');
      var plan = [];
      if (p.flagged.trust.size) plan.push(['Report money from a trust', 'Trust distributions have no $100,000 line, so any amount is reported. Trust rules differ, so talk to a CPA.']);
      if (p.flagged.company > 0) plan.push(['Check the line for company gifts', 'Gifts from foreign companies and partnerships have a lower line, set every year. Check it at irs.gov/InflationAdjustment.']);
      p.required.forEach(function (r) { plan.push(['Form 3520 for ' + r.year, 'Report ' + M.money(r.total) + ' by ' + new Date(r.due).toISOString().slice(0, 10) + (r.late ? ', which has passed' : '') + '. It is filed separately from your Form 1040, by mail.']); });
      if (late.length) plan.push(['Fix a late form with a reasonable-cause statement', 'The usual route is to file late and explain why. Saying you did not know is almost never enough on its own.']);
      plan.push(['Keep your records', 'Wire confirmations, bank statements, the remittance advice (Form A2 or 15CA/15CB) and a short memo on the family relationship.']);
      plan.push(['Convert using the date received', 'Use the exchange rate for each date, and keep a note of the source.']);
      var yrs = {}, order = [];
      p.all.forEach(function (b) { if (!yrs[b.year]) { yrs[b.year] = 0; order.push(b.year); } yrs[b.year] = Math.max(yrs[b.year], b.total); });
      var sorted = a.transfers.slice().sort(function (x, y) { return x.date < y.date ? -1 : 1; });
      return {
        title: rep.title, sub: rep.body, eyebrow: late.length ? 'Possible penalty so far' : 'Forms 3520 needed', value: late.length ? M.money(pen) : review ? 'Needs review' : String(p.required.length), warn: !!late.length || review, note: late.length ? 'At 5% a month, capped at 25%, assuming no extension.' : p.required.length ? 'See your due dates below.' : review ? 'A trust or company transfer follows different rules. See below.' : 'Your transfers stay under the line.',
        custom: p.all.length ? function (box) {
          var c = document.createElement('div'); c.className = 'box2';
          c.innerHTML = '<h3>Your totals against the $100,000 line</h3>' + M.table(['Year', 'Received by', 'From', 'Total', 'Over the line'], p.all.map(function (b) { return [b.year, b.recipient === 'me' ? 'You' : 'Spouse', { family1: 'Your family', family2: 'Spouse\'s family', other1: 'Person 1', other2: 'Person 2' }[b.donor], M.money(b.total), b.total > 100000 ? 'Yes' : 'No']; }));
          box.appendChild(c);
          if (sorted.length > 1) {
            var run = 0, vals = [0], labs = ['Start'];
            sorted.forEach(function (t) { run += t.currency === 'USD' ? t.amount : t.amount / (t.rate || 1); vals.push(run); labs.push(t.date.slice(2, 7)); });
            var d = document.createElement('div'); d.className = 'box2'; d.innerHTML = '<h3>Running total of all transfers</h3>' + M.line([{ color: '#034f46', values: vals }], labs, 100000); box.appendChild(d);
          }
        } : null,
        why: why, plan: { title: 'What to do next', sub: 'Based on your transfers.', items: plan },
        full: function () { return Tax.reportEmail('india-money', rep).html; },
        complex: ['Money from a trust or company, or several missed years?', 'Those need a different approach. A Lesser Tax CPA can help you fix them properly.'],
        fine: 'Educational only. Not tax or legal advice. Money from a company uses a lower yearly line that this tool does not calculate.',
      };
    },
    included: { title: 'Made for money from India', items: ['Every transfer, in dollars or rupees', 'Totals by year, recipient and family', 'Related donors added together', 'Loans, trusts and companies flagged', 'Form 3520 due dates', 'Late penalty to date', 'Records to keep', 'Statement upload, read on your device'] },
    plan: function () { return 'premium'; },
    planWhy: function () { return 'Foreign income and reporting starts at Premium.'; },
    report: { title: 'Get your full Form 3520 report', items: ['Each form you need, with dates', 'When you crossed the line', 'Your possible penalty', 'Our free Indian accounts checklist'] },
  });
}
