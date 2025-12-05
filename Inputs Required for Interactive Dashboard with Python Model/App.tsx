import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import SingleCustomerPrediction from "@/pages/SingleCustomerPrediction";
import BatchPrediction from "@/pages/BatchPrediction";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ExecutiveOverview from "./pages/ExecutiveOverview";
import BehaviourInsights from "./pages/BehaviourInsights";
import AIAssistant from "./pages/AIAssistant";
import ModelIntegrity from "./pages/ModelIntegrity";
import PortfolioHealth from "./pages/PortfolioHealth";
import BusinessRecommendations from "./pages/BusinessRecommendations";
import RealTimeInsights from "./pages/RealTimeInsights";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/overview"} component={ExecutiveOverview} />
      <Route path={"/behaviour"} component={BehaviourInsights} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/model-integrity"} component={ModelIntegrity} />      <Route path={"/single-prediction"} component={SingleCustomerPrediction} />
      <Route path={"/batch-prediction"} component={BatchPrediction} />
      <Route path={"/portfolio-health"} component={PortfolioHealth} />
      <Route path={"/business-recommendations"} component={BusinessRecommendations} />
      <Route path={"/real-time-insights"} component={RealTimeInsights} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
