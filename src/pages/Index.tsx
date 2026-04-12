import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/HeroSection";
import FloatingResults from "@/components/FloatingResults";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import DisclaimerSection from "@/components/DisclaimerSection";
import Footer from "@/components/Footer";

const Index = () => {
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
        <HowItWorksSection />
        <PricingSection />
        <DisclaimerSection />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
