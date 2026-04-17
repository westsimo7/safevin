import { Shield } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Footer = () => {
  const ref = useScrollReveal({ direction: "up", duration: 0.6, distance: 20 });

  return (
    <footer className="py-8 sm:py-12 bg-background border-t border-border">
      <div ref={ref} className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-base sm:text-lg font-bold text-foreground">
              SAFE<span className="text-primary">ViN</span>
            </span>
          </div>
          
          <nav className="flex items-center gap-4 sm:gap-6 text-[13px] sm:text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors py-1">Il metodo</a>
            <a href="#" className="hover:text-foreground transition-colors py-1">Piani</a>
            <a href="/privacy" className="hover:text-foreground transition-colors py-1">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors py-1">Termini</a>
          </nav>
          
          <p className="text-[13px] sm:text-sm text-muted-foreground">
            © 2024 SAFEViN. Tutti i diritti riservati.
          </p>
        </div>
        
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50">
          <p className="text-[11px] sm:text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto px-2 sm:px-0">
            SAFEViN è un ecosistema indipendente di analisi e ottimizzazione annunci. Non è affiliato con Vinted. 
            I risultati dipendono dalla qualità dei dati forniti e dalle condizioni di mercato.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
