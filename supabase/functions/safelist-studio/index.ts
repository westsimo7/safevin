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
  "premiumElements": ["elemento1"],
  "missingAngles": ["angolazione mancante"],
  "overallQuality": "valutazione qualità foto",
  "sellingPoints": ["punto di forza 1", "punto di forza 2"],
  "concerns": ["preoccupazione potenziale buyer 1"]
}`;

const QUESTIONS_SYSTEM_PROMPT = `Sei SAFEViN Studio, un top senior professionista nel resell virtuale su marketplace come Vinted. Il tuo compito è fare domande intelligenti e mirate per raccogliere tutte le informazioni necessarie a creare l'annuncio perfetto.

REGOLE:
1. Le domande devono essere SPECIFICHE per la categoria e il prodotto
2. Usa un mix di domande aperte (textbox) e a scelta multipla (options)
3. NON fare domande su informazioni già disponibili dal report visivo
4. Ogni domanda deve avere uno SCOPO chiaro per l'annuncio finale
5. Adatta il numero e tipo di domande al prodotto specifico
6. Se hai abbastanza info, rispondi con "complete": true

REGOLE FORMATO DOMANDE:
- Le domande a CROCETTE (type: "options") devono essere raggruppate a MASSIMO 3 per round
- Le domande APERTE (type: "text") devono essere MASSIMO 1 per round
- Ogni round può avere: fino a 3 domande options + 1 domanda text, OPPURE solo domande options (max 3), OPPURE solo 1 domanda text
- NON mischiare più di 1 domanda text per round

FORMATO OUTPUT (JSON):
{
  "complete": false,
  "questions": [
    {
      "id": "q1",
      "question": "Testo domanda",
      "type": "text" | "options",
      "options": ["opzione1", "opzione2"] // solo se type=options
      "purpose": "perché serve questa info" // interno, non mostrato
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
  "descrizione": "Descrizione strutturata completa con sezioni logiche, emoji minimali, tono professionale ma accessibile",
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
    "inspirationalText": "Paragrafo ispirazionale (150-250 parole) che integra keyword ad alta ricerca in modo naturale. Parla di occasioni, momenti, eventi, stagioni, abbinamenti, mood. Deve essere elegante, non sembrare SEO spam. Le keyword strategiche devono essere inserite nel flusso del testo.",
    "highlightedKeywords": ["keyword1", "keyword2", "keyword3"],
    "mentalFilters": {
      "occasioni": ["matrimonio invitato", "aperitivo estivo", "outfit ufficio", "serata elegante"],
      "stagione": ["look estivo leggero", "outfit primaverile", "mezza stagione"],
      "outfitAbbinamenti": ["abbinabile con blazer", "perfetto con jeans chiari", "look minimal chic"],
      "sinonimiItaliani": ["borsa elegante donna", "scarpe pelle nere", "giacca sartoriale uomo"],
      "intentoAcquisto": ["pronto per spedizione", "nuovo con scatola", "occasione imperdibile", "pezzo unico"]
    },
    "strategicHashtags": ["#outfitcerimonia", "#lookprimaverile", "#borsaelegantedonna"]
  },
  "suggestedPrice": {
    "min": 0,
    "max": 0,
    "reasoning": "Motivazione range prezzo"
  },
  "hashtags": ["#tag1", "#tag2"],
  "category_suggestion": "Categoria Vinted consigliata",
  "subcategory_suggestion": "Sottocategoria consigliata",
  "tips": ["Consiglio extra 1 per migliorare l'annuncio"]
}

REGOLE KEYWORD INTELLIGENCE:
- inspirationalText: Paragrafo elegante che integra keyword naturalmente. Parla di occasioni reali (cerimonia, aperitivo, cena, lavoro, università), stagione, abbinamenti outfit, mood. NON deve sembrare SEO spam. Deve essere ispirazionale e contestualizzato al prodotto specifico.
- highlightedKeywords: Array con TUTTE le keyword strategiche presenti nel testo ispirazionale (10-20 keyword). Queste verranno evidenziate visivamente nell'UI.
- mentalFilters: 5 categorie di keyword contestualizzate al prodotto:
  * occasioni: 5-8 keyword relative a eventi/occasioni d'uso reali per questo prodotto
  * stagione: 4-6 keyword stagionali pertinenti
  * outfitAbbinamenti: 5-7 keyword su outfit e abbinamenti con questo prodotto
  * sinonimiItaliani: 5-8 varianti semantiche reali che gli utenti cercano SENZA hashtag
  * intentoAcquisto: 4-5 keyword con intento d'acquisto forte
- strategicHashtags: 15-25 hashtag NON BANALI. Evitare #fashion #style #look. Preferire long tail, occasion-based, seasonal, intent-based. Mix tra diretti, long tail, occasion, seasonal, intent.

REGOLE TRUST SECTION:
- buyerQuestions: ESATTAMENTE 3 domande che l'acquirente si fa guardando questo specifico prodotto.
- actionChecklist: ESATTAMENTE 4-5 azioni concrete basate sull'annuncio creato che possano realmente aumentare la fiducia. Se le foto sono deboli, spingi su migliorarle. Sii specifico e pratico.
- strategicScripts: ESATTAMENTE 3 micro-script contestualizzati. Tono sicuro, professionale.

REGOLE GENERALI:
- Rispondi SOLO JSON valido
- Descrizione: 150-300 parole, strutturata con paragrafi
- Bullet points: 4-8 punti
- hashtags: campo legacy, metti gli stessi di strategicHashtags (primi 10)
- Prezzo: range realistico basato su mercato Vinted
- NON includere "trustElements" nel JSON, usa SOLO "trustSection"
- L'output DEVE adattarsi dinamicamente a: categoria, brand, stagione, prezzo (premium vs accessibile), mood, target`;

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
              { type: "text", text: `Analisi pass ${pass + 1}. Analizza queste ${images.length} foto per un annuncio Vinted. Categoria selezionata: ${categoria || "non specificata"}. Sii ESTREMAMENTE preciso su misure, numeri e testo visibile. Ricontrolla ogni dato numerico (taglie, misure, quantità).` },
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
          // If a pass fails, continue with what we have
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

      // If multiple passes, synthesize with a consensus call
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
        contextMessage += `\nBasandoti sulle risposte ricevute, decidi se servono altre domande o se hai abbastanza informazioni. Se servono altre domande, fai SOLO domande di approfondimento su aspetti non ancora coperti.`;
      } else {
        contextMessage += `\nQuesto è il primo round di domande. Fai le domande fondamentali per creare un annuncio eccellente per questa categoria di prodotto.`;
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
      
      // Clean markdown wrapping
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

    return new Response(
      JSON.stringify({ error: "Azione non valida. Usa: vision, questions, generate." }),
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
