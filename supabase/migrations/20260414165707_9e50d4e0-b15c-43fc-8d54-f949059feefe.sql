
CREATE TABLE public.support_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'bot',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own support conversations"
ON public.support_conversations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'founder'::app_role));

CREATE POLICY "Users can insert their own support conversations"
ON public.support_conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founder can update any support conversation"
ON public.support_conversations FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'founder'::app_role));

CREATE POLICY "Users can update their own support conversations"
ON public.support_conversations FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_support_conversations_updated_at
BEFORE UPDATE ON public.support_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;

CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'user',
  sender_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their support conversations"
ON public.support_messages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM support_conversations c
  WHERE c.id = support_messages.conversation_id
  AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'founder'::app_role))
));

CREATE POLICY "Users can send messages to their support conversations"
ON public.support_messages FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM support_conversations c
  WHERE c.id = support_messages.conversation_id
  AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'founder'::app_role))
));

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
