-- ============================================================
-- 1. ENUM dei piani
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.subscription_plan AS ENUM ('free', 'starter', 'pro', 'expert');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. ESTENDI user_credits
-- ============================================================
ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS plan public.subscription_plan NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS studio_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creative_director_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days');

CREATE UNIQUE INDEX IF NOT EXISTS user_credits_user_id_unique ON public.user_credits(user_id);

-- ============================================================
-- 3. get_plan_limits
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan public.subscription_plan)
RETURNS jsonb
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE p_plan
    WHEN 'free' THEN jsonb_build_object(
      'studio_limit', 2, 'creative_director_limit', 0,
      'history_mode', 'last_2', 'incomplete_save', false, 'support_24h', false,
      'creative_director_access', false, 'upgrade_access', false, 'collaboration_access', false)
    WHEN 'starter' THEN jsonb_build_object(
      'studio_limit', 10, 'creative_director_limit', 0,
      'history_mode', 'last_3_sessions', 'incomplete_save', true, 'support_24h', true,
      'creative_director_access', false, 'upgrade_access', false, 'collaboration_access', false)
    WHEN 'pro' THEN jsonb_build_object(
      'studio_limit', 25, 'creative_director_limit', 2,
      'history_mode', 'monthly', 'incomplete_save', true, 'support_24h', true,
      'creative_director_access', true, 'upgrade_access', false, 'collaboration_access', false)
    WHEN 'expert' THEN jsonb_build_object(
      'studio_limit', 60, 'creative_director_limit', 6,
      'history_mode', 'quarterly', 'incomplete_save', true, 'support_24h', true,
      'creative_director_access', true, 'upgrade_access', true, 'collaboration_access', true)
  END;
$$;

-- ============================================================
-- 4. ensure_user_credits
-- ============================================================
CREATE OR REPLACE FUNCTION public.ensure_user_credits(p_user_id UUID)
RETURNS public.user_credits
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.user_credits;
BEGIN
  INSERT INTO public.user_credits (user_id, plan, plan_type, credits_total, credits_used,
    studio_used, creative_director_used, current_period_start, current_period_end,
    period_start, period_end)
  VALUES (p_user_id, 'free', 'free', 0, 0, 0, 0, now(), now() + interval '30 days',
    date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row FROM public.user_credits WHERE user_id = p_user_id;

  IF v_row.current_period_end < now() THEN
    UPDATE public.user_credits
    SET studio_used = 0, creative_director_used = 0,
        current_period_start = now(), current_period_end = now() + interval '30 days'
    WHERE user_id = p_user_id
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

-- ============================================================
-- 5. get_user_plan
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_plan()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_credits;
  v_limits jsonb;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','unauthenticated'); END IF;

  v_row := public.ensure_user_credits(v_uid);
  v_limits := public.get_plan_limits(v_row.plan);

  RETURN jsonb_build_object(
    'plan', v_row.plan,
    'studio_used', v_row.studio_used,
    'studio_limit', (v_limits->>'studio_limit')::int,
    'studio_remaining', GREATEST(0, (v_limits->>'studio_limit')::int - v_row.studio_used),
    'creative_director_used', v_row.creative_director_used,
    'creative_director_limit', (v_limits->>'creative_director_limit')::int,
    'creative_director_remaining', GREATEST(0, (v_limits->>'creative_director_limit')::int - v_row.creative_director_used),
    'current_period_start', v_row.current_period_start,
    'current_period_end', v_row.current_period_end,
    'limits', v_limits,
    'is_founder', public.has_role(v_uid, 'founder'::public.app_role)
  );
END;
$$;

-- ============================================================
-- 6. consume_feature_credit
-- ============================================================
CREATE OR REPLACE FUNCTION public.consume_feature_credit(p_feature TEXT)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_credits;
  v_limits jsonb;
  v_limit INT;
  v_used INT;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'unauthenticated'); END IF;

  IF public.has_role(v_uid, 'founder'::public.app_role) THEN
    RETURN jsonb_build_object('success', true, 'bypassed', true);
  END IF;

  v_row := public.ensure_user_credits(v_uid);
  v_limits := public.get_plan_limits(v_row.plan);

  IF p_feature = 'studio' THEN
    v_limit := (v_limits->>'studio_limit')::int;
    v_used := v_row.studio_used;
    IF v_used >= v_limit THEN
      RETURN jsonb_build_object('success', false, 'error', 'limit_reached',
        'feature','studio','used',v_used,'limit',v_limit);
    END IF;
    UPDATE public.user_credits SET studio_used = studio_used + 1 WHERE user_id = v_uid;
    RETURN jsonb_build_object('success', true, 'feature','studio','used',v_used+1,'limit',v_limit);

  ELSIF p_feature = 'creative_director' THEN
    v_limit := (v_limits->>'creative_director_limit')::int;
    v_used := v_row.creative_director_used;
    IF v_used >= v_limit THEN
      RETURN jsonb_build_object('success', false, 'error', 'limit_reached',
        'feature','creative_director','used',v_used,'limit',v_limit);
    END IF;
    UPDATE public.user_credits SET creative_director_used = creative_director_used + 1 WHERE user_id = v_uid;
    RETURN jsonb_build_object('success', true, 'feature','creative_director','used',v_used+1,'limit',v_limit);
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'unknown_feature');
END;
$$;

-- ============================================================
-- 7. set_user_plan (founder)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_user_plan(p_target_user UUID, p_new_plan public.subscription_plan)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'founder'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied: only founder can change plans';
  END IF;

  PERFORM public.ensure_user_credits(p_target_user);

  UPDATE public.user_credits
  SET plan = p_new_plan, plan_type = p_new_plan::text,
      studio_used = 0, creative_director_used = 0,
      current_period_start = now(), current_period_end = now() + interval '30 days'
  WHERE user_id = p_target_user;

  RETURN jsonb_build_object('success', true, 'user_id', p_target_user, 'new_plan', p_new_plan);
END;
$$;

-- ============================================================
-- 8. Trigger nuovo utente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, plan, plan_type, credits_total, credits_used,
    studio_used, creative_director_used, current_period_start, current_period_end,
    period_start, period_end)
  VALUES (NEW.id, 'free', 'free', 0, 0, 0, 0, now(), now() + interval '30 days',
    date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- ============================================================
-- 9. complete_creative_director_job aggiornato
-- ============================================================
CREATE OR REPLACE FUNCTION public.complete_creative_director_job(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'founder'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.creative_director_conversations
  WHERE id = p_conversation_id;

  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Conversation not found'; END IF;

  UPDATE public.creative_director_conversations SET status = 'completed' WHERE id = p_conversation_id;

  PERFORM public.ensure_user_credits(v_user_id);
  UPDATE public.user_credits
  SET creative_director_used = creative_director_used + 1
  WHERE user_id = v_user_id;

  RETURN TRUE;
END;
$$;

-- ============================================================
-- 10. Sostituisci get_all_users_admin (DROP + CREATE)
-- ============================================================
DROP FUNCTION IF EXISTS public.get_all_users_admin();

CREATE FUNCTION public.get_all_users_admin()
RETURNS TABLE(
  user_id uuid, email text, nome text, cognome text, telefono text,
  role text, plan text, studio_used int, studio_limit int,
  cd_used int, cd_limit int, created_at timestamp with time zone,
  studio_count bigint, analysis_count bigint
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'founder') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id, p.email, p.nome, p.cognome, p.telefono,
    COALESCE(ur.role::TEXT, 'user') AS role,
    COALESCE(uc.plan::TEXT, 'free') AS plan,
    COALESCE(uc.studio_used, 0) AS studio_used,
    COALESCE((public.get_plan_limits(uc.plan)->>'studio_limit')::int, 2) AS studio_limit,
    COALESCE(uc.creative_director_used, 0) AS cd_used,
    COALESCE((public.get_plan_limits(uc.plan)->>'creative_director_limit')::int, 0) AS cd_limit,
    p.created_at,
    COALESCE(sc.cnt, 0) AS studio_count,
    COALESCE(ac.cnt, 0) AS analysis_count
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  LEFT JOIN public.user_credits uc ON uc.user_id = p.user_id
  LEFT JOIN LATERAL (SELECT COUNT(*)::BIGINT AS cnt FROM public.studio_creations s
    WHERE s.user_id = p.user_id AND s.status = 'complete') sc ON TRUE
  LEFT JOIN LATERAL (SELECT COUNT(*)::BIGINT AS cnt FROM public.analyses a
    WHERE a.user_id = p.user_id) ac ON TRUE
  ORDER BY p.created_at DESC;
END;
$$;

-- ============================================================
-- 11. Inizializza riga per utenti esistenti
-- ============================================================
INSERT INTO public.user_credits (user_id, plan, plan_type, credits_total, credits_used,
  studio_used, creative_director_used, current_period_start, current_period_end,
  period_start, period_end)
SELECT u.id, 'free', 'free', 0, 0, 0, 0, now(), now() + interval '30 days',
  date_trunc('month', now()), date_trunc('month', now()) + interval '1 month'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_credits c WHERE c.user_id = u.id);

UPDATE public.user_credits
SET plan = 'expert', plan_type = 'expert'
WHERE user_id IN (SELECT user_id FROM public.user_roles WHERE role = 'founder');