-- Tabella per tenere traccia dell'ultima notifica inviata per conversazione
CREATE TABLE IF NOT EXISTS public.email_notification_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  conversation_type TEXT NOT NULL,
  last_notified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, conversation_type)
);

ALTER TABLE public.email_notification_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage notification state"
  ON public.email_notification_state
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_email_notification_state_lookup
  ON public.email_notification_state (conversation_id, conversation_type);

-- Estensioni necessarie per chiamare edge functions dai trigger
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Helper: invoca send-transactional-email via pg_net
CREATE OR REPLACE FUNCTION public.invoke_send_transactional_email(
  p_template_name TEXT,
  p_recipient_email TEXT,
  p_idempotency_key TEXT,
  p_template_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_request_id BIGINT;
BEGIN
  -- URL della edge function
  v_url := 'https://ilnkeilltvkceohcjfjy.supabase.co/functions/v1/send-transactional-email';

  -- Recupera il service role key dal vault (è già stato salvato dall'infrastruttura email)
  SELECT decrypted_secret INTO v_service_key
  FROM vault.decrypted_secrets
  WHERE name = 'email_queue_service_role_key'
  LIMIT 1;

  IF v_service_key IS NULL THEN
    RAISE WARNING 'email_queue_service_role_key not found in vault, skipping email send';
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := jsonb_build_object(
      'templateName', p_template_name,
      'recipientEmail', p_recipient_email,
      'idempotencyKey', p_idempotency_key,
      'templateData', p_template_data
    )
  ) INTO v_request_id;

  RETURN v_request_id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to invoke send-transactional-email: %', SQLERRM;
  RETURN NULL;
END;
$$;

-- =====================================================
-- 1) BENVENUTO AL SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name TEXT;
BEGIN
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  v_first_name := COALESCE(
    NEW.raw_user_meta_data ->> 'given_name',
    NEW.raw_user_meta_data ->> 'name',
    ''
  );

  PERFORM public.invoke_send_transactional_email(
    'welcome',
    NEW.email,
    'welcome-' || NEW.id::text,
    jsonb_build_object('name', v_first_name)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_send_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();

-- =====================================================
-- 2) CONFERMA UPGRADE DI PIANO
-- =====================================================
CREATE OR REPLACE FUNCTION public.send_plan_upgrade_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_plan_label TEXT;
BEGIN
  -- Solo se il piano è effettivamente cambiato e non è "free"
  IF NEW.plan = OLD.plan THEN
    RETURN NEW;
  END IF;

  IF NEW.plan = 'free' THEN
    RETURN NEW;
  END IF;

  SELECT email, COALESCE(NULLIF(nome, ''), '')
    INTO v_email, v_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN NEW;
  END IF;

  v_plan_label := CASE NEW.plan::text
    WHEN 'starter' THEN 'Starter'
    WHEN 'pro' THEN 'Pro'
    WHEN 'expert' THEN 'Expert'
    ELSE INITCAP(NEW.plan::text)
  END;

  PERFORM public.invoke_send_transactional_email(
    'plan-upgrade',
    v_email,
    'plan-upgrade-' || NEW.user_id::text || '-' || NEW.plan::text || '-' || extract(epoch from now())::bigint::text,
    jsonb_build_object('name', v_name, 'plan', v_plan_label)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_credits_plan_upgrade ON public.user_credits;
CREATE TRIGGER on_user_credits_plan_upgrade
  AFTER UPDATE OF plan ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.send_plan_upgrade_email();

-- =====================================================
-- 3) NOTIFICA RISPOSTA DEL FOUNDER NELLE CHAT (con throttle 30 min)
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_user_on_founder_reply(
  p_conversation_id UUID,
  p_conversation_type TEXT,
  p_recipient_user_id UUID,
  p_chat_label TEXT,
  p_chat_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_last TIMESTAMP WITH TIME ZONE;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  SELECT email, COALESCE(NULLIF(nome, ''), '')
    INTO v_email, v_name
  FROM public.profiles
  WHERE user_id = p_recipient_user_id;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN;
  END IF;

  -- Throttle: controlla l'ultima notifica per questa conversazione
  SELECT last_notified_at INTO v_last
  FROM public.email_notification_state
  WHERE conversation_id = p_conversation_id
    AND conversation_type = p_conversation_type;

  IF v_last IS NOT NULL AND v_last > (v_now - interval '30 minutes') THEN
    RETURN;
  END IF;

  -- Aggiorna lo stato (upsert)
  INSERT INTO public.email_notification_state (conversation_id, conversation_type, last_notified_at)
  VALUES (p_conversation_id, p_conversation_type, v_now)
  ON CONFLICT (conversation_id, conversation_type)
  DO UPDATE SET last_notified_at = EXCLUDED.last_notified_at;

  PERFORM public.invoke_send_transactional_email(
    'chat-reply',
    v_email,
    'chat-reply-' || p_conversation_type || '-' || p_conversation_id::text || '-' || extract(epoch from v_now)::bigint::text,
    jsonb_build_object(
      'name', v_name,
      'chatLabel', p_chat_label,
      'chatUrl', p_chat_url
    )
  );
END;
$$;

-- Trigger per Creative Director
CREATE OR REPLACE FUNCTION public.trg_notify_creative_director_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Solo se chi invia è il founder
  IF NOT public.has_role(NEW.sender_id, 'founder'::public.app_role) THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.creative_director_conversations
  WHERE id = NEW.conversation_id;

  IF v_user_id IS NULL OR v_user_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  PERFORM public.notify_user_on_founder_reply(
    NEW.conversation_id,
    'creative_director',
    v_user_id,
    'Artist Director',
    'https://www.safevinengine.com/artist-director'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_cd_message_notify ON public.creative_director_messages;
CREATE TRIGGER on_cd_message_notify
  AFTER INSERT ON public.creative_director_messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_creative_director_reply();

-- Trigger per Upgrade
CREATE OR REPLACE FUNCTION public.trg_notify_upgrade_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.has_role(NEW.sender_id, 'founder'::public.app_role) THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.upgrade_conversations
  WHERE id = NEW.conversation_id;

  IF v_user_id IS NULL OR v_user_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  PERFORM public.notify_user_on_founder_reply(
    NEW.conversation_id,
    'upgrade',
    v_user_id,
    'Upgrade',
    'https://www.safevinengine.com/upgrade'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_upgrade_message_notify ON public.upgrade_messages;
CREATE TRIGGER on_upgrade_message_notify
  AFTER INSERT ON public.upgrade_messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_upgrade_reply();

-- Trigger per Support
CREATE OR REPLACE FUNCTION public.trg_notify_support_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Per il support, sender_type può essere 'founder' o sender_id può essere il founder
  IF NEW.sender_id IS NULL OR NOT public.has_role(NEW.sender_id, 'founder'::public.app_role) THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.support_conversations
  WHERE id = NEW.conversation_id;

  IF v_user_id IS NULL OR v_user_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  PERFORM public.notify_user_on_founder_reply(
    NEW.conversation_id,
    'support',
    v_user_id,
    'Centro Assistenza',
    'https://www.safevinengine.com/support'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_support_message_notify ON public.support_messages;
CREATE TRIGGER on_support_message_notify
  AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_support_reply();

-- Trigger per Collaboration
CREATE OR REPLACE FUNCTION public.trg_notify_collaboration_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.has_role(NEW.sender_id, 'founder'::public.app_role) THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.collaboration_conversations
  WHERE id = NEW.conversation_id;

  IF v_user_id IS NULL OR v_user_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  PERFORM public.notify_user_on_founder_reply(
    NEW.conversation_id,
    'collaboration',
    v_user_id,
    'Collaborazione',
    'https://www.safevinengine.com/collaboration'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_collab_message_notify ON public.collaboration_messages;
CREATE TRIGGER on_collab_message_notify
  AFTER INSERT ON public.collaboration_messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_collaboration_reply();