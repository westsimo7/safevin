import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import DisclaimerSection from "@/components/DisclaimerSection";
import Footer from "@/components/Footer";


const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden relative">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/landing-bg.jpeg')" }}
      />
      <div className="fixed inset-0 z-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10">
        <LandingNavbar />
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <PillarsSection />
        <HowItWorksSection />
        <PricingSection />
        <DisclaimerSection />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
