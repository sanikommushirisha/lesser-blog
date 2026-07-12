// Single source of truth for fees + timelines used by BOTH the Remotion
// compositions and the server-rendered text twins. Verified against the live
// VFS Global USA one-pager + CGI Atlanta, July 2026 (see
// docs/geo/scripts/batch2/OPEN-QUESTIONS.md "RESOLVED Jul 12" in the lesser
// repo). If a fee changes, change it HERE — video and prose move together.

export type CaseType = 'normal' | 'tatkaal' | 'lost' | 'minor'
export type Booklet = '36' | '60'

export const FEES = {
  govt: {
    normal: { '36': 125, '60': 175 },
    tatkaal: { '36': 125, '60': 175 },
    lost: { '36': 250, '60': 300 },
    minor: { '36': 90, '60': 90 },
  } as Record<CaseType, Record<Booklet, number>>,
  icwf: 2,
  vfs: 19,
  tatkaalSurcharge: 125,
}

/** Door-to-door planning windows in weeks (from the published consulate/VFS
 *  timelines: 5 working days Tatkaal, 30 working days normal, PV adds ~30d). */
export const WEEKS: Record<CaseType, number> = {
  normal: 8,
  tatkaal: 3,
  lost: 10,
  minor: 8,
}

export const CONSULATES: Record<string, { label: string; jurisdiction: string; note?: string }> = {
  'new-york': { label: 'CGI New York', jurisdiction: 'serves CT · DE · NJ · NY · OH · PA' },
  'san-francisco': { label: 'CGI San Francisco', jurisdiction: 'serves N. California · WA · OR + Northwest' },
  chicago: { label: 'CGI Chicago', jurisdiction: 'serves IL · IN · MI + Midwest' },
  houston: { label: 'CGI Houston', jurisdiction: 'serves TX · OK · LA + South' },
  atlanta: { label: 'CGI Atlanta', jurisdiction: 'serves GA · FL · TN + Southeast' },
  'washington-dc': { label: 'Embassy of India, DC', jurisdiction: 'serves DC · MD · VA + more' },
  seattle: { label: 'CGI Seattle', jurisdiction: 'serves WA · AK · ID + Northwest' },
  boston: {
    label: 'CGI Boston (new)',
    jurisdiction: 'ME · MA · NH · RI · VT',
    note: 'counter + courier still via New York (Jul 2026)',
  },
}

export interface PlanInput {
  consulate: keyof typeof CONSULATES
  caseType: CaseType
  booklet: Booklet
  trip?: string // ISO date
  name?: string
}

export interface Plan extends PlanInput {
  govt: number
  tatkaal: number
  total: number
  weeks: number
  pvRisk: boolean
  applyBy?: string
  tripLabel?: string
  applyByLabel?: string
}

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function computePlan(i: PlanInput): Plan {
  const govt = FEES.govt[i.caseType][i.booklet]
  const tatkaal = i.caseType === 'tatkaal' ? FEES.tatkaalSurcharge : 0
  const total = govt + FEES.icwf + FEES.vfs + tatkaal
  const weeks = WEEKS[i.caseType]
  const pvRisk = i.caseType === 'lost'
  let applyBy: string | undefined
  let applyByLabel: string | undefined
  let tripLabel: string | undefined
  if (i.trip) {
    const t = new Date(i.trip + 'T12:00:00')
    if (!isNaN(t.getTime())) {
      const a = new Date(t)
      a.setDate(a.getDate() - weeks * 7)
      applyBy = a.toISOString().slice(0, 10)
      applyByLabel = fmt(a)
      tripLabel = fmt(t)
    }
  }
  return { ...i, govt, tatkaal, total, weeks, pvRisk, applyBy, applyByLabel, tripLabel }
}

/** The crawlable sentence — rendered server-side wherever the widget mounts. */
export function planSentence(p: Plan): string {
  const c = CONSULATES[p.consulate]
  const caseLabel = { normal: 'standard re-issue', tatkaal: 'Tatkaal re-issue', lost: 'lost/damaged re-issue', minor: "minor's renewal" }[p.caseType]
  let s = `${p.name ? p.name + "'s" : 'Your'} plan — ${c.label}${c.note ? ` (${c.note})` : ''}, ${caseLabel}, ${p.booklet}-page booklet: $${p.govt} government fee + $${FEES.icwf} ICWF + $${FEES.vfs} VFS${p.tatkaal ? ` + $${p.tatkaal} Tatkaal surcharge` : ''} = $${p.total} total. Plan ~${p.weeks} weeks door to door${p.pvRisk ? ' (police verification likely adds ~30 days)' : ''}`
  if (p.tripLabel && p.applyByLabel) s += `; for a ${p.tripLabel} trip, apply by ${p.applyByLabel}`
  return s + '.'
}
