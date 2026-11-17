// LD-82 events on the public site, through the page's PostHog (window.posthog,
// as the blog's email gate does). Properties: form id and source ("hub" or the
// blog slug). Never anything typed into the forms.

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

export type FormsEvent =
  | "form_view"
  | "situation_set"
  | "field_complete"
  | "preview_open"
  | "pdf_download"
  | "packet_download"
  | "signup_click";

export function track(event: FormsEvent, props: Record<string, string | number | boolean | undefined>): void {
  try {
    window.posthog?.capture(event, props);
  } catch {
    // Analytics never gets in the way.
  }
}
