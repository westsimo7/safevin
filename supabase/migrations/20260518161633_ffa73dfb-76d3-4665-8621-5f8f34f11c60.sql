-- Tighten support_messages INSERT policy: also require sender_id = auth.uid()
DROP POLICY IF EXISTS "Users can send messages to their support conversations" ON public.support_messages;
CREATE POLICY "Users can send messages to their support conversations"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.support_conversations c
    WHERE c.id = support_messages.conversation_id
      AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'founder'::public.app_role))
  )
);