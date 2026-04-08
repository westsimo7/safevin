import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, PenTool, Zap } from "lucide-react";

const Engine = () => {
  const navigate = useNavigate();
  useSwipeBack("/home");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="text-center mb-4 md:mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 md:mb-4 text-[10px] md:text-xs">
            <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            SafeVin Engine
          </Badge>
          <PageTitle
            title="Cosa vuoi fare?"
            backTo="/home"
            subtitle="Scegli la modalità per iniziare."
            className="text-center"
          />
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-6 max-w-3xl mx-auto">
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group flex-1"
            onClick={() => navigate("/engine/analyze")}
          >
            <CardContent className="p-5 md:p-8 flex flex-col items-center text-center gap-3 md:gap-0 h-full justify-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-5 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-3">ANALIZZA</h2>
                <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                  Valuta il tuo annuncio con il sistema <span className="font-semibold text-primary">Audit</span>: carica immagini o link, ricevi uno score dettagliato e suggerimenti per migliorare.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group flex-1"
            onClick={() => navigate("/engine/studio")}
          >
            <CardContent className="p-5 md:p-8 flex flex-col items-center text-center gap-3 md:gap-0 h-full justify-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-5 group-hover:scale-110 transition-transform">
                <PenTool className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-3">CREA</h2>
                <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                  Genera un annuncio completo con il sistema <span className="font-semibold text-primary">Studio</span>: rispondi a poche domande e ottieni titolo, descrizione e struttura ottimizzata.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Engine;
