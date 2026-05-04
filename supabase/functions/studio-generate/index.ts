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
[Brand] + [Tipo prodotto] + [Dettaglio capo] + [Colore] + [Stile] + Y2K (SOLO se lo stile è Vintage, aggiungi "Y2K" subito dopo lo stile) + [Decade se fornita: "Anni '70" / "Anni '80" / "Anni '90" / "Y2K / Anni 2000"] + [Sesso] + ([Taglia]) + [Condizione]

Dove [Sesso] = "Uomo" o "Donna" (in inglese: "Men" o "Women") posizionato SUBITO PRIMA della taglia tra parentesi. Se il sesso non è disponibile, omettilo.

Se la decade è fornita, inseriscila SUBITO DOPO lo stile (e dopo "Y2K" se presente). Se decade non fornita, omettila completamente.

IMPORTANTE: NON usare MAI il trattino "–" o "-" prima della condizione. La condizione segue direttamente dopo la taglia, separata solo da uno spazio.

Esempio: "Nike Felpa con cappuccio Nera Streetwear Uomo (L) Come nuovo"
Esempio con stile Vintage e decade: "Nike Felpa con cappuccio Nera Vintage Y2K Anni '90 Donna (S) Come nuovo"

- Massimo 80 caratteri
- Ogni elemento presente se disponibile
- Se il brand non è noto, omettilo e inizia dal tipo prodotto

═══════════════════════════════════════
2) DESCRIZIONE
═══════════════════════════════════════

La descrizione è un blocco unico, professionale, copiabile. MASSIMO 60 PAROLE totali per la parte descrittiva (esclusi i bullet points).

Struttura (5 righe con spaziatura specifica):
RIGA 1: [Tipo prodotto] + [Brand] + [Stile] + (se decade fornita: + decade es. "Anni '90") + [Colore] + [Taglia].
(riga vuota)
RIGA 2: [Condizione] + con [Dettaglio distintivo] [posizione]
   REGOLA TONO VINTAGE: Se style === "Vintage" e la condizione NON è "Nuovo con cartellino" né "Nuovo senza cartellino", sostituisci la formula standard con un tono che valorizza l'autenticità del capo:
   - "Ottime condizioni" → "Condizioni eccellenti per un pezzo d'epoca, conservato alla perfezione"
   - "Buone condizioni" → "Vissuto autentico, patina coerente con l'età del capo"
   - "Condizioni soddisfacenti" / "Condizioni discrete" → "Segni del tempo che ne certificano l'autenticità vintage"
   Per tutti gli altri stili (Casual, Streetwear, Elegante, ecc.) e per i due "Nuovo" anche se Vintage, usa il tono neutro standard.
(riga vuota)
RIGA 3: Modello con [elementi strutturali distintivi] e [extra]. Tessuto [materiale] [qualità]. Vestibilità [fit].
   REGOLA CHIUSURA: Menziona il tipo di chiusura SOLO se è effettivamente presente e rilevante (es. "Modello con zip frontale…", "Modello con bottoni a pressione…"). Se l'indumento NON ha chiusura (es. t-shirt, felpa pullover, maglia), NON scrivere mai "senza chiusura" né formule negative: apri la frase valorizzando un dettaglio reale del capo (es. "Modello con cappuccio fisso e tasca a marsupio…", "Modello con scollo a girocollo e polsini a costine…", "Modello con stampa grafica frontale e orlo dritto…"). Usa i dettagli rilevati dalle foto (loghi, stampe, tasche, cappuccio, collo, polsini, orlo, cuciture, patch).
(riga vuota)
RIGA 4: Disponibile per foto extra e spedizione.

REGOLA MATERIALE: Se l'utente ha indicato UN SOLO materiale, scrivi "Tessuto [materiale] 100%". Se sono più materiali, elencali senza percentuale.

NON aggiungere mai un blocco "📋 DETTAGLI TECNICI" o un elenco riepilogativo di Brand/Taglia/Colore/Condizione/Materiale nella descrizione. Quei dati appaiono già nella scheda prodotto separata.

MISURE (UNICA ECCEZIONE): Se — e SOLO se — l'utente ha fornito misure di spalle e/o lunghezza, aggiungi una riga vuota dopo la RIGA 4 e poi un elenco con SOLO quelle misure, una per riga, ciascuna preceduta dal pallino "• ". Esempio:

• Spalle: 49 cm
• Lunghezza: 60 cm

Nessun titolo, nessun'altra voce. Se non ci sono misure, non aggiungere nulla dopo la RIGA 4.

REGOLE FONDAMENTALI:
- MASSIMO 60 PAROLE nella descrizione (esclusi bullet points). Conta le parole.
- Scrivi SOLO informazioni essenziali e visibili. Niente riempitivi.
- Una frase = un'informazione. Niente elenchi lunghi di dettagli.
- ESEMPIO SBAGLIATO: "Modello senza chiusura con cuciture raglan sulle spalle, maniche raglan in tessuto giallo con righe scure, polsini ad orlo a costine"
- ESEMPIO GIUSTO: "Modello con maniche gialle a righe scure e polsini a costine"
- VIETATO usare "senza chiusura" o altre formule negative: se la chiusura manca, valorizza un dettaglio presente (cappuccio, tasche, stampa, collo, polsini, orlo…).
- Gli UNICI stili ammessi sono: Vintage, Casual, Streetwear, Elegante
- Non inventare informazioni non fornite
- Se un dato non è disponibile, omettilo

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
  "title": "titolo SEO con formula [Brand] + [Tipo prodotto] + [Dettaglio capo] + [Colore] + [Stile] + [Sesso] + ([Taglia]) + [Condizione] (NESSUN trattino)",
  "description": "Blocco descrizione professionale (RIGA 1-4). NIENTE blocco DETTAGLI TECNICI. Solo se ci sono misure spalle/lunghezza, aggiungi alla fine i bullet '• Spalle: X cm' e/o '• Lunghezza: Y cm'.",
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
      "Se scendono sotto il minimo di pochi euro → valuta tu se accettare, altrimenti aspetta offerte migliori"
    ]
  },
  "tips": [
    "consiglio vendita pratico 1",
    "consiglio vendita pratico 2",
    "consiglio vendita pratico 3",
    "consiglio vendita pratico 4"
  ],
  "hashtags": [
    "4-5 hashtag ottimizzati per Vinted/Instagram, lowercase, senza spazi, senza simboli speciali oltre al # iniziale. In italiano se language=it, in inglese se language=en. Esempio: ['#vintage90s', '#y2k', '#ralphlauren', '#fleece', '#streetwearuomo']"
  ]
}`;

function decadeLabel(d?: string): string {
  switch (d) {
    case "70s": return "Anni '70";
    case "80s": return "Anni '80";
    case "90s": return "Anni '90";
    case "y2k": return "Anni 2000";
    default: return "";
  }
}

function sanitizeOutput(output: any): any {
  if (!output || typeof output !== "object") return output;
  // Sanitize title: remove dashes between size and condition, clamp to 80 chars
  if (typeof output.title === "string") {
    let t = output.title.replace(/\s+[–-]\s+/g, " ").replace(/\s{2,}/g, " ").trim();
    if (t.length > 80) {
      const truncated = t.slice(0, 80);
      const lastSpace = truncated.lastIndexOf(" ");
      t = (lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated).trim();
    }
    output.title = t;
  }
  // Normalize hashtags: ensure array of lowercase strings starting with #
  if (Array.isArray(output.hashtags)) {
    output.hashtags = output.hashtags
      .filter((h: any) => typeof h === "string" && h.trim().length > 0)
      .map((h: string) => {
        let v = h.trim().toLowerCase().replace(/\s+/g, "");
        if (!v.startsWith("#")) v = "#" + v;
        return v;
      })
      .slice(0, 5);
  }
  return output;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { analysis, userInput, auditContext, language } = body;
    if (!analysis || !userInput) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const lang = language === "en" ? "en" : "it";
    const langInstruction = lang === "en"
      ? "\n\n═══════════════════════════════════════\nLANGUAGE OVERRIDE\n═══════════════════════════════════════\nGenerate ALL output content (title, description, details values, motivation, negotiation steps, tips) in ENGLISH. Keep the JSON keys and the structure unchanged. For measurements bullets use English labels: '• Shoulders: ... cm', '• Length: ... cm'. Do NOT add any technical details summary block."
      : "";

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

    // Build garment features string
    const gf = analysis.garment_features || {};
    const featuresLines: string[] = [];
    const logosArr = Array.isArray(gf.logos) ? gf.logos : (gf.logos && typeof gf.logos === "object" ? [gf.logos] : []);
    logosArr.forEach((l: any) => {
      if (l && typeof l === "object") {
        featuresLines.push(`Logo: ${l.description ?? ""} (${l.type ?? ""}, ${l.position ?? ""}, ${l.size ?? ""})`);
      }
    });
    const printsArr = Array.isArray(gf.prints) ? gf.prints : (gf.prints && typeof gf.prints === "object" ? [gf.prints] : []);
    printsArr.forEach((p: any) => {
      if (p && typeof p === "object") {
        featuresLines.push(`Stampa: ${p.description ?? ""} (${p.type ?? ""}, ${p.position ?? ""}, ${p.technique ?? ""})`);
      }
    });
    const simpleFeatures = ["zippers", "pockets", "buttons", "hood", "collar", "cuffs", "hem", "embossing_relief", "patches_badges", "drawstrings", "stitching_details", "other_details"];
    for (const key of simpleFeatures) {
      if (gf[key] && gf[key] !== "nessuno" && gf[key] !== "nessuna") {
        featuresLines.push(`${key}: ${gf[key]}`);
      }
    }
    const featuresStr = featuresLines.length > 0 ? featuresLines.join("\n") : "nessun dettaglio rilevato";

    const colorsStr = Array.isArray(analysis.colors) ? analysis.colors.join(", ") : (analysis.color || "non specificato");

    const userPrompt = `Genera l'annuncio completo e la strategia di prezzo per questo prodotto:

DATI RILEVATI DALLE FOTO:
- Tipo prodotto: ${analysis.product_type || "non specificato"}
- Categoria: ${analysis.category || "non specificata"}
- Colori dominanti: ${colorsStr}
- Brand: ${analysis.brand || "nessun brand"}

DETTAGLI INDUMENTO RILEVATI DALLE FOTO:
${featuresStr}

DATI FORNITI DALL'UTENTE:
- Sesso: ${userInput.gender || "non specificato"}
- Taglia: ${userInput.size}
- Tipologia prodotto: ${userInput.productType || "non specificata"}
- Fit: ${userInput.fit || "non specificato"}
- Stile: ${userInput.style || "non specificato"}
- Condizione: ${userInput.condition}
- Materiali: ${userInput.materials || "non specificati"}
- Prezzo minimo accettato: ${userInput.minPrice}€
${userInput.decade ? `- Decade / Periodo: ${decadeLabel(userInput.decade)}` : ""}
${measurementsStr ? `- Misure: ${measurementsStr}` : ""}
${userInput.extras ? `- Note extra: ${userInput.extras}` : ""}
${auditSection}
ISTRUZIONI:
1. Crea un titolo SEO con formula ESATTA in quest'ordine: [Brand] + [Tipo prodotto] + [Dettaglio capo] + [Colore] + [Stile] + (se stile=Vintage aggiungi "Y2K" SUBITO DOPO lo stile) + (se decade fornita aggiungi "Anni '70" / "Anni '80" / "Anni '90" / "Y2K / Anni 2000" SUBITO DOPO lo stile/Y2K) + [Sesso: Uomo/Donna] + ([Taglia]) [Condizione] — NON inserire mai un trattino "–" o "-" tra taglia e condizione
   IMPORTANTE: Y2K e la decade vanno SEMPRE collocati tra lo Stile e il Sesso, MAI dopo la taglia o la condizione. Usa i dettagli dell'indumento (loghi, stampe, zip, tasche, cappuccio ecc.) come [Dettaglio capo] nel titolo. Inserisci sempre "Uomo" o "Donna" subito prima della taglia se il sesso è fornito.
2. Crea la descrizione professionale con la struttura indicata nel system prompt
   IMPORTANTE: Integra TUTTI i dettagli rilevati (loghi, stampe, zip, tasche, rilievi, patch, ecc.) nella descrizione in modo naturale e professionale
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
          { role: "system", content: SYSTEM_PROMPT + langInstruction },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
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
      const parsed = JSON.parse(content);
      const output = sanitizeOutput(parsed);
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