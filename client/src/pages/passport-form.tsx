// /tools/indian-passport-forms/<slug>: one free form's page (LD-78), with its
// own title, H1, description and FAQ (FAQPage) from the synced CONTENT.

import { useEffect } from "react";
import { useParams } from "wouter";
import { FORMS_LIST, GovFormAnswers, HUB_PATH, SingleForm, formBySlug, formContent, formPath } from "@shared/passport-forms/ui";
import { FaqSection, FormsPageFrame } from "@/components/passport-forms-layout";
import NotFound from "@/pages/not-found";

export default function PassportFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const form = formBySlug(slug ?? "");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  if (!form) return <NotFound />;
  const c = formContent(form.id);
  const path = formPath(form.id);

  return (
    <FormsPageFrame sourcePage={path}>
      <section className="mx-auto max-w-6xl px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <a href="/services/passport-renewal" className="hover:text-primary">Passport renewal</a>
          <span className="mx-2">/</span>
          <a href={HUB_PATH} className="hover:text-primary">Passport forms</a>
        </nav>
        <h1 className="hero-fade-up mb-5 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground md:text-5xl">{c.h1}</h1>
        <p className="mb-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">{c.desc}</p>
        <p className="mb-8 text-sm text-muted-foreground">
          {form.when} Signs: {form.signs}. Notary: {form.notary}. Source: {form.src}.
        </p>
        {form.id === "govform" ? (
          <GovFormAnswers id={`pf-${form.id}`} source="hub" wide readLink level={2} />
        ) : (
          <SingleForm form={form.id} source="hub" wide readLink level={2} />
        )}
      </section>

      <FaqSection items={c.faq} />

      <section className="mx-auto max-w-3xl px-6 pb-6" aria-labelledby="pf-other">
        <h2 id="pf-other" className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-foreground">
          Other Indian passport renewal forms
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {FORMS_LIST.filter((f) => f.id !== form.id).map((f) => (
            <li key={f.id}>
              <a href={formPath(f.id)} className="font-semibold text-primary hover:underline">
                {f.name}
              </a>
            </li>
          ))}
          <li>
            <a href={HUB_PATH} className="font-semibold text-primary hover:underline">
              All forms for your situation
            </a>
          </li>
        </ul>
      </section>
    </FormsPageFrame>
  );
}
