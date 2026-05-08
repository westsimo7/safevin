import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LandingNavbar = () => {
  const { t } = useTranslation();

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
        <Link to="/auth" className="lg:ml-16">
          <Button variant="neon" size="sm" className="h-9 px-4 text-sm font-bold">
            {t("nav.tryFree")}
          </Button>
        </Link>

        <div className="flex items-center gap-2 lg:mr-16">
          <Button
            onClick={handlePricingClick}
            size="sm"
            className="h-9 px-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white"
          >
            Pricing
          </Button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
