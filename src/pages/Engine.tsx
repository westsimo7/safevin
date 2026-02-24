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

      <main className="container mx-auto px-6 pt-8 pb-12">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Button>

        <div className="text-center mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Zap className="w-3 h-3 mr-1" />
            SafeVin Engine
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Cosa vuoi fare?</h1>
          <p className="text-muted-foreground">Scegli la modalità per iniziare.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* ANALIZZA */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group"
            onClick={() => navigate("/engine/analyze")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">ANALIZZA</h2>
              <p className="text-sm text-muted-foreground">
                Carica immagini o annuncio, ricevi score e fix
              </p>
            </CardContent>
          </Card>

          {/* CREA */}
          <Card
            className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all cursor-pointer group"
            onClick={() => navigate("/engine/studio")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <PenTool className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">CREA</h2>
              <p className="text-sm text-muted-foreground">
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
