import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
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
        <Route path="/" component={GroupsTab} />
        <Route path="/gateways" component={GatewaysTab} />
        <Route path="/secrets" component={SecretsTab} />
        <Route path="/logs" component={LogsTab} />
        <Route path="/health-check" component={HealthTab} />
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
