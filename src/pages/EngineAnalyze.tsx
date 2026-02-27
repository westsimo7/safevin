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

      <main className="container mx-auto px-6 pt-8 pb-12">
        <Button variant="ghost" className="hidden md:inline-flex mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Engine Home
        </Button>

        <div className="text-center mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Search className="w-3 h-3 mr-1" />
            Analisi
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Scegli tipo di analisi</h1>
          <p className="text-muted-foreground">Seleziona cosa vuoi analizzare.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Solo immagini */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group"
            onClick={() => navigate("/engine/analyze/images")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-3">Analizza solo immagini</h2>
              <p className="text-sm text-muted-foreground">
                Report approfondito foto per foto con problemi e soluzioni
              </p>
            </CardContent>
          </Card>

          {/* Annuncio completo */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group"
            onClick={() => navigate("/engine/analyze/audit")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-3">Analizza annuncio completo</h2>
              <p className="text-sm text-muted-foreground">
                SafeScore™ completo con 10 categorie e probabilità conversione
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EngineAnalyze;
