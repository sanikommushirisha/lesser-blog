// Pre-renders the warm renewal combos to 9:16 MP4s (+ poster stills) on
// Remotion Lambda and regenerates src/pages/renewalVideos.generated.ts.
//
// One-time / on-demand tooling — run when the RenewalTimeline composition or
// fees change. ~64 combos x ~$0.003 ≈ $0.19 total. Sequential so we never
// exceed the account Lambda concurrency (each render already fans out ~25 λ).
//
//   npx tsx scripts/render-renewal-videos.ts            # all 64 combos
//   npx tsx scripts/render-renewal-videos.ts --limit 2  # smoke a couple
//   npx tsx scripts/render-renewal-videos.ts --only new-york-normal-36
//
// Requires AWS creds: either exported (AWS_ACCESS_KEY_ID/SECRET/REGION) or in
// ~/.claude/secrets/aws-remotion.env (REMOTION_AWS_* names).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getFunctions,
  getSites,
  renderMediaOnLambda,
  renderStillOnLambda,
  getRenderProgress,
} from '@remotion/lambda/client'
import { computePlan } from '../src/motion/constants'
import { allCombos, comboSlug, parseComboSlug } from '../src/motion/combos'
import type { RenewalVideoMeta } from '../src/pages/renewalVideos.generated'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE_NAME = 'lesser-blog-motion'
const COMPOSITION = 'renewal-timeline-portrait'
const OUT = path.join(__dirname, '../src/pages/renewalVideos.generated.ts')
const DURATION_LABEL = '0:18'
const DURATION_ISO = 'PT18S'

function loadCreds() {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return { region: process.env.AWS_REGION || process.env.REMOTION_AWS_REGION || 'us-east-1' }
  }
  const envFile = path.join(os.homedir(), '.claude/secrets/aws-remotion.env')
  const txt = fs.readFileSync(envFile, 'utf8')
  const get = (k: string) => txt.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1]?.trim()
  process.env.AWS_ACCESS_KEY_ID = get('REMOTION_AWS_ACCESS_KEY_ID')
  process.env.AWS_SECRET_ACCESS_KEY = get('REMOTION_AWS_SECRET_ACCESS_KEY')
  const region = get('REMOTION_AWS_REGION') || 'us-east-1'
  process.env.AWS_REGION = region
  return { region }
}

async function main() {
  const { region } = loadCreds() as { region: 'us-east-1' }
  const args = process.argv.slice(2)
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
  const limit = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : null

  const [fn] = await getFunctions({ region, compatibleOnly: true })
  if (!fn) throw new Error('No Remotion Lambda function deployed — run `remotion lambda functions deploy`.')
  const sites = await getSites({ region })
  const site = sites.sites.find((s) => s.id === SITE_NAME)
  if (!site) throw new Error(`Site "${SITE_NAME}" not found — run \`remotion lambda sites create remotion/index.ts --site-name=${SITE_NAME}\`.`)
  const serveUrl = site.serveUrl
  console.log(`function=${fn.functionName}\nserveUrl=${serveUrl}\nregion=${region}\n`)

  let combos = only ? [parseComboSlug(only)].filter(Boolean).map((c) => c!) : allCombos()
  if (limit) combos = combos.slice(0, limit)
  console.log(`Rendering ${combos.length} combo(s)…\n`)

  const uploadDate = new Date().toISOString().slice(0, 10)
  const registry: Record<string, RenewalVideoMeta> = {}

  for (const key of combos) {
    const slug = comboSlug(key)
    const plan = computePlan(key) // no trip/name — the shared MP4 is generic
    process.stdout.write(`• ${slug} … `)

    const still = await renderStillOnLambda({
      region, functionName: fn.functionName, serveUrl,
      composition: COMPOSITION, inputProps: { plan },
      imageFormat: 'png', frame: 300, privacy: 'public',
    })

    const { renderId, bucketName } = await renderMediaOnLambda({
      region, functionName: fn.functionName, serveUrl,
      composition: COMPOSITION, inputProps: { plan },
      codec: 'h264', privacy: 'public', downloadBehavior: { type: 'play-in-browser' },
    })
    let outputFile = ''
    for (;;) {
      const p = await getRenderProgress({ renderId, bucketName, functionName: fn.functionName, region })
      if (p.fatalErrorEncountered) throw new Error(`Render ${slug} failed: ${p.errors?.[0]?.message}`)
      if (p.done) { outputFile = p.outputFile!; break }
      await new Promise((r) => setTimeout(r, 2000))
    }

    registry[slug] = {
      slug, mp4: outputFile, poster: still.url,
      duration: DURATION_ISO, durationLabel: DURATION_LABEL, uploadDate,
      width: 1080, height: 1920,
    }
    console.log('done')
  }

  // Merge with any existing entries so a --limit/--only run doesn't drop others.
  let existing: Record<string, RenewalVideoMeta> = {}
  try {
    const mod = await import(OUT + '?t=' + Date.now())
    existing = mod.RENEWAL_VIDEOS ?? {}
  } catch { /* first run */ }
  const merged = { ...existing, ...registry }
  const ordered = Object.fromEntries(Object.keys(merged).sort().map((k) => [k, merged[k]]))

  const body = `// AUTO-GENERATED by scripts/render-renewal-videos.ts — do not edit by hand.
// Maps each warm combo slug (consulate-caseType-booklet) to its pre-rendered
// 9:16 MP4 on S3. Empty entries fall back to the live in-browser <Player>.
export interface RenewalVideoMeta {
  slug: string
  mp4: string
  poster: string
  duration: string // ISO 8601
  durationLabel: string
  uploadDate: string
  width: number
  height: number
}

export const RENEWAL_VIDEOS: Record<string, RenewalVideoMeta> = ${JSON.stringify(ordered, null, 2)}
`
  fs.writeFileSync(OUT, body)
  console.log(`\nWrote ${OUT} (${Object.keys(ordered).length} combos)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
