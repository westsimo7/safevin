
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('chat_reply','announcement')),
  source text NOT NULL CHECK (source IN ('artist_director','collaboration','upgrade','system')),
  source_id uuid,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'founder'::public.app_role));

CREATE POLICY "Users update own notifications" ON public.notifications
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founder can insert notifications" ON public.notifications
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'founder'::public.app_role));

CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notification preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  push_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own prefs select" ON public.notification_preferences
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own prefs insert" ON public.notification_preferences
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own prefs update" ON public.notification_preferences
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Push subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_subs_user ON public.push_subscriptions(user_id);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own push subs" ON public.push_subscriptions
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own push subs" ON public.push_subscriptions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own push subs" ON public.push_subscriptions
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Helper: create chat notification + invoke push function
CREATE OR REPLACE FUNCTION public.create_chat_notification(
  p_user_id uuid,
  p_source text,
  p_conversation_id uuid,
  p_label text,
  p_url text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_push_enabled boolean;
  v_has_subs boolean;
  v_service_key text;
  v_title text;
  v_body text;
BEGIN
  v_title := 'Nuova risposta in ' || p_label;
  v_body := 'Hai ricevuto una nuova risposta. Tocca per aprirla.';

  INSERT INTO public.notifications (user_id, type, source, source_id, title, body, link)
  VALUES (p_user_id, 'chat_reply', p_source, p_conversation_id, v_title, v_body, p_url);

  -- Check preferences (default true if missing)
  SELECT COALESCE((SELECT push_enabled FROM public.notification_preferences WHERE user_id = p_user_id), true)
    INTO v_push_enabled;
  IF NOT v_push_enabled THEN RETURN; END IF;

  SELECT EXISTS(SELECT 1 FROM public.push_subscriptions WHERE user_id = p_user_id) INTO v_has_subs;
  IF NOT v_has_subs THEN RETURN; END IF;

  SELECT decrypted_secret INTO v_service_key
  FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
  IF v_service_key IS NULL THEN RETURN; END IF;

  PERFORM net.http_post(
    url := 'https://ilnkeilltvkceohcjfjy.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || v_service_key
    ),
    body := jsonb_build_object(
      'user_id', p_user_id,
      'title', v_title,
      'body', v_body,
      'url', p_url
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'create_chat_notification failed: %', SQLERRM;
END;
$$;

-- Extend the 3 existing trigger functions to also call create_chat_notification
CREATE OR REPLACE FUNCTION public.trg_notify_creative_director_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user_id uuid;
BEGIN
  IF NOT public.has_role(NEW.sender_id, 'founder'::public.app_role) THEN RETURN NEW; END IF;
  SELECT user_id INTO v_user_id FROM public.creative_director_conversations WHERE id = NEW.conversation_id;
  IF v_user_id IS NULL OR v_user_id = NEW.sender_id THEN RETURN NEW; END IF;
  PERFORM public.notify_user_on_founder_reply(NEW.conversation_id,'creative_director',v_user_id,'Artist Director','https://www.safevinengine.com/artist-director');
  PERFORM public.create_chat_notification(v_user_id,'artist_director',NEW.conversation_id,'Artist Director','/artist-director');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_collaboration_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user_id uuid;
BEGIN
  IF NOT public.has_role(NEW.sender_id, 'founder'::public.app_role) THEN RETURN NEW; END IF;
  SELECT user_id INTO v_user_id FROM public.collaboration_conversations WHERE id = NEW.conversation_id;
  IF v_user_id IS NULL OR v_user_id = NEW.sender_id THEN RETURN NEW; END IF;
  PERFORM public.notify_user_on_founder_reply(NEW.conversation_id,'collaboration',v_user_id,'Collaborazione','https://www.safevinengine.com/collaboration');
  PERFORM public.create_chat_notification(v_user_id,'collaboration',NEW.conversation_id,'Collaborazione','/collaboration');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_upgrade_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user_id uuid;
BEGIN
  IF NOT public.has_role(NEW.sender_id, 'founder'::public.app_role) THEN RETURN NEW; END IF;
  SELECT user_id INTO v_user_id FROM public.upgrade_conversations WHERE id = NEW.conversation_id;
  IF v_user_id IS NULL OR v_user_id = NEW.sender_id THEN RETURN NEW; END IF;
  PERFORM public.notify_user_on_founder_reply(NEW.conversation_id,'upgrade',v_user_id,'Upgrade','https://www.safevinengine.com/upgrade');
  PERFORM public.create_chat_notification(v_user_id,'upgrade',NEW.conversation_id,'Upgrade','/upgrade');
  RETURN NEW;
END;
$$;

-- Founder-only broadcast announcement
CREATE OR REPLACE FUNCTION public.broadcast_announcement(p_title text, p_body text, p_link text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count int;
BEGIN
  IF NOT public.has_role(auth.uid(),'founder'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  INSERT INTO public.notifications (user_id, type, source, title, body, link)
  SELECT p.user_id, 'announcement', 'system', p_title, p_body, p_link FROM public.profiles p;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('success', true, 'sent', v_count);
END;
$$;

-- Mark notifications read RPCs (security definer to allow row updates without ambiguity)
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.notifications SET read_at = now()
  WHERE id = p_id AND user_id = auth.uid() AND read_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.notifications SET read_at = now()
  WHERE user_id = auth.uid() AND read_at IS NULL;
$$;
