import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { User, Crown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/storico", label: "Storico" },
];

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-foreground">SAFE</span>
              <span className="text-primary">ViN</span>
            </span>
          </Link>

          {/* Center nav - hidden on mobile (moved below) */}
          {!isMobile && (
            <nav className="flex items-center gap-6">
              {navLinks.map(link => {
                const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                      isActive
                        ? "text-foreground bg-muted/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs h-8 px-3 cursor-not-allowed border-primary/20 text-primary/50"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="end">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Utente SafeViN</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Piano: Starter</p>
                    <p className="text-xs text-muted-foreground">Crediti: ??? / ??? / ???</p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {[
                    { label: "Impostazioni", action: () => navigate("/settings") },
                    { label: "Billing", action: undefined },
                    { label: "Metodo di pagamento", action: undefined },
                    { label: "Fatture", action: undefined },
                    { label: "Piano attuale", action: undefined },
                    { label: "Sicurezza", action: undefined },
                    { label: "Notifiche", action: undefined },
                    { label: "Assistenza", action: undefined },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      disabled={!item.action}
                      className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                        item.action
                          ? "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                          : "text-muted-foreground/50 cursor-not-allowed"
                      }`}
                    >
                      {item.label}
                      {!item.action && <span className="text-[10px] ml-2 text-muted-foreground/40">coming soon</span>}
                    </button>
                  ))}
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <button className="w-full text-left text-sm py-2 px-3 rounded-lg text-destructive/70 hover:bg-destructive/5 hover:text-destructive transition-colors">
                      Esci
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Mobile tab bar under navbar */}
      {isMobile && (
        <div className="sticky top-14 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-center gap-1 px-4 py-1.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex-1 text-center text-xs font-semibold py-1.5 rounded-full transition-colors ${
                    isActive
                      ? "text-foreground bg-muted/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default AppNavbar;
