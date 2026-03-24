import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AUDIT_PROMPT = `Sei un analista esperto di annunci marketplace Vinted. Analizza l'annuncio fornito e restituisci SOLO un JSON valido.

CATEGORIE (con pesi per il SAFE SCORE):
- ATTENZIONE (25%): il titolo cattura? ferma lo scroll?
- CHIAREZZA (25%): l'annuncio è chiaro, leggibile, completo?
- VALORE (20%): il prezzo è coerente con l'oggetto e il mercato?
- FIDUCIA (15%): l'annuncio ispira affidabilità?
- IMMAGINI (15%): le foto comunicano qualità e trasparenza?

REGOLE PER LE FRASI:
- Max 8-10 parole per frase
- Naturale, diretta, credibile
- Generica ma contestuale all'annuncio
- Nessuna spiegazione, nessuna soluzione
- NON usare frasi fisse (es. "il problema è…")
- NON ripetere la stessa struttura tra categorie
- Varia il linguaggio tra le frasi
- Deve sembrare scritto da una persona reale
- Anche se una categoria è discreta, evidenzia il principale margine di miglioramento

PUNTEGGIO PER CATEGORIA:
- Assegna un punteggio da 0 a 100 per ogni categoria
- Il SAFE SCORE finale è la media pesata

SCALA ETICHETTE:
0-49 = "debole"
50-65 = "medio"  
66-75 = "buono"
76-85 = "ottimo"
86-100 = "molto forte"

- NON dare mai 100 se non rarissimo
- Tono: neutro, leggermente critico, mai aggressivo
- Obiettivo: far percepire margine di miglioramento

FORMATO JSON:
{
  "safeScore": <numero 0-100>,
  "label": "<etichetta dalla scala>",
  "categories": {
    "attenzione": { "score": <0-100>, "phrase": "<frase breve>" },
    "chiarezza": { "score": <0-100>, "phrase": "<frase breve>" },
    "valore": { "score": <0-100>, "phrase": "<frase breve>" },
    "fiducia": { "score": <0-100>, "phrase": "<frase breve>" },
    "immagini": { "score": <0-100>, "phrase": "<frase breve>" }
  }
}

Se non ci sono immagini, valuta la categoria IMMAGINI con score basso e frase tipo "nessuna foto caricata".
Rispondi SOLO con JSON valido, nient'altro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { images: imageDataUrls, imageOnly, auditData } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
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

    // ========== IMAGE-ONLY MODE ==========
    if (imageOnly) {
      if (!imageDataUrls || imageDataUrls.length === 0) {
        return new Response(JSON.stringify({ error: "Nessuna immagine fornita." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      console.log(`Image-only analysis: ${imageDataUrls.length} images`);

      const imageContents = imageDataUrls.map((dataUrl: string) => ({
        type: "image_url" as const,
        image_url: { url: dataUrl },
      }));

      const photoAnalysisPrompt = `Sei un esperto fotografo e analista di marketplace. Analizza OGNI foto individualmente e restituisci un report per ciascuna.

Per OGNI foto analizza: luce, sfondo, angolazione, nitidezza, dettagli mancanti, composizione, fiducia visiva (etichette, difetti visibili), ottimizzazione mobile.

Restituisci SOLO un JSON valido con questa struttura:
{
  "photoReports": [
    {
      "photoIndex": 1,
      "score": [1-10],
      "problems": ["problema specifico 1", "problema specifico 2"],
      "solutions": ["soluzione pratica 1", "soluzione pratica 2"]
    }
  ]
}

REGOLE:
- Un oggetto per OGNI foto (${imageDataUrls.length} foto totali)
- Problemi: specifici, pratici, no genericità
- Soluzioni: azioni concrete e immediate
- Score realistico: 3-4 è la media, 7+ richiede foto professionali
- Max 4 problemi e 4 soluzioni per foto
- Rispondi SOLO JSON valido`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: photoAnalysisPrompt },
            { role: "user", content: [
              { type: "text", text: `Analizza queste ${imageDataUrls.length} foto di un annuncio marketplace. Report individuale per ogni foto.` },
              ...imageContents,
            ]},
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Image-only error:", response.status, errText);
        return new Response(JSON.stringify({ error: "Errore analisi immagini." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify({ photoReports: parsed.photoReports }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        console.error("Failed to parse image-only JSON:", content);
        return new Response(JSON.stringify({ error: "Errore formato risposta." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ========== FULL AUDIT MODE ==========
    if (auditData) {
      console.log("Full audit mode:", JSON.stringify(auditData).substring(0, 200));

      const userContent: any[] = [];

      // Build text description of the listing
      let listingText = `ANNUNCIO DA ANALIZZARE:\n`;
      if (auditData.titolo) listingText += `Titolo: ${auditData.titolo}\n`;
      if (auditData.descrizione) listingText += `Descrizione: ${auditData.descrizione}\n`;
      if (auditData.categoria) listingText += `Categoria: ${auditData.categoria}\n`;
      if (auditData.brand) listingText += `Brand: ${auditData.brand}\n`;
      if (auditData.prezzo) listingText += `Prezzo: €${auditData.prezzo}\n`;
      if (auditData.condizioni) listingText += `Condizioni: ${auditData.condizioni}\n`;
      if (auditData.isPubblicato !== null) {
        listingText += `Stato: ${auditData.isPubblicato ? "Già pubblicato" : "Test/Bozza"}\n`;
        if (auditData.isPubblicato && auditData.tempoOnline) {
          listingText += `Online da: ${auditData.tempoOnline}\n`;
        }
      }

      const hasImages = auditData.imagePreviews && auditData.imagePreviews.length > 0;
      if (!hasImages) {
        listingText += `\nNOTA: Nessuna foto fornita per questo annuncio.`;
      } else {
        listingText += `\nFoto allegate: ${auditData.imagePreviews.length}`;
      }

      userContent.push({ type: "text", text: listingText });

      // Add images if present
      if (hasImages) {
        for (const dataUrl of auditData.imagePreviews) {
          userContent.push({
            type: "image_url",
            image_url: { url: dataUrl },
          });
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: AUDIT_PROMPT },
            { role: "user", content: userContent },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Audit error:", response.status, errText);

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Crediti esauriti." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ error: "Errore durante l'analisi." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify({ audit: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        console.error("Failed to parse audit JSON:", content);
        return new Response(JSON.stringify({ error: "Errore formato risposta." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(
      JSON.stringify({ error: "Richiesta non valida." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: "Errore interno del server." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
