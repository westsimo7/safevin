import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PenTool, ArrowRight, Clock } from "lucide-react";

interface ToolSelectorProps {
  onSelectTool: (tool: "post" | "pre") => void;
  selectedTool: "post" | "pre" | null;
}

const ToolSelector = ({ onSelectTool, selectedTool }: ToolSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* SAFEVIN POST - Active */}
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${
          selectedTool === "post" ? "border-primary shadow-lg shadow-primary/20" : "border-border/50"
        }`}
        onClick={() => onSelectTool("post")}
      >
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20">
            Attivo
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">SAFEVIN POST</CardTitle>
          <CardDescription className="text-muted-foreground">
            Analizza un annuncio Vinted già pubblicato e scopri come aumentare visualizzazioni e vendite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="neon" className="w-full group">
            Analizza Annuncio
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      {/* SAFEVIN PRE - Coming Soon */}
      <Card 
        className="relative overflow-hidden opacity-60 cursor-not-allowed border-border/30"
      >
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
            <Clock className="w-3 h-3 mr-1" />
            In sviluppo
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <PenTool className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl font-bold text-muted-foreground">SAFEVIN PRE</CardTitle>
          <CardDescription className="text-muted-foreground/70">
            Crea annunci perfetti prima ancora di pubblicarli.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" className="w-full" disabled>
            Presto Disponibile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolSelector;
