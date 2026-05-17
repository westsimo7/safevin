Ho trovato la causa reale: il dominio email è verificato e la coda email funziona, ma il job dei reminder trial sta fallendo perché chiama l’invio interno senza un token valido. L’errore attuale è `401 UNAUTHORIZED_INVALID_JWT_FORMAT`, quindi i reminder non entrano nemmeno in coda.

Piano operativo:

1. Correggere la funzione dei reminder trial
   - Aggiornare `send-free-trial-reminders` per chiamare l’invio email con autorizzazione valida lato backend.
   - Usare una chiave server interna invece del client anonimo implicito.
   - Mantenere il limite di invii per ciclo per evitare blocchi/rate-limit.

2. Rendere il job più robusto
   - Aggiungere log leggibili quando una chiamata fallisce.
   - Leggere correttamente il corpo dell’errore della funzione email, così i prossimi problemi saranno visibili subito.
   - Evitare che un singolo errore mandi in cascata tutto il ciclo.

3. Deploy delle funzioni necessarie
   - Distribuire di nuovo `send-free-trial-reminders`.
   - Se necessario, ridistribuire anche `send-transactional-email` e `process-email-queue` per garantire che la pipeline email sia aggiornata.

4. Far partire subito le email
   - Eseguire manualmente il job dei reminder dopo la correzione.
   - Verificare che vengano creati nuovi log `pending`/`sent` per i template `free-reminder-*`.
   - Controllare che la coda si svuoti e che almeno il primo batch risulti inviato.

5. Risultato atteso
   - I 186 utenti free idonei che non hanno ancora ricevuto `free-reminder-2h` inizieranno a ricevere i reminder.
   - Il sistema continuerà poi automaticamente ogni 15 minuti fino a completare la sequenza, rispettando il limite per ciclo.