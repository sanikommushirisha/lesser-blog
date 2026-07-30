import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { hasInitialDataFor } from './lib/initial-data'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

// Prerendered pages ship HTML + matching __INITIAL_DATA__: hydrate in place.
// Any other page served from the SPA fallback (e.g. /studio) starts clean.
const route = window.location.pathname.replace(/\/+$/, '') || '/'
if (container.hasChildNodes() && hasInitialDataFor(route)) {
  hydrateRoot(container, app)
} else {
  if (container.hasChildNodes()) container.innerHTML = ''
  createRoot(container).render(app)
}
