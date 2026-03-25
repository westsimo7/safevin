import { useNavigate, useParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const StudioDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-6 py-12 max-w-3xl text-center">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/storico")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna allo Storico
        </Button>
        <p className="text-muted-foreground">Dettaglio Studio non disponibile — versione 2.0 in arrivo.</p>
      </main>
    </div>
  );
};

export default StudioDetail;
