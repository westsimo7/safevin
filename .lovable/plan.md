

## Diagnosi e Fix: Errore dopo analisi immagini in Studio

### Problema identificato

Le chiamate API `studio-analyze` restituiscono tutte 200 OK con dati validi. L'errore probabile è nel **salvataggio del draft in localStorage** dopo l'analisi: le preview delle immagini sono data URL base64 che possono facilmente superare il limite di 5MB di localStorage, causando un'eccezione non gestita che riporta alla fase upload con errore generico.

### Piano

**1. Proteggere il salvataggio draft da errori localStorage**

In `src/lib/studioDrafts.ts` (`writeStudioDrafts`):
- Wrappare `localStorage.setItem` in try/catch
- Se fallisce per quota superata, rimuovere i draft più vecchi e riprovare
- Se continua a fallire, loggare warning ma non lanciare eccezione

**2. Ridurre la dimensione dei dati salvati**

In `src/pages/EngineStudio.tsx` (`saveDraft`):
- NON salvare le preview base64 complete nel draft
- Salvare solo la prima preview ridimensionata (thumbnail ~200px) per la visualizzazione nella lista incompleti
- Le preview full-size restano solo in memoria React state

**3. Gestire errori nel flusso handleAnalyze**

In `src/pages/EngineStudio.tsx`:
- Assicurarsi che `saveDraft` non possa far fallire il flusso principale
- Wrappare la chiamata `saveDraft` in try/catch separato così il passaggio alla fase `recognition` avviene anche se il draft fallisce

### File modificati
- `src/lib/studioDrafts.ts` — aggiunta gestione errori quota localStorage
- `src/pages/EngineStudio.tsx` — riduzione dati preview nei draft + protezione errori

