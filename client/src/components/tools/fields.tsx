// Form building blocks shared by the free tax tools (LD-41 framework): labelled
// money, number, percent and select fields, a segmented control, a card and a
// result row. All values are strings, so a half-typed number never jumps.

import type { ReactNode } from "react";

export const CARD =
  "rounded-2xl border border-[#e0e8e5] bg-white shadow-[0_1px_3px_0_rgb(2_6_23/0.04),0_1px_2px_-1px_rgb(2_6_23/0.06)]";

const INPUT =
  "h-11 w-full rounded-xl border border-[#d5e0dc] bg-white px-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm";

/** Keeps digits and one decimal point. */
export const cleanNumber = (v: string) => {
  const s = v.replace(/[^0-9.]/g, "");
  const dot = s.indexOf(".");
  return dot === -1 ? s : s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "");
};

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs leading-snug text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function NumberField({
  id, label, value, onChange, prefix, suffix, hint, placeholder = "0", testId,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; hint?: string; placeholder?: string; testId?: string;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined}
          data-testid={testId ?? `input-${id}`}
          onChange={(e) => onChange(cleanNumber(e.target.value))}
          className={`${INPUT} ${prefix ? "pl-7" : ""} ${suffix ? "pr-9" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

export const MoneyField = (p: Omit<Parameters<typeof NumberField>[0], "prefix">) => <NumberField {...p} prefix="$" />;
export const PercentField = (p: Omit<Parameters<typeof NumberField>[0], "suffix">) => <NumberField {...p} suffix="%" />;

export function SelectField<T extends string>({
  id, label, value, onChange, options, hint,
}: {
  id: string; label: string; value: T; onChange: (v: T) => void; hint?: string;
  options: { value: T; label: string }[];
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <select
        id={id}
        value={value}
        data-testid={`select-${id}`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value as T)}
        className={INPUT}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Segmented<T extends string>({
  label, value, onChange, options, name,
}: {
  label: string; value: T; onChange: (v: T) => void; name: string;
  options: { value: T; label: string }[];
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              data-testid={`seg-${name}-${o.value}`}
              onClick={() => onChange(o.value)}
              className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                on ? "border-primary bg-primary text-white" : "border-[#d5e0dc] bg-white text-foreground hover:border-primary/50"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${CARD} p-5 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-lg font-extrabold tracking-[-0.02em] text-foreground">{title}</h2>}
      {children}
    </section>
  );
}

export function ResultRow({ label, value, strong, tone, hint }: { label: string; value: ReactNode; strong?: boolean; tone?: "good" | "bad"; hint?: string }) {
  const color = tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : "text-foreground";
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${strong ? "" : "border-t border-[#eef3f1] first:border-t-0"}`}>
      <dt className={`text-sm ${strong ? "font-bold text-foreground" : "text-muted-foreground"}`}>
        {label}
        {hint && <span className="block text-xs font-normal text-muted-foreground/80">{hint}</span>}
      </dt>
      <dd className={`text-right tabular-nums ${strong ? "text-xl font-extrabold" : "text-sm font-semibold"} ${color}`}>{value}</dd>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  const cls = tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-[#d5e6e1] bg-[#f3f8f6] text-foreground/80";
  return <p className={`rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${cls}`}>{children}</p>;
}
