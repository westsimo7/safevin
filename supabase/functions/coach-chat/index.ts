import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";

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

    // Fetch recent data from DB to give the coach context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Fetch last 10 analyses
    const { data: analyses } = await sb
      .from("analyses")
      .select("titolo, categoria, prezzo, condizioni, analysis_type, origin, created_at, analysis_result")
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch last 10 studio creations
    const { data: creations } = await sb
      .from("studio_creations")
      .select("titolo_generato, categoria, origin, created_at, output")
      .order("created_at", { ascending: false })
      .limit(10);

    // Build context summary
    const analysisContext = (analyses || []).map((a: any) => {
      const result = a.analysis_result;
      const score = result?.safescore_totale ?? result?.punteggio_totale ?? "N/A";
      return `- "${a.titolo}" (${a.categoria}, ${a.prezzo}€, ${a.condizioni}) — SafeScore: ${score}/100 [${a.analysis_type}, ${a.origin}] (${a.created_at})`;
    }).join("\n");

    const studioContext = (creations || []).map((c: any) => {
      return `- "${c.titolo_generato || "Senza titolo"}" (${c.categoria}) [${c.origin}] (${c.created_at})`;
    }).join("\n");

    const systemPrompt = `Sei il SafeVin Coach, un assistente AI esperto di vendita su Vinted e marketplace.
Il tuo tono è professionale, diretto e pratico — zero hype, zero emoji eccessive. Rispondi in italiano.

## Il tuo ruolo
- Aiuti gli utenti a migliorare le loro vendite su Vinted
- Conosci a fondo il sistema SAFEViN: Audit (analisi annunci con SafeScore™ da 0 a 100 su 10 categorie), Studio (creazione annunci AI-powered), Engine (Audit + Studio uniti)
- Dai consigli sulla psicologia dell'acquirente, ottimizzazione titoli/descrizioni/foto/prezzi, prevenzione ban e shadowban
- Rispondi basandoti sui dati reali dell'utente quando disponibili

## Funzionalità SAFEViN
- **SafeScore™**: Punteggio 0-100 su 10 categorie (Foto, Titolo, Descrizione, Prezzo, Categoria/Tag, Brand, Condizioni, Taglia/Materiale, Tempo Caricamento, Psicologia Acquirente)
- **Audit**: Analisi approfondita di annunci esistenti o da testare
- **Studio**: Generazione completa di annunci ottimizzati (titolo, descrizione, keyword) partendo da foto e domande
- **Engine**: Pipeline unificata Audit → Fix → Studio
- **Refinement Mode**: Annunci generati dallo Studio ricevono un boost minimo di 70/100 in Audit

## Dati dell'utente — Ultime analisi:
${analysisContext || "Nessuna analisi ancora effettuata."}

## Dati dell'utente — Ultime creazioni Studio:
${studioContext || "Nessuna creazione Studio ancora."}

## Regole
- Risposte concise e actionable
- Se l'utente chiede di un suo annuncio specifico, cerca nei dati sopra
- Se non hai dati sufficienti, suggerisci di usare Audit o Studio
- Non inventare dati o score che non esistono`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppi messaggi, riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Errore AI gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
