# UI/UX Design Spec — Blog

**Reference:** https://blog.rally.tax/t/blogs (matched closely, adapted to brand)
**Date:** June 10, 2026

---

## 1. Design principles

- **Editorial calm:** generous whitespace, single-column feed, no sidebar clutter — the reference reads like a curated publication, not a content farm.
- **Scannability:** image → category → title → meta, in that visual order on every card.
- **Zero dead-ends:** every page links back to the feed; post pages end with "more articles."

## 2. Design tokens — extracted from lesser.tax production CSS (June 10, 2026)

The blog reuses lesser.tax's shadcn/ui-style HSL token system verbatim:

| Token | Light value | Resolved | Usage |
|---|---|---|---|
| `--primary` / `--ring` | `230 93% 54%` | `#1C41F7` | brand blue — CTAs, links, category chips |
| `--background` | `0 0% 100%` | `#FFFFFF` | page background |
| `--foreground` | `222 47% 11%` | `#111827` | headlines, body text |
| `--muted-foreground` | `215 16% 47%` | `#6B7280` | excerpts, dates, meta |
| `--border` / `--input` | `214 32% 91%` | `#E2E8F0` | hairline dividers |
| `--secondary` | `230 40% 96%` | `#F1F2FC` | chip/tag backgrounds |
| `--muted` | `230 20% 96%` | `#F3F4F8` | surfaces, hover fills |
| `--card` | `0 0% 100%` | `#FFFFFF` | card backgrounds |
| `--radius` | `0.5rem` | 8px base | `rounded-lg` ≈ 9px, `rounded-xl` 12px for images |
| Font sans & serif | `"Roboto", ui-sans-serif, system-ui` | — | all type (Google Fonts, variable weight) |
| Font mono | `Menlo, monospace` | — | code blocks |
| Hover/darker blue | — | `#1533C5` | link hover, pressed CTAs |

Dark-mode token set also exists on lesser.tax (`--background: 222 47% 6%` etc.) — carried over so the blog inherits dark mode if enabled later.

| Layout | Value |
|---|---|
| Max content width | 720px (feed & article body), 1100px (nav/footer) |
| Headings | Roboto 600–700, letter-spacing -0.02em |
| Body | Roboto 400, 16–18px, line-height 1.7 |

## 3. Page: Blog listing (`/blog`)

```
┌────────────────────────────────────────────┐
│  NAV  logo · Why Us · Pricing · [Get Started]│
├────────────────────────────────────────────┤
│                                            │
│   Blogs                       ← H1, 40/48px │
│   ─────                                     │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  [ featured image 16:9, rounded ]    │  │
│  │  ● Tax Strategy          ← chip      │  │
│  │  How RSU holders saved $42k…  ← H2   │  │
│  │  Feb 9, 2026 · 8 min read            │  │
│  │  (◯) Hemant Gangolia                 │  │
│  └──────────────────────────────────────┘  │
│                 24px gap                    │
│  ┌──────────────────────────────────────┐  │
│  │  …next card…                          │  │
│  └──────────────────────────────────────┘  │
│                                            │
├────────────────────────────────────────────┤
│  FOOTER  quick links · legal · socials      │
└────────────────────────────────────────────┘
```

**Card anatomy (top→bottom):**
1. Featured image — 16:9, `border-radius: 16px`, lazy-loaded, subtle zoom on hover (1.03, 300ms ease-out).
2. Category chip — accent text on tinted pill, 12px uppercase, 8px above title.
3. Title — 24–28px / 600, max 2 lines (ellipsis), darkens to accent on hover.
4. Meta row — `Feb 9, 2026 · 8 min read`, 14px secondary.
5. Author row — 32px circular avatar + name, 14px medium.

**Whole card is one link** (post URL); 24–32px vertical rhythm between cards. Single column at all breakpoints (per reference) — feed column 720px centered.

**States:** hover (image zoom + title color), focus-visible (2px accent outline ring), empty state ("New articles coming soon" + illustration), skeleton shimmer while loading (3 placeholder cards).

## 4. Page: Post detail (`/blog/[slug]`)

Order, single 720px column:
1. **Breadcrumb / back link:** `← All articles` (top-left, secondary).
2. **Category chip** → **Title (H1, 36–44px)** → **meta row** (date · read time) → **author block** (40px avatar, name, role).
3. **Hero image** 16:9 rounded, `priority` load.
4. **Body** (Portable Text): H2 28px / H3 22px, paragraphs 18px/1.7, blockquotes with 3px accent left-border, inline images full-column-width with optional caption (14px secondary, centered), code blocks dark surface with 14px mono, links accent + underline-on-hover.
5. **End-of-article:** divider → author bio card → **"Keep reading"** — 3 latest other posts as compact cards (thumb left 96px, title + date right).

## 5. Responsive behavior

| Breakpoint | Changes |
|---|---|
| ≥1024px | as specified |
| 640–1023px | column padding 24px; nav collapses extra links to menu |
| <640px | H1 32px, card title 20px, body 16px; padding 16px; tap targets ≥44px; "Keep reading" thumbs stack above titles |

## 6. Accessibility

- Semantic structure: `<main>`, `<article>`, one `<h1>` per page, cards as `<li>` in `<ul>`.
- All images require alt text (enforced in Sanity schema).
- Color contrast ≥ 4.5:1 (tokens above pass on white).
- Full keyboard navigation; visible focus rings; skip-to-content link.
- Dates in `<time datetime="">`.

## 7. Motion

- Card hover zoom + 150ms color transitions only. No scroll-jacking.
- `prefers-reduced-motion`: disable zoom/transitions.

## 8. Editor UX (Sanity Studio)

- Studio nav shows three clean sections: **Posts / Authors / Categories**.
- Post form ordered to mirror the page: Title → Slug (auto) → Excerpt (with live character count) → Main image → Category → Author → Body → SEO (collapsed group).
- Validation messages in plain language ("Add a short summary — it shows on the blog card").
- "Open preview" button on every draft → live site preview in Draft Mode.
- One-page editor cheat-sheet delivered at handoff (write → preview → publish in 3 steps).
