// The 5 free passport form widgets (LD-76), for the blog posts (LD-77) and the
// public forms pages (LD-78). Every widget except the inline card ends with
// the hand-off to Lesser's paid renewal (LD-80), carrying the situation.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PASSPORT_PRICE } from "../../passport-pricing";
import { FORM_BY_ID, LINKS, buildPacket, type Details, type Situation } from "../engine/packet";
import { saveHandoff } from "../engine/saved";
import { situationFromParams, situationToParams } from "../engine/situation";
import { HUB_PATH, formPath, signupUrl } from "../config";
import { track } from "./analytics";
import { ExtLink, Tag, shortFormName } from "./bits";
import { FormFill } from "./FormFill";
import { ChevronRightIcon } from "./icons";
import { PacketSummary } from "./PacketSummary";
import { SituationPicker } from "./SituationPicker";
import { BTN_PILL_SM, BTN_PRIMARY, CARD, EYEBROW, SUBTITLE } from "./styles";
import { presetSituation, typedDetails, useFormsState, type Preset } from "./useFormsState";
import "./paper.css";

export type { Preset } from "./useFormsState";

/** A form's page, carrying the situation so it opens already answered. */
export function formHrefWith(situ: Situation): (id: string) => string {
  const q = new URLSearchParams(situationToParams(situ)).toString();
  return (id: string) => `${formPath(id)}?${q}`;
}

/** The situation a link carries (pf_* params), read after mount: prerendered HTML can't know the URL's query. */
export function useSituationFromLink(apply: (s: Situation) => void) {
  useEffect(() => {
    try {
      const s = situationFromParams(new URLSearchParams(window.location.search), presetSituation());
      if (s) apply(s);
    } catch {
      /* no usable params */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** situation_set on each change the reader makes (not the preset). */
function useSituationEvents(situ: Situation, source: string) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => track("situation_set", { source, who: situ.who, cond: situ.cond, speed: situ.speed, changes: situ.changes.length }), 800);
    return () => clearTimeout(t);
  }, [situ, source]);
}

/** Widget title level: h3 inside a blog post's h2 section; h2 directly under a page's h1 (the forms pages). */
export type HeadingLevel = 2 | 3;

function Shell({ id, title, intro, level = 3, children }: { id: string; title: string; intro?: string; level?: HeadingLevel; children: ReactNode }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby={`${id}-title`} className="not-prose my-8 flex flex-col gap-5 rounded-[24px] border border-[#e0e8e5] bg-[#faf8f0] p-4 sm:p-6" data-passport-widget={id}>
      <div className="flex flex-col gap-1.5">
        <span className={EYEBROW}>Free passport forms · VFS USA</span>
        <H id={`${id}-title`} className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-[#1a1a1a]">
          {title}
        </H>
        {intro && <p className={`${SUBTITLE} m-0`}>{intro}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * "Rather not deal with notaries and couriers?": the hand-off to the paid renewal (LD-80).
 * With details typed, the button saves them in this browser and carries on to sign-up
 * or login; the app then starts the case with them, so nothing is asked twice.
 */
export function SignupBlock({ situ, d, source, form }: { situ: Situation; d?: Details; source: string; form?: string }) {
  const mine = d ? typedDetails(d) : {};
  const typed = Object.keys(mine).length > 0;
  const go = (e: { preventDefault: () => void }) => {
    track("signup_click", { form, source });
    if (!typed) return;
    let saved = false;
    try {
      saved = saveHandoff(situ, mine, window.localStorage);
    } catch {
      /* storage blocked: the situation still goes along in the link */
    }
    e.preventDefault();
    window.location.href = signupUrl(situ, source, form, saved);
  };
  return (
    <div className={`${CARD} flex flex-col gap-3 border-[#034f46]/30 p-5 sm:p-6`}>
      <p className="m-0 text-[16px] font-semibold text-[#1a1a1a]">Rather not deal with notaries and couriers?</p>
      <p className="m-0 max-w-[62ch] text-[15px] leading-relaxed text-[#374151]">
        Lesser fills every form, checks your packet before you mail it, and tracks it home. Your answers here come along, so you aren’t asked again.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a href={signupUrl(situ, source, form)} className={BTN_PRIMARY} onClick={go} data-testid="passport-signup">
          {typed ? "Save my details and continue" : "Let Lesser do it"}
        </a>
        <span className="text-[13px] text-[#6b7280]">{PASSPORT_PRICE.short}</span>
      </div>
      {typed && (
        <p className="m-0 max-w-[62ch] text-[13px] leading-relaxed text-[#6b7280]">
          Your details stay in this browser until you sign up or log in, then they are saved to your Lesser account. Nothing is sent before that.
        </p>
      )}
    </div>
  );
}

/** The packet builder: situation, then every form the case needs, typed once and downloaded (LD-76). */
export function PacketBuilder({ id = "pf-packet", preset, source, wide, title, readLink, level }: { id?: string; preset?: Preset; source: string; wide?: boolean; title?: string; readLink?: boolean; level?: HeadingLevel }) {
  const { situ, d, updateSitu, updateD, replaceSitu } = useFormsState(preset);
  useSituationFromLink((s) => readLink && replaceSitu(s));
  const packet = useMemo(() => buildPacket(situ), [situ]);
  const [filling, setFilling] = useState(false);
  useSituationEvents(situ, source);
  useEffect(() => track("form_view", { form: "packet", source }), [source]);

  return (
    <Shell id={id} level={level} title={title ?? "Build your passport renewal packet"} intro="Answer a few questions to see every form, document and fee your case needs. Then type your details once and download each form, filled. Free; nothing you type leaves this page.">
      <div className={`grid items-start gap-5 ${wide ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : ""}`}>
        <div className={`${CARD} p-5 sm:p-7`}>
          <SituationPicker situ={situ} idPrefix={id} onChange={updateSitu} />
        </div>
        <PacketSummary packet={packet} formHref={formHrefWith(situ)} compact={!wide} />
      </div>
      {filling ? (
        <FormFill formIds={packet.forms} situ={situ} d={d} onChange={updateD} idPrefix={`${id}-d`} source={source} wide={wide} />
      ) : (
        <div>
          <button type="button" className={BTN_PRIMARY} onClick={() => setFilling(true)} data-testid={`${id}-fill`}>
            Fill my {packet.forms.length} forms
          </button>
        </div>
      )}
      <SignupBlock situ={situ} d={d} source={source} />
    </Shell>
  );
}

/** The forms picker: same questions; the result is the list of forms with a Fill button each (LD-76). */
export function FormsPicker({ id = "pf-picker", preset, source, readLink, level }: { id?: string; preset?: Preset; source: string; readLink?: boolean; level?: HeadingLevel }) {
  const { situ, updateSitu, replaceSitu } = useFormsState(preset);
  useSituationFromLink((s) => readLink && replaceSitu(s));
  const packet = useMemo(() => buildPacket(situ), [situ]);
  const href = formHrefWith(situ);
  useSituationEvents(situ, source);
  useEffect(() => track("form_view", { form: "picker", source }), [source]);

  return (
    <Shell id={id} level={level} title="Which passport forms do you need?" intro="Tell us your situation and we list the forms for your case. Fill each one free.">
      <div className={`${CARD} p-5 sm:p-7`}>
        <SituationPicker situ={situ} idPrefix={id} onChange={updateSitu} />
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {packet.forms.map((fid) => {
          const f = FORM_BY_ID[fid];
          return (
            <li key={fid} className="m-0 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e0e8e5] bg-white px-4 py-3">
              <span className="flex min-w-[200px] flex-1 flex-col gap-0.5">
                <b className="text-[15px] text-[#1a1a1a]">{f.name}</b>
                <span className="text-[13px] text-[#6b7280]">
                  Signs: {f.signs}. Notary: {f.notary}.
                </span>
              </span>
              <a href={href(fid)} className={BTN_PILL_SM}>
                Fill
                <ChevronRightIcon />
              </a>
            </li>
          );
        })}
      </ul>
      <SignupBlock situ={situ} source={source} />
    </Shell>
  );
}

/** One form, with the rest of the packet listed underneath (LD-76). */
export function SingleForm({ id, form, preset, source, wide, readLink, level }: { id?: string; form: string; preset?: Preset; source: string; wide?: boolean; readLink?: boolean; level?: HeadingLevel }) {
  const wid = id ?? `pf-${form}`;
  const { situ, d, updateSitu, updateD, replaceSitu } = useFormsState(preset);
  useSituationFromLink((s) => readLink && replaceSitu(s));
  const packet = useMemo(() => buildPacket(situ), [situ]);
  const href = formHrefWith(situ);
  const f = FORM_BY_ID[form];
  useSituationEvents(situ, source);
  useEffect(() => track("form_view", { form, source }), [form, source]);

  return (
    <Shell id={wid} level={level} title={`Fill ${f.name} free`} intro={`${f.when} Signs: ${f.signs}. Notary: ${f.notary}.`}>
      <details className={`${CARD} group px-5 py-4 sm:px-7`}>
        <summary className="cursor-pointer list-none text-[14px] font-semibold text-[#034f46]">
          Your situation: {situ.who === "minor" ? "a child’s" : "your own"} passport, {situ.cond === "valid" ? "valid or expired" : situ.cond}
          {situ.changes.length ? `, ${situ.changes.length} change${situ.changes.length > 1 ? "s" : ""}` : ""}. Change it
        </summary>
        <div className="mt-5">
          <SituationPicker situ={situ} idPrefix={wid} onChange={updateSitu} />
        </div>
      </details>
      <FormFill formIds={[form]} situ={situ} d={d} onChange={updateD} idPrefix={`${wid}-d`} source={source} wide={wide} />
      {packet.forms.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-[#1a1a1a]">The rest of your packet</span>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {packet.forms
              .filter((x) => x !== form)
              .map((x) => (
                <li key={x} className="m-0">
                  <a href={href(x)} className={BTN_PILL_SM}>
                    {shortFormName(FORM_BY_ID[x].name)}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
      <SignupBlock situ={situ} d={d} source={source} form={form} />
    </Shell>
  );
}

/** Form 1 only: step-by-step answers for the government online form (LD-76). */
export function GovFormAnswers({ id = "pf-gov", preset, source, wide, readLink, level }: { id?: string; preset?: Preset; source: string; wide?: boolean; readLink?: boolean; level?: HeadingLevel }) {
  const { situ, d, updateD, replaceSitu } = useFormsState(preset);
  useSituationFromLink((s) => readLink && replaceSitu(s));
  useEffect(() => track("form_view", { form: "govform", source }), [source]);
  return (
    <Shell id={id} level={level} title="Your answers for the government form" intro="Type your details once and get every answer for the Passport Seva re-issue form, in the portal’s order, ready to copy.">
      <div className="flex flex-wrap gap-2">
        <ExtLink href={LINKS.gov} primary>
          Open the government form
        </ExtLink>
        <Tag>mportal.passportindia.gov.in/mission</Tag>
      </div>
      <FormFill formIds={["govform"]} situ={situ} d={d} onChange={updateD} idPrefix={`${id}-d`} source={source} wide={wide} />
      <SignupBlock situ={situ} d={d} source={source} form="govform" />
    </Shell>
  );
}

/** One line and a button to the forms hub (LD-76). No sign-up block. `from` lets the hub credit this post in analytics. */
export function InlineCard({ preset, source }: { preset?: Preset; source: string }) {
  const q = new URLSearchParams({ ...(preset ? situationToParams(presetSituation(preset)) : {}), from: source }).toString();
  return (
    <aside className="not-prose my-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c8deda] bg-[#f0f7f6] px-5 py-4" data-passport-widget="inline">
      <span className="text-[15px] font-semibold text-[#034f46]">Annexure E, the affidavits and the VFS checklist, filled for your case and free to download.</span>
      <a href={`${HUB_PATH}?${q}`} className={BTN_PRIMARY}>
        Fill my forms free
      </a>
    </aside>
  );
}
