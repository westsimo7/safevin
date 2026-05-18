## Obiettivo

1. Popup "Acquista annunci" (sostituisce l'attuale pop up acquista annunci che mostra ancora il piano da 5,99€)mostrato al primo accesso e ogni volta che l'utente entra in Dashboard: pacchetti singoli 5/10/15 + abbonamento Pro, con prezzi reali.
2. Popup "Annuncio gratis inviato per email" che appare PRIMA dell'altro: spiega che l'annuncio prova è stato spedito via email, invita a controllare la casella. Quando l'utente lo chiude, parte il popup acquisti.
3. Email "annuncio gratis disponibile" (inviata appena la persona chiude il pop up dell'annuncio gratuito)minuti dopo la registrazione.
4. Email "annuncio gratis terminato" inviata subito quando l'annuncio gratis viene utilizzato dopo il riscatto .

## UI — popup

**Nuovo `FreeListingEmailPopup**` (sostituisce l'attuale `FirstListingPopup` come primo step):

- Solo per utenti free senza ancora aver creato annunci.
- Titolo: "Il tuo annuncio gratis è in arrivo via email".
- Descrizione: invita a controllare la casella (anche spam) — arriva appena confermi questo messaggio .
- CTA: "Ho capito" → chiude e attiva il popup acquisti.
- Mostrato una volta per utente (`localStorage` flag).

**Rifacimento `FirstListingPopup` → `PurchaseOptionsPopup**`:

- Mostra i 3 bundle (5 / 10 / 15 annunci) prezzi `€2,95 / €4,95 / €8,95` con vecchi prezzi barrati, evidenziando il pacchetto da 10.
- Mostra anche la card Pro a `€12,99/mese` (25 annunci + Artist Director).
- Ogni card chiama l'edge function di checkout (`create-bundle-checkout` per i bundle, `create-checkout` per Pro).
- Mostrato:
  - Al primo accesso Dashboard dopo il popup gratis.
  - Ogni accesso Dashboard successivo, ma con `sessionStorage` per non riapparire più volte nella stessa sessione (evitare di essere insopportabile).
- Pulsante "Più tardi" lo chiude.

`**SafevinDashboard.tsx**`:

- All'avvio decide la sequenza:
  - Se l'utente è free, non ha mai visto `freeListingEmail:<uid>` → apri prima `FreeListingEmailPopup`.
  - Alla chiusura → apri `PurchaseOptionsPopup` (e marca sessione).
  - Se già visto in passato → vai dritto a `PurchaseOptionsPopup` (max una volta per sessione).
- Rimuove `UpsellPopup` per evitare doppi popup sovrapposti su /home.

## Email — flow

**Template nuovi (in `supabase/functions/_shared/transactional-email-templates/`)**:

- `free-listing-available.tsx`: "Il tuo annuncio prova è pronto" (solo pop up di notifica che appare solo se viene interagito il cta dell'email sull'annuncio gratis" appare solo in quello caso è solo una volta 
- `free-listing-finished.tsx`: "Hai usato il tuo annuncio prova" + CTA "Compra altri annunci".
- Registrati entrambi nel `registry.ts`.

**Email post-registrazione (solo dopo aver interagito il pop up del far vedere l'email per l'annuncio gratis )**:

- Migrazione: cron job `send-free-listing-available` ogni 5 minuti che seleziona utenti registrati da almeno 5 minuti, free, mai inviata, e li accoda via `enqueue_email`.(riformula no ai 5 minuti deve essere ogni qualcovolta che gli intenti interagiscono con il pop up
- Nuova edge function `send-free-listing-available` che esegue la query e accoda.
- Tabella di log `free_listing_email_log(user_id, sent_at)` per non duplicare.

**Email annuncio gratis terminato**:

- In `supabase/functions/studio-generate/index.ts`, dopo aver scalato il contatore studio, se l'utente era free e `studio_remaining` passa da 1→0, invoca subito `send-transactional-email` con template `free-listing-finished`.
- Salva flag in `free_listing_email_log.finished_at` per evitare reinvii.

## Dettagli tecnici

- Le funzioni edge che inviano email chiamano `send-transactional-email` (esistente) con `{ templateName, recipient, payload }`.
- I template seguono lo schema dei file esistenti (heading, paragrafo, CTA, link unsubscribe).
- Cron in Postgres via `pg_cron` con `cron.schedule('send-free-listing-available', '*/5 * * * *', ...)` → chiama via `net.http_post` la edge function (pattern già usato per `send-free-trial-reminders` se presente; in caso contrario creo lo schedule).
- Sessione popup: chiave `purchasePopupShown:<uid>` in `sessionStorage`; flag email popup `freeListingEmailPopupShown:<uid>` in `localStorage`.

## File toccati

- `src/components/FreeListingEmailPopup.tsx` (nuovo)
- `src/components/PurchaseOptionsPopup.tsx` (nuovo, rimpiazza visivamente `FirstListingPopup`)
- `src/components/SafevinDashboard.tsx` (orchestrazione popup)
- `src/App.tsx` (rimuovo `UpsellPopup`)
- `src/pages/EngineStudio.tsx` (rimuovo trigger `FirstListingPopup` dopo prima creazione — verrà già sostituito dal popup dashboard)
- `supabase/functions/_shared/transactional-email-templates/free-listing-available.tsx` (nuovo)
- `supabase/functions/_shared/transactional-email-templates/free-listing-finished.tsx` (nuovo)
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `supabase/functions/send-free-listing-available/index.ts` (nuovo) + `deno.json`
- `supabase/functions/studio-generate/index.ts` (trigger immediato email finished)
- Migrazione SQL: tabella `free_listing_email_log` + RLS + cron job `*/5 * * * *`.