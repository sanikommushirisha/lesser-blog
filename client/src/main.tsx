import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { preloadRoute } from "./routes";
// Self-hosted fonts (same origin, preloaded by the vite.config.ts plugin) rather
// than Google Fonts, which put two extra connections before the first paint.
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import "@fontsource-variable/eb-garamond/wght.css";
import "@fontsource-variable/eb-garamond/wght-italic.css";
import "./index.css";

const root = document.getElementById("root")!;

// Load this page's code first so the first render matches the prerendered
// HTML exactly. Pages served without prerendered markup (development, or a
// route with no build-time HTML) render from scratch.
preloadRoute(window.location.pathname).finally(() => {
  if (root.hasChildNodes()) {
    hydrateRoot(root, <App />);
  } else {
    createRoot(root).render(<App />);
  }
});
