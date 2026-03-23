import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EngineAudit = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-6 pt-8 pb-12 max-w-4xl">
        <Button variant="ghost" className="hidden md:inline-flex mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine/analyze")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tipo analisi
        </Button>
        <div className="text-center py-20 text-muted-foreground">
          <p>Nuova implementazione Audit in arrivo.</p>
        </div>
      </main>
    </div>
  );
};

export default EngineAudit;
