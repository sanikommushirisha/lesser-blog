/**
 * Email gate on articles: which posts show it, and which lead magnet (free PDF)
 * each post offers. The ids and delivery details are in shared/lead-magnets.ts
 * (used by the server too), so adding a PDF there makes OFFERS below fail to
 * typecheck until it has pop-up copy.
 *
 * TURNING IT ON: the gate only appears on posts listed in GATE_ROLLOUT, which
 * ships empty. List a post only after the tax team has signed off its PDF and
 * the file is in blog/public/guides/. Add slugs in small batches and watch
 * search rankings before adding more. Do not add passport posts: they sell a
 * service directly and one runs a placement A/B test.
 *
 * THE TEST: a visitor is split 50/50 on their first gate. Half see the PDF
 * matched to the post's topic, half see the general NRI checklist, so each
 * matched PDF is compared with the same yardstick within its own topic.
 * Results are the PostHog events gate_shown and gate_subscribed, by `offer`,
 * `topic` and `arm`.
 */

import type { LeadMagnetId } from '../../../shared/lead-magnets'

export type OfferId = LeadMagnetId

export type Offer = { id: OfferId; headline: string; sub: string }

export const GATE_ROLLOUT: readonly string[] = []

export const OFFERS: Record<OfferId, Offer> = {
  'rsu-checklist': {
    id: 'rsu-checklist',
    headline: 'Get the RSU tax checklist',
    sub: 'Enter your email to keep reading. We will also send you our free checklist for RSUs, ESPP and options on a visa or green card.',
  },
  'india-accounts-checklist': {
    id: 'india-accounts-checklist',
    headline: 'Get the Indian accounts checklist',
    sub: 'Enter your email to keep reading. We will also send you our free FBAR and FATCA checklist for your Indian accounts.',
  },
  'moving-back-checklist': {
    id: 'moving-back-checklist',
    headline: 'Moving back to India?',
    sub: 'Enter your email to keep reading. We will also send you our free checklist of US tax and money steps before you leave.',
  },
  'founder-checklist': {
    id: 'founder-checklist',
    headline: 'Get the founder filing checklist',
    sub: 'Enter your email to keep reading. We will also send you our free filing checklist for immigrant founders with an LLC or corporation.',
  },
  'nri-checklist': {
    id: 'nri-checklist',
    headline: 'Get the NRI tax checklist',
    sub: 'Enter your email to keep reading. We will also send you our free US tax checklist for anyone with income or assets in both countries.',
  },
}

const GENERAL_OFFER: OfferId = 'nri-checklist'

const TOPICS: Partial<Record<OfferId, readonly string[]>> = {
  'rsu-checklist': [
    'rsu-taxes-h1b-2026',
    'espp-83b-election-visa-holders-2026',
    'iso-amt-leaving-us-2026',
    'nsos-h-1b-tax-at-exercise-after-move',
    'rsus-that-fell-after-vesting-wash-sales-between',
    'h-1b-transfer-two-w2s-withholding-rsus',
    'where-your-paycheck-goes-taxes-h1b',
  ],
  'moving-back-checklist': [
    'us-401k-moving-back-to-india',
    'sell-rsus-moving-back-india-2026',
    'rnor-status-returning-nri-2026',
    'us-exit-tax-green-card-india-2026',
    'backdoor-roth-h-1b-india-does-with-it',
  ],
  'founder-checklist': [
    'c-corp-vs-corp-when-owner-is-nonresident',
    'corp-vs-llc-founders-h-1b-or-green',
    'does-llc-with-no-income-have-file',
    'form-2553-electing-corp-status-relief-if-missed',
    'form-5472-llc-owned-by-founder-india',
    'form-7004-partnerships-corps-first-time-penalty-abatement',
    'qsbs-immigrant-founders-2026',
  ],
  'india-accounts-checklist': [
    'form-3520-gifts-inheritance-from-parents-india',
    'parents-sent-money-for-house-us-reporting',
    'nri-india-income-us-tax-return',
    'fbar-form-8938-indian-accounts',
    'file-fbar-indian-bank-accounts-step-by-step',
    'form-8938-indian-assets-ppf-epf-mutual-funds',
    'form-8621-indian-mutual-funds-file-it-costs',
    'delinquent-fbar-prior-years-nri',
    'streamlined-filing-compliance-nri',
    'streamlined-foreign-offshore-procedures-nris-who-moved-back',
  ],
}

function matchedOffer(slug: string): OfferId | null {
  for (const [id, slugs] of Object.entries(TOPICS)) {
    if (slugs?.includes(slug)) return id as OfferId
  }
  return null
}

/** Safe for the prerender: depends only on the slug. */
export function isGatedPost(slug: string): boolean {
  return GATE_ROLLOUT.includes(slug)
}

/** Lets `?gate=preview` show the gate on any post, in dev or a preview build only. */
export function isGatePreview(): boolean {
  const allowed = import.meta.env.DEV || import.meta.env.VITE_GATE_PREVIEW === 'true'
  return allowed && new URLSearchParams(window.location.search).get('gate') === 'preview'
}

/** `bucket` is the visitor's stable A/B bucket: 'a' is matched, 'b' is general. */
export function chooseOffer(slug: string, bucket: 'a' | 'b'): { offer: Offer; topic: string; arm: string } {
  const matched = matchedOffer(slug)
  const topic = matched ?? 'general'
  if (!matched) return { offer: OFFERS[GENERAL_OFFER], topic, arm: 'general-only' }
  return bucket === 'a'
    ? { offer: OFFERS[matched], topic, arm: 'matched' }
    : { offer: OFFERS[GENERAL_OFFER], topic, arm: 'general' }
}

const UNLOCK_KEY = 'lsr_gate_unlocked'

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

export function rememberUnlock() {
  try {
    localStorage.setItem(UNLOCK_KEY, '1')
  } catch {
    // Private mode: the reader sees the gate again on the next post.
  }
}

/** Set on <html> while the gate is on screen (see components/EmailGate.tsx). */
export const GATE_OPEN_CLASS = 'lesser-gate-open'

export function isGateOpen(): boolean {
  return document.documentElement.classList.contains(GATE_OPEN_CLASS)
}
