// Body sectioning for the editorial post layout (design system v2).
//
// Existing posts already carry these sections as plain Portable Text (a
// "Key takeaways" line + bullets, FAQ h2s with h3 questions, a Sources h2
// with bullet links). This module detects and lifts them so the renderer can
// give each its editorial treatment without re-authoring anything in Sanity.
// Detection is conservative: anything unrecognized stays in `main` and renders
// exactly as before.

export type Span = { _key?: string; text: string; marks?: string[] }
export type Block = {
  _key: string
  _type: string
  style?: string
  listItem?: string
  children?: Span[]
  markDefs?: { _key: string; _type: string; href?: string }[]
  [k: string]: unknown
}

export const blockText = (b: Block): string => (b.children ?? []).map((c) => c.text).join('')

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

export interface FaqItem {
  id: string
  question: string
  answer: Block[]
}

export interface SourceChip {
  label: string
  href?: string
  /** the bullet's text with the raw URL stripped — "what this source verifies" */
  text: string
}

export interface Sections {
  quickAnswer: Block | null
  takeaways: Block[]
  main: Block[]
  faq: FaqItem[]
  sources: { count: number; chips: SourceChip[]; closer: string | null } | null
  toc: { id: string; label: string }[]
}

const isH2 = (b: Block) => b._type === 'block' && b.style === 'h2'
const isH3 = (b: Block) => b._type === 'block' && b.style === 'h3'
const isBullet = (b: Block) => b._type === 'block' && b.listItem === 'bullet'

const FAQ_H2 = /^(faq|frequently asked|common questions)/i

/** A question inside an FAQ section: an h3, or a fully-bold short paragraph
 *  ending in "?" (the format the city guides use). */
function isFaqQuestion(b: Block): boolean {
  if (isH3(b)) return true
  if (b._type !== 'block' || b.style !== 'normal' || b.listItem) return false
  const spans = (b.children ?? []).filter((c) => c.text.trim())
  if (!spans.length) return false
  const text = blockText(b).trim()
  return text.endsWith('?') && text.length < 160 && spans.every((c) => (c.marks ?? []).includes('strong'))
}

/** The third authoring format: one paragraph whose leading bold run is the
 *  question ("Q?") and whose remaining spans are the answer. Returns the
 *  question text and a synthesized answer block, or null. */
function splitBoldLeadQA(b: Block): { question: string; answerBlock: Block } | null {
  if (b._type !== 'block' || b.style !== 'normal' || b.listItem) return null
  const spans = b.children ?? []
  let qEnd = 0
  while (qEnd < spans.length && (spans[qEnd].marks ?? []).includes('strong')) qEnd += 1
  if (qEnd === 0 || qEnd >= spans.length) return null
  const question = spans
    .slice(0, qEnd)
    .map((c) => c.text)
    .join('')
    .trim()
  if (!question.endsWith('?') || question.length > 200) return null
  return {
    question,
    answerBlock: { ...b, _key: `${b._key}-a`, children: spans.slice(qEnd) },
  }
}
const SOURCES_H2 = /^sources/i
const URL_RE = /https?:\/\/[^\s)]+/

const DOMAIN_RE = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:gov(?:\.in)?|com|org|in|net)\b/i

function cleanText(text: string): string {
  return text
    .replace(URL_RE, '')
    .replace(/\(\s*[a-z0-9-]+(?:\.[a-z0-9-]+)+[^)]*\)/gi, '') // "(domain/path)" — the pill already shows it
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.:;])/g, '$1')
    .replace(/[,:;\s]+$/, '')
    .trim()
}

function sourceChip(b: Block): SourceChip | null {
  const text = blockText(b)
  const linkDef = (b.markDefs ?? []).find((m) => m.href)
  const url = linkDef?.href ?? URL_RE.exec(text)?.[0]
  if (url) {
    try {
      return { label: new URL(url).hostname.replace(/^www\./, ''), href: url, text: cleanText(text) }
    } catch {
      /* fall through to domain detection */
    }
  }
  const domain = DOMAIN_RE.exec(text)?.[0]
  return domain ? { label: domain.replace(/^www\./, ''), text: cleanText(text) } : null
}

export function splitBody(body: Block[]): Sections {
  const main: Block[] = []
  const faq: FaqItem[] = []
  const takeaways: Block[] = []
  let quickAnswer: Block | null = null
  let sources: Sections['sources'] = null

  let i = 0
  while (i < body.length) {
    const b = body[i]
    const text = blockText(b).trim()

    if (!quickAnswer && b.style === 'blockquote' && /^quick answer:/i.test(text)) {
      quickAnswer = b
      i += 1
      continue
    }

    if (b._type === 'block' && !b.listItem && /^key takeaways$/i.test(text)) {
      i += 1
      while (i < body.length && isBullet(body[i])) {
        takeaways.push(body[i])
        i += 1
      }
      continue
    }

    if (isH2(b) && FAQ_H2.test(text)) {
      i += 1
      while (i < body.length && !isH2(body[i])) {
        const qa = splitBoldLeadQA(body[i])
        if (isFaqQuestion(body[i])) {
          const question = blockText(body[i]).trim()
          const answer: Block[] = []
          i += 1
          while (i < body.length && !isFaqQuestion(body[i]) && !splitBoldLeadQA(body[i]) && !isH2(body[i])) {
            answer.push(body[i])
            i += 1
          }
          faq.push({ id: slugify(question), question, answer })
        } else if (qa) {
          faq.push({ id: slugify(qa.question), question: qa.question, answer: [qa.answerBlock] })
          i += 1
        } else {
          main.push(body[i])
          i += 1
        }
      }
      continue
    }

    if (isH2(b) && SOURCES_H2.test(text)) {
      const chips: SourceChip[] = []
      let closer: string | null = null
      const sectionBlocks: Block[] = [b]
      i += 1
      while (i < body.length && !isH2(body[i])) {
        const sb = body[i]
        const st = blockText(sb).trim()
        sectionBlocks.push(sb)
        if (isBullet(sb)) {
          const chip = sourceChip(sb)
          if (chip) chips.push(chip)
        } else if (/last verified/i.test(st)) closer = st
        i += 1
      }
      if (chips.length) {
        sources = { count: chips.length, chips, closer }
      } else {
        // Not a link list we can turn into chips — leave the section inline.
        main.push(...sectionBlocks)
      }
      continue
    }

    main.push(b)
    i += 1
  }

  const toc = main
    .filter(isH2)
    .map((b) => ({ id: slugify(blockText(b)), label: blockText(b).trim() }))
  if (faq.length) toc.push({ id: 'faq', label: 'FAQ' })

  return { quickAnswer, takeaways, main, faq, sources, toc }
}
