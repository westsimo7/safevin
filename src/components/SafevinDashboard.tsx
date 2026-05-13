import { useEffect, useMemo, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, History } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { countStudioDrafts, getStudioDraftsChangeEvent } from "@/lib/studioDrafts";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import FirstListingPopup from "@/components/FirstListingPopup";
import PurchaseGiftPopup from "@/components/PurchaseGiftPopup";

const SafevinHome = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refresh: refreshPlan, state: planState } = usePlan();
  const { user } = useAuth();
  const [draftCount, setDraftCount] = useState(0);
  const [creationsCount, setCreationsCount] = useState<number | null>(null);
  const [showFirstPopup, setShowFirstPopup] = useState(false);

  useEffect(() => {
    if (searchParams.get("firstPopup") === "1") {
      setShowFirstPopup(true);
      searchParams.delete("firstPopup");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const sessionId = searchParams.get("session_id");
    const bundle = searchParams.get("bundle");
    if (!status) return;
    if (status === "success") {
      toast({ title: "Pagamento completato", description: "Stiamo aggiornando il tuo account…" });
      (async () => {
        try {
          if (bundle && sessionId) {
            await supabase.functions.invoke("verify-bundle-payment", { body: { session_id: sessionId } });
          } else {
            await supabase.functions.invoke("check-subscription");
          }
          await refreshPlan();
          toast({ title: "Account aggiornato", description: bundle ? `Hai aggiunto ${bundle} annunci.` : "Il tuo abbonamento è stato attivato." });
        } catch (e) {
          console.error(e);
        }
      })();
    } else if (status === "cancel") {
      toast({ title: "Pagamento annullato", variant: "destructive" });
    }
    searchParams.delete("status");
    searchParams.delete("plan");
    searchParams.delete("bundle");
    searchParams.delete("session_id");
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planLabel = planState?.plan === "free" ? "Starter" : planState?.plan ? planState.plan.charAt(0).toUpperCase() + planState.plan.slice(1) : "Starter";

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
      desc: draftCount > 0 ? "Lavori in corso" : "Nessuno",
      onClick: () => navigate("/incomplete"),
      highlight: draftCount > 0,
      badge: draftCount > 0 ? draftCount : undefined,
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
          {(() => {
            const limitReached = !planState?.isFounder && (planState?.studioRemaining ?? 0) <= 0;
            return (
              <motion.button
                type="button"
                onClick={() => { if (limitReached) { navigate("/pricing"); } else { navigate("/engine/studio"); } }}
                disabled={limitReached}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...spring, delay: 0.08 }}
                whileHover={limitReached ? undefined : { y: -2 }}
                whileTap={limitReached ? undefined : { scale: 0.98 }}
                className={`card-holo w-full text-left rounded-3xl p-6 sm:p-7 group ${limitReached ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/70 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      {planState?.isFounder
                        ? "Annunci creabili: ∞"
                        : `Annunci creabili: ${planState?.studioRemaining ?? 0}`}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-1">
                      {limitReached ? "Limite raggiunto" : "Crea un nuovo annuncio"}
                    </h2>
                    <p className="text-sm text-foreground/70">
                      {limitReached
                        ? "Hai usato tutti gli annunci del tuo piano. Aggiorna per continuare."
                        : "Foto → titolo, descrizione e prezzo in pochi secondi."}
                    </p>
                  </div>
                  <div className="shrink-0 min-w-[3rem] h-12 px-3 rounded-2xl bg-foreground/10 backdrop-blur flex flex-col items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all leading-none">
                    <span className="text-xl font-bold tabular-nums">
                      {planState?.isFounder ? "∞" : (planState?.studioRemaining ?? 0)}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">left</span>
                  </div>
                </div>
              </motion.button>
            );
          })()}

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
            <motion.button
              type="button"
              onClick={() => navigate("/pricing#bundle")}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={spring}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="surface-soft rounded-2xl p-4 text-left transition-all ring-1 ring-orange-500/40 hover:ring-orange-500/70"
            >
              <p className="text-xs text-muted-foreground mb-1">Acquista</p>
              <p className="text-2xl font-bold text-orange-500">+ Annunci</p>
            </motion.button>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            className="grid grid-cols-2 gap-3"
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
                className={`relative surface-soft rounded-2xl p-4 text-left transition-all ${a.highlight ? "ring-1 ring-primary/40" : ""}`}
              >
                {a.badge !== undefined && (
                  <span className="absolute top-2 right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                    {a.badge}
                  </span>
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${a.highlight ? "bg-primary/15 text-primary" : "bg-foreground/5 text-foreground/80"}`}>
                  {a.icon}
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight">{a.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
              </motion.button>
            ))}
          </motion.div>

        </div>
      </main>
      <FirstListingPopup open={showFirstPopup} onOpenChange={setShowFirstPopup} />
      <PurchaseGiftPopup />
    </div>
  );
};

export default SafevinHome;
