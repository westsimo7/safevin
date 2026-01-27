import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LifestyleSection from "@/components/LifestyleSection";
import SafeListChat from "@/components/SafeListChat";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <LifestyleSection />
      <SafeListChat />
      <PricingSection />
      <Footer />
    </main>
  );
};

export default Index;
