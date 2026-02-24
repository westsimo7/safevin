import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const PRIMARY_MODEL = "gpt-5";
const FALLBACK_MODEL = "gpt-5-mini";
const MAX_IMAGES = 6;

const IMAGE_ONLY_PROMPT = `Sei un analista fotografico esperto marketplace. Valuta OGNI foto singolarmente.

Restituisci SOLO JSON valido con questo schema:
{
  "photoReports": [
    {
      "photoIndex": 1,
      "score": 1,
      "problems": ["problema pratico"],
      "solutions": ["soluzione pratica"]
    }
  ]
}

Regole:
- Un report per ogni foto ricevuta
- score 1-10 realistico (3-4 è media)
- max 4 problemi e 4 soluzioni per foto
- problemi e soluzioni concreti, niente genericità`;

const FULL_AUDIT_PROMPT = `Sei SAFEVIN, revisore senior di annunci marketplace.
Obiettivo: audit operativo, realistico e utile alla conversione.

Restituisci SOLO JSON valido con struttura ESATTA:
{
  "overallScore": 0,
  "sections": [
    {"title":"Qualità Foto","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Titolo SEO","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Descrizione","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Prezzo Strategico","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Categoria / Brand","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Tag / Keyword","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Condizioni Prodotto","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Taglia / Materiale / Colore","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Vita Annuncio","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""},
    {"title":"Psicologia Acquirente","score":1,"conversionProbability":0,"impersonation":"","scoreBreakdown":"","advice":""}
  ],
  "summary": ""
}

Regole qualità:
- score 1-10 realistico (3-4 è media)
- conversionProbability coerente con score
- impersonation: breve, in prima persona, basata sui dati
- scoreBreakdown: fattori che penalizzano con punti chiari
- advice: azioni pratiche immediate
- output conciso e denso (niente testo superfluo)`;

const SECTION_TITLES = [
  "Qualità Foto",
  "Titolo SEO",
  "Descrizione",
  "Prezzo Strategico",
  "Categoria / Brand",
  "Tag / Keyword",
  "Condizioni Prodotto",
  "Taglia / Materiale / Colore",
  "Vita Annuncio",
  "Psicologia Acquirente",
] as const;

class AIRequestError extends Error {
  status?: number;
  body?: string;
  isTimeout?: boolean;

  constructor(message: string, options?: { status?: number; body?: string; isTimeout?: boolean }) {
    super(message);
    this.name = "AIRequestError";
    this.status = options?.status;
    this.body = options?.body;
    this.isTimeout = options?.isTimeout;
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toString = (value: unknown, fallback = "") => (typeof value === "string" ? value.trim() : fallback);

const parseJsonFromContent = (content: unknown) => {
  if (typeof content === "object" && content !== null) return content;
  if (typeof content !== "string") throw new Error("Invalid AI content");

  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object found");
    const candidate = cleaned.slice(start, end + 1);
    return JSON.parse(candidate);
  }
};

const buildImageContent = (images: string[]) =>
  images.map((dataUrl) => ({
    type: "image_url" as const,
    image_url: { url: dataUrl },
  }));

async function callOpenAI(params: {
  apiKey: string;
  model: string;
  messages: Array<{ role: "system" | "user"; content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }> }>;
  maxCompletionTokens: number;
  timeoutMs: number;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        stream: false,
        max_completion_tokens: params.maxCompletionTokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new AIRequestError("AI request failed", { status: response.status, body: errText });
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message;
    const rawContent = message?.content;

    const content = Array.isArray(rawContent)
      ? rawContent
          .map((part: unknown) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && "text" in part) {
              return String((part as { text?: unknown }).text ?? "");
            }
            return "";
          })
          .join("")
      : rawContent;

    if (!content || (typeof content === "string" && !content.trim())) {
      const refusal = typeof message?.refusal === "string" ? message.refusal : "";
      const finishReason = data?.choices?.[0]?.finish_reason;
      throw new AIRequestError("AI returned empty content", {
        status: 500,
        body: JSON.stringify({ refusal, finishReason }).slice(0, 1000),
      });
    }

    return parseJsonFromContent(content);
  } catch (error) {
    if (error instanceof AIRequestError) throw error;
    if ((error as Error)?.name === "AbortError") {
      throw new AIRequestError("AI request timeout", { status: 504, isTimeout: true });
    }
    throw new AIRequestError((error as Error)?.message || "Unexpected AI error", { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callOpenAIWithFallback(params: {
  apiKey: string;
  messages: Array<{ role: "system" | "user"; content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }> }>;
  maxCompletionTokens: number;
  primaryTimeoutMs: number;
  fallbackTimeoutMs: number;
}) {
  try {
    return await callOpenAI({
      apiKey: params.apiKey,
      model: PRIMARY_MODEL,
      messages: params.messages,
      maxCompletionTokens: params.maxCompletionTokens,
      timeoutMs: params.primaryTimeoutMs,
    });
  } catch (error) {
    const err = error as AIRequestError;
    const retryable = err.isTimeout || (typeof err.status === "number" && err.status >= 500);

    if (!retryable) throw err;

    console.warn(`Primary model failed (${PRIMARY_MODEL}), retrying with ${FALLBACK_MODEL}`);
    return callOpenAI({
      apiKey: params.apiKey,
      model: FALLBACK_MODEL,
      messages: params.messages,
      maxCompletionTokens: params.maxCompletionTokens,
      timeoutMs: params.fallbackTimeoutMs,
    });
  }
}

const normalizePhotoReports = (raw: unknown, expectedCount: number) => {
  const reports = Array.isArray((raw as { photoReports?: unknown[] })?.photoReports)
    ? (raw as { photoReports: unknown[] }).photoReports
    : [];

  const normalized = reports.slice(0, expectedCount).map((item, index) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;

    const scoreValue = Number(row.score ?? 0);
    const score = clamp(Number.isFinite(scoreValue) ? Math.round(scoreValue) : 1, 1, 10);

    const problems = Array.isArray(row.problems)
      ? row.problems.map((p) => toString(p)).filter(Boolean).slice(0, 4)
      : [];

    const solutions = Array.isArray(row.solutions)
      ? row.solutions.map((s) => toString(s)).filter(Boolean).slice(0, 4)
      : [];

    return {
      photoIndex: index + 1,
      score,
      problems: problems.length ? problems : ["Dettagli non sufficienti per una valutazione completa."],
      solutions: solutions.length ? solutions : ["Riscatta la foto con più luce naturale e inquadratura più pulita."],
    };
  });

  for (let i = normalized.length; i < expectedCount; i++) {
    normalized.push({
      photoIndex: i + 1,
      score: 3,
      problems: ["Foto non analizzabile in modo affidabile."],
      solutions: ["Carica nuovamente questa foto con maggiore nitidezza."],
    });
  }

  return normalized;
};

const normalizeAudit = (raw: unknown) => {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawSections = Array.isArray(input.sections) ? input.sections : [];

  const normalizedSections = SECTION_TITLES.map((title, index) => {
    const section = (rawSections[index] && typeof rawSections[index] === "object"
      ? rawSections[index]
      : {}) as Record<string, unknown>;

    const scoreValue = Number(section.score ?? 0);
    const score = clamp(Number.isFinite(scoreValue) ? Math.round(scoreValue) : 3, 1, 10);

    const convValue = Number(section.conversionProbability ?? score * 10);
    const conversionProbability = clamp(Number.isFinite(convValue) ? Math.round(convValue) : score * 10, 0, 98);

    return {
      title,
      score,
      conversionProbability,
      impersonation: toString(section.impersonation, "Ho analizzato i dati disponibili e vedo margine di miglioramento concreto."),
      scoreBreakdown: toString(section.scoreBreakdown, "• Dati incompleti o poco specifici che riducono fiducia e conversione."),
      advice: toString(section.advice, "Aggiungi dettagli specifici e rendi più chiaro il valore dell'annuncio."),
    };
  });

  const computedOverall = clamp(
    Math.round((normalizedSections.reduce((sum, s) => sum + s.score, 0) / (SECTION_TITLES.length * 10)) * 100),
    0,
    100,
  );

  const providedOverall = Number(input.overallScore);
  const overallScore = clamp(Number.isFinite(providedOverall) ? Math.round(providedOverall) : computedOverall, 0, 100);

  return {
    overallScore,
    sections: normalizedSections,
    summary: toString(
      input.summary,
      "L'annuncio ha basi utili ma richiede ottimizzazione su foto, chiarezza descrittiva e leva di valore per aumentare conversione e ridurre frizioni.",
    ),
  };
};

const buildFallbackPhotoReports = (count: number) =>
  Array.from({ length: Math.max(1, count) }, (_, idx) => ({
    photoIndex: idx + 1,
    score: 4,
    problems: ["Analisi automatica non completata in tempo utile."],
    solutions: ["Riprova con foto più nitide e luce naturale uniforme."],
  }));

const buildFallbackAudit = (listing: Record<string, unknown>, imageCount: number) => {
  const hasTitle = toString(listing.titolo).length > 0;
  const hasDescription = toString(listing.descrizione).length > 0;

  const baseScore = clamp((hasTitle ? 2 : 0) + (hasDescription ? 2 : 0) + (imageCount > 0 ? 2 : 0), 2, 7);
  const sections = SECTION_TITLES.map((title, index) => ({
    title,
    score: clamp(baseScore + (index % 2 === 0 ? 0 : 1), 1, 8),
    conversionProbability: clamp((baseScore + (index % 2 === 0 ? 0 : 1)) * 10, 5, 75),
    impersonation: "Ho rilevato dati sufficienti per un audit preliminare, ma il calcolo avanzato non si è completato.",
    scoreBreakdown: "• Analisi AI incompleta: risultato sintetico di continuità per evitare blocchi operativi.",
    advice: imageCount === 0
      ? "Aggiungi foto chiare (fronte, retro, dettagli, etichette) per ottenere un audit completo e più preciso."
      : "Mantieni dati titolo/descrizione coerenti e ripeti audit per ottenere punteggi completi e consigli dettagliati.",
  }));

  const overallScore = Math.round((sections.reduce((sum, s) => sum + s.score, 0) / (SECTION_TITLES.length * 10)) * 100);

  return {
    overallScore,
    sections,
    summary: "Analisi avanzata non disponibile in questo tentativo: ti mostro un report di continuità per non interrompere il flusso. Riprova tra pochi secondi per il report completo GPT-5.",
  };
};

const buildListingText = (listing: Record<string, unknown>, imageCount: number) => {
  return [
    `TITOLO: ${toString(listing.titolo, "(non inserito)")}`,
    `DESCRIZIONE: ${toString(listing.descrizione, "(non inserita)")}`,
    `PREZZO: ${toString(listing.prezzo, "(non inserito)")}`,
    `CATEGORIA: ${toString(listing.categoria, "(non inserita)")}`,
    `BRAND: ${toString(listing.brand, "(non inserito)")}`,
    `CONDIZIONI: ${toString(listing.condizioni, "(non inserite)")}`,
    `TAGLIA: ${toString(listing.taglia, "(non inserita)")}`,
    `COLORE: ${toString(listing.colore, "(non inserito)")}`,
    `TEMPO ONLINE: ${toString(listing.tempoCaricamento, "(non inserito)")}`,
    `NUMERO FOTO: ${imageCount}`,
  ].join("\n");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const listing = (body?.listing && typeof body.listing === "object" ? body.listing : {}) as Record<string, unknown>;
    const imageOnly = Boolean(body?.imageOnly);
    const imageDataUrls = Array.isArray(body?.images)
      ? body.images.filter((item: unknown) => typeof item === "string" && item.startsWith("data:image/")).slice(0, MAX_IMAGES)
      : [];

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Chiave AI non configurata." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (imageOnly) {
      if (!imageDataUrls.length) {
        return new Response(JSON.stringify({ error: "Nessuna immagine fornita." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const messages = [
        { role: "system" as const, content: IMAGE_ONLY_PROMPT },
        {
          role: "user" as const,
          content: [
            { type: "text" as const, text: `Analizza queste ${imageDataUrls.length} foto, una per una.` },
            ...buildImageContent(imageDataUrls),
          ],
        },
      ];

      let photoReports;
      try {
        const aiRaw = await callOpenAIWithFallback({
          apiKey: OPENAI_API_KEY,
          messages,
          maxCompletionTokens: 2200,
          primaryTimeoutMs: 40000,
          fallbackTimeoutMs: 28000,
        });
        photoReports = normalizePhotoReports(aiRaw, imageDataUrls.length);
      } catch (error) {
        if (error instanceof AIRequestError && (error.status === 429 || error.status === 402 || error.status === 400)) {
          throw error;
        }
        console.error("Image analysis fallback activated:", error);
        photoReports = buildFallbackPhotoReports(imageDataUrls.length);
      }

      return new Response(
        JSON.stringify({ photoReports }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const hasMinimumInput =
      toString(listing.titolo).length > 0 ||
      toString(listing.descrizione).length > 0 ||
      imageDataUrls.length > 0;

    if (!hasMinimumInput) {
      return new Response(
        JSON.stringify({ error: "Inserisci almeno un titolo, una descrizione o delle foto." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userText = buildListingText(listing, imageDataUrls.length);
    const userContent: Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: `Esegui audit completo su questo annuncio:\n\n${userText}` },
    ];

    if (imageDataUrls.length) {
      userContent.push(...buildImageContent(imageDataUrls));
    }

    const messages = [
      { role: "system" as const, content: FULL_AUDIT_PROMPT },
      { role: "user" as const, content: userContent },
    ];

    let analysis;
    try {
      const aiRaw = await callOpenAIWithFallback({
        apiKey: OPENAI_API_KEY,
        messages,
        maxCompletionTokens: 4200,
        primaryTimeoutMs: 55000,
        fallbackTimeoutMs: 35000,
      });
      analysis = normalizeAudit(aiRaw);
    } catch (error) {
      if (error instanceof AIRequestError && (error.status === 429 || error.status === 402 || error.status === 400)) {
        throw error;
      }
      console.error("Full audit fallback activated:", error);
      analysis = buildFallbackAudit(listing, imageDataUrls.length);
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof AIRequestError) {
      if (error.status === 429) {
        return new Response(JSON.stringify({ error: "Troppo traffico AI. Riprova tra pochi secondi." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (error.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI insufficienti. Ricarica il workspace per continuare." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (error.status === 400 && error.body?.includes("image_parse_error")) {
        return new Response(JSON.stringify({ error: "Una o più immagini non sono leggibili. Riprova con foto JPG/PNG standard." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (error.isTimeout) {
        return new Response(JSON.stringify({ error: "Analisi troppo lenta: riduci numero/risoluzione foto e riprova." }), {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.error("AIRequestError:", error.status, error.body || error.message);
      return new Response(JSON.stringify({ error: "Analisi non riuscita. Riprova." }), {
        status: error.status && error.status >= 400 ? error.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.error("safelist-analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
