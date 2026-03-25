import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei un esperto copywriter per annunci di vendita su Vinted e marketplace simili.
Il tuo obiettivo è creare un annuncio PERFETTO, pronto da copiare e incollare.

REGOLE:
- Tono semplice, diretto, vendibile
- Niente parole inutili o filler
- Keyword integrate NATURALMENTE nel testo (NO hashtag separati)
- Descrizione fluida in un unico blocco di testo
- Max 60-80 parole per la descrizione
- Il titolo deve seguire la struttura: [Tipo] [Brand] [Colore] [Stile/uso] [Taglia]
- La strategia prezzo deve essere realistica e pratica per venditori occasionali

Rispondi SOLO con un JSON valido (senza markdown) con questa struttura:

{
  "title": "titolo ottimizzato per Vinted",
  "description": "descrizione completa: hook iniziale + mini storytelling (40-60 parole) + descrizione prodotto + contesto d'uso + dettagli tecnici integrati. Keyword integrate naturalmente.",
  "details": {
    "categoria": "categoria prodotto",
    "brand": "brand o 'Non specificato'",
    "colore": "colore principale",
    "taglia": "taglia indicata",
    "condizione": "condizione indicata",
    "materiale": "materiale stimato o 'Non specificato'"
  },
  "pricing": {
    "min_accepted": numero_minimo,
    "suggested_low": prezzo_basso_consigliato,
    "suggested_high": prezzo_alto_consigliato,
    "motivation": "breve motivazione del prezzo consigliato (margine trattativa, percezione valore, spazio offerte)",
    "negotiation": [
      "Se offrono X€ → controproponi Y€",
      "Se salgono a Z€ → scendi a W€",
      "Se arrivano a V€ → puoi accettare",
      "Se restano troppo bassi → non continuare"
    ]
  },
  "tips": [
    "consiglio vendita 1",
    "consiglio vendita 2",
    "consiglio vendita 3",
    "consiglio vendita 4"
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { analysis, userInput } = body;
    if (!analysis || !userInput) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build measurements string
    const measurementsStr = Object.entries(userInput.measurements || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v} cm`)
      .join(", ");

    const userPrompt = `Genera l'annuncio completo per questo prodotto:

DATI RILEVATI DALLE FOTO:
- Tipo prodotto: ${analysis.product_type || "non specificato"}
- Categoria: ${analysis.category || "non specificata"}
- Colore: ${analysis.color || "non specificato"}
- Brand: ${analysis.brand || "nessun brand"}
- Stile: ${analysis.style || "non specificato"}
- Condizione stimata: ${analysis.condition || "non specificata"}
- Materiali: ${analysis.materials || "non specificati"}

DATI FORNITI DALL'UTENTE:
- Taglia: ${userInput.size}
- Condizione: ${userInput.condition}
- Prezzo minimo accettato: ${userInput.minPrice}€
${measurementsStr ? `- Misure: ${measurementsStr}` : ""}
${userInput.context ? `- Contesto d'uso: ${userInput.context}` : ""}
${userInput.extras ? `- Note extra: ${userInput.extras}` : ""}

Genera un annuncio ottimizzato per Vinted.`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppi messaggi, riprova tra poco." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Errore AI gateway" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const output = JSON.parse(content);
      return new Response(JSON.stringify({ output }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Risposta AI non valida" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("studio-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
