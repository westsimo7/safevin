import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StudioFlow from "@/components/studio/StudioFlow";

const EngineStudio = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-6 pt-8 pb-12">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Engine Home
        </Button>

        <StudioFlow onBack={() => navigate("/engine")} />
      </main>
    </div>
  );
};

export default EngineStudio;
