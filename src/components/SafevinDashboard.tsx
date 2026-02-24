import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, Search, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";

const SafevinDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-3xl mx-auto -mt-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            <Zap className="w-3 h-3 mr-1" />
            Audit + Studio in un unico motore
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            <span className="text-foreground">SAFE</span>
            <span className="text-primary">Vi</span>
            <span className="text-foreground">N</span>
            <br />
            <span className="text-primary text-glow-red">ENGINE</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-4 leading-relaxed">
            Analizza il tuo annuncio, ricevi score e criticità.<br />
            Correggi tutto e genera la versione migliore.
          </p>

          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-primary" />
              Audit
            </span>
            <span className="text-border">→</span>
            <span className="text-foreground font-medium">Fix</span>
            <span className="text-border">→</span>
            <span className="flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-primary" />
              Studio
            </span>
          </div>

          <Button
            variant="neon"
            size="lg"
            className="text-lg px-12 py-6 h-auto group animate-pulse-glow"
            onClick={() => navigate("/engine")}
          >
            Avvia SafeVin Engine
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SafevinDashboard;
