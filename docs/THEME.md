# Lesser brand theme — port notes

The marketing site and the blog were moved from the old blue/white/Roboto
theme onto the Lesser app's brand theme (warm cream page, one deep-teal
green, Plus Jakarta Sans). Source spec: `THEME_TRANSFER_GUIDE.md`.

This file records the decisions that the guide does not cover, the two
places where the guide's own numbers are wrong, and what is still open.

---

## 1. Two corrections to the transfer guide

The guide prints HSL triples alongside its brand hexes. Two of them do not
convert back to the hex they claim. The tokens in this repo use the exact
conversions, not the guide's values.

| Token | Guide says | Converts to | Exact value used here |
| --- | --- | --- | --- |
| Brand green `#034f46` | `161 98% 16%` | `#015137` — too green, blue channel off by 15 | **`173 93% 16%`** |
| Cream `#faf8f0` | `--lesser-cream: 45 33% 97%` | `#faf9f5` — too pink | **`48 50% 96%`** |

Note the guide contradicts itself on the cream: §4.2 calls `48 50% 96%`
"a hair warmer" than `#faf8f0`, but that triple *is* `#faf8f0` exactly,
and the `--lesser-cream` value is the approximation. Verified in-browser:
`getComputedStyle(document.body).backgroundColor === "rgb(250, 248, 240)"`.

A third, smaller one: the guide's `--success: 160 84% 39%` resolves to
`#10b77f` — essentially `#10b981`, which its own §4.6 lists as forbidden.
This repo uses `161 94% 30%` = `#059669`.

## 2. Why `globals.css` was not copy-pasted

The guide's §9 stylesheet is missing every token this codebase's UI
primitives depend on: `--elevate-1/2`, `--button-outline`, `--card-border`,
`--popover-border`, `--sidebar-*`, and the `*-border` fallback chain used by
the `hover-elevate` / `toggle-elevate` system. Pasting it over
`client/src/index.css` silently removes borders and hover states from all 47
shadcn primitives.

Instead the existing token *names* were kept and only their *values*
retuned, then the guide's new pieces were appended (`.glass-card`,
`.btn-primary-*`, `.font-eb-garamond`, `.bg-grain`, `.bg-dot-grid`).

## 3. Fonts are loaded, unlike in the source project

The guide flags (§3) that the app declares `--font-jakarta` but never loads
the font, so it silently falls back to `system-ui`. Both apps here load it
for real via Google Fonts:

- site: `client/index.html` `<link>` (replaced the Roboto link)
- blog: `@import` at the top of `blog/src/index.css`

`next/font` from §3 does not apply — neither app is Next.js.

## 4. The two Tailwind versions

| App | Tailwind | Theme lives in |
| --- | --- | --- |
| Marketing site | v3 (JS config) | `tailwind.config.ts` + `client/src/index.css` |
| Blog | v4 (`@tailwindcss/vite`) | `blog/src/index.css` `@theme inline` |

The guide is v3-only (its gotcha #11 says so). The blog's tokens were
hand-ported to v4 `@theme` syntax; there is no `tailwind.config.ts` for the
blog and adding one would not work.

**When changing a brand value, change it in both files.**

## 5. Deliberate deviations

- **`font-serif` is not a serif.** Both `sans` and `serif` point at Jakarta;
  `.font-serif` is the bold-display class (800 / -0.03em). Use
  `.font-eb-garamond` for the real serif. This matches the guide.
- **Legal pages keep 600-weight subheadings.** `privacy.tsx` and `terms.tsx`
  use `font-semibold` on their h2/h3s. Forcing those to 800 makes dense
  legal prose shout; the guide's own §5 allows 700 for the "subsection"
  role. The 194 display headings were upgraded to 800 + `-0.03em`.
- **Third-party brand colours were left alone**: the Google logo
  (`#4285F4 #34A853 #FBBC05 #EA4335`) in `google-reviews-section.tsx` and
  Infosys blue (`#007CC3`) in `infosys.tsx`. These are other companies'
  marks, not our palette.
- **Rainbow accent palettes were collapsed to a green depth ramp.**
  `google-reviews-section.tsx` and `nris.tsx` each carried a 6–7 colour
  hue rotation (blue/violet/amber/rose/cyan) for card variety. The
  two-green rule forbids this, so variety now comes from depth within the
  brand green: `#034f46 → #056b5e → #023d35 → #011f1a`. **Worth an
  eyeball** — those sections are visibly less varied than before.
- **The WhatsApp share button** in the blog lost its WhatsApp green
  (`#0d8a41` → `#034f46`). On-spec, but it is now less recognisable as a
  WhatsApp affordance. Revert that one line if the click-through drops.
- **Dark mode was retinted, not removed.** No theme toggle mounts `.dark`,
  so it never activates, but its blue values were swapped for greens so it
  is not a landmine if someone wires a toggle up later.
- **Remotion video compositions were recoloured** (`blog/src/motion/`) from
  navy/periwinkle to the brand dark-premium greens, and the video poster
  backgrounds in `WatchPage`/`RenewalWatchPage`/`Widgets` were changed to
  match. **Already-rendered MP4s are still navy** — they need a re-render
  to match the new page chrome.

## 6. The logo

There is no vector source for the mark in this repo, so the four raster
assets were recoloured directly. The two old brand colours were identical
across every file: `#1c41f7` (primary) and `#1d8896` (accent).

| File | Used by | Treatment |
| --- | --- | --- |
| `attached_assets/lesser_logo.png` | site nav, all 15 pages | recolour **+ white tile knocked out** (sits on cream) |
| `client/public/favicon.png` | site tab icon | recolour **+ tile changed white → cream** |
| `blog/public/favicon.png` | blog tab icon | recolour **+ tile changed white → cream** |
| `blog/public/logo.png` | blog nav + footer lockup | recolour only (already transparent) |

The favicons keep an **opaque** tile — now `#faf8f0` rather than white — so
the dark mark stays legible against dark browser chrome. Only the original
rounded-corner alpha is carried through. They were rebuilt from the original
blue source rather than from the already-green file, so the anti-aliased
edges composite against cream directly instead of leaving a pale white halo
around every curve.

Note that browsers cache favicons aggressively; a hard reload (or a visit to
`/favicon.png` directly) is usually needed to see the change in a tab.

Mapping: `#1c41f7 → #034f46`, `#1d8896 → #056b5e`.

Three things worth knowing:

- **A plain hex swap would have left blue fringes.** 210 of the favicon's
  colours are anti-aliased blends of ink and white. Each chromatic pixel was
  un-mixed against the background to recover its ink coverage, then
  recomposed with the target ink at the same coverage. Achromatic pixels
  (the black wordmark, white, greys) were excluded by saturation, which is
  why the wordmark stayed black without being special-cased.
- **The nav mark was a white rounded-square tile.** Invisible on the old
  white page; on cream it read as a white box. Its alpha was rebuilt from
  ink coverage so the mark now sits directly on the cream. The favicons
  deliberately keep their tile — a tab icon needs it so the dark mark stays
  visible against dark browser chrome.
- **Order matters if you ever redo this.** Classify hues from the *original
  blue* file. Running the recolour first and the knockout second re-reads
  hue from an already-green image, where `#034f46` and `#056b5e` both fall
  in the same hue band and the mark flattens to one tone.

The accent is `#056b5e` ("Green Mid" in the guide, whose sanctioned role is
highlight/gradient midpoint). It is a quieter two-tone than the old
blue/teal because both greens are dark. `#6ee7b7` mint pops far more and was
trialled, but the guide reserves mint for notification dots on dark green.
Swapping is a one-line change if the mark reads too flat at small sizes.

`blog/public/favicon.svg` is a *different, purple* mark (`#863bff`) and is
referenced nowhere. Left alone as an orphan — worth deleting or asking about.

## 7. Still open

1. **Existing rendered videos** — see above.
2. **Section rhythm.** The page background is now cream, but many sections
   still set `bg-white` explicitly, so they read as white bands on cream.
   Often that is the intended card-on-cream look; on a few full-bleed
   sections it flattens the warmth. Needs a designer's eye per section
   rather than a find-replace.

## 8. How this was verified

- `npm run check` — clean
- `npm run build` — both apps build; 53 blog URLs prerendered
- In-browser computed-style audit across `/`, `/pricing`, `/business`,
  `/nris`, `/services/passport-renewal`, `/services/india-tax-filing`,
  `/business/partnerships`, `/offers/google`, `/offers/nextdoor`, `/terms`
  and the blog index: every page reports `rgb(250, 248, 240)` background and
  `Plus Jakarta Sans`, and a full-DOM scan for blue-dominant computed
  colours returns only the Google wordmark gradient.
- Built CSS bundles contain zero occurrences of the old blue
  (`230 93% 54%`, `28,65,247`), zero `Roboto`, and zero §4.6 forbidden hexes.
- All four logo rasters re-tallied pixel-by-pixel: zero `#1c41f7` / `#1d8896`
  remaining. The nav mark was also read back off the live page via canvas —
  `#034f46` 806px, `#056b5e` 177px, 8013px transparent, on `rgb(250,248,240)`.

Note: the blog's article list does not render on `localhost:5173` because
Sanity CORS has no entry for that origin. Content fetches fine server-side,
which is why the build prerenders all 53 posts. That is a pre-existing
environment gap, not a theme issue.
