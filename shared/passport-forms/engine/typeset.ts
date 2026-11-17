// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/typeset.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/* eslint-disable */
// Verbatim port of the approved prototype; kept untyped on purpose (see packet.ts for the typed surface).
// @ts-nocheck

// pdf-lib (a few hundred KB) loads on the first PDF built, not with the page:
// previews and the blog widgets never need it until someone downloads.
let P;
async function pdfLib() { return P || (P = await import("pdf-lib")); }

/* Typesets the government specimen formats (Annexure C, D, F, J, name change, government form answer sheet)
 from one block model, to both an A4 PDF (pdf-lib) and an HTML preview. Shared by the site and the tests. */
/* Block model:
   {t:'title', text}            centered bold
   {t:'sub', text}              centered small caps line
   {t:'p', runs:[...], indent}  paragraph; runs: 'text' | {v:'value', ph:'placeholder'} | {s:'struck text'} | {b:'bold'}
   {t:'li', n:'1.', runs}       numbered paragraph
   {t:'opt', n:'(a)', runs, off} option that gets crossed out when off
   {t:'grid', rows:[[label, value, label, value], ...]}   two-person table (Annexure C/D)
   {t:'table', head:[...], rows:[[...]]}
   {t:'sign', left:[lines], right:[lines]}  signature block
   {t:'box', label, h}          photo / stamp box
   {t:'note', text}             small print
   {t:'gap', h}
*/
function asRuns(runs) { return (runs || []).map(function (r) { return typeof r === 'string' ? { k: 't', x: r } : r.v !== undefined ? { k: 'v', x: r.v || '', ph: r.ph || '' } : r.s !== undefined ? { k: 's', x: r.s } : { k: 'b', x: r.b }; }); }

/* ---------- HTML preview ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function runsHTML(runs) {
  return asRuns(runs).map(function (r) {
    if (r.k === 'v') return r.x ? '<span class="v">' + esc(r.x) + '</span>' : '<span class="v miss">' + esc(r.ph || '……') + '</span>';
    if (r.k === 's') return '<s>' + esc(r.x) + '</s>';
    if (r.k === 'b') return '<b>' + esc(r.x) + '</b>';
    return esc(r.x);
  }).join('');
}
export function html(blocks) {
  return blocks.map(function (b) {
    if (b.t === 'title') return '<p class="ph">' + esc(b.text) + '</p>';
    if (b.t === 'sub') return '<p class="ts-sub">' + esc(b.text) + '</p>';
    if (b.t === 'p') return '<p class="ts-p"' + (b.indent ? ' style="padding-left:18px"' : '') + '>' + runsHTML(b.runs) + '</p>';
    if (b.t === 'li') return '<p class="ts-li"><span class="n">' + esc(b.n) + '</span><span>' + runsHTML(b.runs) + '</span></p>';
    if (b.t === 'opt') return '<p class="ts-li' + (b.off ? ' off' : '') + '"><span class="n">' + esc(b.n) + '</span><span>' + (b.off ? '<s>' + esc(asRuns(b.runs).map(function (r) { return r.x; }).join('')) + '</s>' : runsHTML(b.runs)) + '</span></p>';
    if (b.t === 'grid') return '<table class="ts-grid">' + b.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + runsHTML([{ v: r[1], ph: '' }]) + '</td>' + (r.length > 2 ? '<td>' + esc(r[2]) + '</td><td>' + runsHTML([{ v: r[3], ph: '' }]) + '</td>' : '') + '</tr>'; }).join('') + '</table>';
    if (b.t === 'table') return '<table class="ts-grid"><tr>' + b.head.map(function (h) { return '<td><b>' + esc(h) + '</b></td>'; }).join('') + '</tr>' + b.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + runsHTML([{ v: c, ph: '' }]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    if (b.t === 'sign') return '<div class="ts-sign"><div>' + b.left.map(function (l) { return '<p>' + runsHTML(l) + '</p>'; }).join('') + '</div><div>' + (b.right || []).map(function (l) { return '<p>' + runsHTML(l) + '</p>'; }).join('') + '</div></div>';
    if (b.t === 'box') return '<div class="ts-box" style="height:' + (b.h || 90) + 'px">' + esc(b.label) + '</div>';
    if (b.t === 'note') return '<p class="ts-note">' + esc(b.text) + '</p>';
    if (b.t === 'gap') return '<div style="height:' + (b.h || 8) + 'px"></div>';
    return '';
  }).join('');
}

/* ---------- PDF ---------- */
export async function pdf(blocks, opts) {
  await pdfLib();
  opts = opts || {};
  var doc = await P.PDFDocument.create();
  doc.setTitle(opts.title || 'Form'); doc.setCreator('lesser.tax free passport forms'); doc.setProducer('lesser.tax');
  var F = { r: await doc.embedFont(P.StandardFonts.TimesRoman), b: await doc.embedFont(P.StandardFonts.TimesRomanBold), i: await doc.embedFont(P.StandardFonts.TimesRomanItalic) };
  var W = 595.28, H = 841.89, M = 56, LW = W - 2 * M, ink = P.rgb(0, 0, 0), fillInk = P.rgb(0.04, 0.16, 0.45);
  var page = doc.addPage([W, H]), y = H - M;
  function need(h) { if (y - h < M + 20) { page = doc.addPage([W, H]); y = H - M; } }
  function center(text, size, font) {
    var words = text.split(' '), lines = [''];
    words.forEach(function (w) { var t = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w; if (font.widthOfTextAtSize(t, size) > LW && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t; });
    lines.forEach(function (ln) { need(size + 6); var w = font.widthOfTextAtSize(ln, size); page.drawText(ln, { x: (W - w) / 2, y: y - size, size: size, font: font, color: ink }); y -= size + 4; });
    y -= 2;
  }
  /* flow mixed runs inside [x0, x0+width] */
  function flow(runs, x0, width, size, lead, allStruck) {
    var words = [];
    asRuns(runs).forEach(function (r) {
      var txt = r.k === 'v' ? (r.x || (r.ph ? '' : '')) : r.x;
      if (r.k === 'v' && !r.x) { words.push({ w: '……………………', k: 'ph' }); return; }
      txt.split(/(\s+)/).forEach(function (p) { if (p === '') return; words.push({ w: p, k: allStruck ? 's' : r.k }); });
    });
    var lines = [[]], lw = 0;
    words.forEach(function (wd) {
      var f = wd.k === 'v' || wd.k === 'b' ? F.b : F.r;
      var ww = f.widthOfTextAtSize(wd.w, size);
      if (/^\s+$/.test(wd.w)) { if (lines[lines.length - 1].length) { lines[lines.length - 1].push({ w: ' ', k: wd.k, ww: F.r.widthOfTextAtSize(' ', size) }); lw += F.r.widthOfTextAtSize(' ', size); } return; }
      if (lw + ww > width && lines[lines.length - 1].length) { var L = lines[lines.length - 1]; while (L.length && L[L.length - 1].w === ' ') L.pop(); lines.push([]); lw = 0; }
      lines[lines.length - 1].push({ w: wd.w, k: wd.k, ww: ww }); lw += ww;
    });
    lines.forEach(function (L) {
      need(lead); var x = x0, base = y - size;
      L.forEach(function (wd) {
        var f = wd.k === 'v' || wd.k === 'b' ? F.b : F.r;
        if (wd.w !== ' ') page.drawText(wd.w, { x: x, y: base, size: size, font: f, color: wd.k === 'v' ? fillInk : ink });
        if (wd.k === 'v' && wd.w !== ' ') page.drawLine({ start: { x: x, y: base - 1.6 }, end: { x: x + wd.ww, y: base - 1.6 }, thickness: 0.5, color: fillInk });
        if (wd.k === 's') page.drawLine({ start: { x: x, y: base + size * 0.32 }, end: { x: x + wd.ww, y: base + size * 0.32 }, thickness: 0.9, color: ink });
        x += wd.ww;
      });
      y -= lead;
    });
  }
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (b.t === 'title') { center(b.text, 12.5, F.b); }
    else if (b.t === 'sub') { center(b.text, 10.5, F.b); }
    else if (b.t === 'p') { flow(b.runs, M + (b.indent ? 18 : 0), LW - (b.indent ? 18 : 0), 11, 15.5); y -= 5; }
    else if (b.t === 'li' || b.t === 'opt') {
      need(16); page.drawText(b.n, { x: M + 4, y: y - 11, size: 11, font: F.r, color: ink });
      flow(b.runs, M + 30, LW - 30, 11, 15.5, b.t === 'opt' && b.off); y -= 5;
    }
    else if (b.t === 'grid') {
      b.rows.forEach(function (r) {
        need(17); var cw = LW / 2;
        [[r[0], r[1], M], [r[2], r[3], M + cw]].forEach(function (c) {
          if (c[0] === undefined) return;
          page.drawText(c[0], { x: c[2], y: y - 11, size: 10.5, font: F.r, color: ink });
          var lx = c[2] + F.r.widthOfTextAtSize(c[0], 10.5) + 4, val = c[1] || '';
          var sz = 10.5; while (sz > 7 && F.b.widthOfTextAtSize(val, sz) > cw - (lx - c[2]) - 10) sz -= 0.5;
          page.drawLine({ start: { x: lx, y: y - 13 }, end: { x: c[2] + cw - 10, y: y - 13 }, thickness: 0.4, color: P.rgb(0.55, 0.55, 0.55), dashArray: [1, 1.5] });
          if (val) page.drawText(val, { x: lx + 1, y: y - 11, size: sz, font: F.b, color: fillInk });
        });
        y -= 17;
      });
      y -= 4;
    }
    else if (b.t === 'table') {
      var cols = b.head.length, wf = b.widths || b.head.map(function () { return 1 / cols; }), rowH = 18;
      need(rowH * (b.rows.length + 1));
      [b.head].concat(b.rows).forEach(function (r, ri) {
        var cx = M;
        r.forEach(function (c, ci) {
          var cw2 = LW * wf[ci];
          page.drawRectangle({ x: cx, y: y - rowH, width: cw2, height: rowH, borderColor: ink, borderWidth: 0.5 });
          var lab = b.labelCol && ci === 0 && ri > 0, f = lab ? F.r : F.b, sz = 9.5, txt = String(c || '');
          while (sz > 6 && f.widthOfTextAtSize(txt, sz) > cw2 - 6) sz -= 0.5;
          page.drawText(txt, { x: cx + 3, y: y - rowH + 5.5, size: sz, font: f, color: ri === 0 || lab ? ink : fillInk });
          cx += cw2;
        });
        y -= rowH;
      });
      y -= 8;
    }
    else if (b.t === 'sign') {
      var hh = Math.max(b.left.length, (b.right || []).length) * 15 + 30; need(hh); y -= 26;
      var y0 = y, low = y;
      [[b.left, M], [b.right || [], M + LW / 2 + 10]].forEach(function (col) {
        y = y0; col[0].forEach(function (l) { flow(l, col[1], LW / 2 - 14, 10.5, 15); }); low = Math.min(low, y);
      });
      y = low - 8;
    }
    else if (b.t === 'box') { var bh = b.h || 110; need(bh + 10); page.drawRectangle({ x: M + (b.x || 0), y: y - bh, width: b.w || 150, height: bh, borderColor: ink, borderWidth: 0.7 }); var lt = b.label; var lwid = F.i.widthOfTextAtSize(lt, 9); page.drawText(lt, { x: M + (b.x || 0) + ((b.w || 150) - lwid) / 2, y: y - bh / 2, size: 9, font: F.i, color: P.rgb(0.4, 0.4, 0.4) }); if (!b.inline) y -= bh + 10; }
    else if (b.t === 'note') { flow([b.text], M, LW, 9, 12); y -= 3; }
    else if (b.t === 'gap') { y -= b.h || 8; }
  }
  /* footer on every page */
  doc.getPages().forEach(function (pg, k, all) {
    pg.drawText('Prepared with lesser.tax from the official specimen format. Print on A4, one side only. Page ' + (k + 1) + ' of ' + all.length, { x: M, y: 24, size: 7.5, font: F.i, color: P.rgb(0.45, 0.45, 0.45) });
  });
  return doc.save();
}
