// The warm-combo space for personalized renewal videos. The widget's inputs
// that CHANGE THE VIDEO are consulate x caseType x booklet = 8 x 4 x 2 = 64.
// (trip date + name are optional overlays; they ride in the interactive replay
// and the text twin, not the pre-rendered MP4.) So every share maps to one of
// these 64 pre-rendered videos — there is no cold path.
import { CONSULATES, type CaseType, type Booklet, type PlanInput } from './constants'

export const CASE_TYPES: CaseType[] = ['normal', 'tatkaal', 'lost', 'minor']
export const BOOKLETS: Booklet[] = ['36', '60']

export type ComboKey = Pick<PlanInput, 'consulate' | 'caseType' | 'booklet'>

/** Readable, stable slug: `new-york-normal-36`. Used as the /r/:combo path. */
export function comboSlug(i: ComboKey): string {
  return `${i.consulate}-${i.caseType}-${i.booklet}`
}

/** Inverse of comboSlug. Returns null for anything not in the warm set. */
export function parseComboSlug(slug: string): ComboKey | null {
  const booklet: Booklet | null = slug.endsWith('-36') ? '36' : slug.endsWith('-60') ? '60' : null
  if (!booklet) return null
  const rest = slug.slice(0, -3) // strip "-36" / "-60"
  const caseType = CASE_TYPES.find((c) => rest.endsWith('-' + c))
  if (!caseType) return null
  const consulate = rest.slice(0, -(caseType.length + 1))
  if (!(consulate in CONSULATES)) return null
  return { consulate: consulate as PlanInput['consulate'], caseType, booklet }
}

export function allCombos(): ComboKey[] {
  const out: ComboKey[] = []
  for (const consulate of Object.keys(CONSULATES) as (keyof typeof CONSULATES)[]) {
    for (const caseType of CASE_TYPES) {
      for (const booklet of BOOKLETS) {
        out.push({ consulate, caseType, booklet })
      }
    }
  }
  return out
}
