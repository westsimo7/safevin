-- Weekly period (Mon 00:00 -> Sun 23:59:59 Europe/Rome) for FREE plan,
-- 30-day rolling period for paid plans.

CREATE OR REPLACE FUNCTION public.compute_period_for_plan(p_plan public.subscription_plan)
RETURNS TABLE(period_start timestamptz, period_end timestamptz)
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_now_rome timestamp;
  v_dow int;
  v_week_start_rome timestamp;
  v_week_end_rome timestamp;
BEGIN
  IF p_plan = 'free' THEN
    v_now_rome := (now() AT TIME ZONE 'Europe/Rome');
    -- Monday=1 ... Sunday=7
    v_dow := EXTRACT(ISODOW FROM v_now_rome)::int;
    v_week_start_rome := date_trunc('day', v_now_rome) - ((v_dow - 1) || ' days')::interval;
    v_week_end_rome := v_week_start_rome + interval '7 days' - interval '1 second';
    period_start := v_week_start_rome AT TIME ZONE 'Europe/Rome';
    period_end := v_week_end_rome AT TIME ZONE 'Europe/Rome';
  ELSE
    period_start := now();
    period_end := now() + interval '30 days';
  END IF;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_credits(p_user_id uuid)
RETURNS public.user_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.user_credits;
  v_period RECORD;
BEGIN
  INSERT INTO public.user_credits (user_id, plan, plan_type, credits_total, credits_used,
    studio_used, creative_director_used, current_period_start, current_period_end,
    period_start, period_end)
  SELECT p_user_id, 'free', 'free', 0, 0, 0, 0,
         cp.period_start, cp.period_end,
         date_trunc('month', now()), date_trunc('month', now()) + interval '1 month'
  FROM public.compute_period_for_plan('free'::public.subscription_plan) cp
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row FROM public.user_credits WHERE user_id = p_user_id;

  IF v_row.current_period_end < now() THEN
    SELECT * INTO v_period FROM public.compute_period_for_plan(v_row.plan);
    UPDATE public.user_credits
    SET studio_used = 0, creative_director_used = 0,
        current_period_start = v_period.period_start,
        current_period_end = v_period.period_end
    WHERE user_id = p_user_id
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

-- When admin changes plan, reset using the right period
CREATE OR REPLACE FUNCTION public.set_user_plan(p_target_user uuid, p_new_plan public.subscription_plan)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_period RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'founder'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied: only founder can change plans';
  END IF;

  PERFORM public.ensure_user_credits(p_target_user);
  SELECT * INTO v_period FROM public.compute_period_for_plan(p_new_plan);

  UPDATE public.user_credits
  SET plan = p_new_plan, plan_type = p_new_plan::text,
      studio_used = 0, creative_director_used = 0,
      current_period_start = v_period.period_start,
      current_period_end = v_period.period_end
  WHERE user_id = p_target_user;

  RETURN jsonb_build_object('success', true, 'user_id', p_target_user, 'new_plan', p_new_plan);
END;
$$;

-- Sync from payments: also reset period using new plan's window
CREATE OR REPLACE FUNCTION public.sync_user_plan_from_payment(p_user_id uuid, p_new_plan public.subscription_plan)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_period RECORD;
BEGIN
  PERFORM public.ensure_user_credits(p_user_id);
  SELECT * INTO v_period FROM public.compute_period_for_plan(p_new_plan);

  UPDATE public.user_credits
  SET plan = p_new_plan,
      plan_type = p_new_plan::text,
      current_period_start = v_period.period_start,
      current_period_end = v_period.period_end
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'plan', p_new_plan);
END;
$$;