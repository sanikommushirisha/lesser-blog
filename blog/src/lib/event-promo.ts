/**
 * Schedule for the current event promo (components/EventPopup.tsx and the bell
 * in components/EventPromo.tsx). Update or remove when the next event replaces it.
 */

/** Session start, 25 Oct 2026 10:00 AM PT. The promo switches itself off after. */
export const EVENT_ENDS_AT = Date.parse('2026-10-25T17:00:00Z')

/** True until the session starts; the popup and its bell disappear after. */
export function isEventUpcoming(): boolean {
  return Date.now() < EVENT_ENDS_AT
}
