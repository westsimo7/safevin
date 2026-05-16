
-- 1) Free plan: studio_limit 1 -> 0
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan subscription_plan)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_plan
    WHEN 'free' THEN jsonb_build_object(
      'studio_limit', 0, 'creative_director_limit', 0,
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

-- 2) Free effective limit -> 0
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
    'limit', 0,
    'throttle', false,
    'period_start', v_period_start,
    'period_end', v_period_end,
    'window_index', v_window_index
  );
END;
$function$;

-- 3) Bundle purchase: applica bonus per tier (5->+1, 10->+3, 15->+5)
CREATE OR REPLACE FUNCTION public.credit_bundle_purchase(p_session_id text, p_user_id uuid, p_quantity integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_inserted boolean := false;
  v_bonus int := 0;
  v_total int;
BEGIN
  IF p_session_id IS NULL OR p_user_id IS NULL OR p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_input');
  END IF;

  v_bonus := CASE p_quantity
    WHEN 5  THEN 1
    WHEN 10 THEN 3
    WHEN 15 THEN 5
    ELSE 0
  END;
  v_total := p_quantity + v_bonus;

  INSERT INTO public.bundle_purchases (session_id, user_id, quantity)
  VALUES (p_session_id, p_user_id, v_total)
  ON CONFLICT (session_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted THEN
    PERFORM public.ensure_user_credits(p_user_id);
    UPDATE public.user_credits
    SET bonus_credits = COALESCE(bonus_credits, 0) + v_total
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('success', true, 'credited', v_total, 'base', p_quantity, 'bonus', v_bonus, 'duplicate', false);
  END IF;

  RETURN jsonb_build_object('success', true, 'credited', 0, 'duplicate', true);
END;
$function$;
