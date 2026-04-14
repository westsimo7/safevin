
-- Upgrade conversations
CREATE TABLE public.upgrade_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.upgrade_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own upgrade conversations"
ON public.upgrade_conversations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Users can insert their own upgrade conversations"
ON public.upgrade_conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founder can update any upgrade conversation"
ON public.upgrade_conversations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'founder'));

-- Upgrade messages
CREATE TABLE public.upgrade_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.upgrade_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.upgrade_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their upgrade conversations"
ON public.upgrade_messages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.upgrade_conversations c
  WHERE c.id = upgrade_messages.conversation_id
  AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'founder'))
));

CREATE POLICY "Users can send messages to their upgrade conversations"
ON public.upgrade_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.upgrade_conversations c
    WHERE c.id = upgrade_messages.conversation_id
    AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'founder'))
  )
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.upgrade_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.upgrade_messages;

-- Trigger for updated_at
CREATE TRIGGER update_upgrade_conversations_updated_at
BEFORE UPDATE ON public.upgrade_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
