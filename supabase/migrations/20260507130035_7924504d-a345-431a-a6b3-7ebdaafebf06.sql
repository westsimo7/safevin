
-- Update recount: studio_used = MAX(current, real_count) so deletes don't refund.
CREATE OR REPLACE FUNCTION public.recount_studio_used(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_row public.user_credits;
  v_eff jsonb;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_real_count int;
  v_new int;
BEGIN
  SELECT * INTO v_row FROM public.user_credits WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF v_row.plan = 'free' THEN
    v_eff := public.get_free_effective_limit(p_user_id);
    v_period_start := (v_eff->>'period_start')::timestamptz;
    v_period_end := (v_eff->>'period_end')::timestamptz;
  ELSE
    v_period_start := COALESCE(v_row.current_period_start, now() - interval '30 days');
    v_period_end := COALESCE(v_row.current_period_end, now() + interval '30 days');
  END IF;

  -- If window changed, reset to real count (start fresh window)
  IF v_row.current_period_start IS DISTINCT FROM v_period_start
     OR v_row.current_period_end IS DISTINCT FROM v_period_end THEN
    SELECT COUNT(*) INTO v_real_count
    FROM public.studio_creations
    WHERE user_id = p_user_id AND status = 'complete'
      AND created_at >= v_period_start AND created_at < v_period_end;
    UPDATE public.user_credits
    SET studio_used = v_real_count,
        current_period_start = v_period_start,
        current_period_end = v_period_end
    WHERE user_id = p_user_id;
    RETURN;
  END IF;

  -- Same window: high-water-mark, never decrease
  SELECT COUNT(*) INTO v_real_count
  FROM public.studio_creations
  WHERE user_id = p_user_id AND status = 'complete'
    AND created_at >= v_period_start AND created_at < v_period_end;

  v_new := GREATEST(v_row.studio_used, v_real_count);
  IF v_new <> v_row.studio_used THEN
    UPDATE public.user_credits SET studio_used = v_new WHERE user_id = p_user_id;
  END IF;
END;
$$;
