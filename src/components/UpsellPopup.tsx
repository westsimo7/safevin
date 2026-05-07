import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";

type Trigger = "welcome" | "after_first" | "limit_reached";

const STORAGE_KEY = "safevin_upsell_shown_v1";

const getShown = (uid: string): Record<Trigger, boolean> => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { welcome: false, after_first: false, limit_reached: false };
};

const markShown = (uid: string, t: Trigger) => {
  const cur = getShown(uid);
  cur[t] = true;
  try {
    localStorage.setItem(`${STORAGE_KEY}:${uid}`, JSON.stringify(cur));
  } catch {}
};

const HIDDEN_ROUTES = ["/auth", "/reset-password", "/pricing", "/unsubscribe"];

const UpsellPopup = () => {
  const { user } = useAuth();
  const { state, loading } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState<Trigger | null>(null);

  const isHidden = HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r)) || location.pathname === "/";

  useEffect(() => {
    if (!user || loading || !state || isHidden) return;
    if (state.isFounder) return;
    if (state.plan !== "free") return;

    const shown = getShown(user.id);
    const used = state.studioUsed ?? 0;
    const limit = state.studioLimit ?? 2;

    let next: Trigger | null = null;
    if (used >= limit && !shown.limit_reached) next = "limit_reached";
    else if (used === 1 && !shown.after_first) next = "after_first";
    else if (used === 0 && !shown.welcome) next = "welcome";

    if (next) {
      const t = setTimeout(() => setActive(next), next === "welcome" ? 1500 : 600);
      return () => clearTimeout(t);
    }
  }, [user, loading, state, isHidden, location.pathname]);

  const close = () => {
    if (user && active) markShown(user.id, active);
    setActive(null);
  };

  const goPricing = () => {
    if (user && active) markShown(user.id, active);
    setActive(null);
    navigate("/pricing");
  };

  const content = useMemo(() => {
    switch (active) {
      case "welcome":
        return {
          icon: <Sparkles className="w-6 h-6 text-primary" />,
          title: "Benvenuto in SAFEViN",
          desc: "Hai 2 annunci gratuiti per provare lo Studio. Vuoi crearne molti di più? Sblocca i piani in offerta lancio.",
          cta: "Scopri i piani",
        };
      case "after_first":
        return {
          icon: <Rocket className="w-6 h-6 text-primary" />,
          title: "Ottimo, primo annuncio creato!",
          desc: "Ti rimane 1 solo annuncio gratis. Passa a Starter (5,99€ invece di 8,99€) e crea fino a 10 annunci al mese.",
          cta: "Sblocca Starter a 5,99€",
        };
      case "limit_reached":
        return {
          icon: <Crown className="w-6 h-6 text-primary" />,
          title: "Hai usato i tuoi annunci gratuiti",
          desc: "Continua a creare senza limiti. Pro a 12,99€ (invece di 15,99€) per 25 annunci al mese + Artist Director.",
          cta: "Passa a Pro a 12,99€",
        };
      default:
        return null;
    }
  }, [active]);

  if (!content) return null;

  return (
    <Dialog open={!!active} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            {content.icon}
          </div>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {content.desc}
          </DialogDescription>
        </DialogHeader>

        {active !== "welcome" && (
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="rounded-xl border border-border/50 p-3 bg-muted/30">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Starter</p>
              <p className="text-base font-bold text-foreground">
                5,99€ <span className="text-xs font-normal text-muted-foreground line-through">8,99€</span>
              </p>
              <p className="text-[11px] text-muted-foreground">10 annunci/mese</p>
            </div>
            <div className="rounded-xl border border-primary/40 p-3 bg-primary/5">
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Pro</p>
              <p className="text-base font-bold text-foreground">
                12,99€ <span className="text-xs font-normal text-muted-foreground line-through">15,99€</span>
              </p>
              <p className="text-[11px] text-muted-foreground">25 annunci/mese</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={goPricing} className="w-full h-11">{content.cta}</Button>
          <Button onClick={close} variant="ghost" className="w-full h-10 text-muted-foreground">
            {active === "limit_reached" ? "Più tardi" : "Continua gratis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpsellPopup;
