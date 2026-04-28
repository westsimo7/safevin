import { useEffect, useMemo, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, MessageCircle, History, Wand2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { countStudioDrafts, getStudioDraftsChangeEvent } from "@/lib/studioDrafts";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const SafevinHome = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refresh: refreshPlan, plan } = usePlan();
  const { user } = useAuth();
  const [draftCount, setDraftCount] = useState(0);
  const [creationsCount, setCreationsCount] = useState<number | null>(null);

  const spring = { type: "spring" as const, stiffness: 90, damping: 18 };

  const firstName = useMemo(() => {
    const meta = (user?.user_metadata || {}) as Record<string, unknown>;
    const fromMeta = (meta.full_name || meta.name || meta.first_name) as string | undefined;
    if (fromMeta) return String(fromMeta).split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "";
  }, [user]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return "Buonanotte";
    if (h < 13) return "Buongiorno";
    if (h < 19) return "Buon pomeriggio";
    return "Buonasera";
  }, []);

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

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const { count } = await supabase
        .from("studio_creations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setCreationsCount(count ?? 0);
    })();
  }, [user?.id]);

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

  const planLabel = plan?.tier ? plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1) : "Free";

  const quickActions = [
    {
      icon: <History className="w-5 h-5" />,
      title: "Storico",
      desc: "I tuoi annunci",
      onClick: () => navigate("/storico"),
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Riprendi",
      desc: draftCount > 0 ? `${draftCount} in sospeso` : "Nessuno",
      onClick: () => navigate("/incomplete"),
      highlight: draftCount > 0,
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Coach",
      desc: "Consigli rapidi",
      onClick: () => navigate("/coach"),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 py-6 sm:py-10 space-y-5 sm:space-y-6">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring }}
          >
            <p className="text-sm text-muted-foreground font-medium mb-1">{greeting}</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {firstName ? (
                <>
                  Ciao,{" "}
                  <span className="text-primary">{firstName}!</span>
                </>
              ) : (
                <>Benvenuto in <span className="text-primary">SAFEViN</span></>
              )}
            </h1>
          </motion.div>

          {/* Hero CTA — holographic card */}
          <motion.button
            type="button"
            onClick={() => navigate("/engine/studio")}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.08 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="card-holo w-full text-left rounded-3xl p-6 sm:p-7 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/70 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Studio · {planLabel}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-1">
                  Crea un nuovo annuncio
                </h2>
                <p className="text-sm text-foreground/70">
                  Foto → titolo, descrizione e prezzo in pochi secondi.
                </p>
              </div>
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-foreground/10 backdrop-blur flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Stats row */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={spring}
              className="surface-soft rounded-2xl p-4"
            >
              <p className="text-xs text-muted-foreground mb-1">Annunci creati</p>
              <p className="text-2xl font-bold text-foreground">{creationsCount ?? "—"}</p>
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={spring}
              className="surface-soft rounded-2xl p-4"
            >
              <p className="text-xs text-muted-foreground mb-1">In sospeso</p>
              <p className="text-2xl font-bold text-foreground">{draftCount}</p>
            </motion.div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
          >
            {quickActions.map((a, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={a.onClick}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                transition={spring}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`surface-soft rounded-2xl p-4 text-left transition-all ${a.highlight ? "ring-1 ring-primary/40" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${a.highlight ? "bg-primary/15 text-primary" : "bg-foreground/5 text-foreground/80"}`}>
                  {a.icon}
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight">{a.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
              </motion.button>
            ))}
          </motion.div>

          {/* Secondary CTA */}
          <motion.button
            type="button"
            onClick={() => navigate("/coach")}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.35 }}
            whileHover={{ y: -2 }}
            className="surface-soft w-full rounded-2xl p-4 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Chiedi al Coach</p>
              <p className="text-xs text-muted-foreground">Consigli su prezzo, foto e descrizioni.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </main>
    </div>
  );
};

export default SafevinHome;
