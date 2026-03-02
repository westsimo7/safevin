import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, FileText, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const EngineAnalyze = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 md:px-6 pt-3 md:pt-8 pb-6 md:pb-12">
        <Button variant="ghost" className="hidden md:inline-flex mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Engine Home
        </Button>

        <div className="text-center mb-3 md:mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-1.5 md:mb-4 text-[10px] md:text-xs">
            <Search className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            Analisi
          </Badge>
          <h1 className="text-base md:text-4xl font-bold tracking-tight mb-0.5 md:mb-2">Scegli tipo di analisi</h1>
          <p className="text-[10px] md:text-base text-muted-foreground">Seleziona cosa vuoi analizzare.</p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-2.5 md:gap-6 max-w-3xl mx-auto">
          {/* Solo immagini */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group flex-1"
            onClick={() => navigate("/engine/analyze/images")}
          >
            <CardContent className="p-4 md:p-8 flex flex-col items-center text-center gap-2 md:gap-0 h-full justify-center">
              <div className="w-11 h-11 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-5 group-hover:scale-110 transition-transform">
                <Camera className="w-5.5 h-5.5 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-bold mb-0.5 md:mb-3">Analizza solo immagini</h2>
                <p className="text-[10px] md:text-sm text-muted-foreground leading-snug">
                  Report approfondito foto per foto con problemi e soluzioni
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Annuncio completo */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group flex-1"
            onClick={() => navigate("/engine/analyze/audit")}
          >
            <CardContent className="p-4 md:p-8 flex flex-col items-center text-center gap-2 md:gap-0 h-full justify-center">
              <div className="w-11 h-11 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-5.5 h-5.5 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-bold mb-0.5 md:mb-3">Analizza annuncio completo</h2>
                <p className="text-[10px] md:text-sm text-muted-foreground leading-snug">
                  SafeScore™ completo con 10 categorie e probabilità conversione
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EngineAnalyze;
