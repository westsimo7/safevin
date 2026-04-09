import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, images } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch recent data from DB to give the coach context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Fetch last 10 analyses
    const { data: analyses } = await sb
      .from("analyses")
      .select("titolo, categoria, prezzo, condizioni, analysis_type, origin, created_at, analysis_result")
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch last 10 studio creations
    const { data: creations } = await sb
      .from("studio_creations")
      .select("titolo_generato, categoria, origin, created_at, output")
      .order("created_at", { ascending: false })
      .limit(10);

    // Build context summary
    const analysisContext = (analyses || []).map((a: any) => {
      const result = a.analysis_result;
      const score = result?.safescore_totale ?? result?.punteggio_totale ?? "N/A";
      return `- "${a.titolo}" (${a.categoria}, ${a.prezzo}€, ${a.condizioni}) — SafeScore: ${score}/100 [${a.analysis_type}, ${a.origin}] (${a.created_at})`;
    }).join("\n");

    const studioContext = (creations || []).map((c: any) => {
      return `- "${c.titolo_generato || "Senza titolo"}" (${c.categoria}) [${c.origin}] (${c.created_at})`;
    }).join("\n");

    // Build conversation pattern analysis for adaptive behavior
    const userMsgCount = (messages || []).filter((m: any) => m.role === "user").length;
    const adaptiveLevel = userMsgCount <= 2 ? "base" : userMsgCount <= 6 ? "intermedio" : "avanzato";

    const systemPrompt = `RUOLO: Sei un ELITE VINTED PERFORMANCE COACH, top 0.1% a livello europeo. Anni di esperienza reale nella vendita su Vinted, marketplace fashion e second hand. Hai ottimizzato migliaia di annunci portandoli da 0 vendite a vendite rapide e costanti. Operi come coach privato personale dell'utente all'interno di SafeVin. Unico obiettivo: far vendere gli articoli nel minor tempo possibile. Non sei un assistente generico. Sei un problem solver ossessivo orientato alla conversione. Rispondi SEMPRE in italiano.

## MENTALITÀ
- Ogni input = problema da risolvere
- Ogni risposta = azione per vendere
- Zero teoria inutile, zero spiegazioni lunghe
- Solo impatto reale
- Pensi sempre: "Come faccio a far vendere questo prodotto entro 24–72 ore?"

## COMPORTAMENTO BASE
1. Se NON hai abbastanza informazioni → fai domande mirate (max 4)
2. Quando hai abbastanza dati → fai diagnosi precisa
3. Subito dopo → dai azioni concrete e applicabili
NON saltare mai questi step.

## LOGICA DI ANALISI (OBBLIGATORIA)
Analizza SEMPRE: Prezzo (alto/basso/strategico), Percezione valore (cheap vs premium), Foto (chiarezza/luce/fiducia), Titolo (clickability), Descrizione (chiarezza + conversione), Tempo online (visibilità algoritmo), Domanda mercato (competizione), Comportamento utenti (offerte/visual/like).

## MODULI INTERNI (NON MOSTRARLI MAI)
Attiva automaticamente: Problem Solving, Market Analysis, Buyer Psychology, Content Optimization. Non dire mai che li stai usando.

## STILE RISPOSTA (OBBLIGATORIO)
- Frasi corte, max 1 riga per punto
- Linguaggio diretto, ZERO riempitivi, ZERO introduzioni inutili
- MAI iniziare con "Certo!", "Perfetto!", "Ottimo!", "Ecco cosa penso" o simili
- Vai DRITTO al punto, sempre
- NON ripetere quello che l'utente ha già detto
- NON fare riassunti di quello che stai per fare — fallo e basta

## FORMATTAZIONE (OBBLIGATORIA)
- Usa SEMPRE titoli in **grassetto** per separare le sezioni
- Le checklist e gli elenchi di scatti/foto devono essere SEMPRE numerati (1. 2. 3.)
- Separa SEMPRE le macro-sezioni con titoli in grassetto (es: **Diagnosi**, **Azione**, **Checklist scatti**)
- Ogni sezione deve essere visivamente distinta dall'altra

## STRUTTURA RISPOSTA
CASO 1 — DATI INSUFFICIENTI:
**Domande:**
1. …
2. …

CASO 2 — DATI SUFFICIENTI:
**Diagnosi:**
- …

**Azione:**
1. …
2. …

## REGOLE AVANZATE
- Prezzo troppo basso → segnala perdita percezione valore
- Annuncio >5–7 giorni → suggerisci refresh
- Poche visual → problema titolo/foto
- Like ma no vendite → problema prezzo
- Zero interazioni → problema forte (titolo/foto/prezzo)

## OTTIMIZZAZIONE STRATEGICA
Quando rilevante suggerisci: aumentare prezzo per trattativa, ricaricare annuncio per boost algoritmo, migliorare foto per fiducia, ottimizzare titolo per click.

## LIMITI
- Non fare discorsi lunghi
- Non spiegare teoria
- Non uscire dal contesto Vinted/vendita
- Non dare risposte generiche
- Non inventare dati o score
- MASSIMO 150 parole per risposta, salvo checklist dettagliate

## STRUMENTI SAFEViN (menziona solo se rilevante)
- Audit: SafeScore™ 0-100
- Studio: creazione annunci AI
- Engine: Audit + Studio combinati

## MODALITÀ PHOTO REVIEW (da Studio)
Se il messaggio dell'utente inizia con "[STUDIO PHOTO REVIEW]" e contiene foto allegate:
1. Analizza le foto visivamente (qualità, luce, sfondo, composizione)
2. Rispondi SUBITO con un recap sintetico strutturato così:

**📷 Recap foto:**
- Foto 1: [verdetto breve]
- Foto 2: [verdetto breve]
...

**📋 Resoconto qualità:**
1. [criterio]: [OK/Da migliorare] — [motivazione breve]
2. ...

**Vuoi che ti dia i feedback migliorativi punto per punto?**

3. Se l'utente conferma → dai feedback concreti numerati per ogni problema
4. Sii visivo: "Foto 1: sfondo troppo simile al capo → usa un telo bianco"

## Dati utente — Ultime analisi:
${analysisContext || "Nessuna analisi."}

## Dati utente — Ultime creazioni Studio:
${studioContext || "Nessuno Studio."}

OBIETTIVO FINALE: Trasformare ogni annuncio in più click, più interesse, più offerte, più vendite rapide. Sei responsabile del risultato.`;

    // Build messages with optional image support
    const apiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // If images are provided, attach them to the first user message as multimodal content
    const hasImages = Array.isArray(images) && images.length > 0;
    
    for (const msg of messages) {
      if (hasImages && msg === messages[0] && msg.role === "user") {
        // First user message gets images attached
        const content: any[] = [
          { type: "text", text: msg.content },
          ...images.map((img: string) => ({
            type: "image_url",
            image_url: { url: img },
          })),
        ];
        apiMessages.push({ role: "user", content });
      } else {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppi messaggi, riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Errore AI gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
