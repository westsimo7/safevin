import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-foreground">SAFE</span>
            <span className="text-primary">ViN</span>
          </span>
        </a>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" disabled className="text-muted-foreground/50 cursor-not-allowed">
            Login
          </Button>
          <Button variant="outline" size="sm" disabled className="text-muted-foreground/50 cursor-not-allowed border-border/30">
            Registrati
          </Button>

          {/* Profile dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                <User className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                <div className="w-12 h-12 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Utente</p>
                  <p className="text-xs text-muted-foreground">Crediti: ??? / ??? / ???</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-not-allowed opacity-50">Impostazioni</p>
                <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-not-allowed opacity-50">Billing</p>
                <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-not-allowed opacity-50">Assistenza</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
