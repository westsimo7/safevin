import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VISION_PROMPT = `Sei un analista visivo specializzato in marketplace second-hand. Analizza TUTTE le immagini fornite e restituisci un report JSON strutturato per aiutare un copywriter AI a creare l'annuncio perfetto.

Analizza:
A. Prodotto identificato (tipo, sottotipo, modello probabile)
B. Brand/Logo visibili (testo leggibile su etichette, loghi)
C. Colori principali e secondari (nomi precisi, non generici)
D. Materiale apparente (cotone, pelle, sintetico, misto, etc.)
E. Stato/Condizioni (nuovo, come nuovo, buono, usato, difetti visibili specifici)
F. Dettagli distintivi (stampe, ricami, zip, bottoni, tasche, cappuccio, fodera)
G. Taglia visibile (se leggibile su etichette)
H. Stile/Estetica (streetwear, elegante, casual, sportivo, vintage)
I. Difetti specifici (macchie, strappi, usura, scolorimento - posizione e gravità)
J. Elementi premium (packaging, dust bag, cartellini, certificati)
K. Coerenza set fotografico (qualità, angolazioni coperte, mancanti)
L. Genere percepito (uomo, donna, unisex)
M. Categoria Vinted suggerita (es. Maglioni girocollo, Felpe con cappuccio, Giacche di pelle)
N. Presenza zip/cappuccio/colletto/fodera
O. Stagionalità percepita (primavera/estate, autunno/inverno, mezza stagione)
P. Vestibilità percepita (slim, regular, oversize)

Restituisci SOLO JSON:
{
  "productType": "tipo prodotto identificato",
  "brandDetected": "brand se visibile, null se non identificabile",
  "colors": ["colore1", "colore2"],
  "materialGuess": "materiale apparente",
  "conditionAssessment": "valutazione stato",
  "defectsFound": ["difetto1 con posizione"],
  "distinctiveDetails": ["dettaglio1", "dettaglio2"],
  "sizeVisible": "taglia se leggibile",
  "styleCategory": "categoria stile",
  "genderGuess": "uomo/donna/unisex",
  "vintedCategoryGuess": "Categoria > Sottocategoria suggerita",
  "hasZip": true/false,
  "hasHood": true/false,
  "hasCollar": true/false,
  "seasonality": "stagionalità percepita",
  "fitGuess": "vestibilità percepita",
  "premiumElements": ["elemento1"],
  "missingAngles": ["angolazione mancante"],
  "overallQuality": "valutazione qualità foto",
  "sellingPoints": ["punto di forza 1", "punto di forza 2"],
  "concerns": ["preoccupazione potenziale buyer 1"]
}`;

const QUESTIONS_SYSTEM_PROMPT = `Sei SAFEViN Studio, un top senior professionista nel resell virtuale su marketplace come Vinted. Il tuo compito è fare domande intelligenti e mirate per raccogliere tutte le informazioni necessarie a creare l'annuncio perfetto.

REGOLE:
1. Le domande devono essere SPECIFICHE per la categoria e il prodotto
2. TUTTE le domande devono essere a RISPOSTA APERTA (type: "text"). NON usare MAI domande a scelta multipla (options).
3. NON fare domande su informazioni già disponibili dal report visivo
4. Ogni domanda deve avere uno SCOPO chiaro per l'annuncio finale
5. Adatta le domande al prodotto specifico
6. Ogni round contiene ESATTAMENTE 3 domande aperte
7. Quando hai raccolto abbastanza informazioni per creare un annuncio premium e dettagliato che raggiunga un SafeScore di 70-75, rispondi con "complete": true. Non continuare a fare domande inutili.
8. INCLUDI domande mirate per determinare la CATEGORIA VINTED corretta, ad esempio:
   - Il capo è pensato principalmente per uomo, donna o unisex?
   - È considerabile streetwear, casual, elegante o sportivo?
   - È parte di una categoria tecnica (sport, outdoor)?
   - È oversize per design o per vestibilità?
   Queste domande vanno integrate naturalmente nel flusso, non tutte insieme.

FORMATO OUTPUT (JSON):
{
  "complete": false,
  "questions": [
    {
      "id": "q1",
      "question": "Testo domanda",
      "type": "text",
      "purpose": "perché serve questa info"
    }
  ],
  "reasoning": "breve spiegazione interna del perché queste domande"
}

Se ritieni di avere abbastanza informazioni:
{
  "complete": true,
  "questions": [],
  "reasoning": "Ho abbastanza informazioni per generare l'annuncio"
}`;

const OUTPUT_SYSTEM_PROMPT = `Sei SAFEViN Studio, il miglior sistema AI per la creazione di annunci marketplace. Genera un annuncio Vinted PERFETTO basato su tutte le informazioni raccolte.

L'annuncio deve:
- Massimizzare la probabilità di vendita
- Essere strutturato per i filtri di ricerca Vinted
- Usare keywords strategiche naturali
- Creare fiducia e urgenza controllata
- Essere pronto per il copia-incolla

FORMATO OUTPUT (JSON):
{
  "titolo": "Titolo ottimizzato (max 80 char, keywords strategiche)",
  "descrizione": "STRUTTURA OBBLIGATORIA della descrizione:\\n\\n1) MINI STORYTELLING (prime 2-3 righe, max 55 parole): Testo diretto, evocativo, zero frasi lunghe, zero riempitivi. Deve trasmettere atmosfera + utilizzo reale del prodotto. Orientato a scena/contesto/uso reale (es. 'Un capo che richiama l'autunno in città, tra università e aperitivi serali. Palette calda e vibe retrò autentica anni 80/90. Perfetto per chi vuole distinguersi senza esagerare.'). NON usare mai la parola 'storytelling' nel testo.\\n\\n2) DESCRIZIONE TECNICA (subito dopo): Vestibilità, misure, materiale, condizioni, dettagli specifici del prodotto. Tono professionale ma accessibile.",
  "bulletPoints": [
    "• Punto tecnico/informativo 1",
    "• Punto tecnico/informativo 2"
  ],
  "trustSection": {
    "buyerQuestions": [
      "Domanda che l'acquirente si pone guardando QUESTO specifico annuncio (max 3)"
    ],
    "actionChecklist": [
      "Azione concreta e specifica per aumentare la fiducia su QUESTO annuncio (max 5)"
    ],
    "strategicScripts": [
      {
        "label": "Contesto della risposta",
        "script": "Risposta professionale pronta da copiare (max 220 caratteri)"
      }
    ]
  },
  "keywordIntelligence": {
    "keywordBlock": "Testo unico fluido di MASSIMO 55 parole che integra: ricerche dirette, ricerche emozionali, ricerche per occasione, sinonimi italiani, intento d'acquisto, outfit/stagione. NON in formato hashtag. Testo fluido ottimizzato SEO marketplace. Pensato per essere inserito ALLA FINE dell'annuncio per intercettare ricerche dirette e correlate senza appesantire la parte narrativa iniziale.",
    "strategicHashtags": ["#hashtag1", "#hashtag2"]
  },
  "suggestedPrice": {
    "min": 0,
    "max": 0,
    "reasoning": "Motivazione range prezzo"
  },
  "hashtags": ["#tag1", "#tag2"],
  "category_suggestion": "Categoria Vinted consigliata (es. Uomo > Maglioni e cardigan > Maglioni girocollo)",
  "subcategory_suggestion": "",
  "category_reasoning": "Motivazione dettagliata: perché questa categoria è stata scelta in base a analisi immagine, vestibilità, target dichiarato, tipologia tessuto, stile",
  "tips": ["Consiglio extra 1 per migliorare l'annuncio"]
}

REGOLE DESCRIZIONE:
- La descrizione DEVE iniziare con un mini storytelling (2-3 righe, max 55 parole): diretto, evocativo, zero riempitivi.
- Dopo il mini storytelling, prosegui con la descrizione tecnica classica (vestibilità, misure, materiale, condizioni).
- Il mini storytelling deve trasmettere atmosfera e utilizzo reale. NON usare la parola "storytelling".

REGOLE KEYWORD INTELLIGENCE:
- keywordBlock: UN UNICO blocco testo fluido (max 55 parole) che integra TUTTE le tipologie di ricerca: dirette, emozionali, per occasione, sinonimi italiani, intento d'acquisto, outfit/stagione. NON usare hashtag nel testo. Deve essere fluido e naturale, ottimizzato SEO marketplace. Questo testo è pensato per essere inserito alla fine dell'annuncio.
- strategicHashtags: MASSIMO 10 hashtag ULTRA-PREMIUM e iper-strategici. Ogni hashtag deve essere scelto con precisione chirurgica in base a TUTTO il resoconto dell'annuncio. Evitare hashtag generici (#fashion #style #look #vinted). Solo long tail specifici.
- NON includere: inspirationalText, highlightedKeywords, mentalFilters. Questi campi sono ELIMINATI.

REGOLE CATEGORIA CONSIGLIATA:
- category_suggestion: Deve essere un percorso completo Vinted (es. "Uomo > Maglioni e cardigan > Maglioni girocollo")
- subcategory_suggestion: Lasciare vuoto (il percorso è già in category_suggestion)
- category_reasoning: Spiegazione dettagliata del PERCHÉ questa categoria è stata scelta, basata su: analisi immagine, vestibilità, target dichiarato, tipologia tessuto, stile. Non solo la categoria, ma anche PERCHÉ.

REGOLE TRUST SECTION:
- buyerQuestions: ESATTAMENTE 3 domande che l'acquirente si fa guardando questo specifico prodotto.
- actionChecklist: ESATTAMENTE 4-5 azioni concrete basate sull'annuncio creato.
- strategicScripts: ESATTAMENTE 3 micro-script contestualizzati.

REGOLE GENERALI:
- Rispondi SOLO JSON valido
- Descrizione: 150-300 parole, strutturata con paragrafi
- Bullet points: 4-8 punti
- hashtags: campo legacy, metti gli stessi di strategicHashtags
- Prezzo: range realistico basato su mercato Vinted
- NON includere "trustElements" nel JSON, usa SOLO "trustSection"
- L'output DEVE adattarsi dinamicamente a: categoria, brand, stagione, prezzo, mood, target
- NON usare asterischi, grassetti, corsivi o markdown nella descrizione o nel keywordBlock`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, categoria, images, visionReport, questionsAnswers, conversationHistory } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
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

    // ========== ACTION: VISION ==========
    if (action === "vision") {
      if (!images || images.length === 0) {
        return new Response(
          JSON.stringify({ error: "Nessuna immagine fornita." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Vision: Analyzing ${images.length} images with multi-pass verification...`);

      const imageContents = images.map((dataUrl: string) => ({
        type: "image_url" as const,
        image_url: { url: dataUrl },
      }));

      const NUM_PASSES = 3;
      const reports: string[] = [];

      for (let pass = 0; pass < NUM_PASSES; pass++) {
        console.log(`Vision pass ${pass + 1}/${NUM_PASSES}...`);
        const visionMessages = [
          { role: "system", content: VISION_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `Analisi pass ${pass + 1}. Analizza queste ${images.length} foto per un annuncio Vinted. Categoria selezionata: ${categoria || "non specificata"}. Sii ESTREMAMENTE preciso su misure, numeri e testo visibile. Ricontrolla ogni dato numerico (taglie, misure, quantità). Presta MASSIMA attenzione a: genere (uomo/donna/unisex), tipo di capo, presenza zip/cappuccio, stagionalità, vestibilità.` },
              ...imageContents,
            ],
          },
        ];

        const visionResponse = await fetch(apiUrl, {
          method: "POST",
          headers: apiHeaders,
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: visionMessages,
            stream: false,
          }),
        });

        if (!visionResponse.ok) {
          const errText = await visionResponse.text();
          console.error(`Vision pass ${pass + 1} error:`, visionResponse.status, errText);
          if (visionResponse.status === 429) {
            return new Response(JSON.stringify({ error: "Troppi richieste. Riprova tra qualche istante." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (visionResponse.status === 402) {
            return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          continue;
        }

        const visionData = await visionResponse.json();
        const passReport = visionData.choices?.[0]?.message?.content || "";
        if (passReport) reports.push(passReport);
      }

      if (reports.length === 0) {
        return new Response(JSON.stringify({ error: "Errore analisi immagini." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let finalReport = reports[0];
      if (reports.length > 1) {
        console.log(`Synthesizing ${reports.length} vision passes...`);
        const synthesisResponse = await fetch(apiUrl, {
          method: "POST",
          headers: apiHeaders,
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Sei un analista visivo. Ti vengono forniti più report indipendenti della stessa immagine. Sintetizza UN UNICO report JSON definitivo. Quando i report discordano su valori numerici (taglie, misure, cm), scegli il valore che appare PIÙ FREQUENTEMENTE. Se tutti discordano, indica l'incertezza. Restituisci SOLO il JSON finale nello stesso formato dei report individuali." },
              { role: "user", content: `Ecco ${reports.length} analisi indipendenti delle stesse foto:\n\n${reports.map((r, i) => `--- ANALISI ${i + 1} ---\n${r}`).join("\n\n")}\n\nSintetizza in un unico report definitivo.` },
            ],
            stream: false,
          }),
        });

        if (synthesisResponse.ok) {
          const synthesisData = await synthesisResponse.json();
          finalReport = synthesisData.choices?.[0]?.message?.content || finalReport;
        }
      }

      return new Response(
        JSON.stringify({ visionReport: finalReport }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== ACTION: QUESTIONS ==========
    if (action === "questions") {
      console.log("Generating dynamic questions...");

      let contextMessage = `Categoria: ${categoria || "non specificata"}\n`;
      
      if (visionReport) {
        contextMessage += `\nReport visivo delle foto caricate:\n${visionReport}\n`;
      }

      if (conversationHistory && conversationHistory.length > 0) {
        contextMessage += `\nDomande e risposte precedenti:\n`;
        for (const qa of conversationHistory) {
          contextMessage += `D: ${qa.question}\nR: ${qa.answer}\n`;
        }
        contextMessage += `\nBasandoti sulle risposte ricevute, decidi se servono altre domande o se hai abbastanza informazioni. Se servono altre domande, fai SOLO domande di approfondimento su aspetti non ancora coperti. Assicurati di aver raccolto abbastanza info per determinare la CATEGORIA VINTED corretta (genere, tipo capo, stile).`;
      } else {
        contextMessage += `\nQuesto è il primo round di domande. Fai le domande fondamentali per creare un annuncio eccellente per questa categoria di prodotto. Includi almeno una domanda utile per determinare la categoria Vinted corretta (es. genere, stile, tipologia).`;
      }

      const questionsResponse = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: QUESTIONS_SYSTEM_PROMPT },
            { role: "user", content: contextMessage },
          ],
          stream: false,
        }),
      });

      if (!questionsResponse.ok) {
        const errText = await questionsResponse.text();
        console.error("Questions error:", questionsResponse.status, errText);
        if (questionsResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Troppi richieste. Riprova tra qualche istante." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "Errore generazione domande." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const questionsData = await questionsResponse.json();
      let content = questionsData.choices?.[0]?.message?.content || "";
      
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify(parsed),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        console.error("Failed to parse questions JSON:", content);
        return new Response(
          JSON.stringify({ error: "Errore formato risposta AI." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ========== ACTION: GENERATE ==========
    if (action === "generate") {
      console.log("Generating final output...");

      let contextMessage = `Genera l'annuncio Vinted perfetto basandoti su queste informazioni:\n\n`;
      contextMessage += `Categoria: ${categoria || "non specificata"}\n`;
      
      if (visionReport) {
        contextMessage += `\nReport analisi foto:\n${visionReport}\n`;
      }

      if (questionsAnswers && questionsAnswers.length > 0) {
        contextMessage += `\nInformazioni raccolte dall'utente:\n`;
        for (const qa of questionsAnswers) {
          contextMessage += `${qa.question}: ${qa.answer}\n`;
        }
      }

      const generateResponse = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "openai/gpt-5.2",
          messages: [
            { role: "system", content: OUTPUT_SYSTEM_PROMPT },
            { role: "user", content: contextMessage },
          ],
          stream: false,
        }),
      });

      if (!generateResponse.ok) {
        const errText = await generateResponse.text();
        console.error("Generate error:", generateResponse.status, errText);
        if (generateResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Troppi richieste. Riprova tra qualche istante." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (generateResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "Errore generazione annuncio." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const generateData = await generateResponse.json();
      let content = generateData.choices?.[0]?.message?.content || "";
      
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify({ output: parsed }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        console.error("Failed to parse output JSON:", content);
        return new Response(
          JSON.stringify({ error: "Errore formato risposta AI." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ========== ACTION: GENERATE_KEYWORD_TEXT ==========
    if (action === "generate_keyword_text") {
      console.log("Generating keyword text variant...");

      const { keywordBlock, outputContext } = body;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `Sei un copywriter esperto di marketplace second-hand. Genera un testo fluido di MASSIMO 55 parole che integra ricerche dirette, emozionali, per occasione, sinonimi italiani, intento d'acquisto, outfit e stagione. NON usare hashtag, emoji, asterischi, grassetti, corsivi, elenchi puntati. Solo testo piano fluido ottimizzato per SEO marketplace. Deve essere DIVERSO dal testo precedente se fornito, ma coprire le stesse aree semantiche con parole e angolazioni diverse.`,
            },
            {
              role: "user",
              content: `Contesto annuncio: ${outputContext || "non disponibile"}\n\nTesto precedente da variare (genera qualcosa di diverso): ${keywordBlock || "nessuno"}\n\nGenera il nuovo testo.`,
            },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Keyword text error:", response.status, errText);
        return new Response(JSON.stringify({ error: "Errore generazione testo keyword." }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() || "";

      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== ACTION: IMPROVE (Audit → Studio bridge) ==========
    if (action === "improve") {
      console.log("Generating improved listing from audit data...");

      const { auditSections, listingData: ld } = body;

      let contextMessage = `Sei SAFEViN Studio. Un utente ha appena ricevuto un Audit del suo annuncio. Devi generare una VERSIONE MIGLIORATA dell'annuncio risolvendo TUTTI i problemi trovati.\n\n`;
      contextMessage += `DATI ORIGINALI DELL'ANNUNCIO:\n`;
      contextMessage += `Titolo: ${ld?.titolo || "(vuoto)"}\n`;
      contextMessage += `Descrizione: ${ld?.descrizione || "(vuota)"}\n`;
      contextMessage += `Categoria: ${ld?.categoria || "(vuota)"}\n`;
      contextMessage += `Prezzo: ${ld?.prezzo || "(vuoto)"}€\n`;
      contextMessage += `Brand: ${ld?.brand || "(vuoto)"}\n`;
      contextMessage += `Condizioni: ${ld?.condizioni || "(vuote)"}\n`;
      contextMessage += `Taglia: ${ld?.taglia || "(vuota)"}\n`;
      contextMessage += `Colore: ${ld?.colore || "(vuoto)"}\n\n`;

      contextMessage += `REPORT AUDIT COMPLETO (incluse osservazioni e fattori penalizzanti):\n`;
      if (auditSections && Array.isArray(auditSections)) {
        for (const s of auditSections) {
          contextMessage += `\n--- ${s.title} (Score: ${s.score}/10) ---\n`;
          if (s.impersonation) contextMessage += `Osservazione: ${s.impersonation}\n`;
          if (s.scoreBreakdown) contextMessage += `Fattori penalizzanti: ${s.scoreBreakdown}\n`;
          if (s.advice) contextMessage += `Consiglio: ${s.advice}\n`;
        }
      }

      contextMessage += `\n\nGenera l'annuncio MIGLIORATO risolvendo TUTTI i problemi identificati dall'Audit. L'annuncio deve essere pronto per il copia-incolla su Vinted.`;

      const generateResponse = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "openai/gpt-5.2",
          messages: [
            { role: "system", content: OUTPUT_SYSTEM_PROMPT },
            { role: "user", content: contextMessage },
          ],
          stream: false,
        }),
      });

      if (!generateResponse.ok) {
        const errText = await generateResponse.text();
        console.error("Improve error:", generateResponse.status, errText);
        return new Response(JSON.stringify({ error: "Errore generazione miglioramento." }), {
          status: generateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const generateData = await generateResponse.json();
      let content = generateData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify({ output: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        console.error("Failed to parse improve JSON:", content);
        return new Response(JSON.stringify({ error: "Errore formato risposta AI." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(
      JSON.stringify({ error: "Azione non valida." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Studio error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Errore imprevisto." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
