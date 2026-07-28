# lesser.tax

The lesser.tax marketing site and the Lesser blog, served as one site from one
deployment. An Express server serves the marketing app at `/` and the blog at
`/blog`.

| Path | App |
|---|---|
| `/` | Marketing site — `client/`, `server/`, `shared/` |
| `/blog` | Blog — `blog/` |
| `/blog/studio` | Sanity Studio |

The two apps deliberately keep separate `package.json` files, dependency trees
and builds: the blog is on React 19 / Tailwind 4 / Vite 8 (and Sanity Studio v5
requires React 19), while the marketing app is on React 18 / Tailwind 3 / Vite 7.
Isolating them means neither app's dependencies can break the other's.

## Commands

```
npm install        # marketing deps; the blog's are installed by the build
npm run dev        # marketing site (Vite HMR) + last blog build, port 5000
npm run dev:blog   # blog with HMR at http://localhost:5173/blog
npm run build      # marketing + server + blog -> dist/
npm run build:blog # just the blog -> dist/public/blog
npm start          # run the production build
```

- **Blog app code & setup guide:** [blog/](blog/) — see [blog/README.md](blog/README.md)
- **Operations:** [OPERATIONS.md](OPERATIONS.md)
- **Docs:** [docs/PRD.md](docs/PRD.md) · [docs/TRD.md](docs/TRD.md) · [docs/UI-UX-DESIGN.md](docs/UI-UX-DESIGN.md)
