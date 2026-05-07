-- Reduce free plan limit from 2 to 1, update logic and backfill notification email

CREATE OR REPLACE FUNCTION public.get_free_effective_limit(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_registered_at timestamptz;
  v_now timestamptz := now();
  v_elapsed_days numeric;
  v_window_index int;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  SELECT created_at INTO v_registered_at FROM public.profiles WHERE user_id = p_user_id LIMIT 1;
  IF v_registered_at IS NULL THEN v_registered_at := v_now; END IF;

  v_elapsed_days := EXTRACT(EPOCH FROM (v_now - v_registered_at)) / 86400.0;
  v_window_index := GREATEST(0, FLOOR(v_elapsed_days / 30.0)::int);
  v_period_start := v_registered_at + (v_window_index * interval '30 days');
  v_period_end := v_period_start + interval '30 days';

  RETURN jsonb_build_object(
    'limit', 1,
    'throttle', false,
    'period_start', v_period_start,
    'period_end', v_period_end,
    'window_index', v_window_index
  );
END;
$function$;

-- get_plan_limits: free studio_limit = 1
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan subscription_plan)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_plan
    WHEN 'free' THEN jsonb_build_object(
      'studio_limit', 1, 'creative_director_limit', 0,
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
$function$;

-- Backfill: send free-limit email to existing free users at/over new limit (idempotency suffix v2)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT uc.user_id, p.email, COALESCE(NULLIF(p.nome,''),'') AS nome,
           public.get_free_effective_limit(uc.user_id) AS eff
    FROM public.user_credits uc
    JOIN public.profiles p ON p.user_id = uc.user_id
    WHERE uc.plan = 'free'
      AND uc.studio_used >= 1
      AND p.email IS NOT NULL AND p.email <> ''
  LOOP
    PERFORM public.invoke_send_transactional_email(
      'free-limit-reached',
      r.email,
      'free-limit-v2-' || r.user_id::text || '-' || extract(epoch from (r.eff->>'period_start')::timestamptz)::bigint::text,
      jsonb_build_object('name', r.nome)
    );
  END LOOP;
END $$;