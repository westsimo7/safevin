import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, PenTool, ArrowRight } from "lucide-react";

interface ToolSelectorProps {
  onSelectTool: (tool: "post" | "pre") => void;
  selectedTool: "post" | "pre" | null;
}

const ToolSelector = ({ onSelectTool, selectedTool }: ToolSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* SAFEViN Audit - Active */}
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
          <CardTitle className="text-xl font-bold">SAFEViN Audit</CardTitle>
          <CardDescription className="text-muted-foreground">
            Analisi strutturale del tuo annuncio pubblicato. SafeScore™ su 10 categorie, problemi e soluzioni operative.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="neon" className="w-full group">
            Avvia Audit
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      {/* SAFEViN Studio - Active */}
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${
          selectedTool === "pre" ? "border-primary shadow-lg shadow-primary/20" : "border-border/50"
        }`}
        onClick={() => onSelectTool("pre")}
      >
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20">
            Attivo
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <PenTool className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">SAFEViN Studio</CardTitle>
          <CardDescription className="text-muted-foreground">
            Costruzione strategica dell'annuncio prima della pubblicazione. L'AI ti guida passo dopo passo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="neon" className="w-full group">
            Avvia Studio
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolSelector;
