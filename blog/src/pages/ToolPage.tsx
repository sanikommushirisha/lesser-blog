import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { TOOLS, TOOLS_LIVE, type Tool } from '../tools/catalog'
import { asset } from '../lib/base'

const SITE = 'https://lesser.tax/blog'
const OG_IMAGE = `${SITE}/logo.png`

// Each app is its own chunk, so blog readers never download them. The apps are
// plain DOM code: they fill the empty boxes below after the page has loaded.
const APPS: Record<string, () => Promise<{ default: () => void }>> = {
  'tax-estimator': () => import('../tools/apps/estimator.js'),
  'rsu-tax-planner': () => import('../tools/apps/rsu.js'),
  'tax-residency-report': () => import('../tools/apps/residency.js'),
  'money-from-india-report': () => import('../tools/apps/money.js'),
  '401k-exit-planner': () => import('../tools/apps/exit.js'),
  'founder-filing-calendar': () => import('../tools/apps/founder.js'),
}

function useToolApp(tool: Tool | undefined) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!tool) return
    let stale = false
    Promise.all([APPS[tool.slug](), import('../tools/engine.js')])
      .then(([app, engine]) => {
        if (stale) return
        engine.setCampaign(tool.campaign)
        engine.setLive(TOOLS_LIVE)
        app.default()
      })
      .catch(() => {
        if (!stale) setFailed(true)
      })
    return () => {
      stale = true
    }
  }, [tool])
  return failed
}

export function ToolPage({ slug }: { slug: string }) {
  const tool = TOOLS.find((t) => t.slug === slug)
  const failed = useToolApp(tool)

  if (!tool) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <Helmet>
          <title>Tool not found | Lesser Tax</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1 className="text-3xl">We could not find that tool</h1>
        <p className="mt-3">
          <Link to="/" className="underline">
            Read our tax guides for Indians in the US
          </Link>
        </p>
      </main>
    )
  }

  const canonical = `${SITE}/tools/${tool.slug}`
  return (
    // ph-no-capture: session recordings hide typed fields but not text on the
    // page, and this page shows people's income and tax figures.
    <main className="tool-app ph-no-capture">
      {/* precedence: React moves it into <head>, so the page never shows unstyled. */}
      <link rel="stylesheet" href={asset('/tools/tools.css')} precedence="tools" />
      <Helmet>
        <title>{tool.seoTitle}</title>
        <meta name="description" content={tool.seoDescription} />
        <link rel="canonical" href={canonical} />
        {!TOOLS_LIVE && <meta name="robots" content="noindex" />}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={tool.seoTitle} />
        <meta property="og:description" content={tool.seoDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={tool.seoTitle} />
        <meta name="twitter:description" content={tool.seoDescription} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>

      <div className="band">
        <div className="wrap">
          {!TOOLS_LIVE && (
            <div className="topbar">
              <span className="review">Review version. Under tax review. Nothing is saved or sent.</span>
            </div>
          )}
          <div className="hero">
            <div>
              <span className="eyebrow">{tool.eyebrow}</span>
              <h1>{tool.heading}</h1>
              <p>{tool.lede}</p>
            </div>
            <div className="trust">
              {tool.trust.map(([title, note]) => (
                <div key={title}>
                  <strong>{title}</strong>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="paths">
            <div className="path on">
              <span className="tag">YOU ARE HERE</span>
              <strong>{tool.thisPath[0]}</strong>
              <p>{tool.thisPath[1]}</p>
            </div>
            <div className="path off">
              <strong>{tool.otherPath[0]}</strong>
              <p>{tool.otherPath[1]}</p>
              {/* The app replaces this with the plan that fits the answers. */}
              <a id="pathcta" href="/#pricing">
                See our plans
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="main">
          <div className="card" id="flowcard">
            {failed && <p className="tool-error">This tool did not load. Refresh the page to try again.</p>}
            <div className="stepper" id="stepper" />
            <div id="flow" />
            <div className="mobilebar" id="mobilebar" hidden />
          </div>
          <aside id="side" />
        </div>
        <footer className="foot">
          <nav aria-label="Related pages" className="tool-related">
            {tool.related.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          Educational only. Not tax or legal advice. Your situation may differ, so check with a qualified tax
          professional before acting.
        </footer>
      </div>
    </main>
  )
}
