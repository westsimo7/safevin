import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Engine from "./pages/Engine";
import EngineAnalyze from "./pages/EngineAnalyze";
import EngineImageAnalysis from "./pages/EngineImageAnalysis";
import EngineAudit from "./pages/EngineAudit";
import EngineStudio from "./pages/EngineStudio";
import EngineImprove from "./pages/EngineImprove";
import Storico from "./pages/Storico";
import StoricoDetail from "./pages/StoricoDetail";
import StudioDetailPage from "./pages/StudioDetail";
import NotFound from "./pages/NotFound";
import CoachWidget from "./components/CoachWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/engine" element={<Engine />} />
          <Route path="/engine/analyze" element={<EngineAnalyze />} />
          <Route path="/engine/analyze/images" element={<EngineImageAnalysis />} />
          <Route path="/engine/analyze/audit" element={<EngineAudit />} />
          <Route path="/engine/studio" element={<EngineStudio />} />
          <Route path="/engine/improve" element={<EngineImprove />} />
          <Route path="/storico" element={<Storico />} />
          <Route path="/storico/studio/:id" element={<StudioDetailPage />} />
          <Route path="/storico/:id" element={<StoricoDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CoachWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
