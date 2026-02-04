import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei SAFEVIN 2.0, un revisore umano esperto di Vinted. Non sei un bot. Analizzi REALMENTE ogni annuncio come farebbe un venditore professionista.

Per ogni punto, usa internamente questi controlli (NON mostrarli all'utente, usali solo per ragionare):
- Titolo: lunghezza, marca, taglia, ordine parole, parole cercabili
- Foto: luminosità, nitidezza, sfondo, numero, qualità prima foto
- Prezzo: differenza mercato, percezione affare, margine trattativa, coerenza, competitività
- Descrizione: chiarezza condizione, misure, difetti, spedizione, fiducia
- Tag: campi mancanti, colore, materiale, stile, categoria
- Risposta: velocità, rischio perdita, notifiche, fasce orarie, stato online
- Attività: frequenza upload, numero annunci, interazioni, ultimo accesso, costanza
- Ripubblicazione: età annuncio, like stagnanti, visualizzazioni, prezzo invariato, foto invariata
- Psicologia: urgenza, sicurezza, valore percepito, chiarezza offerta, fiducia venditore
- Volume: numero annunci, diversificazione, frequenza, nicchia, scala

Restituisci un JSON con questa struttura ESATTA:

{
  "overallScore": [numero da 0 a 100],
  "sections": [
    {
      "title": "Titolo Prodotto",
      "score": [numero da 1 a 10],
      "advice": "[Problema concreto → Perché è un problema → Come sistemarlo subito. Max 2 frasi dirette.]",
      "ultimateContent": "[ANALISI ULTIMATE: Fornisci 3 versioni concrete del titolo ottimizzato: 1) Versione migliorata (equilibrata), 2) Versione alternativa (focus diverso), 3) Versione aggressiva (vendita rapida). Scrivi i titoli pronti da copiare, senza spiegazioni.]"
    },
    {
      "title": "Prime Foto",
      "score": [numero da 1 a 10],
      "advice": "[Valuta luce, sfondo, nitidezza, ordine. Problema → Perché → Soluzione immediata]",
      "ultimateContent": "[ANALISI ULTIMATE: Checklist foto perfetta: 1) Ordine ideale delle foto, 2) Cosa fotografare che manca, 3) Angolazioni che vendono di più per questo tipo di prodotto. Consigli pratici immediati.]"
    },
    {
      "title": "Prezzo Strategico",
      "score": [numero da 1 a 10],
      "advice": "[Confronto reale col mercato. Suggerisci: prezzo vendita veloce / equilibrio / margine]",
      "ultimateContent": "[ANALISI ULTIMATE: 3 strategie prezzo: 1) Prezzo vendita veloce (entro 48h), 2) Prezzo equilibrato (1-2 settimane), 3) Prezzo margine (se puoi aspettare). Numeri concreti basati sul mercato.]"
    },
    {
      "title": "Descrizione",
      "score": [numero da 1 a 10],
      "advice": "[Valuta chiarezza, fiducia, misure, difetti. Problema → Soluzione]",
      "ultimateContent": "[ANALISI ULTIMATE: Riscrivi la descrizione completa ottimizzata, pronta da copiare. Include: hook iniziale, dettagli prodotto, misure, condizione, call to action finale.]"
    },
    {
      "title": "Tag / Categoria / Brand",
      "score": [numero da 1 a 10],
      "advice": "[Controlla completezza campi. Cosa manca? Come sistemare?]",
      "ultimateContent": "[ANALISI ULTIMATE: Lista completa tag consigliati per massimizzare visibilità. Categoria esatta da selezionare. Parole chiave che gli acquirenti cercano per questo prodotto.]"
    },
    {
      "title": "Tempo di Risposta",
      "score": [numero da 1 a 10],
      "advice": "[Impatto sulle vendite. Azione immediata da fare]",
      "ultimateContent": "[ANALISI ULTIMATE: Template risposte veloci: 1) Risposta standard, 2) Risposta a richiesta sconto, 3) Risposta a domanda misure. Pronte da salvare e usare.]"
    },
    {
      "title": "Attività Profilo",
      "score": [numero da 1 a 10],
      "advice": "[Vitalità profilo. Micro-azione concreta da fare oggi]",
      "ultimateContent": "[ANALISI ULTIMATE: Piano settimanale attività: quanti annunci caricare, quando, come interagire per aumentare visibilità algoritmo Vinted.]"
    },
    {
      "title": "Ripubblicazione",
      "score": [numero da 1 a 10],
      "advice": "[Serve un reset? Quando e come farlo?]",
      "ultimateContent": "[ANALISI ULTIMATE: Strategia ripubblicazione: 1) Quando ripubblicare questo annuncio, 2) Cosa cambiare prima di ripubblicare, 3) Tecnica bump gratuito.]"
    },
    {
      "title": "Psicologia Acquirente",
      "score": [numero da 1 a 10],
      "advice": "[Frasi che aumentano urgenza e sicurezza. Esempio concreto]",
      "ultimateContent": "[ANALISI ULTIMATE: 5 frasi pronte che aumentano conversione: frasi urgenza, frasi sicurezza, frasi valore, frasi fiducia, frasi call-to-action. Copia e incolla nella descrizione.]"
    },
    {
      "title": "Volume Annunci",
      "score": [numero da 1 a 10],
      "advice": "[Differenza tra fortuna e sistema. Cosa fare per scalare]",
      "ultimateContent": "[ANALISI ULTIMATE: Piano crescita: 1) Obiettivo annunci settimanale, 2) Categorie da espandere, 3) Come trasformare vendite sporadiche in sistema costante.]"
    }
  ],
  "summary": "[BLOCCO UNICO di circa 15 righe. Scrivi come un venditore esperto che guarda l'annuncio e dice la verità. Includi: problemi principali trovati, cosa blocca la vendita, cosa sistemare subito, cosa migliorare nel breve, spunti pratici su foto/titolo/prezzo/fiducia, importanza del volume e della velocità di risposta, differenza tra annuncio invisibile e vendibile, incoraggiamento concreto e realistico. Tono: umano, diretto, zero paroloni, zero emoji.]"
}

REGOLE CRITICHE:
- Rispondi SOLO con il JSON, nessun altro testo
- ANALIZZA REALMENTE il contenuto, non dare risposte generiche
- Ogni analisi deve essere UNICA e SPECIFICA per quell'annuncio
- I punteggi devono essere VARIABILI e REALISTICI
- ultimateContent deve contenere CONTENUTI CONCRETI, pronti da usare, non teoria
- Il summary finale deve sembrare scritto da un essere umano esperto
- Tono: umano, semplice, diretto, zero tecnicismi, zero emoji
- Frasi corte. Soluzioni immediate. Niente teoria.
- Formato advice: Problema → Perché → Come sistemare subito`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { vintedUrl, listing, analysisType } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userMessage: string;

    // Handle POST analysis (URL-based)
    if (analysisType === "post" && vintedUrl) {
      userMessage = `Analizza questo annuncio Vinted: ${vintedUrl}

Nota: Non ho accesso diretto al contenuto dell'annuncio, quindi fornisci un'analisi basata su best practices generali per un annuncio Vinted tipico, con consigli specifici per ogni sezione.

Genera punteggi realistici variabili (non tutti uguali) e consigli personalizzati.`;
    } 
    // Handle legacy listing-based analysis
    else if (listing) {
      userMessage = `Analizza questo annuncio:

PIATTAFORMA: ${listing.piattaforma || "Vinted"}
TITOLO: ${listing.titolo || ""}
DESCRIZIONE: ${listing.descrizione || ""}
PREZZO: ${listing.prezzo || ""}€
CATEGORIA: ${listing.categoria || ""}
CONDIZIONI: ${listing.condizioni || ""}
ANNUNCI SIMILI RECENTI: ${listing.annunciSimili || "0"}
FREQUENZA PUBBLICAZIONE: ${listing.frequenzaPubblicazione || "1"} annunci/giorno`;
    } else {
      return new Response(
        JSON.stringify({ error: "Missing vintedUrl or listing data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending request to AI gateway...");
    console.log("Analysis type:", analysisType || "legacy");

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
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysisResultRaw = data.choices?.[0]?.message?.content;

    if (!analysisResultRaw) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Raw AI response:", analysisResultRaw);

    // Try to parse as JSON for structured response
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = analysisResultRaw.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      const analysisResult = JSON.parse(cleanedResponse);
      
      console.log("Analysis complete, returning structured result");
      
      return new Response(
        JSON.stringify({ analysis: analysisResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      // If JSON parsing fails, return raw text for legacy compatibility
      console.log("Could not parse as JSON, returning raw text");
      return new Response(
        JSON.stringify({ analysis: analysisResultRaw }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("safelist-analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
