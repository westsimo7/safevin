import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, History, PenTool, Search } from "lucide-react";

const Storico = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            <History className="w-3 h-3 mr-1" />
            I tuoi lavori
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Storico completo.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tutti i tuoi annunci e audit in un unico punto.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all cursor-pointer flex flex-col" onClick={() => navigate("/storico/audit")}>
            <CardHeader className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">SAFEViN Audit</CardTitle>
              </div>
              <CardDescription className="text-base">
                In questa sezione trovi tutte le analisi effettuate con SAFEViN Audit.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button variant="glass" size="sm" className="group">
                Vai ai tuoi Audit
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all cursor-pointer flex flex-col" onClick={() => navigate("/storico/studio")}>
            <CardHeader className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <PenTool className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">SAFEViN Studio</CardTitle>
              </div>
              <CardDescription className="text-base">
                In questa sezione trovi tutti gli annunci creati con SAFEViN Studio.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button variant="glass" size="sm" className="group">
                Vai ai tuoi annunci Studio
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Storico;
