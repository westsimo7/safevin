import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { PenTool, Rocket } from "lucide-react";

const AboutStudio = () => {
  useSwipeBack("/home");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-6 py-12 max-w-3xl text-center space-y-6">
        <PageTitle title="Studio 2.0" backTo="/home" className="text-center" />

        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <PenTool className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">
          <span className="text-foreground">SAFE</span>
          <span className="text-primary">ViN</span>
          <span className="text-foreground"> Studio 2.0</span>
        </h2>
        <p className="text-muted-foreground text-lg">La nuova versione di Studio è in fase di sviluppo.</p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
          <Rocket className="w-4 h-4" />
          <span>Coming soon</span>
        </div>
      </main>
    </div>
  );
};

export default AboutStudio;
