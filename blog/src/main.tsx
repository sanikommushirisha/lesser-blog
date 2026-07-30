import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { hasInitialDataFor } from './lib/initial-data'
import { BASE_PATH, toAppRoute } from './lib/base'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={BASE_PATH}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

// Prerendered pages ship HTML + matching __INITIAL_DATA__: hydrate in place.
// Any other page served from the SPA fallback (e.g. /studio) starts clean.
// Routes are stored basename-relative ("/", "/some-slug"), so the /blog prefix
// has to come off the real pathname before the lookup or nothing ever matches
// and every prerendered page would silently fall back to a client render.
const route = toAppRoute(window.location.pathname)
if (container.hasChildNodes() && hasInitialDataFor(route)) {
  hydrateRoot(container, app)
} else {
  if (container.hasChildNodes()) container.innerHTML = ''
  createRoot(container).render(app)
}
