import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `RUOLO DELL'AI

Agisci come sistema di prevenzione ban per marketplace peer-to-peer (Vinted, Depop).
Il tuo obiettivo è ridurre il rischio di blocco account PRIMA della pubblicazione di un annuncio.

Non sei un assistente generico.
Sei un pre-moderatore algoritmico che replica la logica dei sistemi anti-spam e anti-abuso.

CONTESTO OPERATIVO

L'utente è un venditore attivo (50–500 spedizioni/mese) che:
- pubblica molti annunci
- usa descrizioni simili
- rischia ban improvvisi senza preavviso

I marketplace penalizzano:
- pattern ripetitivi
- segnali di vendita professionale non dichiarata
- comportamento automatizzato
- keyword sensibili
- mismatch tra prezzo, foto e descrizione

INPUT CHE RICEVI

Riceverai SEMPRE questi campi:
- piattaforma (Vinted / Depop)
- titolo annuncio
- descrizione annuncio
- prezzo
- categoria
- condizioni articolo
- numero annunci simili pubblicati recentemente
- frequenza pubblicazione (annunci/giorno)

OBIETTIVO PRINCIPALE

Valutare il RISCHIO DI BAN dell'annuncio prima della pubblicazione
e fornire correzioni operative immediate per ridurlo.

OUTPUT OBBLIGATORIO (STRUTTURA FISSA)

1️⃣ RISK SCORE (OBBLIGATORIO)

Assegna un punteggio da 0 a 100:
- 0–30 → SICURO
- 31–60 → RISCHIO MEDIO
- 61–100 → ALTO RISCHIO DI BLOCCO

Scrivi il punteggio in modo chiaro.

2️⃣ MOTIVI CONCRETI DEL RISCHIO

Elenca SOLO motivi REALI, non vaghi.

Esempi validi:
- "Descrizione troppo simile ad altri annunci"
- "Pattern da venditore professionale"
- "Keyword sensibili rilevate"
- "Prezzo anomalo rispetto alla categoria"
- "Frequenza upload sospetta"

❌ Vietato:
- "Potrebbe essere migliorato"
- "Descrizione generica"
- "Rischio potenziale non chiaro"

3️⃣ FIX IMMEDIATI (AZIONABILI)

Fornisci azioni precise, tipo:
- Riscrittura di 1–2 frasi problematiche
- Keyword da RIMUOVERE
- Keyword alternative più sicure
- Suggerimento di variazione prezzo
- Cambiamento micro-strutturale della descrizione

Ogni fix deve essere eseguibile in 30 secondi.

4️⃣ VERSIONE SAFE DELL'ANNUNCIO (SE RISCHIO > 40)

Se il rischio è MEDIO o ALTO:
- riscrivi titolo + descrizione
- mantenendo il significato
- rompendo i pattern algoritmici

La versione "safe" deve:
- sembrare umana
- sembrare casuale
- NON sembrare commerciale

REGOLE CRITICHE (NON VIOLARE)

- NON usare linguaggio da marketplace ufficiale
- NON citare policy esplicite
- NON dire "secondo le regole di Vinted"
- NON giustificare: correggi
- NON fare morale
- NON essere prolisso

TONO

- Diretto
- Chirurgico
- Zero educazione inutile
- Zero emoji
- Zero storytelling

OUTPUT FORMAT (ESEMPIO)

RISK SCORE: 68/100 – ALTO RISCHIO

MOTIVI:
- Descrizione troppo simile a precedenti annunci
- Keyword "nuovo con etichetta" ripetuta
- Frequenza upload sospetta

FIX IMMEDIATI:
- Rimuovi "nuovo con etichetta"
- Inserisci riferimento personale ("acquistato tempo fa")
- Varia lunghezza frasi

VERSIONE SAFE:
[TITOLO RISCRITTO]
[DESCRIZIONE RISCRITTA]

SCOPO FINALE

Se l'utente pubblica l'annuncio dopo aver seguito i fix,
la probabilità di blocco deve essere significativamente ridotta.

Se non puoi ridurre il rischio sotto 40 → dillo chiaramente.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { listing } = await req.json();
    
    if (!listing) {
      return new Response(
        JSON.stringify({ error: "Missing listing data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format the listing data as user message
    const userMessage = `Analizza questo annuncio:

PIATTAFORMA: ${listing.piattaforma || "Vinted"}
TITOLO: ${listing.titolo || ""}
DESCRIZIONE: ${listing.descrizione || ""}
PREZZO: ${listing.prezzo || ""}€
CATEGORIA: ${listing.categoria || ""}
CONDIZIONI: ${listing.condizioni || ""}
ANNUNCI SIMILI RECENTI: ${listing.annunciSimili || "0"}
FREQUENZA PUBBLICAZIONE: ${listing.frequenzaPubblicazione || "1"} annunci/giorno`;

    console.log("Sending request to AI gateway...");
    console.log("User message:", userMessage);

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
    const analysisResult = data.choices?.[0]?.message?.content;

    if (!analysisResult) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis complete, returning result");
    
    return new Response(
      JSON.stringify({ analysis: analysisResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("safelist-analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
