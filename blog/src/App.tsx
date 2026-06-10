import { lazy, Suspense } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { BlogList } from './pages/BlogList'
import { BlogPost } from './pages/BlogPost'

const StudioPage = lazy(() => import('./pages/StudioPage'))

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Nav />
      <div id="main" className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/studio/*"
        element={
          <Suspense fallback={<p className="p-8 text-muted-foreground">Loading Studio…</p>}>
            <StudioPage />
          </Suspense>
        }
      />
      <Route element={<SiteLayout />}>
        <Route path="/" element={<BlogList />} />
        <Route path="/:slug" element={<BlogPost />} />
      </Route>
    </Routes>
  )
}
