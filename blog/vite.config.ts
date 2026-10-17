import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // The blog is served as a sub-app of lesser.tax at /blog, so every emitted
  // asset URL has to carry that prefix.
  base: '/blog/',
  plugins: [react(), tailwindcss()],
  // Tailwind 4 runs as the Vite plugin above, so this app needs no PostCSS
  // config. Declaring an empty one inline stops Vite walking up the tree and
  // picking up the marketing site's root postcss.config.js, which would feed
  // this app's CSS to Tailwind 3 and fail on `@layer components`.
  css: { postcss: {} },
  build: {
    // The Studio chunk (Sanity + styled-components) is large, but only
    // /blog/studio loads it: App.tsx imports StudioPage lazily. Do not group
    // modules into a manual "studio" chunk: shared code (React, helpers) ends up
    // inside it and every article then preloads all 6.5 MB of it.
    chunkSizeWarningLimit: 7000,
  },
})
