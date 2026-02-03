import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei SAFEVIN, un analizzatore professionale di annunci Vinted.

Analizza l'annuncio fornito e restituisci un JSON con la seguente struttura ESATTA:

{
  "overallScore": [numero da 0 a 100],
  "sections": [
    {
      "title": "Titolo SEO Interno",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Prime 3 Foto",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Prezzo Strategico",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Descrizione",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Tag / Categoria / Brand",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Tempo di Risposta",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Attività Profilo",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Ripubblicazione",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Psicologia del Compratore",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    },
    {
      "title": "Volume Annunci",
      "score": [numero da 1 a 10],
      "advice": "[consiglio pratico specifico]"
    }
  ]
}

REGOLE:
- Rispondi SOLO con il JSON, nessun altro testo
- Ogni consiglio deve essere diretto e azionabile
- Punteggi bassi (1-3) = problema grave
- Punteggi medi (4-6) = margine di miglioramento  
- Punteggi alti (7-10) = ben ottimizzato
- L'overallScore è la media ponderata delle sezioni
- Tono professionale, zero fuffa, zero emoji
- Consigli specifici come "aggiungi X", "rimuovi Y", "modifica Z"

MICROCOPY DA USARE:
- "Un titolo vago è un annuncio invisibile."
- "Le foto vendono prima del prezzo."
- "La fiducia è una leva di conversione."
- "La descrizione deve rispondere a obiezioni, non descrivere."
- "Il prezzo comunica posizionamento."`;

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
