import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, DollarSign, Clock } from "lucide-react";
import PaisleyPattern from "./PaisleyPattern";

const LifestyleSection = () => {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 text-neon-red/5">
        <PaisleyPattern opacity={0.04} />
      </div>
      
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-neon-red/10 rounded-full blur-[200px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[150px] -translate-y-1/2" />
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-6">
              Lifestyle
            </span>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="text-foreground">Guadagna</span><br />
              <span className="text-neon-red text-glow-red">Mentre Dormi</span>
            </h2>
            
            <p className="text-foreground/60 text-lg mb-8 leading-relaxed">
              SafeVin lavora 24/7 per te. Automatizza le vendite, ottimizza i prezzi e massimizza i profitti mentre tu vivi la tua vita.
            </p>
            
            {/* Benefits list */}
            <div className="space-y-4 mb-10">
              {[
                { icon: Smartphone, text: "Gestisci tutto dal telefono" },
                { icon: DollarSign, text: "Pagamenti istantanei" },
                { icon: Clock, text: "Automazione 24/7" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-neon-red/10 border border-neon-red/20 flex items-center justify-center group-hover:bg-neon-red/20 transition-colors">
                    <item.icon className="w-5 h-5 text-neon-red" />
                  </div>
                  <span className="text-foreground/80 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            
            <Button variant="neon" size="lg" className="group">
              Inizia a Guadagnare
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Right visual */}
          <div className="relative">
            {/* Phone mockup */}
            <div className="relative mx-auto w-[280px] md:w-[320px]">
              {/* Phone frame */}
              <div className="relative rounded-[40px] bg-gradient-to-b from-zinc-800 to-zinc-900 p-3 shadow-2xl shadow-black/50">
                <div className="rounded-[32px] bg-background overflow-hidden aspect-[9/19]">
                  {/* Screen content */}
                  <div className="h-full p-4 bg-gradient-to-b from-zinc-900 to-background">
                    {/* Status bar */}
                    <div className="flex justify-between items-center mb-6 text-xs text-foreground/50">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-foreground/30 rounded-sm" />
                        <div className="w-4 h-2 bg-neon-red rounded-sm" />
                      </div>
                    </div>
                    
                    {/* Dashboard preview */}
                    <div className="text-center mb-4">
                      <div className="text-xs text-foreground/50 mb-1">Guadagno Oggi</div>
                      <div className="text-3xl font-black text-gold">€847.50</div>
                      <div className="text-xs text-green-500 mt-1">+23% vs ieri</div>
                    </div>
                    
                    {/* Mini chart */}
                    <div className="h-20 flex items-end justify-between gap-1 mb-4 px-2">
                      {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-neon-red to-neon-red/50 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-neon-red/10 border border-neon-red/20">
                        <div className="text-xs text-foreground/50">Vendite</div>
                        <div className="text-lg font-bold text-foreground">24</div>
                      </div>
                      <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
                        <div className="text-xs text-foreground/50">Attivi</div>
                        <div className="text-lg font-bold text-foreground">156</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-neon-red/30 rounded-[40px] blur-[60px] -z-10" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 md:right-0 p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-gold/30 shadow-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <div className="text-xs text-foreground/50">Nuovo pagamento</div>
                  <div className="font-bold text-foreground">+€127.00</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 md:left-0 p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-neon-red/30 shadow-xl animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neon-red/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-neon-red" />
                </div>
                <div>
                  <div className="text-xs text-foreground/50">Auto-pubblicato</div>
                  <div className="font-bold text-foreground">15 articoli</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
