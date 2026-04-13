import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EngineStudio from "./pages/EngineStudio";
import Storico from "./pages/Storico";
import StudioDetailPage from "./pages/StudioDetail";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import AboutStudio from "./pages/AboutStudio";
import Coach from "./pages/Coach";
import ArtistDirector from "./pages/ArtistDirector";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import IncompleteCreations from "./pages/IncompletCreations";
import AdminDashboard from "./pages/AdminDashboard";
import FounderInbox from "./pages/FounderInbox";
import BottomBar from "./components/BottomBar";
import PageTransition from "./components/PageTransition";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "/index";
  const isAuth = location.pathname === "/auth";

  return (
    <div className={isLanding || isAuth ? "h-[100dvh] overflow-y-auto overflow-x-hidden" : "h-[100dvh] flex flex-col overflow-hidden"}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={
            <ProtectedRoute><PageTransition direction="up"><Dashboard /></PageTransition></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><PageTransition direction="up"><Dashboard /></PageTransition></ProtectedRoute>
          } />
          <Route path="/engine/studio" element={
            <ProtectedRoute><PageTransition direction="left"><EngineStudio /></PageTransition></ProtectedRoute>
          } />
          <Route path="/storico" element={
            <ProtectedRoute><PageTransition direction="right"><Storico /></PageTransition></ProtectedRoute>
          } />
          <Route path="/storico/studio/:id" element={
            <ProtectedRoute><PageTransition direction="right"><StudioDetailPage /></PageTransition></ProtectedRoute>
          } />
          <Route path="/coach" element={
            <ProtectedRoute><PageTransition direction="up"><Coach /></PageTransition></ProtectedRoute>
          } />
          <Route path="/incomplete" element={
            <ProtectedRoute><PageTransition direction="right"><IncompleteCreations /></PageTransition></ProtectedRoute>
          } />
          <Route path="/about/studio" element={
            <ProtectedRoute><PageTransition direction="up"><AboutStudio /></PageTransition></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><PageTransition direction="up"><Settings /></PageTransition></ProtectedRoute>
          } />
          <Route path="/artist-director" element={
            <ProtectedRoute><PageTransition direction="up"><ArtistDirector /></PageTransition></ProtectedRoute>
          } />
          <Route path="/pricing" element={
            <ProtectedRoute><PageTransition direction="up"><Pricing /></PageTransition></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute><PageTransition direction="up"><AdminDashboard /></PageTransition></ProtectedRoute>
          } />
          <Route path="/admin/inbox" element={
            <ProtectedRoute><PageTransition direction="left"><FounderInbox /></PageTransition></ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!isLanding && !isAuth && <BottomBar />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
