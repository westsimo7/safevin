import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_STYLES = ["Vintage", "Casual", "Streetwear", "Elegante"];
const ALLOWED_TARGETS = ["neonato", "bambino", "preteen", "teen", "giovane_adulto", "adulto", "maturo"];

const SYSTEM_PROMPT = `Sei un Senior Copywriter specializzato in marketplace Vinted con expertise in moda secondhand e psicologia del compratore per fasce d'età.

Il tuo compito: generare un annuncio Vinted ottimizzato per conversione, ADATTANDO tono, lessico e struttura al target audience rilevato.

## OUTPUT — JSON puro, no markdown, no backtick:

{
  "title": "string ≤ 80 char",
  "description": "blocco multi-modulo con bullet • e righe vuote tra moduli",
  "details": {
    "categoria": "...", "tipo_prodotto": "...", "brand": "...",
    "taglia": "...", "condizione": "...", "colore": "...",
    "materiale": "...", "sesso": "...", "target": "...", "misure": "... o null"
  },
  "hashtags": ["max 5 hashtag senza #"],
  "pricing": {
    "min_accepted": number, "suggested_low": number, "suggested_high": number,
    "positioning": "bassa | media | medio-alta",
    "positioning_reason": "...",
    "motivation": "...",
    "negotiation": ["...","...","...","..."]
  },
  "photo_report": {
    "luce": "Ottima | Buona | Migliorabile",
    "contrasto": "Ottimo | Buono | Migliorabile",
    "completezza": "Completa | Parziale | Da integrare",
    "nitidezza": "Alta | Media | Bassa",
    "advice": "1 frase di consiglio se almeno un pilastro è Migliorabile o inferiore, altrimenti stringa vuota"
  }
}

## REGOLE TITOLO

Formula: [Brand] + [Tipo prodotto] + [Dettaglio] + [Colore] + [Stile] + [Sesso] + [Taglia] + [Condizione]
- Max 80 caratteri
- Mai trattini "-" o "–", solo spazi
- Sesso prima della taglia: "Uomo (L)"
- Se style=Vintage aggiungi "Y2K" subito dopo lo stile SOLO se sub_style/note indicano y2k
- Per target neonato/bambino/preteen aggiungi fascia età (es. "6-9 Mesi", "4-5 Anni")
- Se brand assente → parti dal tipo prodotto

## REGOLE DESCRIZIONE — STRUTTURA MODULARE (max 80 parole totali)

Componi 5 moduli con UNA RIGA VUOTA tra ognuno. Se un modulo non ha contenuto reale, omettilo (no placeholder vuoti).

[MODULO 1 — Hook di apertura]
Una riga, max 12 parole. Tono adattato al target.

[MODULO 2 — Dettagli capo]
3-4 bullet con "• ", ognuno una caratteristica concreta da garment_features.

[MODULO 3 — Vestibilità / Materiale]
Una riga. Integra fit + materiale (se disponibile, altrimenti solo fit).

[MODULO 4 — Misure] (CONDIZIONALE: solo se misure fornite)
📏 Misure:
• Spalle: X cm
• Lunghezza: Y cm

[MODULO 5 — Closing / CTA]
Una riga finale adattata al target.

## TONO PER TARGET

- neonato/bambino: rassicurante, tecnico-pratico. Lessico: cotone, biologico, lavabile, sicuro, ipoallergenico.
- preteen/teen: diretto, fresh, daily. Lessico: vibe, taglio, perfetto per, daily look.
- giovane_adulto: streetwear-aware, asciutto. Lessico: vibe, taglio, oversize, archive, vintage, anni 2000.
- adulto: bilanciato lifestyle. Lessico: versatile, qualità, classico, contemporaneo, premium.
- maturo: classico, elegante. Lessico: sartoriale, pregiato, raffinato, intramontabile, pura lana, fattura.

## VINCOLI DESCRIZIONE

- Max 80 parole totali (esclusi i bullet • delle misure)
- Bullet "•" per dettagli, mai prosa attaccata
- Emoji funzionali ammesse SOLO: 📏 misure (opz.), 📦 spedizione (opz.). MAI 🔥✨💯 o decorative.
- Una frase = una informazione. Mai inventare.
- Materiale: se 1 solo → "Tessuto X 100%". Se più → elenco senza %. Se non disponibile → omettere.

## HASHTAG
Max 5, SENZA "#", lowercase, senza spazi. Composizione: tipo_prodotto + brand (se noto) + stile + sotto-stile + target.

## PREZZO
STEP 1 — Posizionamento (bassa/media/medio-alta) in base a brand, condizione, materiali.
STEP 2 — Prezzo consigliato sopra il minimo con margine reale.
STEP 3 — Strategia: 4 step concreti basati su min_accepted e suggested_low/high.

## PHOTO REPORT
Valuta 4 pilastri da analysis.photo_quality (media dei punteggi):
- luce: 4-5=Ottima, 3=Buona, ≤2=Migliorabile
- contrasto: 4-5=Ottimo, 3=Buono, ≤2=Migliorabile
- completezza: in base a photos_assessment, "Completa" se ≥4 voci true, "Parziale" se 2-3, "Da integrare" se ≤1
- nitidezza: deriva da quality medio: 4-5=Alta, 3=Media, ≤2=Bassa
Aggiungi 1 frase di "advice" se almeno un pilastro è Migliorabile/inferiore.`;

function sanitizeTitle(t: string): string {
  let v = (t || "").replace(/\s+[–-]\s+/g, " ").replace(/\s{2,}/g, " ").trim();
  if (v.length <= 80) return v;
  // Guided truncation: remove condition → sesso → style markers iteratively
  const conditionWords = ["Nuovo con cartellino", "Nuovo senza cartellino", "Come nuovo", "Ottime condizioni", "Buone condizioni", "Condizioni discrete", "Discreto", "Buono", "Ottimo"];
  for (const c of conditionWords) {
    if (v.length > 80 && v.endsWith(c)) v = v.slice(0, v.length - c.length).trim();
  }
  v = v.replace(/\s+(Uomo|Donna|Men|Women)\s*\([^)]+\)\s*/g, " ").replace(/\s{2,}/g, " ").trim();
  if (v.length > 80) {
    for (const s of ALLOWED_STYLES) {
      v = v.replace(new RegExp(`\\s+${s}\\b`, "g"), "");
    }
    v = v.replace(/\s{2,}/g, " ").trim();
  }
  if (v.length > 80) {
    const cut = v.slice(0, 80);
    const lastSpace = cut.lastIndexOf(" ");
    v = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim();
  }
  return v;
}

function wordCount(s: string): number {
  return (s || "").trim().split(/\s+/).filter(Boolean).length;
}

function sanitizeOutput(output: any): any {
  if (!output || typeof output !== "object") return output;
  if (typeof output.title === "string") output.title = sanitizeTitle(output.title);

  // Hashtags: strip #, lowercase, max 5
  if (Array.isArray(output.hashtags)) {
    output.hashtags = output.hashtags
      .filter((h: any) => typeof h === "string" && h.trim().length > 0)
      .map((h: string) => h.trim().toLowerCase().replace(/^#+/, "").replace(/\s+/g, ""))
      .filter((h: string) => h.length > 0)
      .slice(0, 5);
  }

  // Whitelist style in details
  if (output.details && typeof output.details === "object") {
    const st = output.details.stile || output.details.style;
    if (st && !ALLOWED_STYLES.includes(st)) {
      // Try close match
      const found = ALLOWED_STYLES.find(a => st.toLowerCase().includes(a.toLowerCase()));
      if (output.details.stile) output.details.stile = found || "Casual";
    }
    const tgt = output.details.target;
    if (tgt && !ALLOWED_TARGETS.includes(tgt)) output.details.target = "adulto";
  }
  return output;
}

const PRIMARY_MODEL = "openai/gpt-5.2";
const FALLBACK_MODEL = "google/gemini-2.5-pro";

async function callAIWithFallback(apiKey: string, body: Record<string, unknown>): Promise<Response> {
  const url = "https://ai.gateway.lovable.dev/v1/chat/completions";
  let resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, model: PRIMARY_MODEL }),
  });
  if (resp.ok || resp.status === 429 || resp.status === 402) return resp;
  const errText = await resp.text().catch(() => "");
  console.warn(`[studio-generate] primary ${PRIMARY_MODEL} failed ${resp.status}: ${errText.slice(0, 200)}. Fallback to ${FALLBACK_MODEL}`);
  resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, model: FALLBACK_MODEL }),
  });
  return resp;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { analysis, userInput, auditContext, language } = body;
    if (!analysis || !userInput) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autenticato" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    );
    const { data: consumeRes, error: consumeErr } = await supabase.rpc("consume_feature_credit", { p_feature: "studio" });
    if (consumeErr) {
      console.error("consume_feature_credit error:", consumeErr);
      return new Response(JSON.stringify({ error: "Verifica piano non riuscita" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cr: any = consumeRes;
    if (cr && cr.success === false) {
      if (cr.error === "limit_reached") {
        return new Response(JSON.stringify({
          error: "Hai raggiunto il limite di annunci del tuo piano. Effettua l'upgrade per continuare.",
          code: "limit_reached",
          used: cr.used, limit: cr.limit,
        }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (cr.error === "unauthenticated") {
        return new Response(JSON.stringify({ error: "Non autenticato" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: cr.error || "Errore piano" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const lang = language === "en" ? "en" : "it";
    const langInstruction = lang === "en"
      ? "\n\n## LANGUAGE OVERRIDE\nGenerate ALL output content (title, description, details values, motivation, negotiation steps, hashtags) in ENGLISH. JSON keys unchanged. Measurements bullets: '• Shoulders: X cm', '• Length: Y cm'."
      : "";

    const measurementsStr = (() => {
      if (typeof userInput.measurements === "string") return userInput.measurements.trim();
      return Object.entries(userInput.measurements || {})
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v} cm`)
        .join(", ");
    })();

    // free-limit email (unchanged)
    try {
      const used = Number(cr?.used);
      const limit = Number(cr?.limit);
      const plan = String(cr?.plan ?? "");
      if (plan === "free" && Number.isFinite(used) && Number.isFinite(limit) && used >= limit && limit > 0) {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email;
        const meta = (userData?.user?.user_metadata || {}) as Record<string, unknown>;
        const fullName = (meta.full_name || meta.name || meta.first_name) as string | undefined;
        const firstName = fullName ? String(fullName).split(" ")[0] : (email ? email.split("@")[0] : undefined);
        if (email && userData?.user?.id) {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "free-limit-reached",
              recipientEmail: email,
              idempotencyKey: `free-limit-reached-${userData.user.id}`,
              templateData: firstName ? { name: firstName } : {},
            },
          });
        }
      }
    } catch (mailErr) {
      console.error("free-limit-reached email failed:", mailErr);
    }

    // Build garment features summary
    const gf = analysis.garment_features || {};
    const featuresLines: string[] = [];
    const logosArr = Array.isArray(gf.logos) ? gf.logos : (gf.logos && typeof gf.logos === "object" ? [gf.logos] : []);
    logosArr.forEach((l: any) => {
      if (l && typeof l === "object") featuresLines.push(`Logo: ${l.description ?? ""} (${l.type ?? ""}, ${l.position ?? ""}, ${l.size ?? ""})`);
    });
    const printsArr = Array.isArray(gf.prints) ? gf.prints : (gf.prints && typeof gf.prints === "object" ? [gf.prints] : []);
    printsArr.forEach((p: any) => {
      if (p && typeof p === "object") featuresLines.push(`Stampa: ${p.description ?? ""} (${p.type ?? ""}, ${p.position ?? ""}, ${p.technique ?? ""})`);
    });
    const simpleFeatures = ["zippers", "pockets", "buttons", "hood", "collar", "cuffs", "hem", "embossing_relief", "patches_badges", "drawstrings", "stitching_details", "other_details"];
    for (const key of simpleFeatures) {
      if (gf[key] && gf[key] !== "nessuno" && gf[key] !== "nessuna") featuresLines.push(`${key}: ${gf[key]}`);
    }
    const featuresStr = featuresLines.length > 0 ? featuresLines.join("\n") : "nessun dettaglio rilevato";
    const colorsStr = Array.isArray(analysis.colors) ? analysis.colors.join(", ") : (analysis.color || "non specificato");

    const target = analysis.target_audience?.category || "adulto";

    let auditSection = "";
    if (auditContext) {
      auditSection = `\nCONTESTO AUDIT (score ${auditContext.safeScore}/100):\nTitolo orig: "${auditContext.originalTitle}"\nDesc orig: "${auditContext.originalDescription}"\nProblemi:\n${(auditContext.deepIssues || []).map((i: string, idx: number) => `${idx+1}. ${i}`).join("\n")}\nObiettivo: superare 80.`;
    }

    const userPrompt = `Genera l'annuncio completo per questo prodotto:

DATI RILEVATI DALLE FOTO:
- Tipo prodotto: ${analysis.product_type || "non specificato"}
- Categoria: ${analysis.category || "non specificata"}
- Colori dominanti: ${colorsStr}
- Brand: ${analysis.brand || userInput.manualBrand || "nessun brand"}
- Stile: ${analysis.style || "Casual"}
- Sotto-stile: ${analysis.sub_style || "—"}
- Fit: ${analysis.fit || "Regular"}
- Periodo: ${analysis.period || "Contemporaneo"}
- Target audience: ${target} (confidence ${analysis.target_audience?.confidence || "medium"})
- Note aggiuntive: ${analysis.note_aggiuntive || "—"}

DETTAGLI INDUMENTO:
${featuresStr}

DATI UTENTE:
- Sesso: ${userInput.gender || "non specificato"}
- Taglia: ${userInput.size || "non specificata"}
- Condizione: ${userInput.condition}
- Materiali: ${userInput.materials || "non specificati (omettere se assente)"}
- Prezzo minimo accettato: ${userInput.minPrice}€
${measurementsStr ? `- Misure: ${measurementsStr}` : "- Misure: nessuna (omettere modulo 4)"}
${userInput.extras ? `- Note extra: ${userInput.extras}` : ""}
${auditSection}

ISTRUZIONI:
1. Costruisci titolo con la formula richiesta, adattato al target.
2. Descrizione modulare a 5 moduli, tono per target ${target}, max 80 parole.
3. Hashtag (5, no #, lowercase).
4. Strategia prezzo con minimo ${userInput.minPrice}€.
5. Photo report 4 pilastri da analysis.photo_quality.

Output JSON puro.`;

    let response = await callAIWithFallback(LOVABLE_API_KEY, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT + langInstruction },
        { role: "user", content: userPrompt },
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

    let data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Risposta AI non valida" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side validation: word count retry once if description too long
    const wc = wordCount(parsed.description || "");
    if (wc > 95) {
      try {
        const retry = await callAIWithFallback(LOVABLE_API_KEY, {
          messages: [
            { role: "system", content: SYSTEM_PROMPT + langInstruction },
            { role: "user", content: userPrompt },
            { role: "assistant", content },
            { role: "user", content: `La descrizione ha ${wc} parole, supera il limite di 80. Riscrivi SOLO il JSON mantenendo identica struttura modulare ma riducendo il description a massimo 80 parole. Rispondi con il JSON completo.` },
          ],
          response_format: { type: "json_object" },
        });
        if (retry.ok) {
          const retryData = await retry.json();
          const retryContent = (retryData.choices?.[0]?.message?.content || "").replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
          try { parsed = JSON.parse(retryContent); } catch { /* keep original */ }
        }
      } catch (e) {
        console.warn("description shorten retry failed:", e);
      }
    }

    const output = sanitizeOutput(parsed);
    return new Response(JSON.stringify({ output, target_audience: analysis.target_audience || null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("studio-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
