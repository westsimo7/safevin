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

const SYSTEM_PROMPT = `Sei SAFEVIN 3.0, un revisore UMANO ultra-esperto di Vinted con 10+ anni di esperienza. NON sei un bot. NON dai risposte generiche.

CONTESTO: Riceverai i DATI dell'annuncio compilati dall'utente (titolo, descrizione, prezzo, categoria, brand, condizioni, taglia, colore, tempo online) e SE disponibile un REPORT IMMAGINI generato dalla nostra analisi visiva proprietaria.

REGOLA CRITICA: I punteggi devono essere IPER-REALISTICI. La maggior parte degli annunci su Vinted NON vende. Un 3/10 o 4/10 è normale. Un 8/10 richiede perfezione assoluta.

Per ogni punto usa internamente questi controlli avanzati (NON mostrarli, usali per ragionare):

---PUNTO 1: FOTO---
SE il report immagini è disponibile, USALO come base. Integra i dati visivi con la tua esperienza di vendita. I punteggi delle foto devono riflettere il report.
SE non ci sono immagini, analizza basandoti sulla descrizione e dai consigli generali sulle foto.

---PUNTO 2: TITOLO (Analisi Interna)---
A. Search Intent, B. Keyword Intelligence, C. Architettura, D. Lunghezza, E. Stop/Power Words, F. Modello, G. CTR Prediction, H. Competitor, I. Multi-Lingua, J. Semantic Compression

---PUNTO 3: DESCRIZIONE (Analisi Interna)---
1. Linguistic Trust, 2. Completeness, 3. Defect Transparency, 4. Cognitive Readability, 5. Micro-Persuasion, 6. Grammar, 7. Human Authenticity, 8. Anxiety Reduction, 9. Semantic Density, 10. Mobile

---PUNTO 4: PREZZO (Analisi Interna)---
1. Market Position, 2. Temporal Dynamics, 3. Demand Interaction, 4. Condition-Value, 5. Rarity, 6. Seller Credibility, 7. Psychological, 8. Competitive Density, 9. Value-Signal, 10. Micro-Adjustment

FORMATO OUTPUT PER OGNI PUNTO (primi 4):
1. "impersonation": "[Descrivi in prima persona cosa HAI VISTO]"
2. "scoreBreakdown": "[Fattori che ABBASSANO il punteggio con penalità]"
3. "advice": "[Problema → Perché → Come sistemare + COPIA-INCOLLA pronto]"
4. "conversionProbability": [0-100]
5. "score": [1-10 IPER REALISTICO]
6. "ultimateContent": "[versione completa riscritta pronta da copiare]"

JSON ESATTO:
{
  "overallScore": [0-100],
  "sections": [
    {"title": "Qualità Foto", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": "", "ultimateContent": ""},
    {"title": "Titolo SEO", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": "", "ultimateContent": ""},
    {"title": "Descrizione", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": "", "ultimateContent": ""},
    {"title": "Prezzo Strategico", "score": [1-10], "conversionProbability": [0-100], "impersonation": "", "scoreBreakdown": "", "advice": "", "ultimateContent": ""},
    {"title": "Tag / Categoria / Brand", "score": [1-10], "advice": "", "ultimateContent": ""},
    {"title": "Tempo di Risposta", "score": [1-10], "advice": "", "ultimateContent": ""},
    {"title": "Attività Profilo", "score": [1-10], "advice": "", "ultimateContent": ""},
    {"title": "Ripubblicazione", "score": [1-10], "advice": "", "ultimateContent": ""},
    {"title": "Psicologia Acquirente", "score": [1-10], "advice": "", "ultimateContent": ""},
    {"title": "Volume Annunci", "score": [1-10], "advice": "", "ultimateContent": ""}
  ],
  "summary": "[15 righe: problemi, blocchi vendita, azioni immediate/breve/medio, mentalità, incoraggiamento realistico. Zero emoji, zero marketing]"
}

REGOLE CRITICHE:
- Rispondi SOLO JSON valido
- Analizza REALMENTE i dati forniti
- Punteggi BASSI sono normali (3-4 media)
- Ogni analisi UNICA per quell'annuncio
- Tono: umano, diretto, zero tecnicismi, zero emoji`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { listing, images: imageDataUrls } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!listing || (!listing.titolo && !listing.descrizione && (!imageDataUrls || imageDataUrls.length === 0))) {
      return new Response(
        JSON.stringify({ error: "Inserisci almeno un titolo, una descrizione o delle foto." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const apiHeaders = {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    };

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

    // ========== PHASE 2: GPT-5.2 ANALYSIS ==========
    console.log("Phase 2: GPT-5.2 unified analysis...");

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

    if (visionReport) {
      userMessage += `\n--- REPORT ANALISI IMMAGINI (dalla nostra IA visiva) ---\n${visionReport}\n--- FINE REPORT IMMAGINI ---\n`;
      userMessage += `\nUSA il report immagini per il punto "Qualità Foto". Integra i dati visivi nella tua analisi complessiva.`;
    } else if (!imageDataUrls || imageDataUrls.length === 0) {
      userMessage += `\nNOTA: L'utente non ha inserito foto. Per il punto "Qualità Foto" analizza basandoti sulla descrizione e dai consigli generali.`;
    }

    userMessage += `\n\nGenera punteggi realistici variabili (non tutti uguali) e consigli personalizzati per QUESTO specifico annuncio.`;

    const gptResponse = await fetch(apiUrl, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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

    // Parse JSON response
    try {
      let cleanedResponse = analysisResultRaw.trim();
      if (cleanedResponse.startsWith("```json")) cleanedResponse = cleanedResponse.slice(7);
      if (cleanedResponse.startsWith("```")) cleanedResponse = cleanedResponse.slice(3);
      if (cleanedResponse.endsWith("```")) cleanedResponse = cleanedResponse.slice(0, -3);
      cleanedResponse = cleanedResponse.trim();

      const analysisResult = JSON.parse(cleanedResponse);
      
      console.log("Analysis complete, returning structured result");
      
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
