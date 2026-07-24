import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import NextdoorPage from "@/pages/nextdoor";
import NrisPage from "@/pages/nris";
import RiverIslandPage from "@/pages/riverisland";
import BroadcomPage from "@/pages/broadcom";
import CoupaPage from "@/pages/coupa";
import BusinessPage from "@/pages/business";
import PartnershipsPage from "@/pages/partnerships";
import DeadlinePage from "@/pages/deadline";
import RealEstatePage from "@/pages/re-pricing";
import GooglePage from "@/pages/google";
import InfosysPage from "@/pages/infosys";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import PassportRenewalPage from "@/pages/passport-renewal";
import IndiaTaxFilingPage from "@/pages/india-tax-filing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/offers/nextdoor" component={NextdoorPage} />
      <Route path="/offers/broadcom" component={BroadcomPage} />
      <Route path="/offers/coupa" component={CoupaPage} />
      <Route path="/offers/google" component={GooglePage} />
      <Route path="/offers/infosys" component={InfosysPage} />
      <Route path="/offers/riverisland" component={RiverIslandPage} />
      <Route path="/nris" component={NrisPage} />
      <Route path="/business" component={BusinessPage} />
      <Route path="/business/partnerships" component={PartnershipsPage} />
      <Route path="/business/deadline" component={DeadlinePage} />
      <Route path="/business/realestate" component={RealEstatePage} />
      <Route path="/services/passport-renewal" component={PassportRenewalPage} />
      <Route path="/services/india-tax-filing" component={IndiaTaxFilingPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
