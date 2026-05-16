import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LandingNavbar = () => {
  const handlePricingClick = () => {
    const el = document.getElementById("bundle") || document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/[0.06] bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="w-full h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="lg:ml-16">
          <Button
            onClick={handlePricingClick}
            size="sm"
            variant="neon"
            className="h-9 px-5 text-sm"
          >
            Prezzi
          </Button>
        </div>

        <div className="lg:mr-16">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
