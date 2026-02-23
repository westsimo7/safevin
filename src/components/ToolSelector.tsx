import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PenTool, ArrowRight, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ToolSelectorProps {
  onSelectTool: (tool: "post" | "pre") => void;
  selectedTool: "post" | "pre" | null;
}

const ToolSelector = ({ onSelectTool, selectedTool }: ToolSelectorProps) => {
  const [coachOpen, setCoachOpen] = useState(false);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* SAFEViN Audit */}
        <Card 
          className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] flex flex-col ${
            selectedTool === "post" ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]" : "border-border/50"
          }`}
          onClick={() => onSelectTool("post")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold flex-1">SAFEViN Audit</CardTitle>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20 text-[10px] px-2 py-0.5">
                Attivo
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground text-sm mt-3 leading-relaxed">
              Analisi strutturale del tuo annuncio pubblicato. SafeScore™ su 10 categorie, problemi e soluzioni operative.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-0">
            <Button variant="neon" className="w-full group">
              Avvia Audit
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* SAFEViN Studio */}
        <Card 
          className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] flex flex-col ${
            selectedTool === "pre" ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]" : "border-border/50"
          }`}
          onClick={() => onSelectTool("pre")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <PenTool className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold flex-1">SAFEViN Studio</CardTitle>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20 text-[10px] px-2 py-0.5">
                Attivo
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground text-sm mt-3 leading-relaxed">
              Costruzione strategica dell'annuncio prima della pubblicazione. L'AI ti guida passo dopo passo.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-0">
            <Button variant="neon" className="w-full group">
              Avvia Studio
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* SAFEViN Coach (Placeholder) */}
        <Card 
          className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:border-muted-foreground/30 flex flex-col border-border/30 opacity-75"
          onClick={() => setCoachOpen(true)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg font-bold flex-1 text-muted-foreground">SAFEViN Coach</CardTitle>
              <Badge className="bg-muted text-muted-foreground border-border text-[10px] px-2 py-0.5">
                In sviluppo
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground/70 text-sm mt-3 leading-relaxed">
              Ti guida dalla pubblicazione alla vendita con analisi psicologica avanzata dell'acquirente.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-0">
            <Button variant="glass" className="w-full opacity-50 cursor-not-allowed" disabled>
              Presto disponibile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coach Modal */}
      <Dialog open={coachOpen} onOpenChange={setCoachOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              SafeVin Coach
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              SafeVin Coach sarà presto disponibile. Ti guiderà dalla pubblicazione alla gestione dei messaggi con analisi psicologica avanzata.
            </DialogDescription>
          </DialogHeader>
          <Button variant="glass" className="w-full mt-2" onClick={() => setCoachOpen(false)}>
            Ho capito
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ToolSelector;
