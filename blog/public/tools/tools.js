/*
 * Page behaviour for the free tools in /blog/tools. Results only go out by
 * email: this page sends the answers, and the server works out the result and
 * sends it (shared/tool-results.ts, server/newsletter.ts).
 */
(function () {
  var form = document.getElementById('tool-form');
  var step = document.getElementById('email-step');
  var emailForm = document.getElementById('email-form');
  var message = document.getElementById('email-message');
  var done = document.getElementById('email-done');
  if (!form || !step) return;
  var tool = form.dataset.tool;
  var used = false;

  function capture(event, props) {
    // Only the fact of use goes up, never what the visitor typed.
    try {
      window.posthog && window.posthog.capture(event, props);
    } catch (_) {}
  }

  function value(name) {
    return form.elements[name].value;
  }

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
    done.hidden = true;
    emailForm.hidden = false;
    step.hidden = false;
    message.textContent = '';
    step.scrollIntoView({ behavior: 'smooth', block: 'center' });
    emailForm.elements.email.focus({ preventScroll: true });
    if (!used) {
      used = true;
      capture('tool_used', { tool: tool });
    }
  });

  emailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var button = emailForm.querySelector('button');
    var answers = {};
    new FormData(form).forEach(function (v, k) {
      answers[k] = v;
    });
    button.disabled = true;
    message.textContent = '';
    fetch('/api/newsletter/tool-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailForm.elements.email.value,
        tool: tool,
        answers: answers,
        company: emailForm.elements.company.value,
      }),
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (body) {
            button.disabled = false;
            if (res.ok) {
              capture('tool_result_sent', { tool: tool });
              emailForm.hidden = true;
              done.hidden = false;
              return;
            }
            message.textContent =
              res.status === 400 || res.status === 429 ? body.error : 'We could not send your result. Please try again later.';
          });
      })
      .catch(function () {
        button.disabled = false;
        message.textContent = 'We could not send your result. Please try again later.';
      });
  });
})();
