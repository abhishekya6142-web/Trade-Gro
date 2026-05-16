import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Markets from "@/pages/markets";
import StockDetail from "@/pages/stock-detail";
import Portfolio from "@/pages/portfolio";
import Coach from "@/pages/coach";
import Leaderboard from "@/pages/leaderboard";
import Challenges from "@/pages/challenges";
import Profile from "@/pages/profile";
import { Layout } from "@/components/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("tradevision_user_id");
    if (!userId) {
      setLocation("/");
    } else {
      setIsChecking(false);
    }
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/") {
      const userId = localStorage.getItem("tradevision_user_id");
      if (userId) {
        setLocation("/dashboard");
      }
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/markets"><ProtectedRoute component={Markets} /></Route>
      <Route path="/stock/:symbol"><ProtectedRoute component={StockDetail} /></Route>
      <Route path="/portfolio"><ProtectedRoute component={Portfolio} /></Route>
      <Route path="/coach"><ProtectedRoute component={Coach} /></Route>
      <Route path="/leaderboard"><ProtectedRoute component={Leaderboard} /></Route>
      <Route path="/challenges"><ProtectedRoute component={Challenges} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
      <Route component={NotFound} />
    </Switch>
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
