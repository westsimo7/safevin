import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { PLANS, REQUIRED_PLAN, isPlanAtLeast } from "@/lib/plans";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Crown, Settings, CreditCard, Receipt, Shield, Bell, HelpCircle, Palette, LogOut, ChevronRight, Sparkles, LayoutDashboard, Rocket, Handshake, Lock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "@/components/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";

const navLinks = [
  { to: "/home", label: "Home", disabled: false },
  { to: "/storico", label: "Storico", disabled: false },
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
  const { user, signOut } = useAuth();
  const { state: planState } = usePlan();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState<{ nome: string; cognome: string; email: string } | null>(null);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nome, cognome, email")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfileData(data);
      });
  }, [user]);

  const isFounder = planState?.isFounder ?? false;
  const currentPlanId = planState?.plan ?? "free";
  const currentPlanLabel = isFounder ? "Founder" : PLANS[currentPlanId]?.label ?? "Free";
  const studioRemaining = planState?.studioRemaining ?? 0;
  const studioLimit = planState?.studioLimit ?? 0;
  const cdRemaining = planState?.cdRemaining ?? 0;
  const cdLimit = planState?.cdLimit ?? 0;

  const displayName = profileData?.nome
    ? `${profileData.nome} ${profileData.cognome}`.trim()
    : user?.email || "Utente SafeViN";
  const displayEmail = profileData?.email || user?.email || "";

  // Helper: badge per servizio in base a piano richiesto
  const serviceBadge = (feature: keyof typeof REQUIRED_PLAN) => {
    const required = REQUIRED_PLAN[feature];
    const accessible = isFounder || isPlanAtLeast(currentPlanId, required);
    if (accessible) return undefined;
    const label = PLANS[required].label;
    const colorMap: Record<string, string> = {
      Starter: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      Pro: "bg-primary/10 text-primary border-primary/20",
      Expert: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    };
    return { label, color: colorMap[label] || "bg-muted text-muted-foreground border-border/50" };
  };

  const cdBadge = serviceBadge("creative_director");
  const upgradeBadge = serviceBadge("upgrade");
  const collabBadge = serviceBadge("collaboration");

  const menuSections: MenuSection[] = [
    ...(isFounder ? [{
      title: "Founder",
      items: [
        { label: "Dashboard Admin", icon: LayoutDashboard, action: () => { setOpen(false); navigate("/admin"); }, badge: "Founder", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
      ],
    }] : []),
    {
      title: "Account",
      items: [
        { label: "Profilo", icon: User, action: () => { setOpen(false); navigate("/profile"); } },
        { label: "Impostazioni", icon: Settings, action: () => { setOpen(false); navigate("/settings"); } },
      ],
    },
    ...(isFounder ? [] : [{
      title: "Abbonamento",
      items: [
        {
          label: "Piano attuale",
          icon: Sparkles,
          badge: currentPlanLabel,
          badgeColor: currentPlanId === "expert"
            ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
            : currentPlanId === "pro"
              ? "bg-primary/10 text-primary border-primary/20"
              : currentPlanId === "starter"
                ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                : "bg-muted text-muted-foreground border-border/50",
        },
        ...(currentPlanId !== "expert" ? [{
          label: "Cambia piano",
          icon: Crown,
          action: () => { setOpen(false); navigate("/pricing"); },
          badge: "Prezzi",
          badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        }] : []),
      ],
    }]),
    {
      title: "Servizi",
      items: [
        {
          label: "Artist Director",
          icon: Palette,
          action: () => { setOpen(false); navigate("/artist-director"); },
          badge: cdBadge?.label,
          badgeColor: cdBadge?.color,
        },
        {
          label: "Prezzi",
          icon: Rocket,
          action: () => { setOpen(false); navigate("/upgrade"); },
          badge: upgradeBadge?.label,
          badgeColor: upgradeBadge?.color,
        },
        {
          label: "Collaborazioni",
          icon: Handshake,
          action: () => { setOpen(false); navigate("/collaboration"); },
          badge: collabBadge?.label,
          badgeColor: collabBadge?.color,
        },
      ],
    },
    {
      title: "Assistente",
      items: [
        { label: "Assistenza", icon: HelpCircle, action: () => { setOpen(false); navigate("/support"); } },
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
              className="h-8 px-2.5 sm:px-3 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/60"
              onClick={() => navigate("/pricing")}
              aria-label="Upgrade"
            >
              <Crown className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Upgrade</span>
            </Button>

            <NotificationBell />

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                {/* Profile header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{displayEmail}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isFounder
                        ? <>Piano: <span className="font-semibold text-amber-500">Founder</span> · Annunci: <span className="font-semibold text-amber-500">∞</span></>
                        : <>Annunci creabili: <span className="font-semibold text-foreground/70">{studioRemaining}</span></>
                      }
                    </p>
                    {!isFounder && cdLimit > 0 && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        Artist Director: {cdRemaining} / {cdLimit} disponibili
                      </p>
                    )}
                  </div>
                </div>

                {/* Menu sections */}
                <div>
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
                  <button
                    className="w-full flex items-center gap-3 text-sm py-2.5 px-4 rounded-lg text-destructive/70 hover:bg-destructive/5 hover:text-destructive transition-colors"
                    onClick={async () => { setOpen(false); await signOut(); window.location.href = "/"; }}
                  >
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
