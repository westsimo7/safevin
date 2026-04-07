import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6">
        {/* Logo - flush left */}
        <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <motion.span
            className="text-3xl sm:text-4xl font-black tracking-tight"
            initial={{ opacity: 0, scale: 0.7, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.1 }}
          >
            <span className="text-foreground">SAFE</span>
            <motion.span
              className="text-primary inline-block"
              animate={{ textShadow: ["0 0 8px hsl(174 65% 34% / 0.3)", "0 0 20px hsl(174 65% 34% / 0.6)", "0 0 8px hsl(174 65% 34% / 0.3)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
