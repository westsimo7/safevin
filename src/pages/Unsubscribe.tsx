import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, MailX } from "lucide-react";

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (res.ok && data.valid) setState({ kind: "valid" });
        else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
        else setState({ kind: "invalid" });
      } catch {
        setState({ kind: "invalid" });
      }
    };

    validate();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) {
      setState({ kind: "error", message: "Si è verificato un errore. Riprova." });
      return;
    }
    if (data?.success) setState({ kind: "success" });
    else if (data?.reason === "already_unsubscribed") setState({ kind: "already" });
    else setState({ kind: "error", message: "Impossibile completare la disiscrizione." });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
        {state.kind === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-foreground">Verifica del link in corso…</p>
          </>
        )}

        {state.kind === "valid" && (
          <>
            <MailX className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Disiscriviti dalle email</h1>
            <p className="mt-2 text-muted-foreground">
              Confermando, smetterai di ricevere email da SAFEViN a questo indirizzo.
            </p>
            <Button onClick={handleConfirm} className="mt-6 w-full">
              Conferma disiscrizione
            </Button>
          </>
        )}

        {state.kind === "submitting" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-foreground">Disiscrizione in corso…</p>
          </>
        )}

        {state.kind === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Disiscrizione confermata</h1>
            <p className="mt-2 text-muted-foreground">
              Non riceverai più email da SAFEViN a questo indirizzo.
            </p>
          </>
        )}

        {state.kind === "already" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Già disiscritto</h1>
            <p className="mt-2 text-muted-foreground">
              Questo indirizzo è già stato rimosso dalle nostre comunicazioni.
            </p>
          </>
        )}

        {state.kind === "invalid" && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Link non valido</h1>
            <p className="mt-2 text-muted-foreground">
              Il link è scaduto o non è valido.
            </p>
          </>
        )}

        {state.kind === "error" && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Errore</h1>
            <p className="mt-2 text-muted-foreground">{state.message}</p>
            <Button onClick={handleConfirm} variant="outline" className="mt-6 w-full">
              Riprova
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
