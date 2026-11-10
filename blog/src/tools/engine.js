var campaign = '';
export function setCampaign(name) { campaign = name; }

var PDF_JS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
/* Loaded on the first upload only, so a visitor who types their numbers never fetches it. */
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve();
  return new Promise(function (ok, fail) {
    var tag = document.createElement('script');
    tag.src = PDF_JS + 'pdf.min.js';
    tag.integrity = 'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e';
    tag.crossOrigin = 'anonymous';
    tag.onload = ok; tag.onerror = fail;
    document.head.appendChild(tag);
  });
}

export var M = {
  money: function (n) { return (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US'); },
  pct: function (r) { return (Math.round(r * 1000) / 10) + '%'; },
  esc: function (s) { return String(s).replace(/[<>&"]/g, ''); },
  short: function (n) { var a = Math.abs(n); return (n < 0 ? '-' : '') + (a >= 1e6 ? '$' + (a / 1e6).toFixed(1) + 'M' : a >= 1e3 ? '$' + Math.round(a / 1e3) + 'K' : '$' + Math.round(a)); },
  amounts: function (t) { return (t.match(/\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d+\.\d{2}/g) || []).map(function (m) { return Number(m.replace(/,/g, '')); }); },
  lines: function (rows) { return '<dl class="lines">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; },
  table: function (head, rows) { return '<div class="tablewrap"><table><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'; },
  line: function (series, labels, target) {
    var w = 560, h = 210, l = 48, r = 12, t = 12, b = 26, all = [].concat.apply([], series.map(function (s) { return s.values; }));
    var max = Math.max.apply(null, all.concat([target || 0, 1])) * 1.08, min = Math.min.apply(null, all.concat([0])), n = labels.length;
    var px = function (i) { return l + (n > 1 ? i / (n - 1) : 0) * (w - l - r); }, py = function (v) { return h - b - ((v - min) / (max - min || 1)) * (h - t - b); };
    var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Chart">';
    [0, .5, 1].forEach(function (f) { var v = min + (max - min) * f; s += '<line x1="' + l + '" x2="' + (w - r) + '" y1="' + py(v) + '" y2="' + py(v) + '" stroke="#e7e8df"/><text x="0" y="' + (py(v) + 4) + '">' + M.short(v) + '</text>'; });
    if (target) s += '<line x1="' + l + '" x2="' + (w - r) + '" y1="' + py(target) + '" y2="' + py(target) + '" stroke="#b4471f" stroke-width="2" stroke-dasharray="4 3"/>';
    var step = Math.max(1, Math.ceil(n / 6));
    labels.forEach(function (x, i) { if (i % step === 0 || i === n - 1) s += '<text x="' + Math.min(px(i), w - 40) + '" y="' + (h - 7) + '">' + x + '</text>'; });
    series.forEach(function (ser) {
      s += '<path d="' + ser.values.map(function (v, i) { return (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1); }).join(' ') + '" fill="none" stroke="' + ser.color + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
      s += '<circle cx="' + px(n - 1) + '" cy="' + py(ser.values[n - 1]) + '" r="4.5" fill="' + ser.color + '"/>';
    });
    return s + '</svg>';
  },
  ring: function (v, target) {
    var r = 78, c = 2 * Math.PI * r, f = Math.min(v / target, 1), over = v >= target;
    return '<svg viewBox="0 0 200 200" style="max-width:210px;margin:0 auto" role="img" aria-label="Weighted days"><circle cx="100" cy="100" r="' + r + '" fill="none" stroke="#e7ebe3" stroke-width="20"/><circle cx="100" cy="100" r="' + r + '" fill="none" stroke="' + (over ? '#b4471f' : '#0b7a6b') + '" stroke-width="20" stroke-linecap="round" stroke-dasharray="' + f * c + ' ' + c + '" transform="rotate(-90 100 100)"/><text x="100" y="105" text-anchor="middle" style="font-size:38px;font-weight:800;fill:#14201d">' + Math.round(v * 10) / 10 + '</text><text x="100" y="128" text-anchor="middle" style="font-size:13px">of ' + target + ' days</text></svg>';
  },
  /* Reads a PDF into rows, using each piece of text's position on the page. */
  readPdf: function (file) {
    return Promise.all([file.arrayBuffer(), loadPdfJs()]).then(function (ready) {
      var buf = ready[0];
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS + 'pdf.worker.min.js';
      return window.pdfjsLib.getDocument({ data: buf, isEvalSupported: false }).promise;
    }).then(function (doc) {
      var pages = []; for (var i = 1; i <= Math.min(doc.numPages, 12); i++) pages.push(i);
      return Promise.all(pages.map(function (n) {
        return doc.getPage(n).then(function (p) { return p.getTextContent(); }).then(function (t) {
          return t.items.filter(function (x) { return x.str.trim(); }).map(function (x) { return { s: x.str, x: x.transform[4], y: x.transform[5], w: x.width, page: n }; });
        });
      }));
    }).then(function (pp) {
      var rows = [];
      pp.forEach(function (items) {
        items.sort(function (a, b) { return b.y - a.y || a.x - b.x; });
        items.forEach(function (it) {
          var row = rows.filter(function (r) { return r.page === it.page && Math.abs(r.y - it.y) <= 2.5; })[0];
          if (!row) { row = { page: it.page, y: it.y, items: [] }; rows.push(row); }
          row.items.push(it);
        });
      });
      rows.forEach(function (r) { r.items.sort(function (a, b) { return a.x - b.x; }); r.text = r.items.map(function (x) { return x.s; }).join(' '); });
      return rows;
    });
  },
  /* Rows from a text or CSV file, with no positions. */
  textRows: function (t) { return t.split(/\r?\n/).filter(function (l) { return l.trim(); }).map(function (l, i) { return { page: 1, y: -i, text: l, items: null }; }); },
  /*
   * Looks up the amount that belongs to a label: on the same row to its right,
   * or directly below it in the same column. Never a nearby number from another
   * column, which is how tax-withheld fields end up holding wages.
   */
  finder: function (rows) {
    function right(row, m) { return M.amounts(row.text.slice(m.index + m[0].length)); }
    function span(row, m) {
      var pos = 0, a = null, b = null, end = m.index + m[0].length;
      row.items.forEach(function (it) { var st = pos, fin = pos + it.s.length; pos = fin + 1; if (fin > m.index && st < end) { var cw = it.w / Math.max(1, it.s.length), x1 = it.x + Math.max(0, m.index - st) * cw, x2 = it.x + Math.min(it.s.length, end - st) * cw; a = a === null ? x1 : Math.min(a, x1); b = b === null ? x2 : Math.max(b, x2); } });
      return [a, b];
    }
    return {
      value: function (re) {
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i], m = row.text.match(re);
          if (!m) continue;
          var same = right(row, m);
          if (same.length) return same[0];
          if (!row.items) { var nx = rows[i + 1]; if (nx && M.amounts(nx.text).length === 1) return M.amounts(nx.text)[0]; continue; }
          var box = span(row, m), best = null;
          rows.forEach(function (r) {
            if (r.page !== row.page || r.y >= row.y || row.y - r.y > 46 || !r.items) return;
            r.items.forEach(function (it) {
              var a = M.amounts(it.s); if (!a.length) return;
              if (it.x + it.w < box[0] - 8 || it.x > box[1] + 8) return;
              var d = row.y - r.y; if (!best || d < best.d) best = { d: d, v: a[0] };
            });
          });
          if (best) return best.v;
        }
        return null;
      },
      /* The last amount on a label's row, such as the YTD column of a pay stub. */
      last: function (re) { for (var i = 0; i < rows.length; i++) { var m = rows[i].text.match(re); if (m) { var a = M.amounts(rows[i].text.slice(m.index + m[0].length)); if (a.length) return a[a.length - 1]; } } return null; },
      rows: rows,
    };
  },
};

export var PLANS = {
  essential: { name: 'Essential', price: '$99', who: 'For standard wage and interest income.', items: ['Tax Savings Plan', 'Annual CPA check-in', 'Multi-state income', 'W-2 and bank interest'] },
  premium: { name: 'Premium', price: '$399', who: 'For stocks, foreign income and complex situations.', items: ['Everything in Essential', 'Tax Savings Plan implementation', 'Semi-annual CPA check-ins', 'Stock, crypto and capital gains', 'Foreign income and tax credits'] },
  'private-client': { name: 'Private Client', price: '$999', who: 'For founders, investors and business owners who need proactive strategy.', items: ['Everything in Premium', 'Quarterly CPA strategy sessions', 'Entity structure optimization', 'Estate and trust planning', 'Dedicated account manager'] },
};

/* Sign-up link for a plan. The app saves these tags to the new profile (lesser repo, lib/attribution.ts). */
export function planLink(key, place) {
  return 'https://lesser.tax/app/auth/sign-up?utm_source=free_tool&utm_medium=web_app&utm_campaign=' + campaign + '&utm_content=' + place + '&utm_term=' + key;
}
export function planButton(key, place, cls) {
  var p = PLANS[key];
  return '<a class="' + (cls || '') + '" data-place="' + place + '" href="' + planLink(key, place) + '" target="_blank" rel="noopener">Get ' + p.name + ' for ' + p.price + '/yr</a>';
}

export var App = {
  mount: function (cfg) {
    var s = JSON.parse(JSON.stringify(cfg.defaults)), at = 0, reached = 0;
    var body = document.getElementById('flow'), side = document.getElementById('side'), mobile = document.getElementById('mobilebar');
    var stepper = document.getElementById('stepper');
    var total = cfg.steps.length + 1;
    function vis(f) { return !f.show || f.show(s); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }

    function drawStepper() {
      stepper.innerHTML = '';
      var names = cfg.steps.map(function (x) { return x.name; }).concat(['Your result']);
      names.forEach(function (n, i) {
        var b = el('button', i === at ? 'now' : i < reached || i < at ? 'done' : '', '<i>' + (i < at ? '&#10003;' : i + 1) + '</i>' + n);
        b.type = 'button'; b.disabled = i > reached;
        b.addEventListener('click', function () { go(i); });
        stepper.appendChild(b);
      });
    }

    function field(f, st, parent, after) {
      var set = function (v) { st[f.key] = v; preview(); if (f.redraw || after) (after || draw)(); };
      var w;
      if (f.type === 'tiles') {
        w = el('div', 'tiles');
        f.options.forEach(function (o) {
          var b = el('button', 'tile', '<b>' + o[1] + '</b>' + (o[2] ? '<span>' + o[2] + '</span>' : ''));
          b.type = 'button'; b.setAttribute('aria-pressed', f.multi ? st[f.key].indexOf(o[0]) >= 0 : st[f.key] === o[0]);
          b.addEventListener('click', function () {
            if (f.multi) { var i = st[f.key].indexOf(o[0]); if (i >= 0) st[f.key].splice(i, 1); else st[f.key].push(o[0]); preview(); draw(); }
            else { st[f.key] = o[0]; preview(); draw(); }
          });
          w.appendChild(b);
        });
        if (f.label) { var g = el('div', 'f', '<span class="lab">' + f.label + '</span>'); g.appendChild(w); g.style.gridColumn = '1 / -1'; return g; }
        w.style.gridColumn = '1 / -1';
        return w;
      }
      if (f.type === 'toggle') {
        w = el('button', 'toggle', f.label); w.type = 'button'; w.setAttribute('aria-pressed', !!st[f.key]);
        w.addEventListener('click', function () { st[f.key] = !st[f.key]; preview(); draw(); });
        w.style.gridColumn = '1 / -1';
        return w;
      }
      var id = 'f' + Math.random().toString(36).slice(2, 8);
      w = el('div', 'f', '<label for="' + id + '">' + f.label + '</label>');
      if (f.type === 'money' || f.type === 'num' || f.type === 'pct' || f.type === 'inr') {
        var box = el('div', 'box', f.type === 'money' ? '<span>$</span>' : f.type === 'inr' ? '<span>Rs</span>' : '');
        var i = el('input'); i.id = id; i.inputMode = 'decimal'; i.autocomplete = 'off';
        var fmt = function (v) { return v === '' || v === null || v === undefined || v === 0 && !f.keepZero ? '' : Number(v).toLocaleString('en-US'); };
        i.value = fmt(st[f.key]); i.placeholder = f.ph || '0';
        i.addEventListener('input', function () { var n = Number(i.value.replace(/[^0-9.]/g, '')) || 0; st[f.key] = n; preview(); });
        i.addEventListener('blur', function () { i.value = fmt(st[f.key]); });
        box.appendChild(i); w.appendChild(box);
      } else if (f.type === 'select') {
        var b2 = el('div', 'box'), sel = el('select'); sel.id = id;
        /* options can depend on other answers, such as the employers added so far. */
        (typeof f.options === 'function' ? f.options(s) : f.options).forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; sel.appendChild(op); });
        sel.value = st[f.key]; sel.addEventListener('change', function () { st[f.key] = sel.value; preview(); draw(); });
        b2.appendChild(sel); w.appendChild(b2);
      } else if (f.type === 'date') {
        var b3 = el('div', 'box'), d = el('input'); d.type = 'date'; d.id = id; d.value = st[f.key] || '';
        d.addEventListener('change', function () { st[f.key] = d.value; preview(); });
        b3.appendChild(d); w.appendChild(b3);
      } else if (f.type === 'count') {
        var c = el('div', 'count', '<button type="button" aria-label="Less">-</button><b>' + st[f.key] + '</b><button type="button" aria-label="More">+</button>');
        var bs = c.querySelectorAll('button');
        bs[0].addEventListener('click', function () { set(Math.max(0, st[f.key] - 1)); c.querySelector('b').textContent = st[f.key]; });
        bs[1].addEventListener('click', function () { set(st[f.key] + 1); c.querySelector('b').textContent = st[f.key]; });
        w.appendChild(c);
      }
      if (f.hint) w.appendChild(el('small', '', f.hint));
      return w;
    }

    function upload(u, parent) {
      var d = el('label', 'drop', '<strong>' + u.title + '</strong><span>' + u.hint + '</span>'), i = el('input'), out = el('div');
      i.type = 'file'; i.accept = '.pdf,.csv,.txt'; d.appendChild(i); parent.appendChild(d); parent.appendChild(out);
      function take(file) {
        if (!file) return;
        /* Clear the last file's "filled in" note, so a failed read never sits next to old results. */
        var old = document.getElementById('upnote'); if (old) old.innerHTML = '';
        out.innerHTML = '<div class="found">Reading ' + M.esc(file.name) + ' on this device...</div>';
        (/\.pdf$/i.test(file.name) ? M.readPdf(file) : file.text().then(M.textRows)).then(function (rows) {
          var f = u.parse(rows.map(function (r) { return r.text; }).join('\n'), s, M.finder(rows));
          if (!f || !f.length) { out.innerHTML = '<div class="found bad">We could not find those details in this file. It may be a scan. You can enter them below.</div>'; return; }
          draw();
          var note = document.getElementById('upnote');
          if (note) note.innerHTML = '<div class="found">Filled in from your file. Please check each one:<ul>' + f.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
          preview();
        }).catch(function () { out.innerHTML = '<div class="found bad">We could not read this file. You can enter the details below.</div>'; });
      }
      i.addEventListener('change', function () { take(i.files[0]); i.value = ''; });
      ['dragover', 'dragenter'].forEach(function (t) { d.addEventListener(t, function (e) { e.preventDefault(); d.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (t) { d.addEventListener(t, function (e) { e.preventDefault(); d.classList.remove('over'); }); });
      d.addEventListener('drop', function (e) { take(e.dataTransfer.files[0]); });
    }

    function draw() {
      drawStepper();
      body.innerHTML = '';
      if (at === cfg.steps.length) return drawResult();
      var st = cfg.steps[at];
      body.appendChild(el('h2', 'step-title', st.title));
      body.appendChild(el('p', 'step-sub', st.sub));
      st.blocks.forEach(function (b) {
        if (!vis(b)) return;
        var sec = el('section', 'block', (b.title ? '<h3>' + b.title + '</h3>' : '') + (b.sub ? '<p class="bsub">' + b.sub + '</p>' : ''));
        if (b.upload) { upload(b.upload, sec); var n = el('div'); n.id = 'upnote'; sec.appendChild(n); }
        if (b.rows) {
          var list = el('div'); list.style.display = 'grid'; list.style.gap = '11px';
          s[b.rows].forEach(function (row, i) {
            var card = el('div', 'rowcard', '<div class="rowhead"><span>' + b.item + ' ' + (i + 1) + '</span></div>');
            if (s[b.rows].length > (b.min || 0)) {
              var rm = el('button', 'rm', 'Remove'); rm.type = 'button';
              rm.addEventListener('click', function () { s[b.rows].splice(i, 1); preview(); draw(); });
              card.querySelector('.rowhead').appendChild(rm);
            }
            var fs = el('div', 'fields');
            b.fields.forEach(function (f) { if (!f.show || f.show(row, s)) fs.appendChild(field(f, row, fs, f.type === 'select' || f.redraw ? draw : null)); });
            card.appendChild(fs); list.appendChild(card);
          });
          sec.appendChild(list);
          if (s[b.rows].length < (b.max || 20)) {
            var add = el('button', 'add', b.add); add.type = 'button';
            add.addEventListener('click', function () { s[b.rows].push(JSON.parse(JSON.stringify(b.blank))); preview(); draw(); });
            sec.appendChild(add);
          }
        } else if (b.fields) {
          var fs2 = el('div', 'fields');
          b.fields.forEach(function (f) { if (vis(f)) fs2.appendChild(field(f, s, fs2)); });
          sec.appendChild(fs2);
        }
        body.appendChild(sec);
      });
      var nav = el('div', 'nav');
      var msg = st.ready ? st.ready(s) : '';
      nav.appendChild(el('span', 'why', msg || ''));
      if (at > 0) { var bk = el('button', 'btn ghost', 'Back'); bk.type = 'button'; bk.addEventListener('click', function () { go(at - 1); }); nav.appendChild(bk); }
      var next = el('button', 'btn', at === cfg.steps.length - 1 ? cfg.cta : 'Continue'); next.type = 'button'; next.disabled = !!msg;
      next.addEventListener('click', function () { go(at + 1); });
      nav.appendChild(next); body.appendChild(nav);
    }

    function drawResult() {
      var r = cfg.result(s), wrap = el('div', 'result'), key = cfg.plan(s);
      var head = el('div', '', '<div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap"><h2 class="step-title">' + r.title + '</h2><button type="button" class="rm" style="color:var(--green)" id="edit">Edit answers</button></div><p class="step-sub" style="margin-bottom:0">' + r.sub + '</p>');
      wrap.appendChild(head);
      wrap.appendChild(el('div', 'heroNum' + (r.warn ? ' warn' : ''), '<div class="lab">' + r.eyebrow + '</div><strong>' + r.value + '</strong><p>' + r.note + '</p>'));
      if (r.split) {
        var sum = r.split.parts.reduce(function (a, p) { return a + Math.max(0, p[1]); }, 0) || 1;
        wrap.appendChild(el('div', 'box2', '<h3>' + r.split.title + '</h3><div class="split">' + r.split.parts.map(function (p) { return '<i style="width:' + (Math.max(0, p[1]) / sum) * 100 + '%;background:' + p[2] + '"></i>'; }).join('') + '</div><div class="legend">' + r.split.parts.map(function (p) { return '<span><u style="background:' + p[2] + '"></u>' + p[0] + ' <b>' + M.money(p[1]) + '</b></span>'; }).join('') + '</div>'));
      }
      if (r.custom) { var cu = el('div'); cu.style.display = 'grid'; cu.style.gap = '12px'; r.custom(cu); wrap.appendChild(cu); }
      if (r.cards) { var t = el('div', 'two'); r.cards.forEach(function (c) { t.appendChild(el('div', 'box2', '<h3>' + c[0] + '</h3>' + c[1])); }); wrap.appendChild(t); }
      if (r.why && r.why.length) wrap.appendChild(el('div', 'box2', '<h3>' + (r.whyTitle || 'Why your result looks like this') + '</h3><ul class="why">' + r.why.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>'));
      var pl = r.plan;
      if (pl) {
        var ps = el('div', 'box2', '<h3>' + pl.title + '</h3>' + (pl.sub ? '<p class="fine">' + pl.sub + '</p>' : ''));
        if (pl.total) ps.appendChild(el('div', 'save', '<span>You could save up to</span><strong>' + pl.total + '</strong><p>' + pl.totalNote + '</p>'));
        pl.items.slice(0, 3).forEach(function (it, i) { ps.appendChild(el('div', 'num', '<i>' + (i + 1) + '</i><div><b>' + it[0] + '</b><span>' + it[1] + '</span></div>')); });
        if (pl.items.length > 3) ps.appendChild(el('div', 'more', '+ ' + (pl.items.length - 3) + ' more in your free report'));
        wrap.appendChild(ps);
      }
      var pc = PLANS[key];
      wrap.appendChild(el('div', 'planrow', '<div><span class="mini">Recommended for you</span><h3>' + pc.name + ' &middot; ' + pc.price + ' a year</h3><p class="fine">' + (cfg.planWhy ? cfg.planWhy(s) : pc.who) + '</p></div>' + planButton(key, 'result', 'btn plan')));
      var gate = el('div', 'gate', '<div class="l"><span class="mini">Free report</span><h3>' + cfg.report.title + '</h3><ul class="incl">' + cfg.report.items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>');
      var form = el('form', '', '<label for="fn">First name</label><input id="fn" required autocomplete="given-name"><label for="em">Email</label><input id="em" type="email" required autocomplete="email" placeholder="you@email.com"><button class="send" type="submit">Email me my free report</button><small>You will also get our short weekly tax note. Unsubscribe any time. A Lesser Tax CPA will only contact you if you ask.</small>');
      gate.appendChild(form); wrap.appendChild(gate);
      var rep = el('div', 'report'); rep.hidden = true; wrap.appendChild(rep);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        rep.innerHTML = '<p class="fine" style="margin-bottom:12px"><strong>Review version:</strong> the reader sees "Check your inbox" and receives this by email, with the matching PDF. Nothing was sent.</p>' + r.full();
        rep.hidden = false; gate.hidden = true; rep.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      if (r.complex) wrap.appendChild(el('div', 'box2', '<h3>' + r.complex[0] + '</h3><p class="fine">' + r.complex[1] + '</p>' + planButton(key, 'result_complex', 'more')));
      wrap.appendChild(el('p', 'fine', r.fine));
      body.appendChild(wrap);
      document.getElementById('edit').addEventListener('click', function () { go(cfg.steps.length - 1); });
    }

    function planCard() {
      var key = cfg.plan(s), p = PLANS[key], hero = document.getElementById('pathcta');
      document.getElementById('plancard').innerHTML = '<span class="mini" style="color:#a9d6c6">Recommended for you</span><h2>' + p.name + ' &middot; ' + p.price + ' a year</h2><p>' + (cfg.planWhy ? cfg.planWhy(s) : p.who) + '</p><ul class="incl light">' + p.items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' + planButton(key, 'sidebar');
      if (hero) { hero.href = planLink(key, 'hero'); hero.textContent = 'Get ' + p.name + ' for ' + p.price + '/yr'; }
    }

    function preview() {
      if (cfg.onChange) cfg.onChange(s);
      planCard();
      var p = cfg.preview(s), card = document.getElementById('livecard');
      card.innerHTML = '<span class="mini">Live preview</span>' + (p ? '<h2>' + p.label + '</h2><div class="big' + (p.warn ? ' warn' : '') + '">' + p.value + '</div>' + (p.rows ? M.lines(p.rows) : '') + (p.html || '') : '<h2>Your number appears here</h2><p class="fine" style="margin-top:6px">' + cfg.waiting + '</p>');
      mobile.innerHTML = p ? '<span>' + p.label + '</span>' + p.value : '';
      mobile.hidden = !p;
      if (at < cfg.steps.length) {
        var st = cfg.steps[at], msg = st.ready ? st.ready(s) : '', btn = body.querySelector('.nav .btn:last-child'), why = body.querySelector('.nav .why');
        if (btn) btn.disabled = !!msg;
        if (why) why.textContent = msg || '';
      }
    }

    function go(i) {
      at = i; reached = Math.max(reached, i);
      draw(); preview();
      document.getElementById('flowcard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    side.innerHTML = '<div class="card" id="livecard"></div><div class="card"><span class="mini">What is included</span><h2>' + cfg.included.title + '</h2><ul class="incl">' + cfg.included.items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div><div class="card cpa" id="plancard"></div>';
    draw(); preview();
    App.state = s; App.go = go;
  },
};
