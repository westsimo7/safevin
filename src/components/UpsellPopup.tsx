import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";

type Trigger = "welcome" | "limit_reached";

const STORAGE_KEY = "safevin_upsell_shown_v2";
const SESSION_KEY = "safevin_upsell_session_v2";

// limit_reached: shown only once ever (localStorage). welcome: shown once per session.
const getShownPersistent = (uid: string): Record<Trigger, boolean> => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { welcome: false, limit_reached: false };
};

const getShownSession = (uid: string): Record<Trigger, boolean> => {
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY}:${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { welcome: false, limit_reached: false };
};

const markShown = (uid: string, t: Trigger) => {
  if (t === "limit_reached") {
    const cur = getShownPersistent(uid);
    cur[t] = true;
    try { localStorage.setItem(`${STORAGE_KEY}:${uid}`, JSON.stringify(cur)); } catch {}
  } else {
    const cur = getShownSession(uid);
    cur[t] = true;
    try { sessionStorage.setItem(`${SESSION_KEY}:${uid}`, JSON.stringify(cur)); } catch {}
  }
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

    const shownP = getShownPersistent(user.id);
    const shownS = getShownSession(user.id);
    const remaining = state.studioRemaining ?? 0;

    let next: Trigger | null = null;
    if (remaining <= 0 && !shownP.limit_reached) next = "limit_reached";
    else if (!shownS.welcome) next = "welcome";

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

  const goStudio = () => {
    if (user && active) markShown(user.id, active);
    setActive(null);
    navigate("/engine/studio");
  };

  const content = useMemo(() => {
    switch (active) {
      case "welcome":
        return {
          icon: <Sparkles className="w-6 h-6 text-primary" />,
          title: "Hai 1 annuncio prova da usare",
          desc: "Non hai ancora usato il tuo annuncio prova gratuito. Provalo subito su Studio oppure scopri i piani in offerta lancio.",
          cta: "Usa il mio annuncio prova",
        };
      case "limit_reached":
        return {
          icon: <Crown className="w-6 h-6 text-primary" />,
          title: "Hai usato il tuo annuncio prova",
          desc: "Continua a creare senza limiti. Starter 5,99€ (10/mese) o Pro 12,99€ (25/mese + Artist Director).",
          cta: "Sblocca più annunci",
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

        {active === "limit_reached" && (
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
          <Button
            onClick={active === "welcome" ? goStudio : goPricing}
            className="w-full h-11"
          >
            {content.cta}
          </Button>
          {active === "welcome" && (
            <Button onClick={goPricing} variant="outline" className="w-full h-10">
              Vedi i piani
            </Button>
          )}
          <Button onClick={close} variant="ghost" className="w-full h-10 text-muted-foreground">
            {active === "limit_reached" ? "Più tardi" : "Più tardi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpsellPopup;
