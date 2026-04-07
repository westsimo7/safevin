import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full h-20 sm:h-24 flex items-center justify-between px-4 sm:px-6">
        {/* Logo - flush left */}
        <a href="#" className="flex items-center hover:opacity-90 transition-opacity">
          <motion.span
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter select-none"
            initial={{ opacity: 0, rotateX: 60, y: -40, scale: 0.6 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 16, delay: 0.1 }}
            style={{ perspective: "600px", transformStyle: "preserve-3d" }}
          >
            <span
              className="text-foreground inline-block"
              style={{
                textShadow: "0 2px 0 hsl(0 0% 30%), 0 4px 0 hsl(0 0% 25%), 0 6px 8px hsl(0 0% 0% / 0.3)",
              }}
            >
              SAFE
            </span>
            <motion.span
              className="text-primary inline-block"
              style={{
                textShadow: "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 8px hsl(174 65% 10% / 0.4)",
              }}
              animate={{
                textShadow: [
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 8px hsl(174 65% 10% / 0.4)",
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 16px hsl(174 65% 34% / 0.6)",
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 8px hsl(174 65% 10% / 0.4)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              ViN
            </motion.span>
          </motion.span>
        </a>

        {/* Profile icon - flush right */}
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
              <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer">Login</p>
              <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer">Registrati</p>
              <div className="my-1 h-px bg-border/50" />
              <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-not-allowed opacity-50">Impostazioni</p>
              <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-not-allowed opacity-50">Billing</p>
              <p className="py-1.5 px-2 rounded hover:bg-muted/50 cursor-not-allowed opacity-50">Assistenza</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default LandingNavbar;
