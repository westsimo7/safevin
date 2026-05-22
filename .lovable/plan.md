## Obiettivo
Aggiungere un sistema notifiche unico per:
1. Risposte ricevute nei 3 chat (Artist Director, Collaboration, Upgrade).
2. Recap/aggiornamenti pubblicati manualmente dal founder (te lo dico io in chat e li inserisco).
3. Push del browser sul telefono, con toggle attiva/disattiva nelle Impostazioni.
4. Badge rosso col numero non lette sull'avatar profilo (in alto a destra).
5. Nuova **campanella** a sinistra del menu profilo in Dashboard che apre la lista.

---

## Database

Nuova tabella `notifications`:
- `user_id`, `type` (`chat_reply` | `announcement`), `title`, `body`, `link`, `source` (`artist_director` | `collaboration` | `upgrade` | `system`), `source_id` (uuid conversation, nullable), `read_at`, `created_at`.
- RLS: utente legge/aggiorna le proprie. Founder può inserire `announcement` per tutti.
- Indice su `(user_id, read_at)`.

Nuova tabella `notification_preferences`:
- `user_id` PK, `push_enabled` boolean default true, `updated_at`.
- RLS: utente legge/scrive solo la propria.

Nuova tabella `push_subscriptions`:
- `user_id`, `endpoint` (unique), `p256dh`, `auth`, `user_agent`, `created_at`.
- RLS: utente legge/scrive le proprie; service-role legge tutte.

Funzione SQL `broadcast_announcement(title, body, link)` (SECURITY DEFINER, solo founder): inserisce una notifica per ogni utente in `profiles`. La userò io via `insert` tool quando mi passi un aggiornamento.

---

## Triggers — già esistenti da estendere
I trigger `trg_notify_creative_director_reply`, `trg_notify_collaboration_reply`, `trg_notify_upgrade_reply` oggi inviano solo email. Aggiungo un'unica funzione `create_chat_notification(user_id, source, conversation_id, label, url)` chiamata accanto a `notify_user_on_founder_reply`, che:
1. INSERT in `notifications`.
2. Se `push_enabled = true` e ci sono subscriptions → chiama l'edge function `send-push` via `net.http_post` (autenticata col service-role nel vault, stesso pattern dell'email).

---

## Edge Functions

`send-push` (nuova): riceve `{ user_id, title, body, url }`, legge le `push_subscriptions` dell'utente, invia web-push con VAPID. Subscriptions con `410 Gone` vengono cancellate.

`subscribe-push` (nuova): l'utente loggato fa POST con la PushSubscription, salvataggio in `push_subscriptions`.

`unsubscribe-push` (nuova): cancella per endpoint.

Secrets necessari: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto). Te li chiederò appena approvi il piano.

---

## Frontend

**Service worker** (`public/sw.js`): gestisce `push` (mostra notifica con icona safevin) e `notificationclick` (apre il link).

**Hook `useNotifications`**: fetch lista, conteggio non lette, realtime su `notifications` filtrate per `user_id`, `markAsRead`, `markAllAsRead`.

**Componente `NotificationBell`** in `DashboardHeader`:
- Icona campanella + badge rosso col numero non lette.
- Click → popover con lista (titolo, body, tempo, link). Click su voce → naviga e marca letta. Pulsante "Segna tutte come lette".
- Posizionato **a sinistra** del menu profilo.

**Avatar profilo**: piccolo pallino rosso quando ci sono non lette (riusa lo stesso counter).

**Settings → nuova sezione "Notifiche"**:
- Toggle "Notifiche push sul telefono". On → richiede `Notification.requestPermission()`, registra service worker, salva subscription via `subscribe-push`, segna `push_enabled = true`. Off → `unsubscribe-push` e `push_enabled = false`.
- Spiegazione iOS: serve "Aggiungi alla schermata Home" su Safari 16.4+ perché il push web non funziona dal browser standard.

---

## File toccati

- Migrazione SQL: tabelle + RLS + funzione `broadcast_announcement` + estensione dei 3 trigger.
- `supabase/functions/send-push/index.ts` (nuovo)
- `supabase/functions/subscribe-push/index.ts` (nuovo)
- `supabase/functions/unsubscribe-push/index.ts` (nuovo)
- `supabase/config.toml` (entry per le 3 nuove funzioni)
- `public/sw.js` (nuovo)
- `src/main.tsx` (registra il SW)
- `src/hooks/useNotifications.tsx` (nuovo)
- `src/components/NotificationBell.tsx` (nuovo)
- `src/components/DashboardHeader.tsx` (inserisce campanella + pallino su avatar)
- `src/pages/Settings.tsx` (toggle push)

---

## Cose da confermare

1. Procedo a creare i secrets `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (te li genero io e te li mostro per salvarli)?
2. Sul telefono **iOS**: il push web funziona solo se l'utente "Aggiunge alla Home" dal Safari (limite Apple). Ok mantenere così, o vuoi che in futuro passiamo a Capacitor nativo per push iOS pieni?
3. Quando vuoi pubblicare un aggiornamento globale, mi scrivi titolo + testo (+ link opzionale) e io lo inserisco come `announcement` per tutti gli utenti — confermi questo flusso?