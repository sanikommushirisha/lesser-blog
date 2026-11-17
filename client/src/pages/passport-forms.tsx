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
        <p className="mb-10 text-sm text-muted-foreground">
          Forms, documents and fees checked against the VFS USA checklists of 1 and 3 November 2026. Nothing you type leaves your browser.
          Prefer help? <a href="/services/passport-renewal" className="font-semibold text-primary hover:underline">Let Lesser Tax handle your passport renewal</a>.
        </p>
        <PacketBuilder id="pf-hub" source={source} wide readLink level={2} title="Your situation, your packet" />
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16" aria-labelledby="pf-all-forms">
        <h2 id="pf-all-forms" className="mb-6 text-3xl font-extrabold tracking-[-0.03em] text-foreground md:text-4xl">
          All 9 Indian passport renewal forms
        </h2>
        {GROUPS.map((g) => (
          <div key={g.title} className="mb-8">
            <h3 className="mb-3 text-lg font-semibold text-foreground">{g.title}</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {g.ids.map((id) => {
                const f = FORMS_LIST.find((x) => x.id === id)!;
                return (
                  <li key={id}>
                    <a href={formPath(id)} className="block h-full rounded-2xl border border-border bg-white p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                      <span className="block text-base font-semibold text-foreground">{f.name}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{f.when}</span>
                      <span className="mt-2 block text-xs text-muted-foreground">
                        Signs: {f.signs}. Notary: {f.notary}.
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pt-10" aria-labelledby="pf-steps">
        <h2 id="pf-steps" className="mb-5 text-3xl font-extrabold tracking-[-0.03em] text-foreground md:text-4xl">
          How to send your renewal once the forms are filled
        </h2>
        <ol className="list-decimal space-y-3 pl-5 text-base leading-relaxed text-muted-foreground">
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
