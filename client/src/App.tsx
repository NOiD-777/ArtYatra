import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import SearchPage from "@/pages/search";
import Map from "@/pages/map";
import NotFound from "@/pages/not-found";
import UploadToDatabase from "@/pages/upload-db";
import Login from "@/pages/login";
import Protected from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Protected>
          <Home />
        </Protected>
      </Route>
      <Route path="/map">
        <Protected>
          <Map />
        </Protected>
      </Route>
      <Route path="/upload-db">
        <Protected>
          <UploadToDatabase />
        </Protected>
      </Route>
      {/* ✅ Move /search ABOVE the catch-all */}
      <Route path="/search">
        <Protected>
          <SearchPage />
        </Protected>
      </Route>
      {/* Keep this LAST as the fallback */}
      <Route>{() => <NotFound />}</Route>
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