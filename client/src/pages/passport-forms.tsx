// /tools/indian-passport-forms: the free Indian passport forms hub (LD-78),
// targeting "Indian passport renewal forms USA". The packet builder does the
// work; every form also has its own page. No login, nothing stored.

import { useEffect, useState } from "react";
import { FORMS_LIST, HUB_CONTENT, PacketBuilder, formPath } from "@shared/passport-forms/ui";
import { FaqSection, FormsPageFrame } from "@/components/passport-forms-layout";

const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Every application", ids: ["govform", "checklist", "annexe", "affidavit"] },
  { title: "Your situation", ids: ["namechange", "annexj", "annexf"] },
  { title: "Minors", ids: ["annexd", "annexc"] },
];

// Card look shared with the blog's post cards: white, green-tinted 1px border, 16px radius, soft shadow.
const CARD = "rounded-2xl border border-[#e0e8e5] bg-white shadow-[0_1px_3px_0_rgb(2_6_23/0.04),0_1px_2px_-1px_rgb(2_6_23/0.06)]";
const CARD_HOVER = "transition-shadow duration-300 hover:shadow-[0_10px_30px_-12px_rgb(2_6_23/0.12)]";
const H2 = "text-3xl font-extrabold tracking-[-0.03em] text-foreground md:text-[2rem]";
const LEAD = "mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground";
const CHIP = "rounded-xl bg-[#eef3f1] px-2.5 py-1 text-xs font-semibold leading-snug text-primary";
const CHIP_WARN = "rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-semibold leading-snug text-amber-800";

export default function PassportFormsHubPage() {
  // A blog post's inline card names itself (?from=<slug>) so analytics credit it.
  const [source, setSource] = useState("hub");
  useEffect(() => {
    window.scrollTo(0, 0);
    const from = new URLSearchParams(window.location.search).get("from");
    if (from && /^[a-z0-9-]{3,120}$/.test(from)) setSource(from);
  }, []);

  return (
    <FormsPageFrame sourcePage="/tools/indian-passport-forms">
      <section className="mx-auto max-w-6xl px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Free tool · VFS USA</p>
        <h1 className="hero-fade-up mb-5 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground md:text-5xl">{HUB_CONTENT.h1}</h1>
        <p className="mb-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          An Indian passport renewal from the USA needs the government online form, the VFS checklist, Annexure E and the appearance affidavit.
          A lost passport, a name change, a new spouse or a child adds Annexure F, the name change affidavit, Annexure J or Annexures D and C.
          Pick your situation below and download each form, filled, for free.
        </p>
        <ul className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {["9 forms, including Annexure C, D, E, F and J", "Nothing stored, it runs in your browser", "Checked against the VFS USA checklists, Nov 2026"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="font-extrabold text-primary">✓</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mb-10 text-sm text-muted-foreground">
          Forms, documents and fees checked against the VFS USA checklists of 1 and 3 November 2026. Nothing you type leaves your browser.
          Prefer help? <a href="/marketplace" className="font-semibold text-primary hover:underline">Let Lesser Tax handle your passport renewal</a>.
        </p>
        <PacketBuilder id="pf-hub" source={source} wide readLink level={2} title="Your situation, your packet" />
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16" aria-labelledby="pf-all-forms">
        <h2 id="pf-all-forms" className={H2}>Every Indian passport renewal form, one page each</h2>
        <p className={LEAD}>
          Each form has its own page, so people searching for “Annexure E pdf” or “Annexure D for minor” land on the form itself.
        </p>
        {GROUPS.map((g) => (
          <div key={g.title} className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-foreground">{g.title}</h3>
            <ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
              {g.ids.map((id) => {
                const f = FORMS_LIST.find((x) => x.id === id)!;
                const notaryYes = /^Yes/.test(f.notary);
                return (
                  <li key={id}>
                    <a href={formPath(id)} className={`group flex h-full flex-col gap-2 p-5 no-underline ${CARD} ${CARD_HOVER} hover:border-primary/40`}>
                      <h4 className="text-[16.5px] font-extrabold leading-snug text-foreground">{f.name}</h4>
                      <span className="text-[12.5px] text-muted-foreground">{f.aka}</span>
                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{f.when}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={CHIP}>Signs: {f.signs}</span>
                        <span className={notaryYes ? CHIP_WARN : CHIP}>Notary: {f.notary.replace(/ \(.*\)/, "")}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {id === "govform" ? "Prepare my answers" : `Fill ${f.name.split(":")[0]} online`}
                        <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16" aria-labelledby="pf-notary">
        <h2 id="pf-notary" className={H2}>Which forms need a notary in the USA?</h2>
        <p className={LEAD}>The question nobody answers clearly. From the VFS USA checklists:</p>
        <div className={`mt-5 overflow-x-auto ${CARD}`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f6f9f8] text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Form or document</th>
                <th className="px-4 py-3 font-semibold">Who signs</th>
                <th className="px-4 py-3 font-semibold">Notary in the USA</th>
                <th className="px-4 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e8e5] align-top">
              {FORMS_LIST.filter((f) => f.id !== "govform").map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-semibold text-foreground"><a href={formPath(f.id)} className="hover:text-primary hover:underline">{f.name}</a></td>
                  <td className="px-4 py-3 text-muted-foreground">{f.signs}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.notary}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.when}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground">US status document copy</td>
                <td className="px-4 py-3 text-muted-foreground">-</td>
                <td className="px-4 py-3 text-muted-foreground">Yes, colour copy</td>
                <td className="px-4 py-3 text-muted-foreground">Every application</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16" aria-labelledby="pf-gov">
        <h2 id="pf-gov" className={H2}>
          How to fill the Passport Seva government online form (GPSP 2.0)
        </h2>
        <p className={LEAD}>
          The government form is online only, at mportal.passportindia.gov.in/mission. It has 9 steps and can’t be edited after you submit.{" "}
          <a href={formPath("govform")} className="font-semibold text-primary hover:underline">Prepare every answer first</a>, then copy them in.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16" aria-labelledby="pf-photo">
        <h2 id="pf-photo" className={H2}>Photo, signature and mailing rules</h2>
        <ul className={`mt-4 max-w-3xl list-disc space-y-3 p-6 pl-10 text-base leading-relaxed text-muted-foreground ${CARD}`}>
          <li>Photos: 2 identical, 35 × 45 mm, white background, taken in the last 6 months. Upload the same photo (630 × 810 px) to the government form before you submit, or the application is returned.</li>
          <li>Signatures: uploaded signature on page 1 of the government form, physical signature on the last page. No thumbprint.</li>
          <li>Print everything on A4, one side only. No staples. One application per envelope.</li>
          <li>Envelope: “RE-ISSUANCE OF PASSPORT IN LIEU OF EXISTING PASSPORT – ADULT”.</li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16" aria-labelledby="pf-steps">
        <h2 id="pf-steps" className={H2}>
          How to send your renewal once the forms are filled
        </h2>
        <ol className={`mt-4 max-w-3xl list-decimal space-y-3 p-6 pl-10 text-base leading-relaxed text-muted-foreground ${CARD}`}>
          <li>Fill the government online form on the mission portal (mportal.passportindia.gov.in/mission) and note your ARN.</li>
          <li>Register and pay on VFS Global: the fee for your case is shown in your packet above, and cards add 3.75%.</li>
          <li>Sign the forms, notarize the ones marked “Notary: Yes” and your US status copy, and mail one packet per envelope.</li>
        </ol>
        <p className="mt-5 text-sm text-muted-foreground">
          More detail: <a href="/blog/vfs-global-indian-passport-renewal-process" className="font-semibold text-primary hover:underline">the VFS renewal process step by step</a> and{" "}
          <a href="/blog/indian-passport-renewal-documents-checklist" className="font-semibold text-primary hover:underline">the full documents checklist</a>.
        </p>
      </section>

      <FaqSection items={HUB_CONTENT.faq} />
    </FormsPageFrame>
  );
}
