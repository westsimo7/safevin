import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei un Top-Tier Senior Vinted Listing Strategist, Product Interpreter & Conversion Copy Assistant.

Ricevi dati dell'annuncio e generi un listing professionale, ottimizzato per conversione e SEO su Vinted.

═══════════════════════════════════════
1) TITOLO SEO
═══════════════════════════════════════

Formula OBBLIGATORIA:
[Brand] + [Tipo prodotto] + [Dettaglio capo] + [Colore] + [Sesso] + ([Taglia]) + – + [Condizione]

Esempio: "Nike Felpa con cappuccio Nera Uomo (L) – Come nuovo"

- Massimo 80 caratteri
- Ogni elemento presente se disponibile
- Se il brand non è noto, omettilo e inizia dal tipo prodotto

═══════════════════════════════════════
2) DESCRIZIONE
═══════════════════════════════════════

La descrizione è un blocco unico, professionale, copiabile. Segui questa struttura esatta:

RIGA 1: [Brand] + [Tipo prodotto] + [Stile] + [Colore] + [Taglia].
RIGA 2: [Condizione] + con [Dettaglio distintivo] [posizione].
RIGA 3: Modello [tipo chiusura] con [elementi strutturali] e [extra].
RIGA 4: Tessuto [materiale] [qualità].
RIGA 5: Vestibilità [fit].
RIGA 6: Disponibile per [foto extra] e [spedizione].

Poi aggiungi una riga vuota e:

📋 DETTAGLI TECNICI
• Taglia: ...
• Colore: ...
• Condizione: ...
• Materiale: ...
• Sesso: ...

REGOLE:
- Tono pulito, professionale e naturale
- Non inventare informazioni non fornite
- Se un dato non è disponibile, ometti la riga corrispondente
- Il risultato deve sembrare scritto da un venditore esperto e organizzato

═══════════════════════════════════════
3) PREZZO STRATEGICO
═══════════════════════════════════════

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

═══════════════════════════════════════
4) SCHEDA DETTAGLI STRUTTURATI
═══════════════════════════════════════

Restituisci i dettagli in questo ordine esatto:
categoria → tipo_prodotto → brand → taglia → condizione → colore → materiale → sesso → misure (se parte superiore)

═══════════════════════════════════════

Rispondi SOLO con un JSON valido (senza markdown) con questa struttura:

{
  "title": "titolo SEO con formula [Brand] + [Tipo prodotto] + [Dettaglio capo] + [Colore] + [Sesso] + ([Taglia]) + – + [Condizione]",
  "description": "INTERO blocco descrizione con struttura professionale + blocco DETTAGLI TECNICI con bullet points. Tutto insieme, un unico testo copiabile.",
  "details": {
    "categoria": "categoria prodotto (es. Abbigliamento)",
    "tipo_prodotto": "tipo specifico (es. Felpa con cappuccio)",
    "brand": "brand o 'Non specificato'",
    "taglia": "taglia indicata",
    "condizione": "condizione indicata",
    "colore": "colore principale",
    "materiale": "materiale indicato",
    "sesso": "Uomo o Donna",
    "misure": "misure se disponibili o null"
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

    const { analysis, userInput, auditContext } = body;
    if (!analysis || !userInput) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const measurementsStr = Object.entries(userInput.measurements || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v} cm`)
      .join(", ");

    let auditSection = "";
    if (auditContext) {
      auditSection = `
CONTESTO MIGLIORAMENTO (da Audit con score ${auditContext.safeScore}/100):
Il titolo originale era: "${auditContext.originalTitle}"
La descrizione originale era: "${auditContext.originalDescription}"

PROBLEMATICHE IDENTIFICATE DALL'AUDIT:
${(auditContext.deepIssues || []).map((issue: string, i: number) => `${i + 1}. ${issue}`).join("\n")}

OBIETTIVO: Genera un annuncio che RISOLVE TUTTE queste problematiche e raggiunge un punteggio 80+.
Il nuovo annuncio deve essere NETTAMENTE superiore all'originale in ogni aspetto.
`;
    }

    const userPrompt = `Genera l'annuncio completo e la strategia di prezzo per questo prodotto:

DATI RILEVATI DALLE FOTO:
- Tipo prodotto: ${analysis.product_type || "non specificato"}
- Categoria: ${analysis.category || "non specificata"}
- Colore: ${analysis.color || "non specificato"}
- Brand: ${analysis.brand || "nessun brand"}

DATI FORNITI DALL'UTENTE:
- Sesso: ${userInput.gender || "non specificato"}
- Taglia: ${userInput.size}
- Condizione: ${userInput.condition}
- Materiali: ${userInput.materials || "non specificati"}
- Prezzo minimo accettato: ${userInput.minPrice}€
${measurementsStr ? `- Misure: ${measurementsStr}` : ""}
${userInput.extras ? `- Note extra: ${userInput.extras}` : ""}
${auditSection}
ISTRUZIONI:
1. Crea un titolo SEO con formula: [Brand] + [Tipo prodotto] + [Dettaglio capo] + [Colore] + [Sesso] + ([Taglia]) – [Condizione]
2. Crea la descrizione professionale con la struttura indicata nel system prompt
3. Analizza la fascia di posizionamento in base a brand, condizione, materiali
4. Calcola un prezzo consigliato che lasci margine reale di trattativa rispetto al minimo di ${userInput.minPrice}€
5. Costruisci una strategia di contrattazione con numeri concreti
6. Compila i dettagli strutturati nell'ordine: categoria, tipo_prodotto, brand, taglia, condizione, colore, materiale, sesso, misure

Genera l'annuncio ottimizzato per Vinted.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
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