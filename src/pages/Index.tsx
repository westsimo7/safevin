import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import DisclaimerSection from "@/components/DisclaimerSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen overflow-x-hidden relative">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <PricingSection />
      <DisclaimerSection />
      <Footer />
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
