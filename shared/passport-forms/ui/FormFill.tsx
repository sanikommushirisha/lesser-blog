// Fill and download: the fields of one form (single form) or of the whole
// packet (packet builder), a live preview of the paper, and the downloads.
// Validation runs on download; the first missing field gets focus. On phones a
// Preview / Download bar sticks to the bottom of the widget (LD-81), inside
// the article rather than over it.

import { useEffect, useMemo, useRef, useState } from "react";
import { FORM_BY_ID, buildPacket, groupsFor, hasChange, validate, type Details, type Situation } from "../engine/packet";
import { previewHtml } from "../engine/preview";
import { Field, Tag, shortFormName } from "./bits";
import { GovSheet } from "./GovSheet";
import { DownloadIcon, SpinnerIcon } from "./icons";
import { track } from "./analytics";
import { useDownloads } from "./useDownloads";
import { BTN_PILL_SM, BTN_PRIMARY, CARD, SECTION_TITLE } from "./styles";

export function FormFill({
  formIds,
  situ,
  d,
  onChange,
  idPrefix,
  source,
  wide,
}: {
  /** The forms whose fields are asked here: one form, or the packet. */
  formIds: string[];
  situ: Situation;
  d: Details;
  onChange: (k: string, v: string) => void;
  idPrefix: string;
  /** Analytics source: "hub" or the blog slug. */
  source: string;
  /** Fields and preview side by side (the forms pages); stacked in a blog post. */
  wide?: boolean;
}) {
  const packet = useMemo(() => buildPacket(situ), [situ]);
  const groups = useMemo(() => {
    const out: { form: string; title: string; keys: string[] }[] = [];
    groupsFor(formIds).forEach((g) => out.push(g));
    return out;
  }, [formIds]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<string>(formIds.find((x) => x !== "govform") ?? formIds[0]);
  const active = formIds.includes(tab) ? tab : formIds[0];
  const previewRef = useRef<HTMLDivElement>(null);
  const spouseVisible = d.married === "yes" || hasChange(situ, "spouse");
  const { busy, status, download } = useDownloads(situ, d, (key) =>
    key === "all" ? track("packet_download", { forms: formIds.length, source }) : track("pdf_download", { form: key, source }),
  );

  // Preview seen once (analytics).
  useEffect(() => {
    const el = previewRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        track("preview_open", { form: active, source });
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [active, source]);

  const change = (k: string, v: string) => {
    onChange(k, v);
    if (errors[k]) setErrors(({ [k]: _gone, ...rest }) => rest);
  };

  const start = (key: string) => {
    const e = validate(key === "all" ? formIds : [key], d);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => (document.querySelector(`[id^="${idPrefix}-"][aria-invalid="true"]`) as HTMLElement | null)?.focus());
      return;
    }
    void download(key);
  };

  const mainKey = formIds.length > 1 ? "all" : formIds[0];
  const errorCount = Object.keys(errors).length;
  const filtered = (keys: string[]) => keys.filter((k) => spouseVisible || (k !== "spouseName" && k !== "spousePassport"));

  return (
    <div className="relative flex flex-col gap-5">
      <div className={`grid items-start gap-5 ${wide ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : ""}`}>
        <div className={`${CARD} flex flex-col gap-6 p-5 sm:p-7`}>
          {groups.map((g, i) => (
            <fieldset key={g.title + g.form} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
              {formIds.length > 1 && (i === 0 || groups[i - 1].form !== g.form) && (
                <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#034f46]">For {g.form}</span>
              )}
              <legend className={`${SECTION_TITLE} mb-2 p-0`}>{g.title}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered(g.keys).map((k) => (
                  <Field key={k} k={k} d={d} idPrefix={idPrefix} error={errors[k]} onChange={change} onComplete={(field) => track("field_complete", { form: active, field, source })} />
                ))}
              </div>
            </fieldset>
          ))}
          <p role="status" className={`m-0 text-[13px] ${errorCount ? "font-medium text-red-600" : "text-[#6b7280]"}`}>
            {errorCount ? `${errorCount} detail${errorCount > 1 ? "s" : ""} still needed, marked in red.` : "Nothing you type leaves this page. Print on A4, one side only, sign in ink."}
          </p>
        </div>

        <div className={`flex min-w-0 flex-col gap-3 ${wide ? "lg:sticky lg:top-24" : ""}`}>
          {formIds.length > 1 && (
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Preview a form">
              {formIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active === id}
                  onClick={() => setTab(id)}
                  className={`min-h-9 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
                    active === id ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e0e8e5] bg-white text-[#374151] hover:border-[#034f46]/30"
                  }`}
                >
                  {shortFormName(FORM_BY_ID[id].name)}
                </button>
              ))}
            </div>
          )}
          <div ref={previewRef} id={`${idPrefix}-preview`} className="pf-paper min-w-0 scroll-mt-24">
            {active === "govform" ? <GovSheet situ={situ} d={d} /> : <div dangerouslySetInnerHTML={{ __html: previewHtml(active, situ, d, packet) }} />}
          </div>
          <span className="text-[12px] text-[#6b7280]">{FORM_BY_ID[active].src}. Live preview; the download is the PDF.</span>
        </div>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {formIds.map((id) => (
          <li key={id} className="m-0 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e0e8e5] bg-white px-4 py-3">
            <span className="flex min-w-[200px] flex-1 flex-col gap-0.5">
              <b className="text-[15px] text-[#1a1a1a]">{FORM_BY_ID[id].name}</b>
              <span role="status" className={`min-h-[18px] text-[13px] ${status[id]?.ok === false ? "text-red-600" : "text-[#034f46]"}`}>
                {status[id]?.msg ?? `Signs: ${FORM_BY_ID[id].signs}. Notary: ${FORM_BY_ID[id].notary}.`}
              </span>
            </span>
            <button type="button" className={BTN_PILL_SM} disabled={busy !== null} onClick={() => start(id)}>
              {busy === id ? <SpinnerIcon /> : <DownloadIcon />}
              {busy === id ? "Preparing…" : id === "govform" ? "Download answers (PDF)" : "Download PDF"}
            </button>
          </li>
        ))}
        {formIds.length > 1 && (
          <li className="m-0 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[#034f46]/30 bg-[#034f46]/[0.04] px-4 py-3">
            <span className="flex min-w-[200px] flex-1 flex-col gap-0.5">
              <b className="text-[15px] text-[#1a1a1a]">All {formIds.length} forms in one PDF</b>
              <span role="status" className={`min-h-[18px] text-[13px] ${status.all?.ok === false ? "text-red-600" : "text-[#034f46]"}`}>
                {status.all?.msg ?? "In packet order: the checklist goes on top."}
              </span>
            </span>
            <button type="button" className={BTN_PRIMARY} disabled={busy !== null} onClick={() => start("all")}>
              {busy === "all" ? <SpinnerIcon /> : <DownloadIcon />}
              {busy === "all" ? "Preparing…" : "Download all"}
            </button>
          </li>
        )}
      </ul>

      {/* Phones: Preview / Download within thumb reach, stuck to the bottom of this widget. */}
      <div className="sticky bottom-0 z-10 -mx-1 flex gap-2 border-t border-[#e0e8e5] bg-white/95 px-1 py-3 backdrop-blur sm:hidden">
        <a href={`#${idPrefix}-preview`} className={`${BTN_PILL_SM} flex-1 justify-center`}>
          Preview
        </a>
        <button type="button" className={`${BTN_PRIMARY} flex-1 !py-2.5`} disabled={busy !== null} onClick={() => start(mainKey)}>
          {busy === mainKey ? <SpinnerIcon /> : <DownloadIcon />}
          {busy === mainKey ? "Preparing…" : mainKey === "all" ? "Download all" : "Download"}
        </button>
      </div>
      {formIds.length === 1 && !packet.forms.includes(formIds[0]) && (
        <p className="m-0 text-[13px] text-[#6b7280]">
          <Tag tone="w">Not in your packet</Tag> Your situation doesn’t need this form.
        </p>
      )}
    </div>
  );
}
