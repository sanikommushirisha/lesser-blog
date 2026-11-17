// Form 1: the government online form as an answer sheet, in the portal's
// order, each answer with a copy button. Ported from the app.

import { useMemo, useState } from "react";
import { govSections } from "../engine/preview";
import type { Details, Situation } from "../engine/packet";

export function GovSheet({ situ, d }: { situ: Situation; d: Details }) {
  const sections = useMemo(() => govSections(situ, d), [situ, d]);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    const done = () => {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400);
    };
    try {
      navigator.clipboard.writeText(text).then(done, done);
    } catch {
      done();
    }
  };
  return (
    <div className="flex flex-col gap-3">
      {sections.map((s, si) => (
        <div key={s.h} className="overflow-hidden rounded-2xl border border-[#e0e8e5] bg-white">
          <p className="m-0 border-b border-[#e0e8e5] bg-[#f6f9f8] px-4 py-2.5 text-[14.5px] font-bold text-[#1a1a1a]">{s.h}</p>
          {s.rows.map(([label, value], ri) => {
            const key = `${si}-${ri}`;
            return (
              <div key={key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto] items-center gap-3 border-b border-[#e0e8e5] px-4 py-2 text-sm last:border-b-0 max-sm:grid-cols-[minmax(0,1fr)_auto]">
                <span className="text-[#6b7280] max-sm:col-span-2">{label}</span>
                {value ? (
                  <>
                    <span className="break-words font-mono text-[13.5px] font-bold text-[#1a1a1a]">{value}</span>
                    <button type="button" onClick={() => copy(key, value)} aria-label={`Copy ${label}`} className="min-h-8 rounded-full border border-[#e0e8e5] bg-white px-3 text-[12.5px] font-bold text-[#374151] hover:border-[#034f46]/30">
                      {copied === key ? "Copied" : "Copy"}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="italic text-[#6b7280]">Answer this yourself</span>
                    <span />
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
