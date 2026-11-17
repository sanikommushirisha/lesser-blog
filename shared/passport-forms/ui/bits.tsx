// Small building blocks of the public passport forms. Ported from the app's
// components/passport-forms/ui.tsx (lesser repo) so both look the same.

import type { ReactNode } from "react";
import { FIELDS, isRequired, type Details } from "../engine/packet";
import { FIELD_ERROR, FIELD_HINT, FIELD_LABEL, chipClass, fieldClass } from "./styles";
import { ExternalIcon } from "./icons";

export function Chips({
  name,
  options,
  value,
  multi,
  isDisabled,
  onToggle,
}: {
  name: string;
  options: [string, string][];
  value: string | string[];
  multi?: boolean;
  isDisabled?: (v: string) => boolean;
  onToggle: (v: string, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role={multi ? "group" : "radiogroup"}>
      {options.map(([v, label]) => {
        const on = multi ? (value as string[]).includes(v) : value === v;
        const off = isDisabled?.(v) ?? false;
        return (
          <label key={v} className="relative">
            <input
              type={multi ? "checkbox" : "radio"}
              name={name}
              value={v}
              checked={on}
              disabled={off}
              onChange={(e) => onToggle(v, e.target.checked)}
              className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            <span className={`${chipClass(on)} ${off ? "opacity-50" : ""} peer-focus-visible:ring-2 peer-focus-visible:ring-[#034f46] peer-focus-visible:ring-offset-2`}>
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function Question({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="mb-1 p-0 text-[15px] font-semibold text-[#1a1a1a]">{legend}</legend>
      {hint && <span className={FIELD_HINT}>{hint}</span>}
      {children}
    </fieldset>
  );
}

/** One field of the engine's registry (engine/forms.ts FIELDS). `idPrefix` keeps ids unique when two widgets share a page. */
export function Field({
  k,
  d,
  error,
  idPrefix,
  onChange,
  onComplete,
}: {
  k: string;
  d: Details;
  error?: string;
  idPrefix: string;
  onChange: (k: string, v: string) => void;
  onComplete?: (k: string) => void;
}) {
  const f = FIELDS[k];
  if (!f) return null;
  const id = `${idPrefix}-${k}`;
  const v = d[k] ?? "";
  const sel: [string, string][] | undefined = typeof f.sel === "function" ? f.sel(d) : f.sel;
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    className: fieldClass(error),
    onBlur: (e: { target: { value: string } }) => {
      if (e.target.value.trim()) onComplete?.(k);
    },
  };
  return (
    <div className={`flex min-w-0 flex-col ${f.span || f.area ? "sm:col-span-2" : ""}`}>
      <label htmlFor={id} className={FIELD_LABEL}>
        {f.l}
        {isRequired(k, d) ? <span className="ml-0.5 text-red-500">*</span> : <span className="ml-1 font-normal text-[#6b7280]">(optional)</span>}
      </label>
      {sel ? (
        <select {...common} value={v} onChange={(e) => onChange(k, e.target.value)}>
          {sel.map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      ) : f.area ? (
        <textarea {...common} rows={3} value={v} placeholder={f.ph} onChange={(e) => onChange(k, e.target.value)} />
      ) : (
        <input {...common} type={f.type || "text"} value={v} placeholder={f.ph} autoComplete={f.ac} inputMode={f.im} onChange={(e) => onChange(k, e.target.value)} />
      )}
      {error ? (
        <span id={`${id}-err`} className={FIELD_ERROR}>
          {error}
        </span>
      ) : f.help ? (
        <span className={FIELD_HINT}>{f.help}</span>
      ) : null}
    </div>
  );
}

export function Tag({ children, tone }: { children: ReactNode; tone?: "g" | "w" }) {
  const cls =
    tone === "g" ? "bg-[#034f46]/10 text-[#034f46] border-transparent" : tone === "w" ? "bg-amber-50 text-amber-800 border-transparent" : "bg-white text-[#374151] border-[#e0e8e5]";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${cls}`}>{children}</span>;
}

export function PacketHeading({ children }: { children: ReactNode }) {
  return <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#374151]">{children}</span>;
}

/** An official site (government form, VFS): always a new tab (LD-81). */
export function ExtLink({ href, primary, children }: { href: string; primary?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13.5px] font-bold no-underline ${
        primary ? "border-[#034f46] bg-[#034f46] text-white hover:bg-[#023d35]" : "border-[#e0e8e5] text-[#1a1a1a] hover:border-[#034f46]/40"
      }`}
    >
      {children}
      <ExternalIcon />
    </a>
  );
}

export function shortFormName(name: string): string {
  return name
    .replace(" (cover page)", "")
    .replace(" (answer sheet)", "")
    .replace("Government online application form", "Government form")
    .replace("Affidavit for Change in Appearance and Signature", "Appearance affidavit")
    .replace("Annexure J: Joint Photo Declaration", "Annexure J");
}
