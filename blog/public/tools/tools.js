/*
 * Step-by-step engine for the free tools in /blog/tools. Reports only go out by
 * email: this page collects answers, and the server works out the report and
 * sends it (shared/tool-results.ts, server/newsletter.ts).
 */
(function () {
  function capture(event, props) {
    // Only the fact of use goes up, never what the visitor typed.
    try {
      window.posthog && window.posthog.capture(event, props);
    } catch (_) {}
  }

  function initApp(app) {
    var tool = app.dataset.tool;
    var steps = Array.prototype.slice.call(app.querySelectorAll('.step'));
    var bar = app.querySelector('.progress-fill');
    var label = app.querySelector('.progress-label');
    var repeaters = Array.prototype.slice.call(app.querySelectorAll('.repeater'));
    var current = 0;
    var started = false;

    function fieldValue(el) {
      return el.value;
    }

    function syncConditional() {
      app.querySelectorAll('[data-show-when]').forEach(function (el) {
        var scope = el.closest('.row-item') || app;
        var parts = el.dataset.showWhen.split('=');
        var source = scope.querySelector('[name="' + parts[0] + '"]');
        var show = !!source && parts[1].split('|').indexOf(source.value) >= 0;
        el.hidden = !show;
        el.querySelectorAll('input, select').forEach(function (input) {
          input.disabled = !show;
        });
      });
    }

    function syncEmployers() {
      var list = app.querySelector('[data-name="employers"]');
      if (!list) return;
      var count = list.querySelectorAll('.row-item').length;
      app.querySelectorAll('select[data-employer-options]').forEach(function (select) {
        var chosen = select.value;
        select.innerHTML = '';
        for (var i = 0; i < count; i++) {
          var option = document.createElement('option');
          option.value = String(i);
          option.textContent = 'Employer ' + (i + 1);
          select.appendChild(option);
        }
        if (Number(chosen) < count) select.value = chosen;
      });
    }

    function renumber(repeater) {
      var rows = repeater.querySelectorAll('.row-item');
      rows.forEach(function (row, i) {
        var title = row.querySelector('.row-title');
        if (title) title.textContent = repeater.dataset.item + ' ' + (i + 1);
      });
      var min = Number(repeater.dataset.min || 0);
      var max = Number(repeater.dataset.max || 20);
      repeater.querySelectorAll('.row-remove').forEach(function (b) {
        b.hidden = rows.length <= min;
      });
      repeater.querySelector('.row-add').hidden = rows.length >= max;
    }

    function addRow(repeater) {
      var row = repeater.querySelector('template').content.firstElementChild.cloneNode(true);
      repeater.querySelector('.row-list').appendChild(row);
      row.querySelector('.row-remove').addEventListener('click', function () {
        row.remove();
        renumber(repeater);
        syncEmployers();
      });
      renumber(repeater);
      syncEmployers();
      syncConditional();
      return row;
    }

    repeaters.forEach(function (repeater) {
      repeater.querySelector('.row-add').addEventListener('click', function () {
        var row = addRow(repeater);
        var first = row.querySelector('input, select');
        if (first) first.focus();
      });
      for (var i = 0; i < Number(repeater.dataset.min || 0); i++) addRow(repeater);
    });
    app.addEventListener('change', syncConditional);
    syncConditional();

    function answers() {
      var out = {};
      app.querySelectorAll('.step [name]').forEach(function (el) {
        if (el.closest('.row-item') || el.closest('.email-form')) return;
        out[el.name] = fieldValue(el);
      });
      repeaters.forEach(function (repeater) {
        out[repeater.dataset.name] = Array.prototype.map.call(repeater.querySelectorAll('.row-item'), function (row) {
          var item = {};
          row.querySelectorAll('[name]').forEach(function (el) {
            item[el.name] = fieldValue(el);
          });
          return item;
        });
      });
      return out;
    }

    function summary() {
      var list = app.querySelector('.review-list');
      if (!list) return;
      list.innerHTML = '';
      repeaters.forEach(function (repeater) {
        var n = repeater.querySelectorAll('.row-item').length;
        var li = document.createElement('li');
        li.textContent = n + ' ' + (n === 1 ? repeater.dataset.one : repeater.dataset.many);
        list.appendChild(li);
      });
    }

    function show(index, focus) {
      current = index;
      steps.forEach(function (step, i) {
        step.hidden = i !== index;
      });
      var total = steps.length;
      bar.style.width = Math.round(((index + 1) / total) * 100) + '%';
      label.textContent = 'Step ' + (index + 1) + ' of ' + total + ': ' + steps[index].dataset.title;
      if (index === total - 1) summary();
      if (focus) {
        app.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var first = steps[index].querySelector('input:not([type=hidden]):not(.trap), select');
        if (first) first.focus({ preventScroll: true });
      }
    }

    steps.forEach(function (step, i) {
      var back = step.querySelector('.step-back');
      if (back) back.addEventListener('click', function () { show(i - 1, true); });
      if (step.classList.contains('email-step')) return;
      step.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!started) {
          started = true;
          capture('tool_used', { tool: tool });
        }
        show(i + 1, true);
      });
    });

    var emailStep = app.querySelector('.email-step');
    var message = app.querySelector('.email-message');
    var done = app.querySelector('.email-done');
    var emailInner = app.querySelector('.email-inner');
    emailStep.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = emailStep.querySelector('button[type=submit]');
      var payload = {
        email: emailStep.elements.email.value,
        tool: tool,
        answers: answers(),
        company: emailStep.elements.company.value,
      };
      button.disabled = true;
      message.textContent = '';
      var send = window.LesserToolPreview
        ? window.LesserToolPreview(app, payload)
        : fetch('/api/newsletter/tool-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (body) {
              return { ok: res.ok, status: res.status, error: body.error };
            });
          });
      send
        .then(function (res) {
          button.disabled = false;
          if (res.ok) {
            capture('tool_result_sent', { tool: tool });
            emailInner.hidden = true;
            done.hidden = false;
            return;
          }
          message.textContent = res.status === 400 || res.status === 429 ? res.error : 'We could not send your report. Please try again later.';
        })
        .catch(function () {
          button.disabled = false;
          message.textContent = 'We could not send your report. Please try again later.';
        });
    });

    var restart = app.querySelector('.email-again');
    if (restart) {
      restart.addEventListener('click', function () {
        emailInner.hidden = false;
        done.hidden = true;
        show(0, true);
      });
    }

    show(0, false);

    app.lesserFill = function (sample) {
      Object.keys(sample).forEach(function (key) {
        var value = sample[key];
        if (Array.isArray(value)) {
          var repeater = app.querySelector('.repeater[data-name="' + key + '"]');
          repeater.querySelector('.row-list').innerHTML = '';
          value.forEach(function (item) {
            var row = addRow(repeater);
            syncEmployers();
            Object.keys(item).forEach(function (k) {
              var el = row.querySelector('[name="' + k + '"]');
              if (el) el.value = item[k];
            });
          });
        } else {
          var el = app.querySelector('.step [name="' + key + '"]');
          if (el) el.value = value;
        }
      });
      syncConditional();
    };
  }

  document.querySelectorAll('.tool-app').forEach(initApp);
})();
