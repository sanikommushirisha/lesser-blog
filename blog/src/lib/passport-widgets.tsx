// Free passport form widgets in the passport posts (LD-77): which widget goes
// in which post, at the end of which H2 section, with which preset. Rules from
// the handoff, applied to the posts' real H2s (checked 17 Nov 2026):
// - pillar, guides and situation posts: packet builder (city guides preset by
//   ZIP, plus the government form answers under the step-by-step H2)
// - Passport Seva vs VFS, VFS process walkthrough: government form answers
// - documents checklist: forms picker
// - timeline, USA vs India, photo rules, both police verification posts: inline card
// - lost passport (7), name change after marriage (6 + 5), the 3 minor posts
//   (8; 9 where one parent can't consent): single form
// - OCI posts and the surrender post: none (nothing to fill)
// A new passport post: packet builder under its documents H2, or a single
// form when it is about one annexure.

import type { ReactNode } from 'react'
import { FormsPicker, GovFormAnswers, InlineCard, PacketBuilder, SingleForm, type Preset } from '../../../shared/passport-forms/ui'

export type PassportWidget =
  | { after: RegExp; widget: 'packet' | 'picker' | 'gov' | 'inline'; preset?: Preset }
  | { after: RegExp; widget: 'single'; form: string; preset?: Preset }

const DOCS = /^What documents do I need/i
const STEPS = /^Step-by-step/i

/** A city guide: packet builder (consulate preset by ZIP) under documents, government answers under step-by-step. */
const city = (zip: string, docs: RegExp = DOCS): PassportWidget[] => [
  { after: docs, widget: 'packet', preset: { zip } },
  { after: STEPS, widget: 'gov', preset: { zip } },
]

export const PASSPORT_WIDGETS: Record<string, PassportWidget[]> = {
  // City guides (11)
  'indian-passport-renewal-atlanta': city('30303'),
  'indian-passport-renewal-boston': city('02108'),
  'indian-passport-renewal-chicago': city('60601'),
  'indian-passport-renewal-dallas': city('75201'),
  'indian-passport-renewal-houston': city('77002'),
  'indian-passport-renewal-los-angeles': city('90012'),
  'indian-passport-renewal-new-jersey': city('07302', /^Document checklist for NJ/i),
  'indian-passport-renewal-new-york': city('10017'),
  'indian-passport-renewal-san-francisco': city('94103'),
  'indian-passport-renewal-seattle': city('98101'),
  'indian-passport-renewal-washington-dc': city('20001'),
  // Pillar, guides and situation posts (7)
  'indian-passport-renewal-usa': [{ after: /^Documents: the short list/i, widget: 'packet' }],
  'address-proof-indian-passport-renewal-usa': [{ after: /^Full address proof checklist/i, widget: 'packet' }],
  'indian-passport-expired-in-usa': [{ after: /^How do you renew an expired/i, widget: 'packet' }],
  'indian-passport-renewal-fees-usa': [{ after: /^What is the total cost by scenario/i, widget: 'packet' }],
  'tatkaal-passport-renewal-usa-eligibility': [{ after: /^The Tatkaal process from the USA/i, widget: 'packet', preset: { speed: 'tatkal' } }],
  'vfs-passport-application-on-hold': [{ after: /^Why was my application held/i, widget: 'packet' }],
  'worth-paying-indian-passport-renewal-service': [{ after: /^What does DIY actually cost/i, widget: 'packet' }],
  // Government form answers (2)
  'passport-seva-vs-vfs-global-usa': [{ after: /^The exact sequence: government form/i, widget: 'gov' }],
  'vfs-global-indian-passport-renewal-process': [{ after: /^Step 1: the Passport Seva form/i, widget: 'gov' }],
  // Forms picker (1)
  'indian-passport-renewal-documents-checklist': [{ after: /^Which Annexures do I need/i, widget: 'picker' }],
  // Inline card (5)
  'indian-passport-renewal-timeline-usa': [{ after: /^Stage-by-Stage Timeline/i, widget: 'inline' }],
  'renew-indian-passport-in-usa-or-india': [{ after: /^Cost comparison/i, widget: 'inline' }],
  'indian-passport-photo-requirements-usa': [{ after: /^Full VFS USA Photo Checklist/i, widget: 'inline' }],
  'police-verification-delays-nri-passport': [{ after: /^When does police verification get triggered/i, widget: 'inline' }],
  'police-verification-nri-passport-reissue': [{ after: /^When is police verification triggered/i, widget: 'inline' }],
  // Single form (5 posts)
  'lost-indian-passport-usa': [{ after: /^Annexure F or Annexure L/i, widget: 'single', form: 'annexf', preset: { cond: 'lost' } }],
  'indian-passport-name-change-after-marriage': [
    { after: /^Which annexure is the joint photo declaration/i, widget: 'single', form: 'annexj', preset: { changes: ['spouse', 'name'] } },
    { after: /^Do I need newspaper ads/i, widget: 'single', form: 'namechange', preset: { changes: ['spouse', 'name'] } },
  ],
  'minor-indian-passport-renewal-usa': [
    { after: /^How to fill Annexure D, field by field/i, widget: 'single', form: 'annexd', preset: { who: 'minor' } },
    { after: /^Can I renew with only one parent/i, widget: 'single', form: 'annexc', preset: { who: 'minor', both: 'no' } },
  ],
  'annexure-d-indian-passport-guide': [
    { after: /^How to fill Annexure D, field by field/i, widget: 'single', form: 'annexd', preset: { who: 'minor' } },
    { after: /^Both-parent signature rules/i, widget: 'single', form: 'annexc', preset: { who: 'minor', both: 'no' } },
  ],
  'indian-passport-for-us-born-child': [{ after: /^Documents Checklist: What You Will Need/i, widget: 'single', form: 'annexd', preset: { who: 'minor' } }],
}

/** The widget for one placement. `source` (the post slug) tags its analytics. */
export function renderPassportWidget(w: PassportWidget, slug: string, i: number): ReactNode {
  const id = `pf-${i}`
  switch (w.widget) {
    case 'packet':
      return <PacketBuilder key={id} id={id} preset={w.preset} source={slug} />
    case 'picker':
      return <FormsPicker key={id} id={id} preset={w.preset} source={slug} />
    case 'gov':
      return <GovFormAnswers key={id} id={id} preset={w.preset} source={slug} />
    case 'inline':
      return <InlineCard key={id} preset={w.preset} source={slug} />
    case 'single':
      return <SingleForm key={id} id={id} form={w.form} preset={w.preset} source={slug} />
  }
}
