import { useState, useEffect } from "react";
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

  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/storico", label: "Storico", icon: Clock },
    { to: "/coach", label: "Coach", icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
        {navItems.map(item => {
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
      </div>
    </div>
  );
};

export default BottomBar;
