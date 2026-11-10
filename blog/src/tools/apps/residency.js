import { App, M } from '../engine.js';
import * as Tax from '../../../../shared/tool-results';

export default function mount() {
  function ans(s) { return { year: Number(s.year), greencard: s.greencard, firstStudentYear: Number(s.firstStudentYear) || 0, firstScholarYear: Number(s.firstScholarYear) || 0, greenCardSteps: s.steps2 ? 'yes' : 'no', foreignTaxHome: s.home ? 'yes' : 'no', trips: s.trips.filter(function (t) { return t.from && t.to && t.from <= t.to; }) }; }
  var STAT = [['worker', 'H-1B, L-1, O-1, H-4 or other'], ['student', 'F, M, or J/Q student'], ['scholar', 'J or Q teacher or researcher'], ['dependent', 'F-2 or J-2 dependent']];
  App.mount({
    defaults: { year: '2026', greencard: 'no', home: false, steps2: false, firstStudentYear: 0, firstScholarYear: 0, trips: [{ from: '', to: '', status: 'worker' }] },
    cta: 'See my residency report', waiting: 'Add a stay to see your day count.',
    steps: [
      { name: 'You', title: 'Which year are you checking', sub: 'Residency is decided one calendar year at a time.', blocks: [
        { title: 'Tax year', fields: [{ type: 'tiles', key: 'year', options: [['2026', '2026', 'This year'], ['2025', '2025', 'Last return'], ['2024', '2024', 'Earlier return']] }] },
        { title: 'Green card', fields: [{ type: 'tiles', key: 'greencard', options: [['no', 'No green card', 'Visa or no status'], ['yes', 'I hold a green card', 'The day count does not apply']] }] },
      ] },
      { name: 'Your stays', title: 'Add your time in the US', sub: 'Any part of a day counts. Add each stay across the last three years, including arrival and departure days.', ready: function (s) { return ans(s).trips.length || s.greencard === 'yes' ? '' : 'Add at least one stay with both dates.'; }, blocks: [
        { title: 'Start from your I-94 history', sub: 'Download it free from i94.cbp.dhs.gov.', upload: { title: 'Upload your I-94 travel history', hint: 'PDF or text. Read on this device and never uploaded.', parse: function (t, s) {
          var ev = [], re = /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})[^A-Za-z0-9]*(Arrival|Departure)|(Arrival|Departure)[^A-Za-z0-9]*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/gi, m;
          while ((m = re.exec(t))) { var d = m[1] || m[4], k = (m[2] || m[3]).toLowerCase(); if (d.indexOf('/') > 0) { var p = d.split('/'); d = p[2] + '-' + p[0].padStart(2, '0') + '-' + p[1].padStart(2, '0'); } ev.push({ d: d, k: k }); }
          if (!ev.length) return [];
          ev.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
          var out = [], open = null, st = s.trips[0] ? s.trips[0].status : 'worker';
          ev.forEach(function (e) { if (e.k === 'arrival') { if (!open) open = e.d; } else { out.push({ from: open || e.d.slice(0, 4) + '-01-01', to: e.d, status: st }); open = null; } });
          /* Still in the US: the stay runs to the end of the tax year. An arrival after that year is outside it. */
          if (open && open <= s.year + '-12-31') out.push({ from: open, to: s.year + '-12-31', status: st });
          s.trips = out;
          return [out.length + ' stays found from ' + ev.length + ' dates', 'Set the status for each stay below'];
        } } },
        { title: 'Your stays', rows: 'trips', item: 'Stay', min: 1, max: 40, add: 'Add another stay', blank: { from: '', to: '', status: 'worker' }, fields: [{ type: 'date', key: 'from', label: 'Arrived' }, { type: 'date', key: 'to', label: 'Left' }, { type: 'select', key: 'status', label: 'Status during this stay', options: STAT }] },
      ] },
      { name: 'Your history', title: 'Two things that change the answer', sub: 'Exempt status runs on calendar years, and any part of a year uses up a whole year.', blocks: [
        { title: 'Student or scholar history', show: function (s) { return s.trips.some(function (t) { return t.status !== 'worker'; }); }, fields: [{ type: 'num', key: 'firstStudentYear', label: 'First calendar year as a student', ph: '2022', hint: 'Exempt for the first 5 calendar years.' }, { type: 'num', key: 'firstScholarYear', label: 'First year as a teacher or researcher', ph: '2024', hint: 'Exempt for the first 2 calendar years.' }] },
        { title: 'Closer connection exception', sub: 'This can make you a nonresident even if you meet the test.', fields: [{ type: 'toggle', key: 'home', label: 'My tax home was outside the US all year' }, { type: 'toggle', key: 'steps2', label: 'I took steps toward a green card this year' }] },
      ] },
    ],
    preview: function (s) {
      var a = ans(s); if (s.greencard === 'yes') return { label: 'Your status', value: 'Resident', warn: true, rows: [['Decided by', 'Green card test']] };
      if (!a.trips.length) return null;
      var n = Tax.residencyPlan(a).now;
      return { label: 'Weighted days', value: String(Math.round(n.weighted * 10) / 10), warn: n.meets, rows: [[s.year + ' days', n.current.total], [(a.year - 1) + ' days / 3', Math.round(n.prior.total / 3 * 10) / 10], [(a.year - 2) + ' days / 6', Math.round(n.before.total / 6 * 10) / 10], ['Needed', '183']], html: '' };
    },
    result: function (s) {
      var a = ans(s), rep = Tax.buildReport('residency-test', a, Date.now()), p = Tax.residencyPlan(a), n = p.now, gc = s.greencard === 'yes';
      var why = gc ? ['A green card makes you a resident under the green card test, whatever your day count.'] : ['Weighted days are all of this year, one third of last year, and one sixth of the year before.', 'You have ' + n.current.total + ' counted days this year and need at least 31.'];
      if (!gc && n.current.exempt + n.prior.exempt + n.before.exempt) why.push((n.current.exempt + n.prior.exempt + n.before.exempt) + ' days as an exempt student or scholar were left out, within the calendar-year limits.');
      if (p.dualStatus && !gc) why.push('You became a resident part-way through the year, so this is usually a dual-status year.');
      if (p.closerConnection) why.push('You may qualify for the closer connection exception on Form 8840.');
      var plan = [];
      (rep.sections.filter(function (x) { return /Forms/.test(x.heading); })[0] || { items: [] }).items.forEach(function (i) { plan.push(['Your filing', i]); });
      (rep.sections.filter(function (x) { return /check next|What this means/.test(x.heading); })[0] || { items: [] }).items.forEach(function (i) { plan.push(['Check this', i]); });
      return {
        title: rep.title, sub: rep.body, eyebrow: 'Your ' + s.year + ' tax residency', value: gc || n.meets && !p.closerConnection ? 'US resident' : p.closerConnection ? 'Possibly nonresident' : 'Nonresident', warn: false, note: gc ? 'Decided by the green card test.' : Math.round(n.weighted * 10) / 10 + ' weighted days, with 183 needed.',
        custom: gc ? null : function (box) {
          var c = document.createElement('div'); c.className = 'two';
          c.innerHTML = '<div class="box2"><h3>Toward 183 days</h3>' + M.ring(n.weighted, 183) + '</div><div class="box2"><h3>Your dates</h3>' + M.lines([['Residency starts', p.start ? new Date(p.start).toISOString().slice(0, 10) : 'Not this year'], ['Dual-status year', p.dualStatus ? 'Yes' : 'No'], ['Default end date', 'Dec 31, ' + s.year], ['Exempt days left out', n.current.exempt]]) + '</div>';
          box.appendChild(c);
        },
        why: why, plan: plan.length ? { title: 'Your forms and next steps', sub: 'Based on your answers.', items: plan } : null,
        full: function () { return Tax.reportEmail('residency-test', rep).html; },
        complex: ['Moved during the year, or married to a nonresident?', 'Dual-status returns and spouse elections change what you file. A Lesser Tax CPA can work through it with you.'],
        fine: 'Educational only. Leave out days covered by other exclusions, such as transit under 24 hours. Not tax or legal advice.',
      };
    },
    included: { title: 'Built for visa holders', items: ['Stay-by-stay day counting', 'Overlapping days counted once', 'Exempt student and scholar years', 'Residency start date', 'Dual-status check', 'Closer connection check', 'Form list for your year', 'I-94 upload, read on your device'] },
    plan: function () { return 'premium'; },
    planWhy: function () { return 'Residency questions usually come with foreign income, which starts at Premium.'; },
    report: { title: 'Get your full residency report', items: ['Your three-year day count', 'Start date and dual-status result', 'Exactly which forms you file', 'Our free NRI US tax checklist'] },
  });
}
