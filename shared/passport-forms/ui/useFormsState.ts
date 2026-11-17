// The public forms' state: situation + details, in the page only (LD-78: no
// login, no prefill, no storage). Same rules as the app's draft: a new ZIP
// asks the county again, refused Tatkal switches to normal, minors get 36 pages,
// adding a spouse marks married. Today's date is set after mount, so the
// prerendered HTML and the first browser render always match.

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SITUATION, tatkalBlock, type Details, type Situation } from "../engine/packet";

/** What a widget starts on: a ZIP sets the consulate, the rest pre-answer questions (LD-76). */
export type Preset = Partial<Pick<Situation, "who" | "cond" | "speed" | "zip" | "both" | "status" | "pages">> & { changes?: string[] };

const BASE_DETAILS: Details = {
  gender: "M",
  married: "no",
  citizenship: "birth",
  repatriated: "no",
  applyingParent: "mother",
  noConsentReason: "a",
};

/** What the reader actually typed or chose: the starting answers and the automatic signing date don't count. */
export function typedDetails(d: Details): Details {
  const out: Details = {};
  for (const [k, v] of Object.entries(d)) {
    if (!v.trim() || k === "signDate" || BASE_DETAILS[k] === v) continue;
    out[k] = v;
  }
  return out;
}

function today(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export function presetSituation(preset?: Preset): Situation {
  const s: Situation = { ...DEFAULT_SITUATION, ...preset, changes: preset?.changes ?? [] };
  if (s.who === "minor") s.pages = "36";
  if (tatkalBlock(s)) s.speed = "normal";
  return s;
}

export function useFormsState(preset?: Preset) {
  const [situ, setSitu] = useState<Situation>(() => presetSituation(preset));
  const [d, setD] = useState<Details>(() => ({
    ...BASE_DETAILS,
    ...(preset?.zip ? { zip: preset.zip } : {}),
    ...(preset?.changes?.includes("spouse") ? { married: "yes" } : {}),
  }));

  useEffect(() => {
    setD((cur) => (cur.signDate ? cur : { ...cur, signDate: today() }));
  }, []);

  const updateSitu = useCallback((key: keyof Situation, value: string, checked?: boolean) => {
    setSitu((cur) => {
      const next: Situation = { ...cur };
      if (key === "changes") {
        const set = cur.changes.filter((x) => x !== value);
        if (checked) set.push(value);
        next.changes = set;
      } else {
        (next as unknown as Record<string, string>)[key] = value;
      }
      if (key === "zip" && value !== cur.zip) delete next.county;
      if (tatkalBlock(next) && next.speed === "tatkal") next.speed = "normal";
      if (next.who === "minor") next.pages = "36";
      return next;
    });
    if (key === "changes" && value === "spouse" && checked) setD((cur) => ({ ...cur, married: "yes" }));
    if (key === "zip" && value.length === 5) setD((cur) => (cur.zip ? cur : { ...cur, zip: value }));
  }, []);

  const updateD = useCallback((k: string, v: string) => setD((cur) => ({ ...cur, [k]: v })), []);

  /** A whole situation at once (from a link's pf_* params), with the same rules applied. */
  const replaceSitu = useCallback((next: Situation) => {
    const s = { ...next };
    if (s.who === "minor") s.pages = "36";
    if (tatkalBlock(s)) s.speed = "normal";
    setSitu(s);
    if (s.zip) setD((cur) => (cur.zip ? cur : { ...cur, zip: s.zip }));
    if (s.changes.includes("spouse")) setD((cur) => ({ ...cur, married: "yes" }));
  }, []);

  return { situ, d, updateSitu, updateD, replaceSitu };
}
