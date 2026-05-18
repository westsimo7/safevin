import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "safevin-cookie-consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const check = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVisible(false);
        return;
      }
      // Mostra il banner dopo 10 secondi se non c'è ancora consenso
      timer = window.setTimeout(() => {
        const latest = localStorage.getItem(STORAGE_KEY);
        setVisible(!latest);
      }, 10000);
    };
    const reset = () => {
      if (timer) window.clearTimeout(timer);
      const stored = localStorage.getItem(STORAGE_KEY);
      setVisible(!stored);
    };
    check();
    window.addEventListener("safevin-cookie-reset", reset);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("safevin-cookie-reset", reset);
    };
  }, []);

  useEffect(() => {
    const updateDialogState = () => {
      const anyOpen = !!document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'
      );
      setDialogOpen(anyOpen);
    };
    updateDialogState();
    const observer = new MutationObserver(updateDialogState);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => observer.disconnect();
  }, []);

  const setConsent = (value: "accepted" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, ts: Date.now() }));
    setVisible(false);
  };

  if (!visible || dialogOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground font-poppins">
                Utilizziamo i cookie
              </h3>
              <button
                onClick={() => setConsent("rejected")}
                className="text-muted-foreground hover:text-foreground transition-colors -mr-1 -mt-1 p-1"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Usiamo cookie tecnici necessari e, con il tuo consenso, cookie analitici per
              migliorare l'esperienza.{" "}
              <Link to="/cookies" className="text-primary hover:underline">
                Scopri di più
              </Link>
              .
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setConsent("rejected")}
                className="flex-1 h-9 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-muted/50 transition-colors"
              >
                Solo necessari
              </button>
              <button
                onClick={() => setConsent("accepted")}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Accetta tutti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
