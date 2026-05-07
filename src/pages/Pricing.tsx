import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, Gift, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "",
    description: "Prova gratis con mano e guarda tu stesso se fa per te",
    icon: Gift,
    features: [
      "2 annunci creabili",
      "Prezzo strategico",
    ],
    limitations: [
      "Accesso alla SAFEViN Artist Direction",
      "3 annunci delegabili al team SAFEViN Artist Direction",
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    cta: "Prova gratis",
    popular: false,
  },
  {
    name: "Starter",
    price: "5,99",
    oldPrice: "8,99",
    period: "/mese",
    description: "Per iniziare a vendere meglio\nOttimizza i tuoi primi annunci",
    icon: Zap,
    features: [
      "10 annunci creabili",
      "Prezzo strategico",
    ],
    limitations: [
      "Accesso alla SAFEViN Artist Direction",
      "3 annunci delegabili al team SAFEViN Artist Direction",
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    cta: "Inizia ora",
    popular: false,
  },
  {
    name: "Pro",
    price: "12,99",
    oldPrice: "15,99",
    period: "/mese",
    description: "Per vendere con costanza\nPiù visibilità, più conversioni",
    icon: Crown,
    features: [
      "25 annunci creabili",
      "Prezzo strategico avanzato",
      "Accesso alla SAFEViN Artist Direction",
      "2 annunci delegabili al team SAFEViN Artist Direction",
      
    ],
    limitations: [
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    cta: "Attiva Pro",
    popular: true,
  },
  {
    name: "Expert",
    price: "34,99",
    period: "/mese",
    description: "Per massimizzare ogni annuncio\nEcosistema completo per veri expert",
    icon: Rocket,
    features: [
      "60 annunci creabili",
      "Prezzo strategico avanzato",
      "Accesso alla SAFEViN Artist Direction prioritaria",
      "6 annunci delegabili al team SAFEViN Artist Direction",
      
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    limitations: [],
    cta: "Passa a Expert",
    popular: false,
  },
];

type PlanKey = "free" | "starter" | "pro" | "expert";
const PLAN_LABEL_TO_KEY: Record<string, PlanKey> = {
  Free: "free",
  Starter: "starter",
  Pro: "pro",
  Expert: "expert",
};

const Pricing = () => {
  useSwipeBack("/home");
  const { user } = useAuth();
  const { state: planState, refresh: refreshPlan } = usePlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentPlanKey: PlanKey = planState?.plan ?? "free";

  // After Stripe redirect, refresh subscription state
  useEffect(() => {
    const status = searchParams.get("status");
    if (!status) return;
    if (status === "success") {
      toast({ title: "Pagamento completato", description: "Stiamo aggiornando il tuo piano…" });
      (async () => {
        try {
          await supabase.functions.invoke("check-subscription");
          await refreshPlan();
        } catch (e) {
          console.error(e);
        }
      })();
    } else if (status === "cancel") {
      toast({ title: "Pagamento annullato", variant: "destructive" });
    }
    searchParams.delete("status");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, refreshPlan]);

  // On mount, refresh subscription from Stripe to keep DB in sync
  useEffect(() => {
    if (!user) return;
    supabase.functions.invoke("check-subscription").then(() => refreshPlan()).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCheckout = async (planKey: PlanKey) => {
    if (!user) {
      toast({ title: "Accedi per continuare", description: "Devi essere registrato per attivare un piano." });
      return;
    }
    if (planKey === "free") return;
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planKey },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("Nessun URL di checkout ricevuto");
    } catch (e: any) {
      toast({ title: "Errore", description: e.message ?? "Impossibile avviare il pagamento", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Errore", description: e.message ?? "Impossibile aprire la gestione abbonamento", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <PageTitle
            title="Scegli il tuo piano"
            subtitle="Ogni piano è pensato per darti strumenti concreti. Nessuna promessa vuota, solo metodo."
            backTo="/home"
            className="text-center"
          />

          <div className="-mx-4 sm:mx-0 mt-6">
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-px-4 px-4 sm:px-0 pt-5 sm:pt-4 pb-4 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {plans.map((plan) => {
              const planKey = PLAN_LABEL_TO_KEY[plan.name];
              const isCurrent = planKey === currentPlanKey;
              const isStarter = plan.name === "Starter";
              const isExpert = plan.name === "Expert";

              // Accent palette per plan (independent from current state)
              const accent = isStarter
                ? { border: "border-orange-500/60", shadow: "shadow-orange-500/10", bg: "bg-orange-500/20", iconBg: "bg-orange-500/10", text: "text-orange-500", badgeBg: "bg-orange-500", badgeText: "text-white", badgeShadow: "shadow-orange-500/30" }
                : isExpert
                  ? { border: "border-blue-500/60", shadow: "shadow-blue-500/10", bg: "bg-blue-500/20", iconBg: "bg-blue-500/10", text: "text-blue-500", badgeBg: "bg-blue-500", badgeText: "text-white", badgeShadow: "shadow-blue-500/30" }
                  : plan.popular
                    ? { border: "border-primary/50", shadow: "shadow-primary/10", bg: "bg-primary/20", iconBg: "bg-primary/10", text: "text-primary", badgeBg: "bg-primary", badgeText: "text-primary-foreground", badgeShadow: "shadow-primary/30" }
                    : { border: "border-border/50", shadow: "", bg: "bg-muted", iconBg: "bg-muted", text: "text-foreground", badgeBg: "", badgeText: "", badgeShadow: "" };

              // Current plan: yellow border overrides, but keep accent fill colors
              const cardBorder = isCurrent
                ? "border-2 border-yellow-400 bg-card shadow-lg shadow-yellow-400/20"
                : (accent.border.includes("border-2") || isExpert || isStarter || plan.popular)
                  ? `border-2 ${accent.border} bg-card shadow-lg ${accent.shadow}`
                  : `border ${accent.border} bg-card/50 hover:border-border`;

              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col p-3.5 rounded-2xl transition-all duration-300 shrink-0 w-[85%] snap-center sm:w-auto sm:shrink ${cardBorder}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="px-3 py-1 rounded-full bg-yellow-400 text-background text-xs font-semibold whitespace-nowrap shadow-lg shadow-yellow-400/30">
                        Piano attuale
                      </div>
                    </div>
                  )}
                  {isStarter && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold whitespace-nowrap shadow-lg shadow-orange-500/30">
                        Per Iniziare
                      </div>
                    </div>
                  )}
                  {plan.popular && !isCurrent && !isStarter && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        Il più venduto
                      </div>
                    </div>
                  )}
                  {isExpert && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold whitespace-nowrap shadow-lg shadow-blue-500/30">
                        Per gli esperti
                      </div>
                    </div>
                  )}

                  <div className="mb-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${accent.bg}`}>
                      <plan.icon className={`w-4 h-4 ${accent.text}`} />
                    </div>
                    <h3 className={`text-base font-bold mb-0.5 ${accent.text}`}>
                      {plan.name}
                    </h3>
                    <p className="text-[11px] leading-snug text-muted-foreground whitespace-pre-line">{plan.description}</p>
                  </div>

                  <div className="mb-2.5">
                    <span className="text-2xl font-bold text-foreground">€{plan.price}</span>
                    <span className="text-muted-foreground text-xs">{plan.period}</span>
                  </div>

                  <ul className="space-y-1.5 mb-3 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${accent.iconBg}`}>
                          <Check className={`w-2 h-2 ${accent.text}`} />
                        </div>
                        <span className="text-foreground/80 text-[11px] leading-snug">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <li key={`lim-${i}`} className="flex items-start gap-1.5 opacity-40">
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted">
                          <span className="text-[9px] text-muted-foreground">–</span>
                        </div>
                        <span className="text-muted-foreground text-[11px] leading-snug line-through">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? "outline" : plan.popular ? "neon" : "glass"}
                    className="w-full text-xs h-9"
                    disabled={isCurrent || planKey === "free" || loadingPlan !== null}
                    onClick={() => handleCheckout(planKey)}
                  >
                    {loadingPlan === planKey ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isCurrent ? (
                      "Piano attuale"
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>
              );
            })}
            </div>
          </div>

          {currentPlanKey !== "free" && (
            <div className="flex justify-center mt-5">
              <Button variant="outline" size="sm" onClick={handleManage} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                Gestisci abbonamento
              </Button>
            </div>
          )}
          <p className="text-center text-muted-foreground text-xs mt-5">
            Cancelli quando vuoi. Zero vincoli. Zero sorprese.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
