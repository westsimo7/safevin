CREATE OR REPLACE FUNCTION public.sync_user_plan_from_payment(
  p_user_id uuid,
  p_new_plan subscription_plan,
  p_period_end timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_period RECORD;
  v_current_plan subscription_plan;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_plan_changed boolean;
BEGIN
  PERFORM public.ensure_user_credits(p_user_id);

  SELECT plan INTO v_current_plan FROM public.user_credits WHERE user_id = p_user_id;
  v_plan_changed := (v_current_plan IS DISTINCT FROM p_new_plan);

  SELECT * INTO v_period FROM public.compute_period_for_plan(p_new_plan);
  v_period_start := v_period.period_start;
  v_period_end := COALESCE(p_period_end, v_period.period_end);

  IF v_plan_changed AND p_new_plan <> 'free' THEN
    -- Upgrade/cambio a piano pagante: dai i benefit pieni (azzera contatori)
    UPDATE public.user_credits
    SET plan = p_new_plan,
        plan_type = p_new_plan::text,
        studio_used = 0,
        creative_director_used = 0,
        current_period_start = v_period_start,
        current_period_end = v_period_end
    WHERE user_id = p_user_id;
  ELSIF v_plan_changed THEN
    -- Downgrade a free: aggiorna piano e periodo senza toccare i contatori
    UPDATE public.user_credits
    SET plan = p_new_plan,
        plan_type = p_new_plan::text,
        current_period_start = v_period_start,
        current_period_end = v_period_end
    WHERE user_id = p_user_id;
  ELSE
    -- Stesso piano: aggiorna solo il periodo (per non perdere il contatore corrente)
    UPDATE public.user_credits
    SET current_period_end = v_period_end
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'plan', p_new_plan,
    'plan_changed', v_plan_changed,
    'reset_counters', v_plan_changed AND p_new_plan <> 'free'
  );
END;
$function$;