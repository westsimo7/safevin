import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AUDIT_PROMPT = `Sei un analista esperto di annunci marketplace Vinted. Analizza l'annuncio fornito e restituisci SOLO un JSON valido.

PRINCIPI DI ANALISI:
- L'utente decide in pochi secondi
- Non analizza, scorre
- Ogni dubbio riduce conversione
- Se non percepisce valore subito, ignora
- Se percepisce rischio, abbandona

FOCUS: Individua il punto che blocca di più la decisione.

LOGICA DI VALUTAZIONE SEVERA (COME A SCUOLA):
Il punteggio NON si regala. Si dà per merito e si toglie quando manca qualcosa.
Un voto basso non è un insulto: è un segnale chiaro che manca valore o sufficienza.
Valuta come un professore esigente ma giusto.

CRITERI DI SEVERITÀ:
- Titolo scarno (1-3 parole generiche, senza keyword) → score ATTENZIONE max 35
- Titolo basilare (nome prodotto + brand ma niente altro) → score ATTENZIONE max 50
- Descrizione di 1-2 righe senza argomentare il prodotto → score CHIAREZZA max 40
- Descrizione che dice solo info basic (taglia, colore) senza contesto → score CHIAREZZA max 55
- Info "basilari" NON giustificano MAI un 68% → quello è un voto BUONO, riservato a chi fa bene
- Se mancano dettagli su condizioni reali, difetti, motivo vendita → FIDUCIA max 45
- Se la descrizione non convince, non rassicura, non argomenta → FIDUCIA crolla
- Prezzo senza alcun supporto (no giustificazione, no contesto) → VALORE max 50

SCALA DI MERITO (riferimento scolastico):
- 0-30: gravemente insufficiente (manca quasi tutto)
- 31-45: insufficiente (c'è qualcosa ma non basta)
- 46-55: mediocre (presente ma debole, non convince)
- 56-65: sufficiente (il minimo per funzionare)
- 66-75: discreto/buono (fa il suo lavoro, qualche margine)
- 76-85: ottimo (ben fatto, pochi margini)
- 86-100: eccellente (quasi perfetto, molto raro)

La sufficienza (56+) va GUADAGNATA. Non è il punto di partenza.

LOGICA DI VALUTAZIONE PER CATEGORIA:

ATTENZIONE (25%)
Valuta se l'annuncio viene notato o ignorato.
- Il titolo è immediato o richiede uno sforzo?
- Fa capire subito cosa si vende?
- Si distingue o scivola tra gli altri?
- Un titolo di 2-3 parole generiche vale sotto il 40.
Segnale chiave: se non colpisce subito, non entra nemmeno nel funnel.

CHIAREZZA (25%)
Valuta quanto è facile arrivare a una decisione.
- Le informazioni chiariscono o lasciano dubbi?
- Taglia, condizioni e dettagli sono evidenti?
- La descrizione argomenta il prodotto o butta lì due righe?
- Due righe di info basic = insufficiente, non "buono"
Segnale chiave: ogni dubbio rallenta o blocca l'acquisto.

VALORE (20%)
Valuta la reazione istintiva al prezzo.
- Il prezzo convince subito o fa esitare?
- È supportato da ciò che si vede e si legge?
- Sembra un'occasione o neutro?
Segnale chiave: se non crea interesse immediato, viene ignorato.

FIDUCIA (15%)
Valuta quanto l'annuncio sembra sicuro.
- La descrizione rassicura o lascia nel dubbio?
- Ci sono info reali sulle condizioni, difetti, motivo di vendita?
- Le informazioni sono coerenti e trasparenti?
- Descrizione vuota o generica = fiducia BASSA, non media
Segnale chiave: anche un piccolo dubbio abbassa drasticamente la fiducia.

IMMAGINI (15%)
Valuta quanto le foto fanno vendere da sole.
- Permettono di capire tutto subito?
- Mostrano davvero il prodotto?
- Trasmettono qualità o incertezza?
Segnale chiave: se non aiutano a decidere, non convertono.

REGOLE OUTPUT:
- Ogni frase: max 8-10 parole, naturale, diretta, credibile
- Basata sui dati reali dell'annuncio
- Nessuna spiegazione, nessuna soluzione
- NON usare frasi fisse
- NON iniziare sempre allo stesso modo
- NON ripetere struttura tra categorie
- Varia ritmo, parole e costruzione
- Ogni frase deve sembrare scritta da una persona reale diversa

LOGICA CAMALEONTICA (ANTI-PATTERN):
Alterna tra:
- osservazioni dirette
- percezioni
- micro-giudizi
- sensazioni

Usa variazioni naturali come:
"non colpisce subito"
"lascia qualche dubbio"
"non convince del tutto"
"si capisce ma non spinge"
"ok ma migliorabile"

Evita simmetrie tra frasi.

TRIGGER DI DEBOLEZZA:
- Titolo generico → annuncio invisibile
- Info mancanti → aumento rischio
- Prezzo incerto → blocco decisione
- Foto deboli → perdita valore
- Incoerenze → crollo fiducia
Se presenti più problemi, abbassa sensibilmente il Safe Score.

SAFE SCORE (LOGICA NON LINEARE):
1. Valuta ogni categoria in modo indipendente
2. Applica i pesi: ATTENZIONE 25%, CHIAREZZA 25%, VALORE 20%, FIDUCIA 15%, IMMAGINI 15%
3. Applica penalizzazioni:
- Se ATTENZIONE è debole → limita il punteggio massimo totale
- Se FIDUCIA è bassa → riduci fortemente il totale
- Se VALORE non è chiaro → abbassa tutto in modo visibile
- Se più categorie sono medie → mantieni score medio, non alto
- Se tutto è buono ma non eccellente → NON superare 85%
4. Coerenza tono-punteggio:
- Score alto → frasi leggere
- Score medio → frasi neutre/critiche
- Score basso → frasi più evidenti

SCALA ETICHETTE:
0-49 = "debole"
50-65 = "medio"
66-75 = "buono"
76-85 = "ottimo"
86-100 = "molto forte"

- NON dare mai 100 se non rarissimo
- La sufficienza NON è il default. Se l'annuncio è scarno, il voto deve essere basso.
- Un annuncio con info basilari e descrizione corta NON può avere score sopra 55 in nessuna categoria.
- Tono: neutro, leggermente critico, mai aggressivo
- Obiettivo: far percepire chiaramente che l'annuncio non sta performando al massimo. Creare consapevolezza del margine di miglioramento. Far capire che la sufficienza va meritata. NON risolvere.

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
