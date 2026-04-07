import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Clock, MessageCircle } from "lucide-react";
import CoachWidget from "./CoachWidget";

const BottomBar = () => {
  const location = useLocation();
  const [coachOpen, setCoachOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Show Dashboard & Storico only on mobile/tablet (<1024px)
  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Don't show on landing page
  if (location.pathname === "/" || location.pathname === "/index") return null;

  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/storico", label: "Storico", icon: Clock },
  ];

  return (
    <>
      <CoachWidget open={coachOpen} onClose={() => setCoachOpen(false)} />

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
          {isSmallScreen && navItems.map(item => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setCoachOpen(!coachOpen)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              coachOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Coach</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomBar;
