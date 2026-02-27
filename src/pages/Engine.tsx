import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, PenTool, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Engine = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-8 md:pb-12">
        <Button variant="ghost" className="mb-3 md:mb-6 text-muted-foreground hover:text-foreground h-8 text-xs md:text-sm md:h-10" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5" />
          Dashboard
        </Button>

        <div className="text-center mb-6 md:mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 md:mb-4 text-[10px] md:text-xs">
            <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            SafeVin Engine
          </Badge>
          <h1 className="text-xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">Cosa vuoi fare?</h1>
          <p className="text-xs md:text-base text-muted-foreground">Scegli la modalità per iniziare.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-3xl mx-auto">
          {/* ANALIZZA */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group"
            onClick={() => navigate("/engine/analyze")}
          >
            <CardContent className="p-4 md:p-8 text-center">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-5 group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <h2 className="text-base md:text-2xl font-bold mb-1.5 md:mb-3">ANALIZZA</h2>
              <p className="text-[11px] md:text-sm text-muted-foreground leading-snug">
                Carica immagini o annuncio, ricevi score e fix
              </p>
            </CardContent>
          </Card>

          {/* CREA */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group"
            onClick={() => navigate("/engine/studio")}
          >
            <CardContent className="p-4 md:p-8 text-center">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-5 group-hover:scale-110 transition-transform">
                <PenTool className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <h2 className="text-base md:text-2xl font-bold mb-1.5 md:mb-3">CREA</h2>
              <p className="text-[11px] md:text-sm text-muted-foreground leading-snug">
                Genera annuncio completo guidato (Studio)
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Engine;
