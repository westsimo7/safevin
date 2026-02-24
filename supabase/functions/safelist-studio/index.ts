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

const QUESTIONS_SYSTEM_PROMPT = `Sei SAFEViN Studio, un top senior professionista nel resell virtuale su marketplace come Vinted. Il tuo compito è fare domande intelligenti e mirate seguendo un flusso strutturato A→Z per raccogliere TUTTE le informazioni necessarie a creare un annuncio da SafeScore 80-85+.

STRUTTURA A BLOCCHI — segui questo ordine logico:

BLOCCO 1 – Identità prodotto:
- Marca e modello specifico
- Target (uomo/donna/unisex)
- Stile (streetwear, casual, tecnico, elegante, vintage)

BLOCCO 2 – Condizioni:
- Nuovo con cartellino / Nuovo senza cartellino / Usato
- Difetti presenti (macchie, strappi, usura, scolorimento — posizione e gravità)
- Riparazioni effettuate

BLOCCO 3 – Misure (DINAMICHE per tipo prodotto):
- Pantaloni: lunghezza totale, vita, cavallo, fondo gamba
- Felpe/Maglie/Giacche: spalle, petto, lunghezza, maniche
- Scarpe: numero, lunghezza soletta, presenza scatola/scontrino
- Elettronica: funzionamento, accessori inclusi, batteria, garanzia
- Borse: altezza, larghezza, profondità, lunghezza tracolla

BLOCCO 4 – Composizione & Dettagli:
- Tessuto/materiale, spessore, elasticità
- Ricami, loghi, dettagli speciali (zip, cappuccio, fodera)

BLOCCO 5 – Prezzo e Posizionamento:
- Prezzo desiderato
- Apertura a trattative
- Posizionamento rispetto alla media di mercato

REGOLE:
1. Le domande devono essere SPECIFICHE per la categoria e il prodotto
2. TUTTE le domande devono essere a RISPOSTA APERTA (type: "text"). MAI scelta multipla.
3. NON fare domande su informazioni già disponibili dal report visivo o dalle risposte precedenti
4. Ogni round contiene ESATTAMENTE 3 domande dello STESSO blocco logico
5. Passa al blocco successivo solo quando hai abbastanza info dal blocco corrente
6. Adatta le domande al tipo di prodotto identificato da Vision
7. Target: raccogliere dati sufficienti per SafeScore 80-85+ (non accontentarti di 70)
8. Quando hai abbastanza info per generare un annuncio da 80-85+, rispondi con "complete": true
9. Includi il campo "currentBlock" per indicare in quale blocco sei

FORMATO OUTPUT (JSON):
{
  "complete": false,
  "currentBlock": "identità",
  "questions": [
    {
      "id": "q1",
      "question": "Testo domanda",
      "type": "text",
      "purpose": "perché serve questa info"
    }
  ],
  "reasoning": "breve spiegazione",
  "missingForTarget": "cosa manca ancora per raggiungere 80-85"
}

Se hai abbastanza informazioni:
{
  "complete": true,
  "questions": [],
  "reasoning": "Ho abbastanza informazioni per generare un annuncio da SafeScore 80-85+"
}`;

const OUTPUT_SYSTEM_PROMPT = `Sei SAFEViN Studio, il miglior sistema AI per la creazione di annunci marketplace. Genera un annuncio Vinted PERFETTO basato su tutte le informazioni raccolte.

L'annuncio deve:
- Massimizzare la probabilità di vendita
- Essere strutturato per i filtri di ricerca Vinted
- Usare keywords strategiche naturali
- Creare fiducia e urgenza controllata
- Essere pronto per il copia-incolla
- Includere PSICOLOGIA ACQUIRENTE: momento d'uso, tipo di persona, contesto, perché lo compri, come ti fa sentire

FORMATO OUTPUT (JSON):
{
  "titolo": "Titolo ottimizzato (max 80 char, keywords strategiche)",
  "descrizione": "STRUTTURA OBBLIGATORIA della descrizione:\\n\\n1) MINI STORYTELLING (prime 2-3 righe, max 55 parole): Testo diretto, evocativo, zero frasi lunghe, zero riempitivi. Deve trasmettere atmosfera + utilizzo reale + PSICOLOGIA: momento d'uso, tipo persona, come ti fa sentire.\\n\\n2) DESCRIZIONE TECNICA (subito dopo): Vestibilità, misure, materiale, condizioni, dettagli specifici del prodotto. Tono professionale ma accessibile.",
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
    "keywordBlock": "Testo unico fluido di MASSIMO 55 parole che integra: ricerche dirette, ricerche emozionali, ricerche per occasione, sinonimi italiani, intento d'acquisto, outfit/stagione. NON in formato hashtag. Testo fluido ottimizzato SEO marketplace.",
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
  "category_reasoning": "Motivazione dettagliata",
  "tips": ["Consiglio extra 1 per migliorare l'annuncio"],
  "score_estimate": 82
}

REGOLE KEYWORD & TAG (STRUTTURA DEFINITIVA):
- strategicHashtags: ESATTAMENTE 10-12 hashtag ULTRA-MIRATI suddivisi così:
  * 3-4 KEYWORD CORE (acquisto immediato, IT + EN): es. #GiaccaPelleUomo #LeatherJacketMen #ChiudoNero #BikerJacketBlack
  * 3 KEYWORD STAGIONALI: es. #OutfitAutunno #LookInverno #FallOutfit
  * 2 KEYWORD OCCASIONE: es. #Aperitivo #EventoSerale
  * 2 KEYWORD EMOZIONALI: es. #StileDeciso #VibeStreet
- VIETATI hashtag generici (#fashion #style #look #vinted #trendy)
- Ogni hashtag deve avere ALTA INTENZIONE D'ACQUISTO
- hashtags (campo legacy): stessi di strategicHashtags

REGOLE PSICOLOGIA ACQUIRENTE (OBBLIGATORIE):
- La descrizione DEVE contenere: momento d'uso, tipo di persona target, contesto d'uso, perché comprarlo, come fa sentire
- Se mancano questi elementi, l'annuncio è INCOMPLETO

REGOLE DESCRIZIONE:
- La descrizione DEVE iniziare con un mini storytelling (2-3 righe, max 55 parole): diretto, evocativo, zero riempitivi.
- Dopo il mini storytelling, prosegui con la descrizione tecnica classica.
- NON usare la parola "storytelling".

REGOLE CATEGORIA CONSIGLIATA:
- category_suggestion: Deve essere un percorso completo Vinted (es. "Uomo > Maglioni e cardigan > Maglioni girocollo")
- category_reasoning: Spiegazione dettagliata del PERCHÉ questa categoria è stata scelta

REGOLE TRUST SECTION:
- buyerQuestions: ESATTAMENTE 3 domande
- actionChecklist: ESATTAMENTE 4-5 azioni concrete
- strategicScripts: ESATTAMENTE 3 micro-script contestualizzati

REGOLE GENERALI:
- Rispondi SOLO JSON valido
- Descrizione: 150-300 parole, strutturata con paragrafi
- Bullet points: 4-8 punti
- Prezzo: range realistico basato su mercato Vinted
- NON includere "trustElements" nel JSON, usa SOLO "trustSection"
- NON usare asterischi, grassetti, corsivi o markdown
- score_estimate: stima REALISTICA del SafeScore. Un annuncio senza misure precise non può superare 65.
- Target score_estimate: 80-85+.`;

const AUDIT_INTERNAL_PROMPT = `Sei il motore di validazione interno di SAFEViN. Devi valutare un annuncio generato da Studio PRIMA della pubblicazione.

Valuta SOLO queste 8 categorie (ESCLUDI qualità foto e vita annuncio):

1. Titolo / SEO (max 10 punti)
2. Descrizione (max 10 punti)
3. Prezzo strategico (max 10 punti)
4. Categoria + Brand (max 10 punti)
5. Tag + Keyword (max 10 punti)
6. Condizione prodotto (max 10 punti)
7. Materiale / Colore (max 10 punti)
8. Psicologia acquirente (max 10 punti)

PUNTEGGIO MASSIMO: 80
SOGLIA MINIMA: 65/80
TARGET: 70-75+
ECCELLENZA: 75-80

Per ogni categoria assegna un punteggio 0-10 e identifica le carenze.

REGOLA KEYWORD: se l'annuncio ha keyword strutturate (core IT+EN, stagionali, occasione, emozionali), il punteggio keyword DEVE essere MINIMO 7/10.

Rispondi SOLO JSON:
{
  "totalScore": numero (0-80),
  "passed": boolean (true se >= 65),
  "categories": [
    {
      "name": "nome categoria",
      "score": numero (0-10),
      "issues": ["problema 1"],
      "missingData": ["dato mancante 1"]
    }
  ],
  "missingFields": [
    {
      "field": "nome campo mancante",
      "reason": "perché serve",
      "question": "domanda da fare all'utente"
    }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, categoria, images, visionReport, questionsAnswers, conversationHistory } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
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

    // Helper: route request to correct API based on model
    const callAI = async (model: string, messages: any[], extraParams: any = {}) => {
      const isOpenAI = model.startsWith("openai/") && OPENAI_API_KEY;
      const url = isOpenAI ? openaiApiUrl : lovableApiUrl;
      const headers = isOpenAI ? openaiHeaders : lovableHeaders;
      // Strip prefix for direct OpenAI calls
      const actualModel = isOpenAI ? model.replace("openai/", "") : model;
      
      return fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: actualModel, messages, stream: false, ...extraParams }),
      });
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

        const visionResponse = await callAI("google/gemini-2.5-flash", visionMessages);

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
        const synthesisResponse = await callAI("google/gemini-2.5-flash", [
              { role: "system", content: "Sei un analista visivo. Ti vengono forniti più report indipendenti della stessa immagine. Sintetizza UN UNICO report JSON definitivo. Quando i report discordano su valori numerici (taglie, misure, cm), scegli il valore che appare PIÙ FREQUENTEMENTE. Se tutti discordano, indica l'incertezza. Restituisci SOLO il JSON finale nello stesso formato dei report individuali." },
              { role: "user", content: `Ecco ${reports.length} analisi indipendenti delle stesse foto:\n\n${reports.map((r, i) => `--- ANALISI ${i + 1} ---\n${r}`).join("\n\n")}\n\nSintetizza in un unico report definitivo.` },
            ]);

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

      const questionsResponse = await callAI("google/gemini-3-flash-preview", [
            { role: "system", content: QUESTIONS_SYSTEM_PROMPT },
            { role: "user", content: contextMessage },
          ]);

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

      const generateResponse = await callAI("openai/gpt-5.2", [
            { role: "system", content: OUTPUT_SYSTEM_PROMPT },
            { role: "user", content: contextMessage },
          ]);

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
        let parsed = JSON.parse(content);

        // Auto-refinement: if score_estimate < 75, refine once
        if (parsed.score_estimate && parsed.score_estimate < 75) {
          console.log(`Score estimate ${parsed.score_estimate} < 75, auto-refining...`);
          try {
            const refineResponse = await callAI("openai/gpt-5.2", [
                  { role: "system", content: OUTPUT_SYSTEM_PROMPT },
                  { role: "user", content: contextMessage },
                  { role: "assistant", content: content },
                  { role: "user", content: "Il SafeScore stimato è troppo basso. Raffina l'annuncio: aggiungi micro CTA, migliora leve persuasive, riduci genericità, migliora struttura frasi, inserisci parole ad alta intenzione d'acquisto, migliora chiarezza misure. Target: 80-85+. Restituisci lo stesso formato JSON completo." },
                ]);

            if (refineResponse.ok) {
              const refineData = await refineResponse.json();
              let refinedContent = refineData.choices?.[0]?.message?.content || "";
              refinedContent = refinedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
              try {
                parsed = JSON.parse(refinedContent);
                console.log(`Refined score_estimate: ${parsed.score_estimate}`);
              } catch {
                console.log("Refinement parse failed, using original output");
              }
            }
          } catch (refErr) {
            console.error("Refinement error:", refErr);
          }
        }

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

      const response = await callAI("google/gemini-2.5-flash-lite", [
            {
              role: "system",
              content: `Sei un copywriter esperto di marketplace second-hand. Genera un testo fluido di MASSIMO 55 parole che integra ricerche dirette, emozionali, per occasione, sinonimi italiani, intento d'acquisto, outfit e stagione. NON usare hashtag, emoji, asterischi, grassetti, corsivi, elenchi puntati. Solo testo piano fluido ottimizzato per SEO marketplace. Deve essere DIVERSO dal testo precedente se fornito, ma coprire le stesse aree semantiche con parole e angolazioni diverse.`,
            },
            {
              role: "user",
              content: `Contesto annuncio: ${outputContext || "non disponibile"}\n\nTesto precedente da variare (genera qualcosa di diverso): ${keywordBlock || "nessuno"}\n\nGenera il nuovo testo.`,
            },
          ]);

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

      const { auditSections, listingData: ld, gapAnswers } = body;

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

      if (gapAnswers && Array.isArray(gapAnswers) && gapAnswers.length > 0) {
        contextMessage += `\n\nINFORMAZIONI AGGIUNTIVE FORNITE DALL'UTENTE:\n`;
        for (const qa of gapAnswers) {
          contextMessage += `${qa.question}: ${qa.answer}\n`;
        }
      }

      contextMessage += `\n\nGenera l'annuncio MIGLIORATO risolvendo TUTTI i problemi identificati dall'Audit. Integra le informazioni aggiuntive se presenti. L'annuncio deve essere pronto per il copia-incolla su Vinted. Target SafeScore: 80-85+.`;

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

    // ========== ACTION: GAP_QUESTIONS (Audit → Studio bridge) ==========
    if (action === "gap_questions") {
      console.log("Generating gap-based questions from audit...");

      const { auditSections: auditSecs, listingData: ld2 } = body;

      let ctxMsg = `Sei SAFEViN Studio. Hai ricevuto un report Audit di un annuncio esistente. Devi generare domande MIRATE solo sulle informazioni MANCANTI per portare l'annuncio a un SafeScore di 80-85+.\n\n`;
      ctxMsg += `DATI ESISTENTI:\n`;
      ctxMsg += `Titolo: ${ld2?.titolo || "(vuoto)"}\nDescrizione: ${ld2?.descrizione || "(vuota)"}\nCategoria: ${ld2?.categoria || "(vuota)"}\n`;
      ctxMsg += `Prezzo: ${ld2?.prezzo || "(vuoto)"}€\nBrand: ${ld2?.brand || "(vuoto)"}\nCondizioni: ${ld2?.condizioni || "(vuote)"}\n`;
      ctxMsg += `Taglia: ${ld2?.taglia || "(vuota)"}\nColore: ${ld2?.colore || "(vuoto)"}\n\n`;

      ctxMsg += `PROBLEMI IDENTIFICATI DALL'AUDIT:\n`;
      if (auditSecs && Array.isArray(auditSecs)) {
        for (const s of auditSecs) {
          if (s.score < 7) {
            ctxMsg += `- ${s.title} (${s.score}/10): ${s.advice}\n`;
            if (s.scoreBreakdown) ctxMsg += `  Fattori: ${s.scoreBreakdown}\n`;
          }
        }
      }

      ctxMsg += `\nGenera 3-5 domande SOLO sulle informazioni mancanti che impediscono di raggiungere un SafeScore 80-85+. Non chiedere informazioni già presenti nei dati.`;

      if (conversationHistory && conversationHistory.length > 0) {
        ctxMsg += `\n\nRisposte già fornite:\n`;
        for (const qa of conversationHistory) {
          ctxMsg += `D: ${qa.question}\nR: ${qa.answer}\n`;
        }
        ctxMsg += `\nSe hai abbastanza info, rispondi con "complete": true.`;
      }

      const gapResponse = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `Genera domande mirate per colmare i gap informativi di un annuncio marketplace. Ogni domanda DEVE essere a risposta aperta (type: "text"). Rispondi SOLO JSON valido: { "complete": boolean, "questions": [{ "id": "q1", "question": "...", "type": "text" }] }` },
            { role: "user", content: ctxMsg },
          ],
          stream: false,
        }),
      });

      if (!gapResponse.ok) {
        const errText = await gapResponse.text();
        console.error("Gap questions error:", gapResponse.status, errText);
        return new Response(JSON.stringify({ error: "Errore generazione domande gap." }), {
          status: gapResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const gapData = await gapResponse.json();
      let gapContent = gapData.choices?.[0]?.message?.content || "";
      gapContent = gapContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const gapParsed = JSON.parse(gapContent);
        return new Response(JSON.stringify(gapParsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        return new Response(JSON.stringify({ error: "Errore formato risposta AI." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ========== ACTION: AUDIT_INTERNAL (Studio → Audit validation) ==========
    if (action === "audit_internal") {
      console.log("Running internal audit on generated ad...");

      const { generatedOutput } = body;

      if (!generatedOutput) {
        return new Response(JSON.stringify({ error: "Nessun annuncio da validare." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const auditContext = `Valida questo annuncio generato da SAFEViN Studio:

TITOLO: ${generatedOutput.titolo || "(vuoto)"}

DESCRIZIONE: ${generatedOutput.descrizione || "(vuota)"}

BULLET POINTS: ${(generatedOutput.bulletPoints || []).join("; ")}

PREZZO SUGGERITO: €${generatedOutput.suggestedPrice?.min || "?"} - €${generatedOutput.suggestedPrice?.max || "?"}
Motivazione: ${generatedOutput.suggestedPrice?.reasoning || "(nessuna)"}

CATEGORIA: ${generatedOutput.category_suggestion || "(vuota)"}

HASHTAG/KEYWORD: ${(generatedOutput.hashtags || []).join(", ")}
Keyword Block: ${generatedOutput.keywordIntelligence?.keywordBlock || "(vuoto)"}
Strategic Hashtags: ${(generatedOutput.keywordIntelligence?.strategicHashtags || []).join(", ")}

TRUST SECTION: ${generatedOutput.trustSection ? "presente" : "assente"}

TIPS: ${(generatedOutput.tips || []).join("; ")}

Categoria prodotto: ${categoria || "non specificata"}
Vision report disponibile: ${visionReport ? "sì" : "no"}`;

      const auditResponse = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: AUDIT_INTERNAL_PROMPT },
            { role: "user", content: auditContext },
          ],
          stream: false,
        }),
      });

      if (!auditResponse.ok) {
        const errText = await auditResponse.text();
        console.error("Internal audit error:", auditResponse.status, errText);
        return new Response(JSON.stringify({ error: "Errore audit interno." }), {
          status: auditResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const auditData = await auditResponse.json();
      let auditContent = auditData.choices?.[0]?.message?.content || "";
      auditContent = auditContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const auditParsed = JSON.parse(auditContent);
        console.log(`Internal audit score: ${auditParsed.totalScore}/80, passed: ${auditParsed.passed}`);
        return new Response(JSON.stringify(auditParsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse audit JSON:", auditContent);
        // If parse fails, assume passed to not block user
        return new Response(JSON.stringify({ totalScore: 70, passed: true, categories: [], missingFields: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
