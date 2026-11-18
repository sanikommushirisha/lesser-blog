// Analytics events for the free tax tools (LD-41 framework): tool_started,
// tool_completed, lead_captured and cta_clicked, sent to PostHog (loaded in
// client/index.html, through the same-origin proxy). Never sends what the
// visitor typed: only which tool, and for the CTA which one.

import { useEffect, useRef } from "react";

export type ToolEvent = "tool_started" | "tool_completed" | "lead_captured" | "cta_clicked";

// window.posthog is typed once, in shared/passport-forms/ui/analytics.ts.
export function trackTool(event: ToolEvent, props: Record<string, unknown>) {
  try {
    window.posthog?.capture(event, { ...props, page: window.location.pathname });
  } catch {
    // Analytics must never break a calculator.
  }
}

/**
 * tool_started on the first change to any input; tool_completed once, 2.5 s after
 * a change that left a valid result (so a visitor reading a result counts, one
 * typing through the fields does not). `signature` changes whenever an input does.
 */
export function useToolEvents(tool: string, signature: string, valid: boolean) {
  const mounted = useRef(false);
  const started = useRef(false);
  const completed = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!started.current) {
      started.current = true;
      trackTool("tool_started", { tool });
    }
    if (!valid || completed.current) return;
    const t = setTimeout(() => {
      completed.current = true;
      trackTool("tool_completed", { tool });
    }, 2500);
    return () => clearTimeout(t);
  }, [signature, valid, tool]);
}
