import { Switch, Route, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient as browserQueryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteMeta } from "@/lib/seo";
import { ROUTES, loadNotFound, page } from "./routes";

// Created once, so a route component keeps its identity across renders.
const ROUTE_COMPONENTS = ROUTES.map((r) => ({ path: r.path, component: page(r.load) }));
const NotFound = page(loadNotFound);

function Routes() {
  return (
    <Switch>
      {ROUTE_COMPONENTS.map((r) => (
        <Route key={r.path} path={r.path} component={r.component} />
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * `ssrPath` is set when prerendering (entry-server.tsx); in the browser the
 * router reads the real location.
 */
function App({ ssrPath, queryClient = browserQueryClient }: { ssrPath?: string; queryClient?: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router ssrPath={ssrPath}>
          <RouteMeta />
          <Toaster />
          <Routes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
