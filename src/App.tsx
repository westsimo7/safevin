import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EngineStudio from "./pages/EngineStudio";
import Storico from "./pages/Storico";
import StudioDetailPage from "./pages/StudioDetail";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import AboutStudio from "./pages/AboutStudio";
import Coach from "./pages/Coach";
import IncompleteCreations from "./pages/IncompletCreations";
import BottomBar from "./components/BottomBar";
import PageTransition from "./components/PageTransition";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "/index";

  return (
    <div className={isLanding ? "h-[100dvh] overflow-y-auto overflow-x-hidden" : "h-[100dvh] flex flex-col overflow-hidden"}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={
            <PageTransition direction="up"><Dashboard /></PageTransition>
          } />
          <Route path="/dashboard" element={
            <PageTransition direction="up"><Dashboard /></PageTransition>
          } />
          <Route path="/engine/studio" element={
            <PageTransition direction="left"><EngineStudio /></PageTransition>
          } />
          <Route path="/storico" element={
            <PageTransition direction="right"><Storico /></PageTransition>
          } />
          <Route path="/storico/studio/:id" element={
            <PageTransition direction="right"><StudioDetailPage /></PageTransition>
          } />
          <Route path="/coach" element={
            <PageTransition direction="up"><Dashboard /></PageTransition>
          } />
          <Route path="/incomplete" element={
            <PageTransition direction="right"><IncompleteCreations /></PageTransition>
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
      {!isLanding && <BottomBar />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
