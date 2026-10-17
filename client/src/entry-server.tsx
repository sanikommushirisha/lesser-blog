import { renderToString } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import App from "./App";
import { preloadRoute } from "./routes";

// Build-time prerender (script/prerender.ts): the markup for one route, which
// the browser then hydrates (main.tsx). A fresh QueryClient per page keeps
// state from leaking between renders.
export async function render(pathname: string): Promise<string> {
  await preloadRoute(pathname);
  return renderToString(<App ssrPath={pathname} queryClient={new QueryClient()} />);
}
