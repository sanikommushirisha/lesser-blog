// The app's form styles (lesser repo components/shared/lesser-styles.ts), as
// plain Tailwind classes so the public forms look like the ones in the app.
// Explicit colours, not theme tokens: the blog and the site use different
// Tailwind versions and themes.

export const CARD = "rounded-[20px] border border-[#e0e8e5] bg-white";
export const PANEL = "rounded-2xl border border-[#e0e8e5] bg-[#f6f9f8]";
export const EYEBROW = "text-[12px] font-bold uppercase tracking-[0.08em] text-[#4b5563]";
export const SUBTITLE = "text-[15px] font-medium leading-relaxed text-[#6b7280]";
export const SECTION_TITLE = "text-[16px] font-semibold tracking-[-0.2px] text-[#1a1a1a]";
export const FIELD_LABEL = "mb-1.5 block text-[13px] font-semibold text-[#374151]";
export const FIELD_HINT = "mt-1.5 text-[12px] text-[#6b7280]";
export const FIELD_ERROR = "mt-1.5 text-[12px] font-medium text-red-600";
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#034f46] px-6 py-3.5 text-[15px] font-semibold text-white no-underline shadow-lg shadow-[#034f46]/20 transition-all duration-200 hover:bg-[#023d35] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";
export const BTN_PILL_SM =
  "inline-flex h-10 items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 text-sm font-semibold text-[#374151] no-underline transition-colors duration-200 hover:border-[#034f46]/30 hover:text-[#034f46] disabled:cursor-not-allowed disabled:opacity-60";
export const LINK = "font-semibold text-[#034f46] underline-offset-2 hover:underline";

/** Inputs are 16 px on phones: iOS zooms into anything smaller (LD-81). */
export function fieldClass(error?: unknown): string {
  return `w-full rounded-xl border-2 bg-white px-4 py-3 text-[16px] sm:text-[15px] font-medium text-[#1a1a1a] placeholder:font-normal placeholder:text-[#6b7280] outline-none transition-colors duration-150 hover:border-[#034f46]/30 focus:border-[#034f46] ${
    error ? "border-red-400 hover:border-red-400 focus:border-red-500" : "border-[#e0e0e0]"
  }`;
}

export function chipClass(selected: boolean): string {
  return `inline-flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-150 ${
    selected ? "border-[#034f46] bg-[#034f46] text-white shadow-sm" : "border-[#e0e0e0] bg-white text-[#374151] hover:border-[#034f46]/30 hover:shadow-sm"
  }`;
}
