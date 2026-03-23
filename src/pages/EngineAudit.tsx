import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search } from "lucide-react";
import AuditWizard, { type AuditData } from "@/components/AuditWizard";

const EngineAudit = () => {
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState<AuditData | null>(null);

  const handleComplete = (data: AuditData) => {
    setAuditData(data);
    // TODO: send to analysis engine
    console.log("Audit data collected:", data);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-12">
        <Button
          variant="ghost"
          className="hidden md:inline-flex mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/engine/analyze")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tipo analisi
        </Button>

        <div className="text-center mb-6 md:mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 md:mb-4">
            <Search className="w-3 h-3 mr-1" />
            Audit Completo
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-1">Analizza il tuo annuncio</h1>
          <p className="text-sm md:text-base text-muted-foreground">Inserisci i dati esatti del tuo annuncio, uno alla volta</p>
        </div>

        {!auditData ? (
          <AuditWizard onComplete={handleComplete} />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>Dati raccolti. Analisi in arrivo...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineAudit;
