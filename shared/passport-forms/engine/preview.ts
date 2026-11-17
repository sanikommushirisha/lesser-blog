// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport-forms/preview.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
// HTML previews of the forms shown beside the details step. Every value goes
// through esc(), so what a user types can never become markup.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { FORMS as FORMS_UNTYPED } from "./forms";
import * as Typeset from "./typeset";
import { fmtDate } from "./fill-official";
import { dataFor, type Details, type Packet, type Situation } from "./packet";
import { CHECKLIST_EDITIONS } from "./rules/checklist-editions";

const FORMS: any = FORMS_UNTYPED;

function esc(s: unknown): string {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function V(v: string | undefined, ph: string): string {
  return v ? `<span class="v">${esc(v)}</span>` : `<span class="v miss">${esc(ph)}</span>`;
}

const U = (x: unknown) => (x || "").toString().toUpperCase();

function officialPreview(id: string, d: Record<string, any>, p: Packet): string {
  if (id === "annexe") {
    const opts = ["birth", "descent", "registration", "naturalization"]
      .map((o) => (o === d.citizenship ? `<b>${o}</b>` : `<s>${o}</s>`))
      .join("/");
    const a7 = "I have never been repatriated from abroad back to India at the expense of Government of India";
    const b7 = "I was repatriated from abroad back to India at the expense of Government of India, but reimbursed expenditure incurred in connection with such repatriation";
    const rn = d.relation === "Wife of" ? d.spouseName : d.fatherName;
    return (
      `<p class="ph">ANNEXURE ‘E’<br>DECLARATION OF THE APPLICANT ON A PLAIN PAPER</p>` +
      `<p class="ts-p">I, ${V(U(d.fullName), "name")} ${esc(d.relation)} ${V(U(rn), "name")} residing at ${V(U([d.street, d.apt, d.city, d.state].filter(Boolean).join(", ")), "US address")}, DOB ${V(fmtDate(d.dob), "DD/MM/YYYY")} being an applicant for issue of passport, do hereby solemnly affirm and state the following:</p>` +
      `<p class="ts-li"><span class="n">1.</span><span>That the names of my parents and spouse are as follows: (i) Father: ${V(U(d.fatherName), "father")} (ii) Mother: ${V(U(d.motherName), "mother")} (iii) Wife/Husband: ${V(d.married ? U(d.spouseName) : "N/A", "spouse")}</span></p>` +
      `<p class="ts-li"><span class="n">2.</span><span>That I am a continuous resident at the above mentioned address from ${V(U(d.since), "month year")}</span></p>` +
      `<p class="ts-li"><span class="n">3.</span><span>That I am a citizen of India by ${opts} and that I have neither acquired the citizenship of another country nor have surrendered or been terminated/ deprived of my citizenship of India.</span></p>` +
      `<p class="ts-li muted"><span class="n">4–6.</span><span>No conviction, pending criminal proceedings, warrant or summons in India.</span></p>` +
      `<p class="ts-li"><span class="n">7.</span><span>That ${d.repatriated === "yes" ? `<s>${a7}</s>/<b>${b7}</b>` : `<b>${a7}</b>/<s>${b7}</s>`}.</span></p>` +
      `<p class="ts-li muted"><span class="n">8–10.</span><span>Standard statements.</span></p>` +
      `<p class="ts-p">Place: ${V(U(d.place), "city")} &nbsp; Date: ${V(fmtDate(d.signDate), "date")} &nbsp; (Signature of applicant)</p>`
    );
  }
  if (id === "affidavit") {
    return (
      `<p class="ph">AFFIDAVIT FOR CHANGE IN APPEARANCE AND SIGNATURE</p>` +
      `<p class="ts-p">I, ${V(U(d.fullName), "name")} Son/Daughter of ${V(U(d.fatherName), "father")}, resident of ${V(U([d.street, d.apt, d.city, d.state, d.zip].filter(Boolean).join(", ")), "US address")}, and holder of passport No. ${V(d.passportNo, "passport no.")} issued on ${V(fmtDate(d.issueDate), "date")} at ${V(U(d.issuePlace), "place")} hereby affirm and declare as under: -</p>` +
      `<p class="ts-li"><span class="n">1.</span><span>That my appearance <b>${d.appearanceChanged ? "has" : "has not"}</b> changed.</span></p>` +
      `<p class="ts-li"><span class="n">2.</span><span>That my signature <b>${d.signatureChanged ? "has" : "has not"}</b> changed.</span></p>` +
      `<div class="ts-sign"><div class="ts-box" style="height:80px">Please affix photo below</div><div><p>Dependent/Applicant signature</p><p>Date: ${V(fmtDate(d.signDate), "date")}</p><p>Place: ${V(U(d.place), "city")}</p></div></div>`
    );
  }
  // checklist: the VFS edition for this case (Nov 2026), header filled on every page
  const ed = CHECKLIST_EDITIONS[p.edition];
  return (
    `<p class="ph">${esc(ed.label.toUpperCase())}</p>` +
    `<table class="ts-grid"><tr><td>Applicant’s Name</td><td>${V(U(d.fullName), "name")}</td><td>Passport no.</td><td>${V(d.passportNo, "no.")}</td></tr>` +
    `<tr><td>Email ID</td><td>${V(d.email, "email")}</td><td>Mobile no.</td><td>${V(d.mobile, "___-___-____")}</td></tr></table>` +
    `<p class="ts-note">${esc(`Filled on every page of the official VFS checklist dated ${ed.dated}. Sign on page ${ed.signPage}.`)}</p>`
  );
}

/** HTML for one form's live preview (not the government form, which is rendered as an answer sheet). */
export function previewHtml(id: string, s: Situation, details: Details, packet: Packet): string {
  const d = dataFor(id, s, details);
  const official = FORMS.BY[id].kind === "official";
  const body = official ? officialPreview(id, d, packet) : Typeset.html(FORMS.blocks(id, d));
  return `<div class="paper ${official ? "" : "typeset"}">${body}</div>`;
}

/** The government online form as an answer sheet: sections of [label, answer]. */
export function govSections(s: Situation, details: Details): { h: string; rows: [string, string][] }[] {
  return FORMS.gov(dataFor("govform", s, details));
}
