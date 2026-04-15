
-- Create collaboration_conversations table
CREATE TABLE public.collaboration_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collaboration_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collaboration conversations"
ON public.collaboration_conversations FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'founder'::app_role));

CREATE POLICY "Users can insert their own collaboration conversations"
ON public.collaboration_conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founder can update any collaboration conversation"
ON public.collaboration_conversations FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'founder'::app_role));

-- Create collaboration_messages table
CREATE TABLE public.collaboration_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.collaboration_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collaboration_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their collaboration conversations"
ON public.collaboration_messages FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM collaboration_conversations c
  WHERE c.id = collaboration_messages.conversation_id
  AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'founder'::app_role))
));

CREATE POLICY "Users can send messages to their collaboration conversations"
ON public.collaboration_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM collaboration_conversations c
    WHERE c.id = collaboration_messages.conversation_id
    AND (c.user_id = auth.uid() OR has_role(auth.uid(), 'founder'::app_role))
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_messages;

-- Trigger for updated_at
CREATE TRIGGER update_collaboration_conversations_updated_at
BEFORE UPDATE ON public.collaboration_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
