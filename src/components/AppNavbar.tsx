import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { User, Crown, Settings, CreditCard, Receipt, Shield, Bell, HelpCircle, Palette, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { to: "/home", label: "Home", disabled: false },
  { to: "/storico", label: "Storico", disabled: false },
  { to: "/coach", label: "Coach", disabled: true },
];

type MenuItem = {
  label: string;
  icon: React.ElementType;
  action?: () => void;
  badge?: string;
  badgeColor?: string;
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const menuSections: MenuSection[] = [
    {
      title: "Account",
      items: [
        { label: "Profilo", icon: User, action: () => { setOpen(false); navigate("/settings"); } },
        { label: "Impostazioni", icon: Settings, action: () => { setOpen(false); navigate("/settings"); } },
      ],
    },
    {
      title: "Abbonamento",
      items: [
        { label: "Piano attuale", icon: Sparkles, badge: "Starter", badgeColor: "bg-primary/10 text-primary border-primary/20" },
        { label: "Upgrade", icon: Crown, badge: "Pro", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
      ],
    },
    {
      title: "Pagamenti",
      items: [
        { label: "Metodo di pagamento", icon: CreditCard },
        { label: "Fatture e ricevute", icon: Receipt },
      ],
    },
    {
      title: "Servizi",
      items: [
        { label: "Artist Director", icon: Palette, action: () => { setOpen(false); navigate("/artist-director"); }, badge: "Expert", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
      ],
    },
    {
      title: "Preferenze",
      items: [
        { label: "Notifiche", icon: Bell },
        { label: "Sicurezza e privacy", icon: Shield },
      ],
    },
    {
      title: "Supporto",
      items: [
        { label: "Centro assistenza", icon: HelpCircle },
      ],
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity lg:ml-16">
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-foreground">SAFE</span>
              <span className="text-primary">ViN</span>
            </span>
          </Link>

          {/* Center nav - absolutely centered */}
          {!isMobile && (
            <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
              {navLinks.map(link => {
                const isActive = !link.disabled && (location.pathname === link.to || location.pathname.startsWith(link.to + "/"));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                      link.disabled
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : isActive
                          ? "text-foreground bg-muted/50"
                          : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={link.disabled ? (e) => e.preventDefault() : undefined}
                  >
                    {link.label}
                    {link.disabled && (
                      <span className="absolute -top-2 -right-3 text-[8px] font-bold text-destructive uppercase">soon</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:mr-16">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs h-8 px-3 cursor-not-allowed border-primary/20 text-primary/50"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                {/* Profile header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Utente SafeViN</p>
                    <p className="text-xs text-muted-foreground mt-0.5">utente@email.com</p>
                  </div>
                </div>

                {/* Menu sections */}
                <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
                  {menuSections.map((section, sIdx) => (
                    <div key={sIdx}>
                      {section.title && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold px-4 pt-3 pb-1">
                          {section.title}
                        </p>
                      )}
                      {section.items.map(item => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          disabled={!item.action}
                          className={`w-full flex items-center gap-3 text-sm py-2.5 px-4 transition-colors ${
                            item.action
                              ? "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                              : "text-muted-foreground/50 cursor-not-allowed"
                          }`}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <Badge className={`text-[9px] px-1.5 py-0 ${item.badgeColor || ""}`}>
                              {item.badge}
                            </Badge>
                          )}
                          {!item.action && !item.badge && (
                            <span className="text-[9px] text-muted-foreground/40">soon</span>
                          )}
                          {item.action && <ChevronRight className="w-3 h-3 text-muted-foreground/30" />}
                        </button>
                      ))}
                      {sIdx < menuSections.length - 1 && (
                        <div className="border-b border-border/30 mx-3 my-1" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-border/50 p-2">
                  <button className="w-full flex items-center gap-3 text-sm py-2.5 px-4 rounded-lg text-destructive/70 hover:bg-destructive/5 hover:text-destructive transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Esci</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
    </>
  );
};

export default AppNavbar;
