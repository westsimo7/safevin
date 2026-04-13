import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Clock, MessageCircle } from "lucide-react";

const BottomBar = () => {
  const location = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (location.pathname === "/" || location.pathname === "/index") return null;
  if (!isSmallScreen) return null;

  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/storico", label: "Storico", icon: Clock },
    { to: "#", label: "Coach", icon: MessageCircle, disabled: true },
  ];

  return (
    <div className="shrink-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
        {navItems.map(item => {
          const isActive = !item.disabled && (location.pathname === item.to || location.pathname.startsWith(item.to + "/"));
          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground/40 cursor-not-allowed relative"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                <span className="absolute -top-1 -right-1 text-[7px] font-bold text-destructive">SOON</span>
              </div>
            );
          }
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
      </div>
    </div>
  );
};

export default BottomBar;
