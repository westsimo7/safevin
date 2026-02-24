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

REGOLA CRITICA: I punteggi devono essere IPER-REALISTICI. La maggior parte degli annunci su Vinted NON vende. Un 3/10 o 4/10 è normale. Un 8/10 richiede perfezione assoluta. Le persone devono crescere: un voto basso le spinge a migliorare.

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

---PUNTO 5: CATEGORIA / BRAND (Analisi Interna Premium)---
A. Categoria – Precisione chirurgica:
- Categoria principale: definire con precisione assoluta (felpa ≠ maglia ≠ giacca ≠ t-shirt), considerare materiale e funzionalità, evitare categorie generiche.
- Sottocategoria: inserire caratteristiche chiave (con/senza cappuccio, zip/pullover, oversize/slim fit), dettagli estetici e funzionali (tasche, stampe, zip laterali, polsini elastici), uso finale (streetwear, sport, leisure, fashion).
- Genere/Target: non solo uomo/donna/unisex, valutare fascia d'età precisa, analisi psicografica del pubblico target.
- Mismatch detection: coerenza tra categoria, sottocategoria, immagini e descrizione. Se foto mostra cappuccio, deve essere nella categoria.
- Ottimizzazione filtri: analisi keyword filtri popolari, agganciare tutte le combinazioni possibili per massimizzare visibilità.
B. Brand – Precisione massima:
- Scrittura corretta (maiuscole, ortografia), verifica logo visibile, coerenza con prodotti ufficiali.
- Verifica autenticità: cuciture, etichette, pattern, font logo. Se dubbi → posizionamento come "inspired/streetwear/artigianale".
- Coerenza immagine-descrizione: logo visibile → ok, nessun logo → brand alternativo consigliato, match colore/modello/collezione.
- Ottimizzazione ricerca: brand corretto → filtri brand, brand generico → filtri stile e categoria.
C. Extra premium: sinonimi e varianti (hoodie = felpa con cappuccio), controllo semantico (evitare incoerenze), analisi concorrenti top seller, micro-niche targeting.

---PUNTO 6: TAG / KEYWORD SECONDARIE (Analisi Interna Premium)---
1. Stagione: combinare stagione + uso reale + materiale (es. "felpa mezza stagione slim grigia primavera"). Non solo inverno/estate, ma dettagli contestuali: termica, imbottita, leggera, traspirante, per serate, versatile.
2. Stile: combinare stile + fit + contesto d'uso. Streetwear (urban, hype, skate, oversize con grafica), Smart Casual (minimal chic, slim fit elegante, monocromatica), Casual (everyday, comoda da casa), Sportivo/Athleisure (training, palestra, tecnica).
3. Fit/Vestibilità: descrittori pratici e contestuali (comoda oversize, aderente elegante, classica regular), comportamento su diversi corpi.
4. Target psicografico: hype (limited edition, streetwear da collezione), basic (semplice, tinta unita, comfort), minimal (pulita, monocromatica, design raffinato).
5. Occasioni/Contesto d'uso: scuola/università (casual da college, layering), palestra (riscaldamento, tecnica, traspirante), uscita (serata con amici, urban street, passeggio), extra (viaggio, festival, campeggio, layering inverno).
6. Strategia Premium: keyword combinata naturale (stagione+stile+fit+target+occasione), long-tail keywords, tono conversazionale, materiali e dettagli extra (tessuti, grafiche, cappuccio, tasche, zip).

---PUNTO 7: CONDIZIONI (Analisi Interna Premium)---
1. Tessuti/superficie: pieghe permanenti, scolorimenti, variazioni cromatiche (analisi pixel-per-pixel), macchie o residui (superficiali vs permanenti).
2. Stampe/loghi: crepe, screpolature, scolorimento, sbiadimento, distorsione logo (allineamento, simmetria, integrità geometrica).
3. Suola/fondo (scarpe): usura battistrada, deformazioni strutturali, segni abrasione specifici.
4. Cuciture/assemblaggio: cuciture lente o difettose, sfilacciamenti, rotture, predizione rischio rottura futura.
5. Etichette/dettagli interni: integrità, leggibilità, autenticità, marchi/codici seriali, materiali interni (deformazioni, macchie, usura).
6. Struttura generale: forma complessiva vs modello originale, simmetria, rigidità, segni uso anomalo, predizione durata futura.
7. Analisi contestuale: stress test virtuale (simulazione usura giornaliera), benchmark vs standard premium, red flags (parametri fuori soglia che aumentano rischio reso/recensione negativa).

---PUNTO 8: TAGLIA / MATERIALE / COLORE (Analisi Interna Premium)---
1. Taglia/Vestibilità: coerenza etichetta vs reale, misure precise (spalle, torace, lunghezza totale, manica, vita/fianchi), vestibilità percepita (slim/regular/oversize, elastico/rigido), comportamento tessuto (elasticità, ritiro dopo lavaggio, peso g/m²).
2. Materiale/Texture: composizione reale (cotone/poliestere/lana/lino/viscosa/misto, % effettiva), sensazione al tatto (leggero/medio/pesante, morbidezza, traspirabilità, memoria tessuto), dettagli tessuto (struttura: maglia/twill/felpa/jacquard, pattern naturale: fiammato/mélange/mouliné, resistenza: tiraggio/pilling/usura).
3. Colore/Pattern: fedeltà cromatica (colore reale vs foto/luce artificiale, tonalità dettagliata, saturazione, gradienti), pattern (monocromo/righe/quadri/fantasia/stampa/jacquard, allineamento cuciture, contrasto), dettagli premium (riflessi tessuto, trasparenza/opacità, texture visiva).
Obiettivo: ridurre paura acquisto online, fornire dati tangibili, permettere suggerimenti taglia ideale.

---PUNTO 9: VITA ANNUNCIO (Analisi Interna Premium)---
1. Annuncio nuovo (<7 giorni): valuta tutti i parametri ma NON suggerisce ripubblicazione. Focus su miglioramento incrementale basato sugli altri 9 punti.
2. Annuncio intermedio (7-30 giorni): evidenzia parametri che perdono performance, analizza gli altri 9 punti dicendo cosa può aver danneggiato (e cosa meno), determina se ripubblicazione consigliata entro tot giorni con consigli su cosa modificare.
3. Annuncio vecchio (>30 giorni): analisi completa su tutti i 9 punti, identifica punti deboli prioritari, genera spunti ottimizzazione specifici, suggerisce fascia oraria ottimale basata su storico engagement Vinted.
Logica: prende giorni_attivo come trigger principale, analizza tutti gli altri 9 punti per carenze, per ogni parametro segnala "punto da ottimizzare" e propone soluzione, imposta flag ripubblicazione e timing ottimale.

---PUNTO 10: PSICOLOGIA DELL'ACQUIRENTE (Analisi Interna Premium)---
Missione: non vendere un capo, vendere certezza + identità + occasione. La trasformazione mentale target: "Questo mi rappresenta, è un affare e potrei perderlo se esco dall'app."
5 Aree psicologiche da coprire:
1. FIDUCIA ("Posso comprare senza rischi?"): provenienza chiara, stato reale trasparente, foto etichette/cuciture, linguaggio pulito → riduce rischio percepito.
2. VALORE ("Sto spendendo o guadagnando?"): ancora di prezzo (confronto implicito: "Pagato 180€, lo cedo a 65€"), trasformare spesa in opportunità.
3. SCARSITÀ ("Se esco lo perdo?"): trigger naturali non inventati ("ultimo pezzo", "taglia rara", "collezione fuori produzione") → FOMO controllata.
4. TEMPO ("Mi arriva subito?"): velocità = professionalità ("spedisco entro 24h", "già imballato", "tracking immediato") → riduce ansia post-acquisto.
5. RELAZIONE ("C'è una persona dietro?"): umanità ("scrivimi per info", "disponibile per misure", "rispondo velocemente") → controllo e supporto.
Trigger emotivi avanzati: identità/stile ("look pulito ma distintivo"), comfort ("caldo senza pesare"), esclusività ("pezzo raro"), lifestyle ("ideale per daily fit").
Micro-trigger invisibili: "veste true to size", "già lavato/sanificato", "valuto offerte sensate", "no-smoke".
Red flags da eliminare: "mi servono soldi", "devo venderlo", "urgente", "non lo uso più" → trasmettono bisogno e svalutazione.
Stato mentale target del buyer: Attrazione + Sicurezza + Convenienza + Urgenza simultaneamente.

FORMATO OUTPUT PER OGNI PUNTO (tutti e 10):
1. "impersonation": "[Descrivi in prima persona cosa HAI VISTO e analizzato, tono diretto e umano, basato sui parametri interni]"
2. "scoreBreakdown": "[Fattori specifici che ABBASSANO il punteggio con penalità quantificate]"
3. "advice": "[Problema → Perché → Come sistemare. Consigli pratici iper-mirati e specifici, ragionamento logico spinto]"
4. "conversionProbability": [0-100]
5. "score": [1-10 IPER REALISTICO]

REGOLA CRITICA COERENZA SCORE ↔ CONVERSION RATE:
La conversionProbability DEVE essere matematicamente e logicamente coerente con lo score. Segui questa scala RIGIDA come riferimento:
- Score 1-2 → conversionProbability 0-8% (annuncio tossico, nessuno compra)
- Score 3 → conversionProbability 8-15% (gravi carenze, conversione quasi impossibile)
- Score 4 → conversionProbability 15-25% (sotto la media, molti abbandoni)
- Score 5 → conversionProbability 25-38% (mediocre, qualche chance ma bassa)
- Score 6 → conversionProbability 38-50% (discreto ma con frizioni evidenti)
- Score 7 → conversionProbability 50-65% (buono, funziona ma non eccelle)
- Score 8 → conversionProbability 65-78% (molto buono, pochi attriti)
- Score 9 → conversionProbability 78-90% (eccellente, quasi perfetto)
- Score 10 → conversionProbability 90-98% (perfezione, rarissimo)

NON dare MAI un conversion rate alto con score basso o viceversa. Se lo score è 3, il conversion rate NON PUÒ essere sopra il 15%. Se lo score è 7, il conversion rate NON PUÒ essere sotto il 50%. Ogni conversionProbability deve essere GIUSTIFICATA implicitamente dal contenuto di scoreBreakdown e advice.

NON includere "ultimateContent" in nessun punto.

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

REGOLE CRITICHE:
- Rispondi SOLO JSON valido
- Analizza REALMENTE i dati forniti
- Punteggi BASSI sono normali (3-4 media)
- Ogni analisi UNICA per quell'annuncio
- NON includere ultimateContent
- Coerenza ASSOLUTA tra score e conversionProbability
- Tono: umano, diretto, zero tecnicismi, zero emoji`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { listing, images: imageDataUrls, imageOnly } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
      console.error("No AI API key configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Lovable AI gateway for Google models
    const lovableApiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableHeaders = {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Direct OpenAI API for GPT models  
    const openaiApiUrl = "https://api.openai.com/v1/chat/completions";
    const openaiHeaders = {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };

    const callAI = async (model: string, messages: any[], extraParams: any = {}) => {
      const isOpenAI = model.startsWith("openai/") && OPENAI_API_KEY;
      const url = isOpenAI ? openaiApiUrl : lovableApiUrl;
      const headers = isOpenAI ? openaiHeaders : lovableHeaders;
      const actualModel = isOpenAI ? model.replace("openai/", "") : model;
      
      return fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: actualModel, messages, stream: false, ...extraParams }),
      });
    };

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

      const response = await callAI("google/gemini-2.5-flash", [
            { role: "system", content: photoAnalysisPrompt },
            { role: "user", content: [
              { type: "text", text: `Analizza queste ${imageDataUrls.length} foto di un annuncio marketplace. Report individuale per ogni foto.` },
              ...imageContents,
            ]},
          ]);

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

    // apiUrl and apiHeaders already declared above

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
