import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";

const EngineImprove = () => {
  useSwipeBack("/engine");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-6 pt-8 pb-12 max-w-2xl">
        <PageTitle title="Migliora" backTo="/engine" />
        <div className="text-center py-20 text-muted-foreground">
          <p>Nuova implementazione in arrivo.</p>
        </div>
      </main>
    </div>
  );
};

export default EngineImprove;
