import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GroupsTab from "@/pages/GroupsTab";
import GatewaysTab from "@/pages/GatewaysTab";
import SecretsTab from "@/pages/SecretsTab";
import LogsTab from "@/pages/LogsTab";
import HealthTab from "@/pages/HealthTab";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/">
          <ErrorBoundary pageName="Groups">
            <GroupsTab />
          </ErrorBoundary>
        </Route>
        <Route path="/gateways">
          <ErrorBoundary pageName="Gateways">
            <GatewaysTab />
          </ErrorBoundary>
        </Route>
        <Route path="/secrets">
          <ErrorBoundary pageName="Secrets">
            <SecretsTab />
          </ErrorBoundary>
        </Route>
        <Route path="/logs">
          <ErrorBoundary pageName="Logs">
            <LogsTab />
          </ErrorBoundary>
        </Route>
        <Route path="/health-check">
          <ErrorBoundary pageName="Health">
            <HealthTab />
          </ErrorBoundary>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster position="bottom-center" theme="dark" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
