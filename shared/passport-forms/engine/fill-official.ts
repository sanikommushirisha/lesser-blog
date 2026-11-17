// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/fill-official.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/* eslint-disable */
// Verbatim port of the approved prototype; kept untyped on purpose (see packet.ts for the typed surface).
// @ts-nocheck

// pdf-lib (a few hundred KB) loads on the first PDF built, not with the page:
// previews and the blog widgets never need it until someone downloads.
let P;
async function pdfLib() { return P || (P = await import("pdf-lib")); }

function up(s) { return (s || '').toString().toUpperCase(); }
export function fmtDate(iso) { if (!iso) return ''; var p = iso.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }
function fitSize(font, text, maxW, start, min) { var s = start; while (s > (min || 6) && font.widthOfTextAtSize(text, s) > maxW) s -= 0.5; return s; }
function setText(form, name, value, size) {
  var f = form.getTextField(name);
  f.setText(value || '');
  if (size) f.setFontSize(size);
}

/* 1. VFS adult re-issue checklist: header on all 8 pages (no form fields, so we draw on the page). */
export async function fillChecklist(bytes, d) {
  await pdfLib();
  var doc = await P.PDFDocument.load(bytes);
  var font = await doc.embedFont(P.StandardFonts.Helvetica);
  var black = P.rgb(0.05, 0.05, 0.05);
  var name = up(d.fullName), pno = up(d.passportNo), email = d.email || '', mob = d.mobile || '';
  doc.getPages().forEach(function (pg, i) {
    var dy = i === 4 ? 13.8 : 0;
    var yName = 792 - 68.3 + dy, yMail = 792 - 86.9 + dy;
    if (name) pg.drawText(name, { x: 116, y: yName, size: fitSize(font, name, 186, 9.5), font: font, color: black });
    if (pno) pg.drawText(pno, { x: 479, y: yName, size: 9.5, font: font, color: black });
    if (email) pg.drawText(email, { x: 116, y: yMail, size: fitSize(font, email, 186, 9.5), font: font, color: black });
    if (mob) {
      pg.drawRectangle({ x: 475, y: yMail - 2.5, width: 92, height: 12, color: P.rgb(1, 1, 1) });
      pg.drawText(mob, { x: 479, y: yMail, size: 9.5, font: font, color: black });
    }
  });
  return doc.save();
}

/* 2. Annexure E: fill fields, write the "resident since" date, strike the options that don't apply. */
export async function fillAnnexureE(bytes, d) {
  await pdfLib();
  var doc = await P.PDFDocument.load(bytes);
  var form = doc.getForm(); var page = doc.getPages()[0];
  var font = await doc.embedFont(P.StandardFonts.Helvetica);
  var rel = d.relation || (d.gender === 'F' ? (d.married ? 'Wife of' : 'Daughter of') : 'Son of');
  var relName = rel === 'Wife of' ? up(d.spouseName) : up(d.fatherName);
  setText(form, 'Text18', up(d.fullName), 10);
  form.getDropdown('Dropdown19').select(rel);
  setText(form, 'Text20', relName, 10);
  setText(form, 'Text21', up(d.street), 9);
  setText(form, 'Text22', up(d.apt), 9);
  setText(form, 'Text23', up(d.city), 9);
  if (d.state) form.getDropdown('Dropdown24').select(d.state);
  setText(form, 'Date25_af_date', fmtDate(d.dob), 7);
  setText(form, 'Text15', up(d.fatherName), 10);
  setText(form, 'Text16', up(d.motherName), 10);
  setText(form, 'Text17', d.married && d.spouseName ? up(d.spouseName) : 'N/A', 10);
  setText(form, 'Text3', up(d.place), 10);
  setText(form, 'Date4_af_date', fmtDate(d.signDate), 10);
  if (d.since) page.drawText(up(d.since), { x: 408, y: 792 - 282.4, size: 10, font: font, color: P.rgb(0, 0, 0) });
  var ink = P.rgb(0, 0, 0);
  function strike(x1, x2, yTop) { var y = 792 - yTop - 5.3; page.drawLine({ start: { x: x1, y: y }, end: { x: x2, y: y }, thickness: 1.1, color: ink }); }
  /* Point 3: "birth/descent/registration/naturalization", one word from x 224.4 to 413.2 */
  var opts = ['birth', 'descent', 'registration', 'naturalization'];
  var full = opts.join('/'); var x0 = 224.4, total = 413.2 - 224.4;
  var sz = 10; var w = font.widthOfTextAtSize(full, sz); var k = total / w;
  var x = x0;
  opts.forEach(function (o, i) {
    var ow = font.widthOfTextAtSize(o, sz) * k;
    if (o !== (d.citizenship || 'birth')) strike(x, x + ow, 315.0);
    x += ow + (i < 3 ? font.widthOfTextAtSize('/', sz) * k : 0);
  });
  /* Point 7: option 1 = line 1 x 96.5–567.5; option 2 = line 1 "I" 570.5–576, line 2 71–576, line 3 71–349.5 */
  if (d.repatriated === 'yes') strike(96.5, 567.5, 511.5);
  else { strike(570.4, 576.2, 511.5); strike(71.2, 576.2, 525.6); strike(71.2, 349.5, 539.6); }
  form.flatten();
  return doc.save();
}

/* 3. Affidavit for change in appearance and signature */
export async function fillAffidavit(bytes, d) {
  await pdfLib();
  var doc = await P.PDFDocument.load(bytes);
  var form = doc.getForm();
  setText(form, 'text_2kmlj', up(d.fullName), 9);
  setText(form, 'text_2ulls', up(d.fatherName), 9);
  var addr = [d.street, d.apt, d.city, d.state, d.zip].filter(Boolean).join(', ');
  setText(form, 'text_4utbf', up(addr), 9);
  setText(form, 'text_5ybfw', up(d.passportNo), 9);
  setText(form, 'text_6jcrz', fmtDate(d.issueDate), 9);
  setText(form, 'text_7ttui', up(d.issuePlace), 9);
  form.getDropdown('dropdown_1oevf').select(d.appearanceChanged ? 'has' : 'has not');
  form.getDropdown('dropdown_8sqbn').select(d.signatureChanged ? 'has' : 'has not');
  setText(form, 'text_1jcbr', fmtDate(d.signDate), 9);
  setText(form, 'text_2dcrb', up(d.place), 9);
  form.flatten();
  return doc.save();
}

/* Merge several filled PDFs into one, in packet order */
export async function merge(list) {
  await pdfLib();
  var out = await P.PDFDocument.create();
  for (var i = 0; i < list.length; i++) {
    var src = await P.PDFDocument.load(list[i]);
    var pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(function (p) { out.addPage(p); });
  }
  return out.save();
}

