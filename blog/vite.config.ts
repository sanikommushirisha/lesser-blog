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
    chunkSizeWarningLimit: 7000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/sanity') || id.includes('node_modules/styled-components')) {
            return 'studio'
          }
        },
      },
    },
  },
})
