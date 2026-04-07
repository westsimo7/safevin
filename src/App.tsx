import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Engine from "./pages/Engine";
import EngineAnalyze from "./pages/EngineAnalyze";

import EngineAudit from "./pages/EngineAudit";
import EngineStudio from "./pages/EngineStudio";
import EngineImprove from "./pages/EngineImprove";
import Storico from "./pages/Storico";
import StoricoDetail from "./pages/StoricoDetail";
import StudioDetailPage from "./pages/StudioDetail";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import AboutAudit from "./pages/AboutAudit";
import AboutStudio from "./pages/AboutStudio";
import BottomBar from "./components/BottomBar";
import PageTransition from "./components/PageTransition";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  // Determine transition direction based on path
  const getDirection = (path: string): "left" | "right" | "up" => {
    if (path.startsWith("/engine")) return "left";
    if (path.startsWith("/storico")) return "right";
    return "up";
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={
          <PageTransition direction="up"><Dashboard /></PageTransition>
        } />
        <Route path="/engine" element={
          <PageTransition direction="left"><Engine /></PageTransition>
        } />
        <Route path="/engine/analyze" element={
          <PageTransition direction="left"><EngineAnalyze /></PageTransition>
        } />
        <Route path="/engine/analyze/audit" element={
          <PageTransition direction="left"><EngineAudit /></PageTransition>
        } />
        <Route path="/engine/studio" element={
          <PageTransition direction="left"><EngineStudio /></PageTransition>
        } />
        <Route path="/engine/improve" element={
          <PageTransition direction="left"><EngineImprove /></PageTransition>
        } />
        <Route path="/storico" element={
          <PageTransition direction="right"><Storico /></PageTransition>
        } />
        <Route path="/storico/studio/:id" element={
          <PageTransition direction="right"><StudioDetailPage /></PageTransition>
        } />
        <Route path="/storico/:id" element={
          <PageTransition direction="right"><StoricoDetail /></PageTransition>
        } />
        <Route path="/about/audit" element={
          <PageTransition direction="up"><AboutAudit /></PageTransition>
        } />
        <Route path="/about/studio" element={
          <PageTransition direction="up"><AboutStudio /></PageTransition>
        } />
        <Route path="/settings" element={
          <PageTransition direction="up"><Settings /></PageTransition>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
        <BottomBar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
