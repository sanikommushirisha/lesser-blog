/* Page behaviour for the free tools in /blog/tools. Tax rules: tools-logic.js. */
(function () {
  var form = document.getElementById('tool-form');
  if (!form) return;
  var T = window.LesserTools;
  var toolId = form.dataset.tool;
  var resultEl = document.getElementById('result');
  var captureEl = document.getElementById('capture');
  var used = false;

  var money = function (n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  };
  var percent = function (r) {
    return Math.round(r * 100) + '%';
  };
  var num = function (name) {
    return Math.max(0, parseFloat(form.elements[name].value) || 0);
  };
  var value = function (name) {
    return form.elements[name].value;
  };

  function verdict(tone, title, body) {
    return '<p class="verdict verdict-' + tone + '">' + title + '</p>' + (body ? '<p>' + body + '</p>' : '');
  }
  function rows(items) {
    return (
      '<dl class="rows">' +
      items
        .map(function (r) {
          return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
        })
        .join('') +
      '</dl>'
    );
  }
  function list(items) {
    return '<ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
  }

  var tools = {
    'rsu-gap': function () {
      var rsu = num('rsu');
      var filing = value('filing');
      var marginal =
        filing === 'single' ? T.marginalRateSingle(num('salary') + rsu) : parseFloat(value('bracket'));
      var r = T.rsuGap({ rsu: rsu, marginal: marginal });
      var html =
        r.gap > 0
          ? verdict('warn', 'Estimated gap: ' + money(r.gap), 'This is federal income tax your employer may not withhold on these RSUs.')
          : verdict('ok', 'No gap at this bracket', 'At a ' + percent(marginal) + ' bracket, the flat vest withholding covers the federal income tax on these RSUs.');
      html += rows([
        ['Your top federal bracket', percent(marginal)],
        ['Withheld at vest (estimate)', money(r.withheld)],
        ['Federal income tax on the RSUs', money(r.owed)],
      ]);
      if (r.gap > 0) {
        html +=
          '<h3>Ways to close it</h3>' +
          list([
            'Add extra withholding on Form W-4, Step 4(c).',
            'Make a quarterly estimated payment through IRS Direct Pay.',
            'Compare your prepayments with the safe harbor: 100% of last year\'s tax, or 110% if last year\'s AGI was over $150,000.',
          ]);
      }
      return html;
    },
    'residency-test': function () {
      if (value('greencard') === 'yes') {
        return verdict('warn', 'You are a resident under the green card test', 'The day count does not decide it for you. Green card status continues until it is given up or terminated, so this calculator does not apply.');
      }
      var current = num('current');
      var r = T.presenceTest({ current: current, prior: num('prior'), before: num('before') });
      var weighted = Math.round(r.weighted * 100) / 100;
      var html = r.meets
        ? verdict('warn', 'You meet the Substantial Presence Test', 'You are generally a US resident for tax, and report worldwide income on Form 1040.')
        : verdict('ok', 'You do not meet the test', current < 31 ? 'You need at least 31 days in the current year.' : 'You are under 183 weighted days, so you are generally a nonresident and file Form 1040-NR if you have a US filing duty.');
      html += rows([
        ['Current year days', String(current)],
        ['Prior year days / 3', String(Math.round((num('prior') / 3) * 100) / 100)],
        ['Year before / 6', String(Math.round((num('before') / 6) * 100) / 100)],
        ['Weighted total (183 needed)', String(weighted)],
      ]);
      var notes = [];
      if (value('visa') === 'exempt') {
        notes.push('On F, J, M or Q status, days as an exempt individual should be left out of the counts above, and you file Form 8843 to exclude them. Filing it on time matters.');
      }
      if (r.closerConnectionPossible) {
        notes.push('You were here fewer than 183 days this year, so check the closer connection exception on Form 8840.');
      }
      if (r.meets) {
        notes.push('An arrival or departure year is usually a dual-status year, with different forms and limits.');
      }
      if (notes.length) html += '<h3>What to check next</h3>' + list(notes);
      return html;
    },
    'india-money': function () {
      var amount = num('amount');
      var r = T.moneyFromIndia({ usPerson: value('usperson') === 'yes', source: value('source'), amount: amount });
      var noIncome = 'A gift from a nonresident individual is not income, so this is a reporting form and not a tax bill. Later earnings on the money are taxable.';
      switch (r.outcome) {
        case 'not-us-person':
          return verdict('ok', 'Form 3520 does not apply', 'If you are a nonresident alien, Form 3520 does not apply to you.');
        case 'loan':
          return verdict('warn', 'A documented loan is not a gift', 'Keep the loan paperwork. A loan with no documents is typically treated as a gift, so run this check again as a gift if you have none.');
        case 'check-annual-line':
          return verdict('warn', 'Check this year\'s line', 'Gifts from foreign corporations and partnerships have a much lower line, set every year. Check the current figure at irs.gov/InflationAdjustment or ask a CPA.');
        case 'trust':
          return verdict('warn', 'Form 3520 is likely required', 'Distributions from a foreign trust have no $100,000 line: any amount is reported. Talk to a CPA, because trust rules are different.');
        case 'under-line':
          return verdict('ok', 'No Form 3520 for this total', 'The calendar-year total of ' + money(amount) + ' is not over $100,000. ' + noIncome);
        default:
          return (
            verdict('warn', 'Form 3520 is required', 'The calendar-year total of ' + money(amount) + ' is over $100,000, so the full amount is reported. ' + noIncome) +
            rows([
              ['Normal due date', 'April 15 of next year'],
              ['With Form 4868 extension', 'October 15'],
              ['Penalty if late, each month', money(r.penaltyPerMonth)],
              ['Penalty cap (25%)', money(r.penaltyMax)],
            ]) +
            '<h3>What to do</h3>' +
            list([
              'File it separately from your Form 1040, by mail to the IRS in Ogden.',
              'Convert each amount to dollars using the date you received it.',
              'If you missed a past year, the usual fix is to file late with a reasonable-cause statement.',
            ])
          );
      }
    },
    '401k-exit': function () {
      var balance = num('balance');
      var underAge = value('age') === 'under';
      var r = T.cashOut({ balance: balance, underAge: underAge, timing: value('timing'), otherIncome: num('other') });
      if (r.timing === 'after') {
        var items = [['Likely withheld up front (often 30%)', money(r.withheld)]];
        if (underAge) items.push(['Additional 10% before age 59 1/2', money(r.extra)]);
        return (
          verdict('warn', 'We can only estimate what is withheld', 'Withholding is a prepayment, not your final tax. Your final US tax depends on your treaty position, which needs a CPA.') +
          rows(items) +
          '<p class="note">The 10% is commonly understood to still apply after you become a nonresident. Keeping the account, or a direct rollover to a traditional IRA, has no US tax today.</p>'
        );
      }
      var html =
        verdict('warn', 'Estimated federal cost: ' + money(r.total) + ' (' + percent(r.share) + ')', 'This is a cash-out in one tax year while you are still a US resident.') +
        rows(
          [['Federal income tax on the cash-out', money(r.incomeTax)]]
            .concat(underAge ? [['Additional 10% before age 59 1/2', money(r.extra)]] : [])
            .concat([['Left after federal tax', money(r.left)]])
        );
      return (
        html +
        '<p class="note">State tax is not included. Keeping the account, or a direct rollover to a traditional IRA, has no US tax today. Moving abroad is not an exception to the 10%, but some exceptions exist, such as leaving that employer in or after the year you turn 55.</p>'
      );
    },
    'founder-forms': function () {
      var entity = value('entity');
      var foreign = value('owner') === 'foreign';
      var extend = 'Form 7004 extends the time to file, not the time to pay, and must be filed by the original due date.';
      var state = 'State filings are not covered here, and some states need their own extension.';
      function result(title, body, table, next) {
        return verdict(next && next.tone ? next.tone : 'warn', title, body) + rows(table) + list((next ? next.items : []).concat([state]));
      }
      if (entity === 'smllc' && !foreign) {
        return verdict('ok', 'No separate LLC return', 'A single-member LLC with a US owner is disregarded. You report it on Schedule C, E or F of your Form 1040.') +
          list(['If you move abroad and become a nonresident, Form 5472 comes into play.', 'If the LLC has employees, payroll returns are its own.', state]);
      }
      if (entity === 'smllc') {
        return result('Pro forma Form 1120 plus Form 5472', 'An India-based owner of a single-member LLC files these every year, even with no revenue, when there is a reportable transaction. Reportable transactions have effectively no minimum, so check with a CPA before skipping a year.',
          [['Due', 'April 15'], ['With Form 7004', 'October 15'], ['Filing', 'Mail or fax, no e-file'], ['Penalty for missing it', '$25,000']],
          { items: [extend, 'The penalty is also charged for a late or substantially incomplete form.'] });
      }
      if (entity === 'mmllc') {
        return result('Form 1065 plus K-1s', 'A multi-member LLC files as a partnership, unless it truly had no income and no deductible expenses.',
          [['Due', 'March 15'], ['With Form 7004', 'September 15'], ['Late penalty', 'About $255 per partner, per month, up to 12 months']],
          { items: [extend].concat(foreign ? ['Nonresident partners bring withholding rules that a CPA should set up.'] : []) });
      }
      if (entity === 'scorp' && foreign) {
        return verdict('warn', 'An S corp cannot have a nonresident shareholder', 'A transfer of shares to a nonresident ends the election on the date of transfer. A C corporation has no such limit.') + list(['An LLC with a nonresident member can elect C corporation treatment on Form 8832, not S.', state]);
      }
      if (entity === 'scorp') {
        return result('Form 1120-S plus K-1s', 'You file every year the S election is in effect, even with no income.',
          [['Due', 'March 15'], ['With Form 7004', 'September 15'], ['Late penalty', 'About $255 per shareholder, per month, up to 12 months']],
          { items: [extend, 'Working shareholders must be paid reasonable W-2 wages.', 'Form 2553 is due 2 months and 15 days after the start of the tax year.'] });
      }
      return result(foreign ? 'Form 1120 plus Form 5472' : 'Form 1120', 'A C corporation files even with zeros.',
        [['Due', 'April 15'], ['With Form 7004', 'October 15']].concat(foreign ? [['Form 5472 penalty', '$25,000']] : []),
        { items: [extend].concat(foreign ? ['Form 5472 applies if a foreign owner holds 25% or more.', 'Dividends to a nonresident shareholder face 30% withholding, or 25% under the India treaty with Form W-8BEN.'] : []) });
    },
  };

  function syncConditional() {
    form.querySelectorAll('[data-show-when]').forEach(function (el) {
      var parts = el.dataset.showWhen.split('=');
      el.hidden = value(parts[0]) !== parts[1];
    });
  }
  form.addEventListener('change', syncConditional);
  syncConditional();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    resultEl.innerHTML = '<h2>Your result</h2>' + tools[toolId]() + '<p class="note">Educational estimate only. Not tax or legal advice.</p>';
    resultEl.hidden = false;
    if (captureEl) captureEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resultEl.focus({ preventScroll: true });
    if (!used) {
      used = true;
      // Only the fact of use goes up, never what the visitor typed.
      try {
        window.posthog && window.posthog.capture('tool_used', { tool: toolId });
      } catch (_) {}
    }
  });

  var captureForm = document.getElementById('capture-form');
  if (captureForm) {
    var message = document.getElementById('capture-message');
    captureForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = captureForm.querySelector('button');
      button.disabled = true;
      message.textContent = '';
      fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: captureForm.elements.email.value,
          offer: captureForm.dataset.offer,
          slug: captureForm.dataset.slug,
          company: captureForm.elements.company.value,
        }),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (res.ok) {
              try {
                window.posthog && window.posthog.capture('tool_subscribed', { tool: toolId, offer: captureForm.dataset.offer });
              } catch (_) {}
              captureForm.hidden = true;
              message.textContent = 'Done. Your checklist is on its way.';
              return;
            }
            message.textContent = res.status === 400 || res.status === 429 ? body.error : 'Signup is not working right now. Please try later.';
            button.disabled = false;
          });
        })
        .catch(function () {
          message.textContent = 'Signup is not working right now. Please try later.';
          button.disabled = false;
        });
    });
  }
})();
