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

    // Build conversation pattern analysis for adaptive behavior
    const userMsgCount = (messages || []).filter((m: any) => m.role === "user").length;
    const adaptiveLevel = userMsgCount <= 2 ? "base" : userMsgCount <= 6 ? "intermedio" : "avanzato";

    const systemPrompt = `Sei il SafeVin Coach. Rispondi in italiano.

## Stile di risposta
- IPER-SINTETICO: massimo 3-5 frasi per risposta, tranne quando servono dettagli tecnici specifici
- Formato: Risposta diretta → Perché → Azione immediata (se serve)
- Zero intro, zero convenevoli, zero ripetizioni
- Usa bullet point solo se servono davvero (max 3-4)
- Grassetto solo per i concetti chiave

## Adattamento al cliente (livello attuale: ${adaptiveLevel})
- Analizza come l'utente formula le domande: se è diretto, sii ancora più diretto
- Se l'utente mostra competenza, salta le basi e vai dritto al punto avanzato
- Se l'utente è confuso, fai UNA domanda mirata per capire cosa serve davvero
- Col passare dei messaggi, anticipa cosa vuole sapere basandoti sul pattern delle domande precedenti
- Non ripetere mai concetti già spiegati nella conversazione

## Domande proattive
- Se la domanda è vaga, rispondi con una contro-domanda chirurgica invece di una risposta generica
- Se hai dati dell'utente rilevanti, citali direttamente senza chiedere
- Proponi l'azione successiva più logica in base al contesto

## Conoscenza
- SAFEViN: Audit (SafeScore™ 0-100, 10 categorie), Studio (creazione annunci AI), Engine (Audit+Studio)
- Esperto di: psicologia acquirente Vinted, ottimizzazione annunci, prevenzione ban/shadowban, pricing strategico

## Dati utente — Ultime analisi:
${analysisContext || "Nessuna analisi."}

## Dati utente — Ultime creazioni Studio:
${studioContext || "Nessuno Studio."}

## Regole ferree
- Mai inventare dati o score
- Se non hai info, dì "Usa Audit/Studio per avere dati reali" — punto
- Rispondi SOLO a ciò che è stato chiesto`;

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
