import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-foreground">SAFE</span>
            <span className="text-primary">VIN</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#dashboard" 
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Dashboard
          </a>
          <a 
            href="#account" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Account
          </a>
          <a 
            href="#upgrade" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Upgrade
          </a>
        </nav>

        {/* AI Badge + CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI Powered for Vinted</span>
          </div>
          <Button variant="neon" size="sm">
            Upgrade
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
