import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Sei Tommy Scendi, l'assistente virtuale di SafeViN. Il tuo compito è aiutare gli utenti a risolvere qualsiasi problema relativo alla piattaforma SafeViN.

INFORMAZIONI SU SAFEVIN:
SafeViN è una piattaforma che aiuta i venditori su Vinted a creare annunci professionali e ottimizzati. Le funzionalità principali sono:

1. **Studio** - Crea annunci professionali: carica le foto del tuo articolo, rispondi a poche domande e SafeViN genera titolo, descrizione e keywords ottimizzati per Vinted.
2. **Audit** - Analizza annunci esistenti: inserisci un annuncio Vinted e ricevi un'analisi dettagliata con punteggio e suggerimenti di miglioramento.
3. **Coach** - Assistente AI personalizzato: chiedi consigli su vendite, prezzi, fotografia e strategie per vendere meglio su Vinted.
4. **Artist Director** - Servizio premium: un esperto modifica le tue foto per renderle più professionali (disponibile con piano Pro o Expert).
5. **Upgrade** - Invia idee e suggerimenti per migliorare la piattaforma.
6. **Storico** - Consulta tutti i tuoi annunci creati e analisi passate.

PIANI DISPONIBILI:
- **Starter** (gratuito): funzionalità base
- **Pro**: 2 campagne Artist Director, funzionalità avanzate
- **Expert**: 6 campagne Artist Director, tutte le funzionalità

PROBLEMI COMUNI:
- Se l'utente ha problemi con il login: suggerisci di verificare email/password, provare con Google, o cancellare cache del browser.
- Se le foto non si caricano: verificare dimensione (max 10MB), formato (JPG/PNG), connessione internet.
- Se lo Studio non genera risultati: riprovare, verificare che le foto siano chiare e le risposte complete.
- Se l'Audit non funziona: verificare che il link Vinted sia corretto e pubblico.

REGOLE:
- Rispondi SEMPRE in italiano
- Sii cordiale, empatico e professionale
- Se non riesci a risolvere il problema, suggerisci all'utente di parlare con un operatore umano
- Non inventare funzionalità che non esistono
- Mantieni le risposte concise ma complete
- Usa emoji con moderazione per rendere la conversazione più amichevole`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti esauriti." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Errore del servizio AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
