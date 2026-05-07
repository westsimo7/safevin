import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { PlanProvider } from "@/hooks/usePlan";
import ProtectedRoute from "@/components/ProtectedRoute";
import PlanProtectedRoute from "@/components/PlanProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EngineStudio from "./pages/EngineStudio";
import Storico from "./pages/Storico";
import StudioDetailPage from "./pages/StudioDetail";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AboutStudio from "./pages/AboutStudio";
import Coach from "./pages/Coach";
import ArtistDirector from "./pages/ArtistDirector";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import IncompleteCreations from "./pages/IncompletCreations";
import AdminDashboard from "./pages/AdminDashboard";
import FounderInbox from "./pages/FounderInbox";
import Upgrade from "./pages/Upgrade";
import UpgradeInbox from "./pages/UpgradeInbox";
import Support from "./pages/Support";
import SupportInbox from "./pages/SupportInbox";
import Collaboration from "./pages/Collaboration";
import CollaborationInbox from "./pages/CollaborationInbox";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Terms from "./pages/Terms";
import Unsubscribe from "./pages/Unsubscribe";
import ResetPassword from "./pages/ResetPassword";
import CookieBanner from "./components/CookieBanner";
import UpsellPopup from "./components/UpsellPopup";
// BottomBar removed (Home/Storico/Coach mobile bar)
import PageTransition from "./components/PageTransition";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "/index";
  const isAuth = location.pathname === "/auth" || location.pathname === "/reset-password";

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
          <Route path="/profile" element={
            <ProtectedRoute><PageTransition direction="up"><Profile /></PageTransition></ProtectedRoute>
          } />
          <Route path="/artist-director" element={
            <PlanProtectedRoute feature="creative_director"><PageTransition direction="up"><ArtistDirector /></PageTransition></PlanProtectedRoute>
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
          <Route path="/admin/upgrade-inbox" element={
            <ProtectedRoute><PageTransition direction="left"><UpgradeInbox /></PageTransition></ProtectedRoute>
          } />
          <Route path="/upgrade" element={
            <PlanProtectedRoute feature="upgrade"><PageTransition direction="up"><Upgrade /></PageTransition></PlanProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute><PageTransition direction="up"><Support /></PageTransition></ProtectedRoute>
          } />
          <Route path="/admin/support-inbox" element={
            <ProtectedRoute><PageTransition direction="left"><SupportInbox /></PageTransition></ProtectedRoute>
          } />
          <Route path="/collaboration" element={
            <PlanProtectedRoute feature="collaboration"><PageTransition direction="up"><Collaboration /></PageTransition></PlanProtectedRoute>
          } />
          <Route path="/admin/collaboration-inbox" element={
            <ProtectedRoute><PageTransition direction="left"><CollaborationInbox /></PageTransition></ProtectedRoute>
          } />
          <Route path="/privacy" element={<PageTransition direction="up"><Privacy /></PageTransition>} />
          <Route path="/cookies" element={<PageTransition direction="up"><Cookies /></PageTransition>} />
          <Route path="/terms" element={<PageTransition direction="up"><Terms /></PageTransition>} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {/* BottomBar removed */}
      <CookieBanner />
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
          <PlanProvider>
            <AnimatedRoutes />
          </PlanProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
