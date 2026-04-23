-- =========================================
-- 1. STORAGE: analysis-images
-- =========================================

-- Rimuovi upload anonimo
DROP POLICY IF EXISTS "Anyone can upload analysis images" ON storage.objects;

-- Solo utenti autenticati nella propria cartella
CREATE POLICY "Authenticated users can upload analysis images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'analysis-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can update their own analysis images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'analysis-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can delete their own analysis images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'analysis-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- =========================================
-- 2. STORAGE: chat-attachments (privato per partecipanti)
-- =========================================

DROP POLICY IF EXISTS "Anyone can view chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;

-- Upload: utente autenticato nella propria cartella (primo segmento = user_id)
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Visualizzazione: solo proprietario del file o founder
CREATE POLICY "Users can view their own chat attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.has_role(auth.uid(), 'founder'::public.app_role)
  )
);

CREATE POLICY "Users can delete their own chat attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Rendi privato il bucket chat-attachments (non più pubblico)
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

-- =========================================
-- 3. REALTIME: RLS su realtime.messages
-- =========================================
-- Impedisce subscribe a topic broadcast/presence di altri utenti.
-- Convenzione: i topic privati devono iniziare con l'user id (es. "user:<uuid>:...")
-- Per i postgres_changes (tabelle con RLS) il filtro avviene già a livello di tabella.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Permetti broadcast/presence solo se il topic inizia con il proprio user id
CREATE POLICY "Users can access only their own realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE (auth.uid())::text || ':%'
  OR realtime.topic() LIKE 'user:' || (auth.uid())::text || ':%'
  OR public.has_role(auth.uid(), 'founder'::public.app_role)
);

CREATE POLICY "Users can send to only their own realtime topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE (auth.uid())::text || ':%'
  OR realtime.topic() LIKE 'user:' || (auth.uid())::text || ':%'
  OR public.has_role(auth.uid(), 'founder'::public.app_role)
);