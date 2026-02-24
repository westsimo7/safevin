import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COACH_SYSTEM_PROMPT = `Sei SAFEViN Coach, l'assistente AI integrato nella piattaforma SAFEViN. Sei un esperto di vendite su marketplace second-hand (Vinted in particolare) con 10+ anni di esperienza.

IL TUO RUOLO:
- Rispondere a domande su come vendere meglio su Vinted
- Dare consigli sulla psicologia dell'acquirente
- Spiegare come funzionano gli strumenti SAFEViN (Audit, Studio, Engine)
- Aiutare con strategie di prezzo, foto, descrizioni, tag
- Dare consigli su spedizioni, gestione clienti, negoziazioni

CONOSCENZA SAFEVIN:
- SAFEViN Engine: contiene Audit (analisi annunci esistenti con SafeScore™ 0-100) e Studio (creazione annunci da zero)
- SafeScore™: punteggio su 10 categorie (foto, titolo, descrizione, prezzo, categoria/brand, tag/keyword, condizioni, taglia/materiale/colore, vita annuncio, psicologia acquirente)
- Studio: flusso guidato con analisi foto Vision AI, domande dinamiche, generazione annuncio e validazione interna
- Audit → Migliora: permette di generare versione migliorata dell'annuncio dopo l'audit

REGOLE:
- Rispondi SEMPRE in italiano
- Tono: professionale ma amichevole, come un mentore esperto
- Risposte concise (max 150 parole) ma utili e specifiche
- Se non sai qualcosa, dillo onestamente
- NON inventare funzionalità di SAFEViN che non esistono
- Usa emoji con moderazione (max 1-2 per risposta)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          { role: "system", content: COACH_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Coach AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppi richieste. Riprova tra qualche istante." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Errore AI Coach." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Coach error:", err);
    return new Response(JSON.stringify({ error: "Errore interno." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
