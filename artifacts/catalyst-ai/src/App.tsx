import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import Reactions from "@/pages/reactions";
import ReactionDetail from "@/pages/reaction-detail";
import CandidateDetail from "@/pages/candidate-detail";
import Experiments from "@/pages/experiments";
import ExperimentForm from "@/pages/experiment-form";
import ExperimentDetail from "@/pages/experiment-detail";
import Annotations from "@/pages/annotations";
import Retraining from "@/pages/retraining";
import Pathway from "@/pages/pathway";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/reactions" component={Reactions} />
        <Route path="/reactions/:id" component={ReactionDetail} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/experiments" component={Experiments} />
        <Route path="/experiments/new" component={ExperimentForm} />
        <Route path="/experiments/:id" component={ExperimentDetail} />
        <Route path="/annotations" component={Annotations} />
        <Route path="/retraining" component={Retraining} />
        <Route path="/pathway" component={Pathway} />
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
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
