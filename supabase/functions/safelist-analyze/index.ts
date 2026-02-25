import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VISION_PROMPT = `Sei un analista fotografico ultra-esperto specializzato in marketplace di second-hand. Analizza TUTTE le immagini fornite dell'annuncio e restituisci un report JSON strutturato.

Analizza internamente centinaia di parametri per ogni immagine, tra cui:
A. Qualità Tecnica (nitidezza, rumore, artefatti compressione, bilanciamento bianco, range dinamico, sovra/sottoesposizione, risoluzione reale vs upscale, motion blur, distorsione, integrità pixel)
B. Illuminazione (direzione, temperatura Kelvin, ombre, uniformità, riflessi, hotspot, dominanti, bilanciamento sfondo, naturale vs artificiale, coerenza multi-foto)
C. Composizione (regola terzi, centratura, % spazio prodotto, angolo scatto, eye-flow, simmetria, distrazioni, orizzonte, margini, bilanciamento)
D. Background (tipo sfondo, disordine, oggetti inutili, pattern caotici, contrasto, profondità campo, specchi, persone, texture, colori conflittuali)
E. Copertura Informativa (numero foto, angolazioni coperte: fronte/retro/lato/dettagli/etichetta/taglia/difetti/interno/indossato, ridondanza, sequenza logica, completezza %)
F. Coerenza Set (stesso ambiente/luce/qualità/zoom, continuità cromatica, cambio stile, stock vs reali, risoluzione, crop, narrativa)
G. Autenticità (logo detection, pattern brand, confronto ufficiale, coerenza modello, fake stitching, forma suola, font etichette, allineamento, materiale, version mismatch)
H. Psicologia Immagine (sensazione nuovo/usato, professionalità, fiducia visiva, appeal, impulso acquisto, igiene, valore percepito, cura, scam perception, premium feel)
I. Mobile (leggibilità miniatura, visibilità dettagli, crop thumbnail, zoom clarity, preview 1:1, distorsione mobile, focus centrale, saturazione OLED, compressione app, tempo caricamento)

Restituisci SOLO un JSON con questa struttura:
{
  "photoTechnicalScore": [0-10],
  "lightingScore": [0-10],
  "compositionScore": [0-10],
  "informationCoverageScore": [0-10],
  "trustScore": [0-10],
  "aestheticAppealScore": [0-10],
  "mobileOptimizationScore": [0-10],
  "authenticityRiskScore": [0-10, dove 10=autentico],
  "overallPhotoScore": [0-10],
  "impersonation": "[descrizione in prima persona di cosa hai visto nelle foto, tono diretto e umano]",
  "scoreBreakdown": "[elenco fattori negativi con penalità, es: • Compressione WhatsApp visibile (-2)]",
  "detailedFindings": "[descrizione dettagliata di tutti i problemi trovati nelle immagini per passarla a GPT]",
  "coverageAnalysis": "[quali angolazioni/dettagli sono presenti e quali mancano]",
  "authenticityNotes": "[note sull'autenticità del prodotto basate sulle immagini]"
}

REGOLE: Punteggi IPER-REALISTICI. 3-4 è la media. 7+ richiede foto professionali. Analisi UNICA per queste specifiche foto. Rispondi SOLO JSON valido.`;

const EXTERNAL_SYSTEM_PROMPT = `Sei SAFEVIN 3.0, un revisore UMANO ultra-esperto di Vinted con 10+ anni di esperienza. NON sei un bot. NON dai risposte generiche.

MODALITÀ: EXTERNAL AUDIT (annuncio NON generato da SAFEViN Studio)
Score base: 0. Valutazione piena e rigorosa.

CONTESTO: Riceverai i DATI dell'annuncio compilati dall'utente (titolo, descrizione, prezzo, categoria, brand, condizioni, taglia, colore, tempo online) e SE disponibile un REPORT IMMAGINI generato dalla nostra analisi visiva proprietaria.

REGOLA CRITICA: I punteggi devono essere IPER-REALISTICI. La maggior parte degli annunci su Vinted NON vende. Un 3/10 o 4/10 è normale. Un 8/10 richiede perfezione assoluta.

Per ogni punto usa internamente questi controlli avanzati (NON mostrarli, usali per ragionare):

---PUNTO 1: FOTO---
SE il report immagini è disponibile, USALO come base. Integra i dati visivi con la tua esperienza di vendita.
SE non ci sono immagini, analizza basandoti sulla descrizione e dai consigli generali sulle foto.

---PUNTO 2: TITOLO (Analisi Interna)---
A. Search Intent, B. Keyword Intelligence, C. Architettura, D. Lunghezza, E. Stop/Power Words, F. Modello, G. CTR Prediction, H. Competitor, I. Multi-Lingua, J. Semantic Compression

---PUNTO 3: DESCRIZIONE (Analisi Interna)---
1. Linguistic Trust, 2. Completeness, 3. Defect Transparency, 4. Cognitive Readability, 5. Micro-Persuasion, 6. Grammar, 7. Human Authenticity, 8. Anxiety Reduction, 9. Semantic Density, 10. Mobile

---PUNTO 4: PREZZO (Analisi Interna)---
1. Market Position, 2. Temporal Dynamics, 3. Demand Interaction, 4. Condition-Value, 5. Rarity, 6. Seller Credibility, 7. Psychological, 8. Competitive Density, 9. Value-Signal, 10. Micro-Adjustment

---PUNTO 5: CATEGORIA / BRAND---
Precisione chirurgica su categoria, sottocategoria, genere/target, mismatch detection, ottimizzazione filtri. Brand: scrittura corretta, autenticità, coerenza.

---PUNTO 6: TAG / KEYWORD---
Stagione, stile, fit, target psicografico, occasioni, strategia premium con keyword combinate naturali.

---PUNTO 7: CONDIZIONI---
Tessuti, stampe, cuciture, etichette, struttura generale, analisi contestuale.

---PUNTO 8: TAGLIA / MATERIALE / COLORE---
Coerenza taglia, composizione, fedeltà cromatica, pattern.

---PUNTO 9: VITA ANNUNCIO---
<7 giorni: no ripubblicazione. 7-30: evidenzia cali. >30: analisi completa + timing ottimale.

---PUNTO 10: PSICOLOGIA ACQUIRENTE---
Fiducia, valore, scarsità, tempo, relazione. Trigger emotivi e micro-trigger.

FORMATO OUTPUT PER OGNI PUNTO (tutti e 10):
1. "impersonation": "[cosa HAI VISTO, tono diretto e umano]"
2. "scoreBreakdown": "[fattori che ABBASSANO il punteggio con penalità]"
3. "advice": "[Problema → Perché → Come sistemare]"
4. "conversionProbability": [0-100]
5. "score": [1-10 IPER REALISTICO]

COERENZA SCORE ↔ CONVERSION RATE:
- Score 1-2 → 0-8%, Score 3 → 8-15%, Score 4 → 15-25%, Score 5 → 25-38%
- Score 6 → 38-50%, Score 7 → 50-65%, Score 8 → 65-78%, Score 9 → 78-90%, Score 10 → 90-98%

JSON ESATTO:
{
  "overallScore": [0-100],
  "sections": [
    {"title": "Qualità Foto", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Titolo SEO", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Descrizione", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Prezzo Strategico", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Categoria / Brand", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Tag / Keyword", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Condizioni Prodotto", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Taglia / Materiale / Colore", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Vita Annuncio", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Psicologia Acquirente", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""}
  ],
  "summary": "[15 righe: problemi, blocchi vendita, azioni immediate/breve/medio, mentalità, incoraggiamento realistico. Zero emoji, zero marketing]"
}

REGOLE: Rispondi SOLO JSON valido. Punteggi BASSI normali. Coerenza score↔conversionProbability. Tono umano, zero emoji.`;

const STUDIO_REFINEMENT_PROMPT = `Sei SAFEVIN 3.0, un revisore esperto di Vinted.

MODALITÀ: STUDIO REFINEMENT MODE (annuncio generato da SAFEViN Studio)

FILOSOFIA: Questo annuncio è stato creato dal TUO STESSO ecosistema. Il tuo ruolo è RAFFINARE e OTTIMIZZARE, non giudicare come un critico esterno. Studio e Audit sono UN UNICO sistema integrato.

REGOLE REFINEMENT MODE:
- Score base iniziale: 70 MINIMO (l'annuncio è già strutturato professionalmente)
- NON scendere sotto 70 salvo errori GRAVI (incoerenze fattuali, dati totalmente errati)
- NON penalizzare struttura generata da Studio (mini storytelling, keyword integrate, blocco hashtag)
- NON penalizzare keyword già presenti nel testo
- NON penalizzare il blocco keyword/hashtag separato (è un boost SEO intenzionale)
- Se una sezione è ben fatta → PREMIALA con punteggio alto e breve validazione positiva
- Se una sezione è migliorabile → suggerimento chirurgico specifico, tono costruttivo

LOGICA PUNTEGGIO REFINEMENT:
Base = 70
Incrementi possibili:
+5 coerenza prezzo (range realistico e ben motivato)
+5 foto complete (buona copertura angolazioni)
+5 misure chiare (presenti e precise)
+5 condizioni coerenti (stato dichiarato coerente con foto/descrizione)
+5 strategia pubblicazione corretta

Penalità SOLO per:
- Foto = 0 (nessuna foto)
- Incoerenza grave (es: "nuovo" + difetti dichiarati)
- Misure completamente assenti
- Titolo modificato e incoerente con contenuto
- NON penalizzare micro dettagli stilistici

VITA ANNUNCIO (se recente, <7 giorni):
- NON abbassare punteggio struttura
- Analizzare: vita annuncio, prezzo dinamico, strategia refresh
- Focus su PERFORMANCE, non su struttura

FORMATO OUTPUT PER OGNI PUNTO (tutti e 10):
1. "impersonation": "[Feedback costruttivo: cosa funziona bene + eventuali ottimizzazioni]"
2. "scoreBreakdown": "[Fattori positivi E negativi con valutazione bilanciata]"
3. "advice": "[Se eccellente: breve validazione. Se migliorabile: suggerimento chirurgico specifico]"
4. "conversionProbability": [0-100]
5. "score": [1-10, partendo da base alta per contenuti Studio]

COERENZA SCORE ↔ CONVERSION RATE (stessa scala):
Score 7 → 50-65%, Score 8 → 65-78%, Score 9 → 78-90%, Score 10 → 90-98%

JSON ESATTO:
{
  "overallScore": [0-100],
  "sections": [
    {"title": "Qualità Foto", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Titolo SEO", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Descrizione", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Prezzo Strategico", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Categoria / Brand", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Tag / Keyword", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Condizioni Prodotto", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Taglia / Materiale / Colore", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Vita Annuncio", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""},
    {"title": "Psicologia Acquirente", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": ""}
  ],
  "summary": "[15 righe: punti di forza, margini di ottimizzazione, azioni strategiche. Tono costruttivo e premium. Zero emoji]"
}

REGOLE: Rispondi SOLO JSON valido. Coerenza score↔conversionProbability. Tono costruttivo e premium.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { listing, images: imageDataUrls, imageOnly, origin } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const apiHeaders = {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Determine audit mode based on origin
    const isStudioOrigin = origin === "studio";
    const activePrompt = isStudioOrigin ? STUDIO_REFINEMENT_PROMPT : EXTERNAL_SYSTEM_PROMPT;
    
    if (isStudioOrigin) {
      console.log("REFINEMENT MODE activated - Studio origin detected");
    }

    // ========== IMAGE-ONLY MODE ==========
    if (imageOnly) {
      if (!imageDataUrls || imageDataUrls.length === 0) {
        return new Response(JSON.stringify({ error: "Nessuna immagine fornita." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      console.log(`Image-only analysis: ${imageDataUrls.length} images`);

      const imageContents = imageDataUrls.map((dataUrl: string) => ({
        type: "image_url" as const,
        image_url: { url: dataUrl },
      }));

      const photoAnalysisPrompt = `Sei un esperto fotografo e analista di marketplace. Analizza OGNI foto individualmente e restituisci un report per ciascuna.

Per OGNI foto analizza: luce, sfondo, angolazione, nitidezza, dettagli mancanti, composizione, fiducia visiva (etichette, difetti visibili), ottimizzazione mobile.

Restituisci SOLO un JSON valido con questa struttura:
{
  "photoReports": [
    {
      "photoIndex": 1,
      "score": [1-10],
      "problems": ["problema specifico 1", "problema specifico 2"],
      "solutions": ["soluzione pratica 1", "soluzione pratica 2"]
    }
  ]
}

REGOLE:
- Un oggetto per OGNI foto (${imageDataUrls.length} foto totali)
- Problemi: specifici, pratici, no genericità
- Soluzioni: azioni concrete e immediate
- Score realistico: 3-4 è la media, 7+ richiede foto professionali
- Max 4 problemi e 4 soluzioni per foto
- Rispondi SOLO JSON valido`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: photoAnalysisPrompt },
            { role: "user", content: [
              { type: "text", text: `Analizza queste ${imageDataUrls.length} foto di un annuncio marketplace. Report individuale per ogni foto.` },
              ...imageContents,
            ]},
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Image-only error:", response.status, errText);
        return new Response(JSON.stringify({ error: "Errore analisi immagini." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify({ photoReports: parsed.photoReports }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        console.error("Failed to parse image-only JSON:", content);
        return new Response(JSON.stringify({ error: "Errore formato risposta." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ========== FULL AUDIT MODE ==========
    if (!listing || (!listing.titolo && !listing.descrizione && (!imageDataUrls || imageDataUrls.length === 0))) {
      return new Response(
        JSON.stringify({ error: "Inserisci almeno un titolo, una descrizione o delle foto." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== PHASE 1: VISION ANALYSIS (if images provided) ==========
    let visionReport: string | null = null;

    if (imageDataUrls && imageDataUrls.length > 0) {
      console.log(`Phase 1: Analyzing ${imageDataUrls.length} images with Vision...`);

      const imageContents = imageDataUrls.map((dataUrl: string) => ({
        type: "image_url" as const,
        image_url: { url: dataUrl },
      }));

      const visionMessages = [
        { role: "system", content: VISION_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: `Analizza queste ${imageDataUrls.length} foto di un annuncio Vinted. Prodotto: ${listing.titolo || "non specificato"}, Brand: ${listing.brand || "non specificato"}, Categoria: ${listing.categoria || "non specificata"}.` },
            ...imageContents,
          ],
        },
      ];

      try {
        const visionResponse = await fetch(apiUrl, {
          method: "POST",
          headers: apiHeaders,
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: visionMessages,
            stream: false,
          }),
        });

        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          visionReport = visionData.choices?.[0]?.message?.content || null;
          console.log("Vision analysis complete");
        } else {
          const errText = await visionResponse.text();
          console.error("Vision API error:", visionResponse.status, errText);
        }
      } catch (visionErr) {
        console.error("Vision phase error:", visionErr);
      }
    }

    // ========== PHASE 2: MAIN ANALYSIS ==========
    console.log(`Phase 2: ${isStudioOrigin ? "REFINEMENT" : "EXTERNAL"} analysis...`);

    let userMessage = `Analizza questo annuncio Vinted:\n\n`;
    userMessage += `TITOLO: ${listing.titolo || "(non inserito)"}\n`;
    userMessage += `DESCRIZIONE: ${listing.descrizione || "(non inserita)"}\n`;
    userMessage += `PREZZO: ${listing.prezzo ? listing.prezzo + "€" : "(non inserito)"}\n`;
    userMessage += `CATEGORIA: ${listing.categoria || "(non inserita)"}\n`;
    userMessage += `BRAND: ${listing.brand || "(non inserito)"}\n`;
    userMessage += `CONDIZIONI: ${listing.condizioni || "(non inserite)"}\n`;
    userMessage += `TAGLIA: ${listing.taglia || "(non inserita)"}\n`;
    userMessage += `COLORE: ${listing.colore || "(non inserito)"}\n`;
    userMessage += `TEMPO ONLINE: ${listing.tempoCaricamento || "(non inserito)"}\n`;
    userMessage += `NUMERO FOTO: ${imageDataUrls ? imageDataUrls.length : 0}\n`;

    if (isStudioOrigin) {
      userMessage += `\nNOTA: Questo annuncio è stato generato da SAFEViN Studio. Applica REFINEMENT MODE.\n`;
    }

    if (visionReport) {
      userMessage += `\n--- REPORT ANALISI IMMAGINI (dalla nostra IA visiva) ---\n${visionReport}\n--- FINE REPORT IMMAGINI ---\n`;
      userMessage += `\nUSA il report immagini per il punto "Qualità Foto". Integra i dati visivi nella tua analisi complessiva.`;
    } else if (!imageDataUrls || imageDataUrls.length === 0) {
      userMessage += `\nNOTA: L'utente non ha inserito foto. Per il punto "Qualità Foto" analizza basandoti sulla descrizione e dai consigli generali.`;
    }

    userMessage += `\n\nGenera punteggi ${isStudioOrigin ? "bilanciati (base alta per contenuti Studio)" : "realistici variabili (non tutti uguali)"} e consigli personalizzati per QUESTO specifico annuncio.`;

    const gptResponse = await fetch(apiUrl, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: [
          { role: "system", content: activePrompt },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error("GPT error:", gptResponse.status, errorText);
      
      if (gptResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Troppo traffico. Riprova tra qualche secondo." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (gptResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crediti esauriti." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Analisi fallita. Riprova." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await gptResponse.json();
    const analysisResultRaw = data.choices?.[0]?.message?.content;

    if (!analysisResultRaw) {
      console.error("No content in GPT response:", data);
      return new Response(
        JSON.stringify({ error: "Risposta IA vuota. Riprova." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Raw GPT response length:", analysisResultRaw.length);

    try {
      let cleanedResponse = analysisResultRaw.trim();
      if (cleanedResponse.startsWith("```json")) cleanedResponse = cleanedResponse.slice(7);
      if (cleanedResponse.startsWith("```")) cleanedResponse = cleanedResponse.slice(3);
      if (cleanedResponse.endsWith("```")) cleanedResponse = cleanedResponse.slice(0, -3);
      cleanedResponse = cleanedResponse.trim();

      const analysisResult = JSON.parse(cleanedResponse);
      
      console.log(`Analysis complete (${isStudioOrigin ? "REFINEMENT" : "EXTERNAL"} mode), returning structured result`);
      
      return new Response(
        JSON.stringify({ analysis: analysisResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.log("Raw response:", analysisResultRaw.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Formato risposta non valido. Riprova." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("safelist-analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
