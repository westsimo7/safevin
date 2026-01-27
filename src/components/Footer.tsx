import { Zap } from "lucide-react";
import PaisleyPattern from "./PaisleyPattern";

const Footer = () => {
  return (
    <footer className="relative py-16 bg-background border-t border-border/30 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 text-neon-red/5">
        <PaisleyPattern opacity={0.03} />
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-neon-red/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-red" />
            </div>
            <span className="text-2xl font-black">
              <span className="text-foreground">SAFE</span>
              <span className="text-neon-red">VIN</span>
            </span>
          </div>
          
          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-8">
            {["Funzionalità", "Prezzi", "FAQ", "Contatti", "Privacy"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-foreground/50 hover:text-neon-red transition-colors text-sm"
              >
                {link}
              </a>
            ))}
          </nav>
          
          {/* Copyright */}
          <p className="text-foreground/30 text-sm">
            © 2024 SafeVin. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
