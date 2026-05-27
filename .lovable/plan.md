
## Piano implementazione SAFEViN Studio v2.0

Trasformo il flusso Studio in 2 schermate, con AI target-aware, nuova formula titolo/descrizione modulare e validazioni server-side. Tutto in linea col documento allegato.

---

### ⚠️ Nota critica sui modelli AI (da confermare)

Il Lovable AI Gateway supporta ufficialmente solo modelli `google/*` e `openai/*`. I modelli `anthropic/claude-opus-4-6` e `anthropic/claude-sonnet-4-6` indicati nel doc **non sono nella lista supportata**. Procedo così:

- **Tento prima** `anthropic/claude-opus-4-6` (vision) e `anthropic/claude-sonnet-4-6` (generate). Se il gateway risponde 4xx "model not supported", **fallback automatico** a:
  - Vision → `google/gemini-2.5-pro` (top vision + reasoning)
  - Generate → `openai/gpt-5.2` (attuale, copywriting solido)
- Log dell'errore in console edge per poter switchare manualmente.

Se vuoi forzare subito gli equivalenti supportati senza tentare Claude, dimmelo prima del lancio.

---

### MODIFICA 1+2 — Flusso a 2 schermate, campi ridotti

**`src/components/studio/StudioInput.tsx`** (riduzione campi):
- Mantenere: Genere, Taglia (sblocca dopo genere), Condizione, Misure (testo libero), Prezzo minimo.
- Spostare **Materiale** in sezione "Info aggiuntive" come opzionale.
- Rimuovere dai campi manuali: tipologia prodotto, fit, stile, periodo, colore, dettagli grafici, target audience.

**`src/pages/EngineStudio.tsx`** + **`StudioRecognition.tsx`**:
- Saltare lo step "Conferma Dettagli" quando `recognition_confidence !== "low"`: dopo l'analisi vai direttamente a generate → output.
- Mantenere `StudioRecognition` SOLO come fallback low-confidence (e per il pop-up brand non rilevato).
- Aggiungere mini pop-up inline "Aggiungi brand? (opzionale)" se `brand_visibile === null`, con tasto "Salta".

---

### MODIFICA 3 — Switch modelli (con fallback)

Aggiungere helper `callAIWithFallback(primary, fallback, body)` in entrambe le edge function. Timeout: 45s edge / 180s client invariati.

---

### MODIFICA 4 — `supabase/functions/studio-analyze/index.ts`

Estendere `VISION_PROMPT`:
1. Aggiungere campo `target_audience: { category, confidence, reasoning }` (7 valori: neonato/bambino/preteen/teen/giovane_adulto/adulto/maturo) con la tabella indicatori del doc.
2. Mantenere whitelist stili stretta (`Vintage, Casual, Streetwear, Elegante`) ma chiedere sotto-stile in `note_aggiuntive` (lista Y2K, Old Money, Quiet Luxury, Techwear, …).
3. Mantenere logica `brand_visibile = null` invariata (handling lato client).
4. Caricare enciclopedie stili/fit come **costanti statiche** nel file edge, non in ogni chiamata.

---

### MODIFICA 5+6+7 — `supabase/functions/studio-generate/index.ts`

- `userInput.materials` diventa opzionale.
- Sostituire `SYSTEM_PROMPT` con quello del doc (sezione 7.2): regole titolo, descrizione modulare 5 moduli (Hook / Bullet dettagli / Vestibilità+Materiale / Misure 📏 condizionale / Closing), tono adattivo per target, hashtag (5), prezzo invariato, **photo_report 4 pilastri** (luce/contrasto/completezza/nitidezza).
- Output JSON include `photo_report`, rimossi `tips_di_vendita` e scheda recap dettagli.

---

### MODIFICA 8 — Validazione server-side post-generate

Dopo il parse JSON in `studio-generate`:
1. Conteggio parole `description`: se > 80 → re-prompt automatico con "accorcia mantenendo struttura modulare" (max 1 retry).
2. Lunghezza `title` > 80 char → truncation guidata: rimuovi condizione → poi sesso → poi stile finché ≤ 80.
3. Sanitizer: rimuovi `-`/`–` tra elementi del titolo.
4. Whitelist `style` ∈ {Vintage, Casual, Streetwear, Elegante}: se off, normalizza alla più vicina.
5. Whitelist `target_audience.category` ∈ 7 valori: se off, default `adulto`.

---

### Persistenza & UI Output

- **Migrazione DB**: aggiungere `target_audience jsonb` a `public.studio_creations` (nullable).
- **`StudioOutput.tsx`**: nuovo ordine — Titolo → Descrizione (rendering che preserva i moduli e i bullet `•`) → Hashtag → Prezzo+Strategia (4 step) → **Resoconto foto 4 Pilastri** in coda. Rimuovere scheda recap e tips finali.

---

### File toccati

```
src/components/studio/StudioInput.tsx         (riduzione campi + materiale opzionale)
src/components/studio/StudioRecognition.tsx   (solo low-confidence + brand pop-up)
src/components/studio/StudioOutput.tsx        (nuovo ordine, photo report, no recap/tips)
src/pages/EngineStudio.tsx                    (skip conferma, brand pop-up inline)
supabase/functions/studio-analyze/index.ts    (target_audience, sotto-stili, modello)
supabase/functions/studio-generate/index.ts   (nuovo system prompt, validazioni, modello)
supabase/migrations/*_studio_target_audience.sql  (colonna target_audience)
mem://features/studio/*                       (aggiorno listing-output, vision-logic, wizard-structure)
```

---

### Verifica finale prima del lancio

1. Build TypeScript pulita.
2. Test edge functions via `supabase--curl_edge_functions` con 1 immagine fake per validare schema JSON.
3. Smoke test in preview: upload 2 foto → verifica skip conferma → output con 5 moduli, hashtag, prezzo, 4 pilastri.
4. Se Claude non risponde, fallback OpenAI/Gemini attivo e loggato.

Fuori scope (priorità bassa del doc): scarpe/oggetti/gioielli, A/B test, few-shot examples estesi, structured outputs JSON-schema, streaming.
