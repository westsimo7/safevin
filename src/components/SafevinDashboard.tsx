import { useEffect, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PenTool, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { countStudioDrafts, getStudioDraftsChangeEvent } from "@/lib/studioDrafts";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "@/hooks/use-toast";

const SafevinHome = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refresh: refreshPlan } = usePlan();
  const [draftCount, setDraftCount] = useState(0);
  const spring = { type: "spring" as const, stiffness: 80, damping: 18 };
  const snappy = { type: "spring" as const, stiffness: 120, damping: 14 };

  useEffect(() => {
    const syncDraftCount = () => setDraftCount(countStudioDrafts());
    syncDraftCount();
    const changeEvent = getStudioDraftsChangeEvent();
    window.addEventListener(changeEvent, syncDraftCount);
    window.addEventListener("storage", syncDraftCount);
    return () => {
      window.removeEventListener(changeEvent, syncDraftCount);
      window.removeEventListener("storage", syncDraftCount);
    };
  }, []);

  // Handle return from Stripe checkout: refresh subscription and notify user.
  useEffect(() => {
    const status = searchParams.get("status");
    if (!status) return;
    if (status === "success") {
      toast({ title: "Pagamento completato", description: "Stiamo attivando il tuo piano…" });
      (async () => {
        try {
          await supabase.functions.invoke("check-subscription");
          await refreshPlan();
          toast({ title: "Piano attivo", description: "Il tuo abbonamento è stato attivato." });
        } catch (e) {
          console.error(e);
        }
      })();
    } else if (status === "cancel") {
      toast({ title: "Pagamento annullato", variant: "destructive" });
    }
    searchParams.delete("status");
    searchParams.delete("plan");
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "Continua i tuoi lavori",
      desc: draftCount > 0 ? `${draftCount} lavori da riprendere` : "Riprendi gli annunci incompleti",
      onClick: () => navigate("/incomplete"),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-5 sm:px-6 flex flex-col items-center">
          <div className="text-center max-w-3xl mx-auto mt-8 sm:mt-12 md:mt-16 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...snappy, delay: 0.1 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 sm:mb-6 text-[11px] sm:text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Benvenuto nel tuo centro di controllo
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 sm:mb-6 overflow-hidden leading-[0.9]"
              initial="hidden"
              animate="visible"
            >
              <motion.span
                className="inline-block text-foreground"
                variants={{ hidden: { opacity: 0, y: 80, rotateX: 40 }, visible: { opacity: 1, y: 0, rotateX: 0 } }}
                transition={{ ...spring, delay: 0.25 }}
              >
                SAFE
              </motion.span>
              <motion.span
                className="inline-block text-primary"
                variants={{ hidden: { opacity: 0, y: 80, rotateX: 40 }, visible: { opacity: 1, y: 0, rotateX: 0 } }}
                transition={{ ...spring, delay: 0.35 }}
              >
                Vi
              </motion.span>
              <motion.span
                className="inline-block text-foreground"
                variants={{ hidden: { opacity: 0, y: 80, rotateX: 40 }, visible: { opacity: 1, y: 0, rotateX: 0 } }}
                transition={{ ...spring, delay: 0.45 }}
              >
                N
              </motion.span>
              <br />
              <motion.span
                className="inline-block text-primary text-glow-red"
                variants={{ hidden: { opacity: 0, scale: 0.3, filter: "blur(20px)" }, visible: { opacity: 1, scale: 1, filter: "blur(0px)" } }}
                transition={{ ...spring, delay: 0.6 }}
              >
                STUDIO
              </motion.span>
            </motion.h1>

            

            <motion.div
              className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-1 sm:px-0"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.85 } } }}
            >
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6 text-left hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group cursor-pointer"
                  variants={{ hidden: { opacity: 0, y: 40, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                  transition={{ ...spring }}
                  onClick={feat.onClick}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 sm:mb-14 leading-relaxed px-2 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-bold text-foreground">Crea annunci ottimizzati in pochi minuti.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ ...spring, delay: 1.1 }}
            >
              <Button
                variant="neon"
                size="lg"
                className="text-lg sm:text-xl px-10 sm:px-16 py-6 sm:py-8 h-auto group animate-pulse-glow mb-4 sm:mb-6 w-full sm:w-auto font-bold"
                onClick={() => navigate("/engine/studio")}
              >
                Crea il tuo annuncio
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default SafevinHome;
