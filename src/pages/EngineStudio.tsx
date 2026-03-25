import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenTool, Rocket } from "lucide-react";

const EngineStudio = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-6 pt-8 pb-12">
        <Button variant="ghost" className="hidden md:inline-flex mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Engine Home
        </Button>

        <div className="max-w-2xl mx-auto pt-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <PenTool className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-foreground">SAFE</span>
            <span className="text-primary">ViN</span>
            <span className="text-foreground"> Studio 2.0</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Stiamo costruendo la nuova versione di Studio. Torna presto!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
            <Rocket className="w-4 h-4" />
            <span>In fase di sviluppo</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EngineStudio;
