-- Daily reset for FREE (Europe/Rome). After 5 lifetime studio creations,
-- Free plan switches to 1 listing per 5 days (hidden throttle).

CREATE OR REPLACE FUNCTION public.compute_period_for_plan(p_plan public.subscription_plan)
RETURNS TABLE(period_start timestamptz, period_end timestamptz)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_now_rome timestamp;
  v_day_start_rome timestamp;
BEGIN
  IF p_plan = 'free' THEN
    v_now_rome := (now() AT TIME ZONE 'Europe/Rome');
    v_day_start_rome := date_trunc('day', v_now_rome);
    period_start := v_day_start_rome AT TIME ZONE 'Europe/Rome';
    period_end := (v_day_start_rome + interval '1 day' - interval '1 second') AT TIME ZONE 'Europe/Rome';
  ELSE
    period_start := now();
    period_end := now() + interval '30 days';
  END IF;
  RETURN NEXT;
END;
$$;

-- Override get_plan_limits only for FREE: dynamic studio_limit based on lifetime count
-- We add a helper that returns the effective free studio_limit for a user.
CREATE OR REPLACE FUNCTION public.get_free_effective_limit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lifetime int;
  v_last_complete timestamptz;
  v_now_rome timestamp;
  v_throttle_active boolean := false;
  v_limit int := 2;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  SELECT COUNT(*)::int, MAX(created_at)
    INTO v_lifetime, v_last_complete
  FROM public.studio_creations
  WHERE user_id = p_user_id AND status = 'complete';

  IF v_lifetime >= 5 THEN
    -- Throttle mode: 1 listing every 5 days
    v_throttle_active := true;
    v_limit := 1;
    -- Period = 5-day window starting from last complete creation (or now if none)
    IF v_last_complete IS NULL THEN
      v_period_start := now();
      v_period_end := now() + interval '5 days';
    ELSE
      v_period_start := v_last_complete;
      v_period_end := v_last_complete + interval '5 days';
    END IF;
  ELSE
    -- Daily mode (Europe/Rome)
    v_now_rome := (now() AT TIME ZONE 'Europe/Rome');
    v_period_start := date_trunc('day', v_now_rome) AT TIME ZONE 'Europe/Rome';
    v_period_end := (date_trunc('day', v_now_rome) + interval '1 day' - interval '1 second') AT TIME ZONE 'Europe/Rome';
  END IF;

  RETURN jsonb_build_object(
    'limit', v_limit,
    'throttle', v_throttle_active,
    'period_start', v_period_start,
    'period_end', v_period_end,
    'lifetime', v_lifetime
  );
END;
$$;

-- Update ensure_user_credits: for free, recompute window from get_free_effective_limit
CREATE OR REPLACE FUNCTION public.ensure_user_credits(p_user_id uuid)
RETURNS public.user_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.user_credits;
  v_eff jsonb;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  INSERT INTO public.user_credits (user_id, plan, plan_type, credits_total, credits_used,
    studio_used, creative_director_used, current_period_start, current_period_end,
    period_start, period_end)
  VALUES (p_user_id, 'free', 'free', 0, 0, 0, 0, now(), now() + interval '1 day',
    date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row FROM public.user_credits WHERE user_id = p_user_id;

  IF v_row.plan = 'free' THEN
    v_eff := public.get_free_effective_limit(p_user_id);
    v_period_start := (v_eff->>'period_start')::timestamptz;
    v_period_end := (v_eff->>'period_end')::timestamptz;

    -- If stored window is outdated (different start) reset counter
    IF v_row.current_period_start IS DISTINCT FROM v_period_start
       OR v_row.current_period_end IS DISTINCT FROM v_period_end THEN
      UPDATE public.user_credits
      SET studio_used = 0,
          current_period_start = v_period_start,
          current_period_end = v_period_end
      WHERE user_id = p_user_id
      RETURNING * INTO v_row;
    END IF;
  ELSE
    IF v_row.current_period_end < now() THEN
      UPDATE public.user_credits
      SET studio_used = 0, creative_director_used = 0,
          current_period_start = now(),
          current_period_end = now() + interval '30 days'
      WHERE user_id = p_user_id
      RETURNING * INTO v_row;
    END IF;
  END IF;

  RETURN v_row;
END;
$$;

-- Update consume_feature_credit + get_user_plan to use dynamic free limit
CREATE OR REPLACE FUNCTION public.consume_feature_credit(p_feature text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_credits;
  v_limits jsonb;
  v_limit INT;
  v_used INT;
  v_eff jsonb;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'unauthenticated'); END IF;

  IF public.has_role(v_uid, 'founder'::public.app_role) THEN
    RETURN jsonb_build_object('success', true, 'bypassed', true);
  END IF;

  v_row := public.ensure_user_credits(v_uid);
  v_limits := public.get_plan_limits(v_row.plan);

  IF p_feature = 'studio' THEN
    IF v_row.plan = 'free' THEN
      v_eff := public.get_free_effective_limit(v_uid);
      v_limit := (v_eff->>'limit')::int;
    ELSE
      v_limit := (v_limits->>'studio_limit')::int;
    END IF;
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

CREATE OR REPLACE FUNCTION public.get_user_plan()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_credits;
  v_limits jsonb;
  v_studio_limit int;
  v_eff jsonb;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','unauthenticated'); END IF;

  v_row := public.ensure_user_credits(v_uid);
  v_limits := public.get_plan_limits(v_row.plan);

  IF v_row.plan = 'free' THEN
    v_eff := public.get_free_effective_limit(v_uid);
    v_studio_limit := (v_eff->>'limit')::int;
  ELSE
    v_studio_limit := (v_limits->>'studio_limit')::int;
  END IF;

  RETURN jsonb_build_object(
    'plan', v_row.plan,
    'studio_used', v_row.studio_used,
    'studio_limit', v_studio_limit,
    'studio_remaining', GREATEST(0, v_studio_limit - v_row.studio_used),
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