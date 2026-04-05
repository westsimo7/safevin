import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AUDIT_PROMPT = `Sei un analista esperto di annunci marketplace Vinted. Analizza l'annuncio e restituisci SOLO un JSON valido.

OUTPUT: breve, leggibile in pochi secondi. Linguaggio diretto, concreto. Nessuna spiegazione lunga. Ogni categoria: breve valutazione + percentuale.

PRINCIPI:
- L'utente decide in pochi secondi, scorre invece di analizzare
- Ogni dubbio riduce conversione
- Se non percepisce valore subito, ignora
- Individua il punto che blocca di più la decisione

LOGICA SEVERA (COME A SCUOLA):
Il punteggio NON si regala. Si dà per merito e si toglie quando manca qualcosa.
La sufficienza (56+) va GUADAGNATA, non è il punto di partenza.

CRITERI DI SEVERITÀ:
- Titolo scarno (1-3 parole generiche) → ATTENZIONE max 35
- Titolo basilare (prodotto + brand, niente altro) → ATTENZIONE max 50
- Descrizione 1-2 righe senza argomentare → CHIAREZZA max 40
- Descrizione solo info basic (taglia, colore) senza contesto → CHIAREZZA max 55
- Info "basilari" NON giustificano MAI un 68%
- Mancano dettagli su condizioni reali, difetti, motivo vendita → FIDUCIA max 45
- Prezzo senza supporto → VALORE max 50

SCALA DI MERITO:
0-39 = "gravemente insufficiente"
40-54 = "debole"
55-64 = "sufficiente"
65-74 = "discreto"
75-84 = "buono"
85-92 = "forte"
93-100 = "eccellente"

CATEGORIE:

ATTENZIONE (25%)
Valuta il titolo in base alla capacità di catturare l'attenzione.
Analizza: presenza brand, tipo prodotto, chiarezza immediata.
- Titolo immediato o richiede sforzo?
- Si distingue o scivola tra gli altri?
- 2-3 parole generiche = sotto 40

CHIAREZZA (25%)
Valuta quanto la descrizione è completa e rende facile la decisione.
Analizza: completezza info, struttura, comprensibilità generale.
- Le informazioni chiariscono o lasciano dubbi?
- Argomenta il prodotto o butta lì due righe?
- Due righe di info basic = insufficiente

VALORE (20%)
Valuta il prezzo rispetto al mercato reale.
LOGICA OBBLIGATORIA E DETERMINISTICA:
1. Estrai: brand, tipo prodotto, condizioni dichiarate
2. Usa queste fasce di riferimento fisse per Vinted (usato, buone condizioni):
   - Fast fashion (H&M, Zara, Primark, Bershka): 5-15€
   - Sportswear mainstream (Nike, Adidas, Puma): 12-25€
   - Premium casual (Tommy Hilfiger, Ralph Lauren, Lacoste, Calvin Klein): 18-35€
   - Streetwear/hype (Supreme, Stüssy, Carhartt WIP): 25-50€
   - Luxury entry (Burberry, Hugo Boss, The North Face premium): 30-60€
   - Luxury (Gucci, Prada, Balenciaga): 50-150€
3. Aggiusta la fascia: "nuovo con etichetta" +30%, "ottime condizioni" +10%, "usato" -20%
4. Calcola il punto medio della fascia aggiustata come "media stimata"
5. Confronta con prezzo annuncio
OUTPUT nella phrase: indica prezzo sotto/in linea/sopra media.
Specifica SEMPRE il confronto numerico (es: "fascia 12-25€, media ~18€, annuncio 19€ → in linea").
Se il prezzo non è fornito, segnala "prezzo non indicato".
IMPORTANTE: usa SEMPRE le stesse fasce. Il risultato deve essere IDENTICO per gli stessi input.

FIDUCIA (15%)
Valuta quanto l'annuncio trasmette affidabilità.
NON usare valutazioni generiche.
Analizza segnali concreti nella descrizione:
- condizioni dichiarate chiaramente
- assenza/presenza difetti
- disponibilità a fornire info o foto extra
- dettagli tecnici (materiale, fit, misure)
OUTPUT: indica se i segnali aumentano o riducono la fiducia.
Descrizione vuota o generica = fiducia BASSA.

IMMAGINI (15%)
Valuta qualità visiva e presentazione prodotto.
Analizza: sfondo (pulito vs confuso), luce (uniforme vs scarsa), nitidezza, focus sul prodotto.
Se non ci sono immagini → score basso, frase "nessuna foto caricata".

REGOLE OUTPUT:
- Ogni frase: max 8-10 parole, naturale, diretta, credibile
- Basata sui dati reali dell'annuncio
- Nessuna spiegazione, nessuna soluzione
- NON usare frasi fisse, NON iniziare sempre allo stesso modo
- NON ripetere struttura tra categorie
- Varia ritmo, parole e costruzione
- Ogni frase deve sembrare scritta da una persona reale

LOGICA CAMALEONTICA (ANTI-PATTERN):
Alterna tra: osservazioni dirette, percezioni, micro-giudizi, sensazioni.
Evita simmetrie tra frasi.

TRIGGER DI DEBOLEZZA:
- Titolo generico → annuncio invisibile
- Info mancanti → aumento rischio
- Prezzo incerto → blocco decisione
- Foto deboli → perdita valore
- Incoerenze → crollo fiducia
Se presenti più problemi, abbassa sensibilmente il Safe Score.

SAFE SCORE (LOGICA NON LINEARE):
1. Valuta ogni categoria indipendentemente
2. Applica pesi: ATTENZIONE 25%, CHIAREZZA 25%, VALORE 20%, FIDUCIA 15%, IMMAGINI 15%
3. Penalizzazioni: ATTENZIONE debole limita il max totale; FIDUCIA bassa riduce fortemente; VALORE non chiaro abbassa tutto
4. Più categorie medie → score medio, non alto
5. Tutto buono ma non eccellente → NON superare 85%

COERENZA PUNTEGGIO-TESTO (OBBLIGATORIA):
- Frase con "basico/sufficiente/essenziale/minimo" → 55-64
- Frase con "discreto/abbastanza buono/solido" → 65-74
- Frase con "buono/ben fatto/chiaro/convincente" → 75-84
- Frase con "forte/molto curato/ottimo" → 85-92
- Frase molto negativa → sotto 55
- NON usare parole positive con punteggi mediocri e viceversa

CONTROLLO FINALE: verifica che linguaggio e numero appartengano alla stessa fascia. Se non coincidono, CORREGGI IL PUNTEGGIO.

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
  },
  "deepIssues": [
    "<problema specifico e dettagliato che impedisce la vendita, es: 'Il titolo non contiene keyword di ricerca come taglia o stile'>"
  ]
}

DEEP ISSUES (OBBLIGATORIO):
Genera SEMPRE un array "deepIssues" con 3-8 problemi concreti e azionabili dell'annuncio.
Ogni issue deve essere una frase specifica che descrive COSA non va e PERCHÉ blocca la vendita.
Queste issues servono per guidare la rigenerazione automatica dell'annuncio.
Esempi: "Titolo privo di keyword: manca taglia, stile e materiale", "Descrizione non argomenta il valore del capo", "Prezzo non giustificato rispetto al brand", "Nessun storytelling o contesto d'uso", "Foto con sfondo disordinato riducono la percezione di qualità".

Rispondi SOLO con JSON valido, nient'altro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { images: imageDataUrls, imageOnly, auditData, similarContext } = body;

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
          model: "openai/gpt-5.2",
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

      // Add similarity context if a previous similar analysis exists
      if (similarContext?.previousResult && similarContext?.similarity) {
        const simNote = `\nCONTESTO ANALISI PRECEDENTE (similarità ${similarContext.similarity}%):
Le parti identiche all'analisi precedente devono ricevere gli STESSI punteggi. Valuta solo le differenze.
Risultato precedente: ${JSON.stringify(similarContext.previousResult)}`;
        userContent.push({ type: "text", text: simNote });
      }

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
          model: "openai/gpt-5.2",
          temperature: 0,
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
