import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-foreground">
              SAFE<span className="text-primary">ViN</span>
            </span>
          </div>
          
          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Il metodo</a>
            <a href="#" className="hover:text-foreground transition-colors">Piani</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Termini</a>
          </nav>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 SAFEViN. Tutti i diritti riservati.
          </p>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto">
            SAFEViN è un ecosistema indipendente di analisi e ottimizzazione annunci. Non è affiliato con Vinted. 
            I risultati dipendono dalla qualità dei dati forniti e dalle condizioni di mercato.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
