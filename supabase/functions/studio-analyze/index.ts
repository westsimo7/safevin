import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VISION_PROMPT = `Sei un esperto analista visivo per annunci di vendita online (Vinted, Wallapop, ecc).

Analizza TUTTE le immagini fornite e restituisci un JSON con questa struttura esatta:

{
  "product_type": "tipo di prodotto (es: maglietta, scarpe, giacca, borsa, pantaloni, felpa, ecc.)",
  "category": "categoria Vinted più adatta (es: Abbigliamento donna, Abbigliamento uomo, Scarpe, Borse, Accessori, ecc.)",
  "color": "colore principale del prodotto",
  "brand": "brand se CHIARAMENTE visibile nell'immagine, altrimenti null",
  "brand_confidence": "high se il logo/brand è chiaramente leggibile, low se solo intuibile, null se non presente",
  "style": "stile del prodotto: streetwear, elegante, sportivo, casual, vintage, boho, minimal, classico, ecc.",
  "condition": "condizione percepita: nuovo con cartellino, come nuovo, buono, discreto, usato",
  "materials": "materiali stimati se deducibili dall'immagine (es: cotone, poliestere, pelle, denim), altrimenti null",
  "photos_assessment": {
    "has_front": true/false,
    "has_back": true/false,
    "has_detail": true/false,
    "has_label_size": true/false,
    "has_label_materials": true/false,
    "has_defects": true/false,
    "has_worn": true/false,
    "has_logo_closeup": true/false
  },
  "missing_photos": [
    {
      "type": "tipo foto mancante (es: front, back, label_size, label_materials, defects, logo_closeup, worn)",
      "name": "nome leggibile (es: Foto frontale completa)",
      "reason": "breve spiegazione del perché serve per vendere meglio",
      "tips": ["consiglio pratico 1", "consiglio pratico 2", "consiglio pratico 3"]
    }
  ]
}

REGOLE FONDAMENTALI:
- NON inventare MAI informazioni. Se non vedi qualcosa, metti null.
- Il brand deve essere CHIARAMENTE leggibile. Se hai dubbi, metti null e brand_confidence null.
- Per missing_photos: analizza cosa manca in base al tipo di prodotto specifico.
- Per abbigliamento: front, back, label_size, label_materials, logo_closeup (se brandizzato), defects sono importanti.
- Per scarpe: aggiungere suola, interno, laterale.
- Ogni suggerimento di foto mancante deve avere 3-4 tips pratici e semplicissimi.
- Rispondi SOLO con il JSON, senza markdown o testo aggiuntivo.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { images } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "Nessuna immagine fornita" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = images.map((dataUrl: string) => ({
      type: "image_url" as const,
      image_url: { url: dataUrl },
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: VISION_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `Analizza queste ${images.length} immagini di un prodotto in vendita.` },
              ...imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppi messaggi, riprova tra poco." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Errore AI gateway" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean markdown wrapping if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    try {
      const analysis = JSON.parse(content);
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Risposta AI non valida" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("studio-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
