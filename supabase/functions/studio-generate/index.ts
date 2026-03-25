import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei un esperto copywriter e coach di vendita senior per annunci su Vinted e marketplace simili.
Il tuo obiettivo è creare un annuncio PERFETTO e una strategia di prezzo concreta.

REGOLE TITOLO SEO:
- Struttura: [Tipo prodotto] [Brand] [Colore] [Stile/uso] [Taglia]
- Massimo 80 caratteri
- Keyword principali incluse
- Esempio: "T-shirt Nike nera streetwear uomo taglia M"

REGOLE DESCRIZIONE:
La descrizione deve essere un UNICO blocco di testo fluido che contiene IN ORDINE:

1. MINI STORYTELLING (hook iniziale, 40-60 parole max): frase d'impatto che cattura l'attenzione e introduce il prodotto in modo personale e vendibile.

2. DESCRIZIONE PRODOTTO + CONTESTO D'USO: descrizione concreta del capo, materiali, vestibilità, occasione d'utilizzo. Keyword integrate NATURALMENTE nel testo (NO hashtag separati). Tono semplice, diretto, vendibile. Niente parole inutili o filler.

3. DETTAGLI TECNICI (bullet points alla fine):
Chiudi la descrizione con una lista puntata dei dettagli tecnici completi:
• Taglia: ...
• Condizione: ...
• Colore: ...
• Materiale: ...
• Brand: ...
(e qualsiasi altro dettaglio rilevante come misure se fornite)

Il testo + i bullet devono stare tutti insieme come un unico blocco copiabile.

REGOLE PREZZO STRATEGICO (FONDAMENTALE):

STEP 1 — POSIZIONAMENTO:
In base a brand, condizione, materiali e qualità percepita, stima la fascia:
- fascia bassa: no brand, usato, basic
- fascia media: brand medio, buone condizioni, stile attuale
- fascia medio-alta: brand forte, come nuovo, stile ricercato

STEP 2 — PREZZO CONSIGLIATO:
- Deve essere sopra il minimo accettato
- Abbastanza alto da lasciare margine di trattativa reale
- Non così alto da sembrare scollegato dalla realtà

STEP 3 — STRATEGIA DI CONTRATTAZIONE:
Genera una sequenza concreta di comportamento basata sul prezzo minimo e il prezzo consigliato.

Rispondi SOLO con un JSON valido (senza markdown) con questa struttura:

{
  "title": "titolo SEO ottimizzato per Vinted",
  "description": "INTERO blocco descrizione: mini storytelling + descrizione prodotto con contesto d'uso + bullet points dettagli tecnici. Tutto insieme, un unico testo.",
  "details": {
    "categoria": "categoria prodotto",
    "brand": "brand o 'Non specificato'",
    "colore": "colore principale",
    "taglia": "taglia indicata",
    "condizione": "condizione indicata",
    "materiale": "materiale indicato"
  },
  "pricing": {
    "min_accepted": numero_minimo,
    "suggested_low": prezzo_basso_consigliato,
    "suggested_high": prezzo_alto_consigliato,
    "positioning": "fascia stimata: bassa, media o medio-alta",
    "positioning_reason": "breve spiegazione della fascia",
    "motivation": "perché questo prezzo è sensato",
    "negotiation": [
      "Se ti offrono X€ → controproponi Y€",
      "Se salgono a Z€ → puoi scendere a W€",
      "Se arrivano a V€ → puoi accettare",
      "Se restano troppo bassi → non inseguire la trattativa"
    ]
  },
  "tips": [
    "consiglio vendita pratico 1",
    "consiglio vendita pratico 2",
    "consiglio vendita pratico 3",
    "consiglio vendita pratico 4"
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

    const measurementsStr = Object.entries(userInput.measurements || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v} cm`)
      .join(", ");

    const userPrompt = `Genera l'annuncio completo e la strategia di prezzo per questo prodotto:

DATI RILEVATI DALLE FOTO:
- Tipo prodotto: ${analysis.product_type || "non specificato"}
- Categoria: ${analysis.category || "non specificata"}
- Colore: ${analysis.color || "non specificato"}
- Brand: ${analysis.brand || "nessun brand"}

DATI FORNITI DALL'UTENTE:
- Taglia: ${userInput.size}
- Condizione: ${userInput.condition}
- Materiali: ${userInput.materials || "non specificati"}
- Prezzo minimo accettato: ${userInput.minPrice}€
${measurementsStr ? `- Misure: ${measurementsStr}` : ""}
${userInput.context ? `- Contesto d'uso: ${userInput.context}` : ""}
${userInput.extras ? `- Note extra: ${userInput.extras}` : ""}

ISTRUZIONI:
1. Crea un titolo SEO ottimizzato (max 80 char)
2. Crea una descrizione unica che contiene: mini storytelling + descrizione prodotto con contesto d'uso + chiude con bullet points di dettagli tecnici completi
3. Analizza la fascia di posizionamento in base a brand, condizione, materiali
4. Calcola un prezzo consigliato che lasci margine reale di trattativa rispetto al minimo di ${userInput.minPrice}€
5. Costruisci una strategia di contrattazione con numeri concreti

Genera l'annuncio ottimizzato per Vinted.`;

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
