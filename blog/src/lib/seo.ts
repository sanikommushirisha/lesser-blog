// Title and description rules for search results, shared by every blog page.
// The marketing site follows the same ones (shared/page-meta.ts at the repo
// root): titles end "| Lesser Tax" and stay within 60 characters, descriptions
// within 160, and no em-dashes in either.

export const BRAND = 'Lesser Tax'
const SUFFIX = ` | ${BRAND}`
const TITLE_MAX = 60
const DESCRIPTION_MAX = 160

/** The organization defined on lesser.tax's home page (its JSON-LD @id). */
export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': 'https://lesser.tax/#organization',
  name: BRAND,
  url: 'https://lesser.tax/',
  logo: { '@type': 'ImageObject', url: 'https://lesser.tax/blog/logo.png' },
}

/** "A — B" -> "A: B". Editors write dashes; the copy rules do not allow them. */
function noEmDash(s: string): string {
  return s.replace(/\s*—\s*/g, ': ').replace(/:\s*:/g, ':').trim()
}

/** "<topic> | Lesser Tax" when it fits in 60 characters, else the topic alone. */
export function pageTitle(topic: string): string {
  const t = noEmDash(topic)
  return t.length + SUFFIX.length <= TITLE_MAX ? `${t}${SUFFIX}` : t
}

/**
 * At most 160 characters: ends at the last full sentence when that keeps
 * enough of it, otherwise at a word boundary with an ellipsis.
 */
export function pageDescription(text: string | undefined | null): string {
  const d = noEmDash((text ?? '').replace(/\s+/g, ' '))
  if (d.length <= DESCRIPTION_MAX) return d
  const cut = d.slice(0, DESCRIPTION_MAX)
  const sentence = cut.lastIndexOf('. ')
  if (sentence >= 110) return cut.slice(0, sentence + 1)
  return `${cut.slice(0, cut.lastIndexOf(' ', DESCRIPTION_MAX - 1)).replace(/[,;:]$/, '')}…`
}
