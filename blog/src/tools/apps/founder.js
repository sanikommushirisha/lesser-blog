import { App, M } from '../engine.js';
import * as Tax from '../../../../shared/tool-results';

export default function mount() {
  function ans(s) { return { entity: s.entity, taxYear: Number(s.taxYear), firstDay: s.entity === 'scorp' ? s.firstDay : '', revenue: s.act.indexOf('revenue') >= 0 ? 'yes' : 'no', ownerMoney: s.act.indexOf('money') >= 0 ? 'yes' : 'no', employees: s.act.indexOf('staff') >= 0 ? 'yes' : 'no', monthsLate: s.monthsLate, owners: s.owners }; }
  var ST = [['citizen', 'US citizen'], ['greencard', 'Green card holder'], ['visa', 'US tax resident on a visa'], ['nonresident', 'Nonresident, such as in India']];
  function strip(items, year) {
    var w = 560, cell = w / 12, t = 'JFMAMJJASOND', s = '<svg viewBox="0 0 ' + w + ' 86" role="img" aria-label="Filing calendar">';
    t.split('').forEach(function (m, i) { var hit = items.filter(function (k) { return k[0] === i; })[0]; s += '<rect x="' + (i * cell + 2) + '" y="6" width="' + (cell - 4) + '" height="42" rx="7" fill="' + (hit ? hit[2] : '#eef1ea') + '"/><text x="' + (i * cell + cell / 2) + '" y="32" text-anchor="middle" style="font-weight:700;fill:' + (hit ? '#fff' : '#5b6863') + '">' + m + '</text>'; });
    items.forEach(function (k) { s += '<text x="' + Math.min(k[0] * cell + 2, w - 110) + '" y="68" style="font-weight:700;fill:' + k[2] + '">' + k[1] + '</text>'; });
    return s + '</svg><p class="fine">' + year + ' calendar, for a calendar tax year.</p>';
  }
  App.mount({
    /* What the report request sends: the server rebuilds the report from these answers. */
    tool: 'founder-forms',
    answers: function (s) { return ans(s); },
    defaults: { entity: '', taxYear: '2026', firstDay: '', act: [], monthsLate: 0, owners: [{ pct: 100, status: 'citizen' }] },
    cta: 'Build my filing calendar', waiting: 'Choose how your company is taxed to see your next deadline.',
    steps: [
      { name: 'Your company', title: 'Tell us about your company', sub: 'Your filing duty follows how it is taxed, not whether it made money.', ready: function (s) { return s.entity ? '' : 'Choose how it is taxed.'; }, blocks: [
        { title: 'Start from last year\'s return', upload: { title: 'Upload last year\'s business return', hint: 'PDF. Read on this device and never uploaded.', parse: function (t, s) {
          var e = /form\s*1120-?\s*s\b/i.test(t) ? 'scorp' : /form\s*1065/i.test(t) ? 'mmllc' : /form\s*1120/i.test(t) ? 'ccorp' : null, out = [];
          if (e) { s.entity = e; out.push('Entity read from the form number'); }
          var y = t.match(/(?:calendar\s*year|tax\s*year)[^0-9]{0,12}(20\d\d)/i);
          if (y) { var n = Math.min(2026, Number(y[1]) + 1); s.taxYear = String(n); out.push('Last return was ' + y[1] + ', so this plan is for ' + n); }
          return out;
        } } },
        { title: 'How is it taxed', fields: [{ type: 'tiles', key: 'entity', options: [['smllc', 'Single-member LLC', 'One owner'], ['mmllc', 'Multi-member LLC', 'Taxed as a partnership'], ['scorp', 'S corporation', 'Form 2553 filed'], ['ccorp', 'C corporation', 'Delaware and others']] }] },
        { title: 'Tax year', fields: [{ type: 'tiles', key: 'taxYear', options: [['2026', '2026', 'Filed in 2027'], ['2025', '2025', 'Filed in 2026'], ['2024', '2024', 'Filed in 2025']] }, { type: 'date', key: 'firstDay', label: 'First day of its first tax year', hint: 'The earliest of having shareholders, assets or business.', show: function (s) { return s.entity === 'scorp'; } }] },
        { title: 'What happened this year', fields: [{ type: 'tiles', key: 'act', multi: true, options: [['revenue', 'Income or expenses', 'Any activity'], ['money', 'Money moved with an owner', 'Including start-up money'], ['staff', 'Has employees', 'Payroll in the US']] }] },
      ] },
      { name: 'Your owners', title: 'Add each owner', sub: 'Tax status decides which forms apply. Someone on an H-1B can be a US tax resident.', ready: function (s) { var t = s.owners.reduce(function (a, o) { return a + o.pct; }, 0); return t === 100 ? '' : 'Ownership adds up to ' + t + '%. It should be 100%.'; }, blocks: [
        { title: 'Owners', rows: 'owners', item: 'Owner', min: 1, max: 12, add: 'Add another owner', blank: { pct: 0, status: 'citizen' }, fields: [{ type: 'num', key: 'pct', label: 'Ownership %' }, { type: 'select', key: 'status', label: 'Tax status', options: ST }] },
        { title: 'Are you already late', sub: 'Leave blank if not. We use this to work out penalties.', fields: [{ type: 'num', key: 'monthsLate', label: 'Months past the due date' }] },
      ] },
    ],
    preview: function (s) {
      if (!s.entity) return null;
      var a = ans(s), p = Tax.founderPlan(a), r = Tax.buildReport('founder-forms', a, Date.now());
      return { label: p.sBlocked ? 'Needs attention' : 'Next federal deadline', value: r.title.replace('Your next deadline is ', '').replace('Your S election has a problem', 'S election issue').replace('No separate federal return for this LLC', 'No LLC return'), warn: p.sBlocked, rows: [['Owners', s.owners.length], ['Nonresident ownership', p.foreignPct + '%'], ['Form 5472', p.needs5472 ? 'Applies' : 'No']] };
    },
    result: function (s) {
      var a = ans(s), p = Tax.founderPlan(a), rep = Tax.buildReport('founder-forms', a, Date.now()), n = s.owners.length, per = s.entity === 'mmllc' || s.entity === 'scorp';
      var late = []; for (var m = 0; m <= 12; m++) late.push(per ? 255 * n * m : p.needs5472 && m ? 25000 : 0);
      var due = { mmllc: [2, 8, 'Form 1065'], scorp: [2, 8, 'Form 1120-S'], ccorp: [3, 9, p.needs5472 ? 'Forms 1120, 5472' : 'Form 1120'], smllc: [3, 9, 'Forms 1120, 5472'] }[s.entity];
      var none = p.sBlocked || (s.entity === 'smllc' && !p.anyForeign);
      var why = [];
      if (p.sBlocked) why.push('A nonresident cannot hold S corporation shares, so this structure has a problem to fix.');
      if (p.needs5472) why.push('Form 5472 applies because of foreign ownership, and the penalty for missing it is $25,000.');
      if (s.entity === 'smllc' && !p.anyForeign) why.push('A single-member LLC with a US owner is disregarded and reports on your Form 1040.');
      if (s.entity === 'ccorp') why.push('A C corporation files even in a year with zeros.');
      if (per && !p.sBlocked) why.push('Partnership and S corporation penalties scale with the number of owners and months late.');
      var items = [].concat.apply([], rep.sections.filter(function (x) { return x.items; }).map(function (x) { return x.items; }));
      return {
        title: rep.title, sub: rep.body, eyebrow: p.sBlocked ? 'Needs attention' : none ? 'Federal return' : 'Next federal deadline', value: rep.title.replace('Your next deadline is ', '').replace('Your S election has a problem', 'S election issue').replace('No separate federal return for this LLC', 'None for the LLC'), warn: p.sBlocked, note: p.foreignPct + '% nonresident ownership across ' + n + (n === 1 ? ' owner.' : ' owners.'),
        custom: none ? null : function (box) {
          var c = document.createElement('div'); c.className = 'box2'; c.innerHTML = '<h3>Your ' + p.fileYear + ' filing calendar</h3>' + strip([[due[0], due[2], '#034f46'], [due[1], 'With extension', '#0b7a6b']], p.fileYear); box.appendChild(c);
          if (Math.max.apply(null, late)) { var d = document.createElement('div'); d.className = 'box2'; var ls = late.map(function (_, i) { return i + 'mo'; }); d.innerHTML = '<h3>What running late could cost</h3>' + M.line([{ color: '#b4471f', values: late }], ls); box.appendChild(d); }
        },
        why: why, plan: { title: 'What else applies to you', sub: 'Based on your company and owners.', items: items.map(function (i) { return [i.split(/[.,]/)[0], i]; }) },
        full: function () { return Tax.reportEmail('founder-forms', rep).html; },
        complex: ['Raising money, or owners in more than one country?', 'Entity choice and cross-border ownership need planning. A Lesser Tax CPA can help.'],
        fine: 'Federal filings for a calendar tax year only. State filings are not covered. Penalty amounts come from 2024 instructions and change each year. Not tax or legal advice.',
      };
    },
    included: { title: 'Made for immigrant founders', items: ['Real due dates for your year', 'Weekend date adjustments', 'S corp owner eligibility', 'Form 5472 for foreign owners', 'Form 2553 deadline and relief', 'Penalty exposure by owner', 'Form 7004 extension dates', 'Return upload, read on your device'] },
    plan: function () { return 'private-client'; },
    planWhy: function () { return 'Founders get entity structure work and quarterly CPA strategy sessions.'; },
    report: { title: 'Get your full filing calendar', items: ['Every form and date', 'Eligibility checks for your owners', 'Your penalty exposure', 'Our free immigrant founder checklist'] },
  });
}
