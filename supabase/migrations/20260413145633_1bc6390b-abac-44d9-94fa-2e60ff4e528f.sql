
-- Creative Director Conversations
CREATE TABLE public.creative_director_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_director_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON public.creative_director_conversations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Users can insert their own conversations"
ON public.creative_director_conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founder can update any conversation"
ON public.creative_director_conversations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'founder'));

-- Trigger for updated_at
CREATE TRIGGER update_cd_conversations_updated_at
BEFORE UPDATE ON public.creative_director_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Creative Director Messages
CREATE TABLE public.creative_director_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.creative_director_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_director_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their conversations"
ON public.creative_director_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.creative_director_conversations c
    WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'founder'))
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.creative_director_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.creative_director_conversations c
    WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'founder'))
  )
);

-- User Credits
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'pro',
  credits_total INTEGER NOT NULL DEFAULT 2,
  credits_used INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('month', now()),
  period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Founder can insert credits"
ON public.user_credits FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Founder can update credits"
ON public.user_credits FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'founder'));

-- Function to deduct credit when founder completes a job
CREATE OR REPLACE FUNCTION public.complete_creative_director_job(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_period_start TIMESTAMPTZ := date_trunc('month', now());
BEGIN
  -- Only founder can call this
  IF NOT public.has_role(auth.uid(), 'founder') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Get user from conversation
  SELECT user_id INTO v_user_id
  FROM public.creative_director_conversations
  WHERE id = p_conversation_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- Mark conversation as completed
  UPDATE public.creative_director_conversations
  SET status = 'completed'
  WHERE id = p_conversation_id;

  -- Deduct credit
  UPDATE public.user_credits
  SET credits_used = credits_used + 1
  WHERE user_id = v_user_id AND period_start = v_period_start;

  -- If no credit row exists for this month, create one based on role
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, plan_type, credits_total, credits_used, period_start, period_end)
    VALUES (v_user_id, 'pro', 2, 1, v_period_start, v_period_start + interval '1 month');
  END IF;

  RETURN TRUE;
END;
$$;

-- Storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true);

CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

CREATE POLICY "Anyone can view chat attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.creative_director_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creative_director_conversations;
