// Lightweight event beacon for the motion experiments. Insert-only Supabase
// table (`blog_events`, RLS: anon INSERT only) so the Friday loop can query
// funnels: seen → open → play → complete → share, split by concept/placement/
// variant. Fire-and-forget; failures never affect the reader.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function visitorId(): string {
  try {
    const k = 'lsr_vid'
    let v = localStorage.getItem(k)
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem(k, v)
    }
    return v
  } catch {
    return 'anon'
  }
}

/** Stable A/B bucket per visitor: 'a' | 'b'. */
export function abVariant(experiment: string): 'a' | 'b' {
  const v = visitorId() + experiment
  let h = 0
  for (let i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) | 0
  return (h & 1) === 0 ? 'a' : 'b'
}

export function track(
  event: string,
  data: { concept: string; slug: string; placement?: string; variant?: string; meta?: Record<string, unknown> }
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return
  try {
    const body = JSON.stringify({
      event,
      concept: data.concept,
      slug: data.slug,
      placement: data.placement ?? null,
      variant: data.variant ?? null,
      visitor: visitorId(),
      meta: data.meta ?? {},
    })
    const url = `${SUPABASE_URL}/rest/v1/blog_events`
    // sendBeacon can't set headers; use keepalive fetch instead.
    fetch(url, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body,
    }).catch(() => {})
  } catch {
    /* never break the page over analytics */
  }
}
