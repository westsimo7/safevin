import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Static encyclopedias passed once in the system prompt
const SUB_STYLES = `Y2K, Old Money, Quiet Luxury, Techwear, Gorpcore, Opium Style, Blokecore, Football Casual, Preppy, Minimal, Cottagecore, Coquette, Clean Girl, E-Girl, Luxury Streetwear, Archive Fashion, Athleisure, Workwear, Military, Boho, Scandinavian Minimalism, Parisian Chic, Italian Luxury`;

const TARGET_TABLE = `
- neonato (0-3 anni): Body, tutine, taglie 0-36 mesi, motivi infantili, dimensioni mini
- bambino (4-9 anni): Taglie XS bambino, grafiche cartoon, capi proporzioni bambino
- preteen (10-13 anni): Taglie S junior, stile adulto in versione piccola
- teen (14-17 anni): Taglie S/M giovani, streetwear/Y2K, brand teen
- giovane_adulto (18-24 anni): Streetwear, oversize moderno, brand contemporanei, Gen Z aesthetics
- adulto (25-35 anni): Mix lifestyle, brand established, fit bilanciato
- maturo (35+ anni): Tagli classici, brand storici, vestibilità tradizionale, materiali pregiati
`;

const VISION_PROMPT = `Sei un Senior Computer Vision & Marketplace Listing Analyst con 15+ anni di esperienza in e-commerce fashion (Vinted, resale platforms).

Analizza TUTTE le immagini fornite e restituisci un JSON con questa struttura esatta:

{
  "recognition_confidence": "high | low",
  "gender": "uomo | donna | unisex",
  "product_type": "sottocategoria specifica Vinted",
  "category": "macro-categoria Vinted",
  "colors": ["colore dominante 1", "colore dominante 2 (opzionale)"],
  "brand": "brand se CHIARAMENTE visibile, altrimenti null",
  "brand_confidence": "high | low | null",
  "style": "Vintage | Casual | Streetwear | Elegante",
  "sub_style": "uno dei sotto-stili sotto, o null",
  "fit": "Slim | Regular | Oversize | Boxy | Relaxed | Straight | Skinny | Tapered | Cropped | Wide",
  "period": "Anni '70 | Anni '80 | Anni '90 | Anni 2000 | Anni 2010 | Contemporaneo | null",
  "target_audience": {
    "category": "neonato | bambino | preteen | teen | giovane_adulto | adulto | maturo",
    "confidence": "high | medium | low",
    "reasoning": "breve motivazione basata sulle foto"
  },
  "garment_features": {
    "logos": [{"type":"...","description":"logo o logo brand","position":"...","size":"piccolo|medio|grande"}],
    "prints": [{"type":"...","description":"tipo generico","position":"...","technique":"..."}],
    "zippers": "...", "pockets": "...", "buttons": "...", "hood": "...",
    "collar": "...", "cuffs": "...", "hem": "...",
    "embossing_relief": "...", "patches_badges": "...", "drawstrings": "...",
    "stitching_details": "...", "other_details": "..."
  },
  "note_aggiuntive": "1 frase opzionale con sotto-stile o sapore extra (es. 'vibe Y2K Archive')",
  "photos_assessment": {
    "has_front": true/false, "has_back": true/false, "has_detail": true/false,
    "has_label_size": true/false, "has_label_materials": true/false, "has_logo_closeup": true/false
  },
  "photo_quality": [
    {
      "photo_index": 0,
      "summary": "buona | migliorabile | da rifare",
      "scores": { "quality": 1-5, "light": 1-5, "background_contrast": 1-5, "completeness": 1-5 },
      "issues": [{"type":"...","severity":"minor|moderate|major","problem":"...","suggestion":"...","impact":"..."}]
    }
  ],
  "missing_photos": [
    {"type":"front|back|label_size|label_materials|logo_closeup|detail|sole|lateral","name":"...","reason":"...","tips":["...","...","..."]}
  ]
}

=== STILI AMMESSI (whitelist stretta per "style") ===
Vintage, Casual, Streetwear, Elegante

=== SOTTO-STILI (per "sub_style" e "note_aggiuntive") ===
${SUB_STYLES}

=== TARGET AUDIENCE — Indicatori ===
${TARGET_TABLE}

=== PALETTE COLORI VINTED ===
Nero, Grigio, Bianco, Panna, Beige, Albicocca, Arancione, Corallo, Rosso, Borgogna, Rosa, Viola, Lilla, Azzurro, Blu, Blu marino, Turchese, Menta, Verde, Verde scuro, Cachi, Marrone, Senape, Giallo, Argento, Oro, Multi

=== REGOLE FONDAMENTALI ===
- NON inventare. Se non vedi, null.
- recognition_confidence "low" se capo ambiguo, coperto o angolazione strana.
- Brand: solo se CHIARAMENTE leggibile, altrimenti null + brand_confidence null.
- colors: max 2 dalla palette Vinted; 1 se monocromatico.
- target_audience: deduci da taglia, proporzioni capo, motivi, brand, stile. Se hai dubbi → confidence "low".
- style: usa SOLO uno dei 4 valori whitelist. Per stile più specifico usa sub_style.
- garment_features: descrivi SOLO ciò che vedi. Se assente, "nessuno".
- NON leggere il testo dei loghi/stampe, indica solo "logo brand" o "stampa grafica".

=== REGOLE QUALITÀ FOTO ===
Valuta ogni foto 1-5 su quality, light, background_contrast, completeness. Issues SOLO se reali. Tono utile, mai aggressivo.

=== REGOLE FOTO MANCANTI ===
Solo se davvero non visibile in NESSUNA foto. Mai foto di difetti o indossato. Per scarpe aggiungi suola/interno/laterale.

Rispondi SOLO con il JSON puro, senza markdown.`;

const PRIMARY_MODEL = "gpt-4o-mini";
const FALLBACK_MODEL = "gpt-4o-mini";
const CALL_TIMEOUT_MS = 55_000;

async function callModel(apiKey: string, body: Record<string, unknown>, model: string): Promise<Response> {
  const url = "https://api.openai.com/v1/chat/completions";
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), CALL_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model }),
      signal: ctl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

async function callAIWithFallback(apiKey: string, body: Record<string, unknown>): Promise<Response> {
  try {
    const resp = await callModel(apiKey, body, PRIMARY_MODEL);
    if (resp.ok || resp.status === 429 || resp.status === 402) return resp;
    const errText = await resp.text().catch(() => "");
    console.warn(`[studio-analyze] primary ${PRIMARY_MODEL} failed ${resp.status}: ${errText.slice(0, 200)}. Fallback to ${FALLBACK_MODEL}`);
  } catch (err) {
    console.warn(`[studio-analyze] primary ${PRIMARY_MODEL} threw (likely timeout): ${(err as Error).message}. Fallback to ${FALLBACK_MODEL}`);
  }
  try {
    return await callModel(apiKey, body, FALLBACK_MODEL);
  } catch (err) {
    console.error(`[studio-analyze] fallback ${FALLBACK_MODEL} threw: ${(err as Error).message}`);
    return new Response(JSON.stringify({ error: "AI timeout" }), { status: 504, headers: { "Content-Type": "application/json" } });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.93.2");
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: claimsErr } = await sb.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { images } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "Nessuna immagine fornita" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = images.map((dataUrl: string) => ({
      type: "image_url" as const,
      image_url: { url: dataUrl },
    }));

    const response = await callAIWithFallback(OPENAI_API_KEY, {
      messages: [
        { role: "system", content: VISION_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: `Analizza queste ${images.length} immagini. Identifica tipo, categoria, colori, brand, stile, sotto-stile, fit, periodo e target audience. Valuta la qualità di ogni foto.` },
            ...imageContent,
          ],
        },
      ],
      response_format: { type: "json_object" },
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
