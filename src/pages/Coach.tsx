import { Construction } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import BottomBar from "@/components/BottomBar";
import { useSwipeBack } from "@/hooks/useSwipeBack";

const Coach = () => {
  useSwipeBack();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppNavbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Work in progress
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
          SAFEViN Coach è in fase di sviluppo.
        </p>
        <p className="text-muted-foreground/60 text-xs sm:text-sm mt-2">
          Data di rilascio da definire
        </p>
      </main>
      <BottomBar />
    </div>
  );
};

export default Coach;
