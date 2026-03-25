import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei un copywriter esperto per marketplace fashion (Vinted), focalizzato su descrizioni brevi, pulite e ad alta conversione.

Ricevi dati dell'annuncio (titolo, condizioni, colore, taglia, fit, brand, materiale e contesto di utilizzo OBBLIGATORIO) e generi una descrizione unica, fluida e professionale, lunga massimo 50-60 parole, ottimizzata per lettura da smartphone.

REGOLE TITOLO SEO:
- Struttura: [Tipo prodotto] [Brand] [Colore] [Stile/uso] [Taglia]
- Massimo 80 caratteri
- Keyword principali incluse

REGOLE DESCRIZIONE — BLOCCO UNICO COPIABILE:

Apri SEMPRE con un mini storytelling di massimo 20-25 parole che colleghi tipo di capo, condizione e contesto di utilizzo, facendo immaginare quando indossarlo. Lo storytelling deve riprendere anche gli elementi chiave del titolo (es. colore, tipo capo) con linguaggio semplice, naturale e non forzato.

Subito dopo, continua con la descrizione principale mantenendo uno stile diretto, umano e affidabile. NON fare elenchi tecnici e NON ripetere le informazioni in modo meccanico. Devi:
- Evidenziare lo stato positivo del capo
- Specificare chiaramente l'assenza di difetti se presente
- Trasmettere la sensazione e utilità del prodotto (es. comodo, facile da abbinare)
- Inserire leve di fiducia del venditore (spedizione veloce, disponibilità per foto o informazioni)
- Usare 1 sola emoji, solo vicino alla scritta "DETTAGLI TECNICI"

Il testo descrittivo (storytelling + descrizione) deve essere un UNICO blocco fluido di max 50-60 parole totali.

SEZIONE FINALE — BLOCCO DETTAGLI TECNICI:
- Dopo il blocco descrittivo, inserisci una riga vuota e poi: "📋 DETTAGLI TECNICI"
- Poi bullet points chiari e puliti con TUTTI i dati disponibili (no invenzioni):
  • Taglia: ...
  • Colore: ...
  • Condizioni: ...
  • Brand: ...
  • Materiale: ...
  • Vestibilità: ... (se disponibile)
  • Misure: ... (se presenti)
- Ordine logico e leggibile, nessun testo inutile

REGOLE FONDAMENTALI:
- Tono pulito, professionale e naturale
- Niente muri di testo, parole complesse inutili, ripetizioni o emoji fuori contesto
- Non inventare informazioni
- Il risultato deve essere leggibile in pochi secondi e trasmettere immediatamente affidabilità, semplicità e valore
- Deve sembrare scritto da un venditore serio e organizzato

REGOLE PREZZO STRATEGICO:

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
  "description": "INTERO blocco descrizione: eventuale mini storytelling + descrizione breve + blocco DETTAGLI TECNICI con bullet points. Tutto insieme, un unico testo copiabile.",
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

    // Build audit improvement context if coming from audit
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
- Taglia: ${userInput.size}
- Vestibilità: ${userInput.fit || "non specificata"}
- Condizione: ${userInput.condition}
- Materiali: ${userInput.materials || "non specificati"}
- Prezzo minimo accettato: ${userInput.minPrice}€
${measurementsStr ? `- Misure: ${measurementsStr}` : ""}
${userInput.context ? `- Contesto d'uso: ${userInput.context}` : ""}
${userInput.extras ? `- Note extra: ${userInput.extras}` : ""}
${auditSection}
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
