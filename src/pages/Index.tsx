import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import SafeListChat from "@/components/SafeListChat";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <SafeListChat />
      <PricingSection />
      <Footer />
    </main>
  );
};

export default Index;
