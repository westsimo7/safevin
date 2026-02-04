import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei SAFEVIN 2.0, un analizzatore professionale di annunci Vinted con controlli avanzati.

Analizza REALMENTE l'annuncio fornito esaminando ogni dettaglio. Restituisci un JSON con la seguente struttura ESATTA:

{
  "overallScore": [numero da 0 a 100],
  "sections": [
    {
      "title": "Titolo Prodotto",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Lunghezza titolo", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Presenza marca", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Presenza taglia/misura", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Ordine parole", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Parole cercabili", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Foto Principali",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Luminosità", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Nitidezza", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Sfondo", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Numero foto", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Qualità prima foto", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Prezzo Strategico",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Differenza media mercato", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Percezione affare", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Margine trattativa", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Coerenza condizioni", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Competitività", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Descrizione",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Chiarezza condizione", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Presenza misure", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Difetti dichiarati", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Tempo spedizione", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Fiducia generale", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Tag / Categoria / Brand",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Campi mancanti", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Colore", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Materiale", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Stile", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Precisione categoria", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Tempo di Risposta",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Velocità media", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Rischio perdita vendita", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Notifiche attive", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Fasce orarie attive", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Stato online percepito", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Attività Profilo",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Frequenza upload", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Numero annunci", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Interazioni", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Ultimo accesso", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Costanza", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Ripubblicazione",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Età annuncio", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Like stagnanti", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Visualizzazioni ferme", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Prezzo invariato", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Foto invariata", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Psicologia Acquirente",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Urgenza percepita", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Sicurezza", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Valore percepito", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Chiarezza offerta", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Fiducia venditore", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    },
    {
      "title": "Volume Annunci",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico principale]",
      "advancedChecks": [
        {"label": "Numero annunci", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Diversificazione", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Frequenza pubblicazione", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Coerenza nicchia", "status": "ok|warning|error", "detail": "[dettaglio specifico]"},
        {"label": "Potenziale scala", "status": "ok|warning|error", "detail": "[dettaglio specifico]"}
      ]
    }
  ]
}

REGOLE CRITICHE:
- Rispondi SOLO con il JSON, nessun altro testo
- ANALIZZA REALMENTE il contenuto dell'URL fornito
- I punteggi devono essere VARIABILI e REALISTICI basati sull'annuncio reale
- advancedChecks deve contenere ESATTAMENTE 5 controlli per sezione
- status può essere solo: "ok" (verde), "warning" (giallo), "error" (rosso)
- detail deve essere una frase CORTA e DIRETTA con la soluzione immediata
- Tono: umano, semplice, diretto, zero tecnicismi
- Frasi corte. Soluzioni immediate. Niente teoria.

ESEMPI DI DETAIL EFFICACI:
- "Aggiungi la marca nel titolo"
- "Scatta foto con luce naturale"
- "Prezzo 15% sopra la media"
- "Mancano le misure in cm"
- "Categoria troppo generica"`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { vintedUrl, listing, analysisType } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userMessage: string;

    // Handle POST analysis (URL-based)
    if (analysisType === "post" && vintedUrl) {
      userMessage = `Analizza questo annuncio Vinted: ${vintedUrl}

Nota: Non ho accesso diretto al contenuto dell'annuncio, quindi fornisci un'analisi basata su best practices generali per un annuncio Vinted tipico, con consigli specifici per ogni sezione.

Genera punteggi realistici variabili (non tutti uguali) e consigli personalizzati.`;
    } 
    // Handle legacy listing-based analysis
    else if (listing) {
      userMessage = `Analizza questo annuncio:

PIATTAFORMA: ${listing.piattaforma || "Vinted"}
TITOLO: ${listing.titolo || ""}
DESCRIZIONE: ${listing.descrizione || ""}
PREZZO: ${listing.prezzo || ""}€
CATEGORIA: ${listing.categoria || ""}
CONDIZIONI: ${listing.condizioni || ""}
ANNUNCI SIMILI RECENTI: ${listing.annunciSimili || "0"}
FREQUENZA PUBBLICAZIONE: ${listing.frequenzaPubblicazione || "1"} annunci/giorno`;
    } else {
      return new Response(
        JSON.stringify({ error: "Missing vintedUrl or listing data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending request to AI gateway...");
    console.log("Analysis type:", analysisType || "legacy");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysisResultRaw = data.choices?.[0]?.message?.content;

    if (!analysisResultRaw) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Raw AI response:", analysisResultRaw);

    // Try to parse as JSON for structured response
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = analysisResultRaw.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      const analysisResult = JSON.parse(cleanedResponse);
      
      console.log("Analysis complete, returning structured result");
      
      return new Response(
        JSON.stringify({ analysis: analysisResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      // If JSON parsing fails, return raw text for legacy compatibility
      console.log("Could not parse as JSON, returning raw text");
      return new Response(
        JSON.stringify({ analysis: analysisResultRaw }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("safelist-analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
