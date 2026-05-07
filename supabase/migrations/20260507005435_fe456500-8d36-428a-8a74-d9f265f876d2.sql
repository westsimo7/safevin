
-- Free plan: 2 listings per 30-day window starting from user registration date.
-- After window ends, a new 30-day window begins and counter resets.

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
  SELECT created_at INTO v_registered_at
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_registered_at IS NULL THEN
    v_registered_at := v_now;
  END IF;

  v_elapsed_days := EXTRACT(EPOCH FROM (v_now - v_registered_at)) / 86400.0;
  v_window_index := GREATEST(0, FLOOR(v_elapsed_days / 30.0)::int);

  v_period_start := v_registered_at + (v_window_index * interval '30 days');
  v_period_end := v_period_start + interval '30 days';

  RETURN jsonb_build_object(
    'limit', 2,
    'throttle', false,
    'period_start', v_period_start,
    'period_end', v_period_end,
    'window_index', v_window_index
  );
END;
$function$;

-- Update compute_period_for_plan: free uses 30-day window from registration
CREATE OR REPLACE FUNCTION public.compute_period_for_plan(p_plan subscription_plan)
RETURNS TABLE(period_start timestamptz, period_end timestamptz)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_eff jsonb;
BEGIN
  IF p_plan = 'free' AND v_uid IS NOT NULL THEN
    v_eff := public.get_free_effective_limit(v_uid);
    period_start := (v_eff->>'period_start')::timestamptz;
    period_end := (v_eff->>'period_end')::timestamptz;
  ELSIF p_plan = 'free' THEN
    period_start := now();
    period_end := now() + interval '30 days';
  ELSE
    period_start := now();
    period_end := now() + interval '30 days';
  END IF;
  RETURN NEXT;
END;
$function$;
