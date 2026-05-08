
-- 1) bonus_credits column
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS bonus_credits integer NOT NULL DEFAULT 0;

-- 2) bundle_purchases table
CREATE TABLE IF NOT EXISTS public.bundle_purchases (
  session_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bundle_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bundle purchases" ON public.bundle_purchases;
CREATE POLICY "Users can view own bundle purchases"
ON public.bundle_purchases FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'founder'::public.app_role));

-- 3) updated recount: cap studio_used at plan limit
CREATE OR REPLACE FUNCTION public.recount_studio_used(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row public.user_credits;
  v_eff jsonb;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_real_count int;
  v_limits jsonb;
  v_plan_limit int;
  v_capped int;
BEGIN
  SELECT * INTO v_row FROM public.user_credits WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_limits := public.get_plan_limits(v_row.plan);

  IF v_row.plan = 'free' THEN
    v_eff := public.get_free_effective_limit(p_user_id);
    v_period_start := (v_eff->>'period_start')::timestamptz;
    v_period_end := (v_eff->>'period_end')::timestamptz;
    v_plan_limit := (v_eff->>'limit')::int;
  ELSE
    v_period_start := COALESCE(v_row.current_period_start, now() - interval '30 days');
    v_period_end := COALESCE(v_row.current_period_end, now() + interval '30 days');
    v_plan_limit := (v_limits->>'studio_limit')::int;
  END IF;

  IF v_row.current_period_start IS DISTINCT FROM v_period_start
     OR v_row.current_period_end IS DISTINCT FROM v_period_end THEN
    SELECT COUNT(*) INTO v_real_count
    FROM public.studio_creations
    WHERE user_id = p_user_id AND status = 'complete'
      AND created_at >= v_period_start AND created_at < v_period_end;
    v_capped := LEAST(v_real_count, v_plan_limit);
    UPDATE public.user_credits
    SET studio_used = v_capped,
        current_period_start = v_period_start,
        current_period_end = v_period_end
    WHERE user_id = p_user_id;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_real_count
  FROM public.studio_creations
  WHERE user_id = p_user_id AND status = 'complete'
    AND created_at >= v_period_start AND created_at < v_period_end;

  v_capped := LEAST(GREATEST(v_row.studio_used, v_real_count), v_plan_limit);
  IF v_capped <> v_row.studio_used THEN
    UPDATE public.user_credits SET studio_used = v_capped WHERE user_id = p_user_id;
  END IF;
END;
$function$;

-- 4) get_user_plan: includes bonus_credits in remaining
CREATE OR REPLACE FUNCTION public.get_user_plan()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_credits;
  v_limits jsonb;
  v_studio_limit int;
  v_eff jsonb;
  v_plan_remaining int;
  v_bonus int;
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

  v_plan_remaining := GREATEST(0, v_studio_limit - v_row.studio_used);
  v_bonus := COALESCE(v_row.bonus_credits, 0);

  RETURN jsonb_build_object(
    'plan', v_row.plan,
    'studio_used', v_row.studio_used,
    'studio_limit', v_studio_limit,
    'studio_remaining', v_plan_remaining + v_bonus,
    'bonus_credits', v_bonus,
    'plan_remaining', v_plan_remaining,
    'creative_director_used', v_row.creative_director_used,
    'creative_director_limit', (v_limits->>'creative_director_limit')::int,
    'creative_director_remaining', GREATEST(0, (v_limits->>'creative_director_limit')::int - v_row.creative_director_used),
    'current_period_start', v_row.current_period_start,
    'current_period_end', v_row.current_period_end,
    'limits', v_limits,
    'is_founder', public.has_role(v_uid, 'founder'::public.app_role)
  );
END;
$function$;

-- 5) consume_feature_credit: drain bonus when plan exhausted
CREATE OR REPLACE FUNCTION public.consume_feature_credit(p_feature text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_credits;
  v_limits jsonb;
  v_limit INT;
  v_used INT;
  v_eff jsonb;
  v_bonus INT;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'unauthenticated'); END IF;
  IF public.has_role(v_uid, 'founder'::public.app_role) THEN
    RETURN jsonb_build_object('success', true, 'bypassed', true);
  END IF;

  v_row := public.ensure_user_credits(v_uid);
  PERFORM public.recount_studio_used(v_uid);
  SELECT * INTO v_row FROM public.user_credits WHERE user_id = v_uid;
  v_limits := public.get_plan_limits(v_row.plan);

  IF p_feature = 'studio' THEN
    IF v_row.plan = 'free' THEN
      v_eff := public.get_free_effective_limit(v_uid);
      v_limit := (v_eff->>'limit')::int;
    ELSE
      v_limit := (v_limits->>'studio_limit')::int;
    END IF;
    v_used := v_row.studio_used;
    v_bonus := COALESCE(v_row.bonus_credits, 0);

    IF v_used < v_limit THEN
      RETURN jsonb_build_object('success', true, 'feature','studio','source','plan','used',v_used,'limit',v_limit,'bonus_credits',v_bonus);
    ELSIF v_bonus > 0 THEN
      UPDATE public.user_credits SET bonus_credits = bonus_credits - 1 WHERE user_id = v_uid;
      RETURN jsonb_build_object('success', true, 'feature','studio','source','bonus','used',v_used,'limit',v_limit,'bonus_credits',v_bonus - 1);
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'limit_reached',
        'feature','studio','used',v_used,'limit',v_limit,'bonus_credits',0);
    END IF;
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
$function$;

-- 6) credit_bundle_purchase rpc — idempotent via PK
CREATE OR REPLACE FUNCTION public.credit_bundle_purchase(p_session_id text, p_user_id uuid, p_quantity int)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_inserted boolean := false;
BEGIN
  IF p_session_id IS NULL OR p_user_id IS NULL OR p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_input');
  END IF;

  INSERT INTO public.bundle_purchases (session_id, user_id, quantity)
  VALUES (p_session_id, p_user_id, p_quantity)
  ON CONFLICT (session_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted THEN
    PERFORM public.ensure_user_credits(p_user_id);
    UPDATE public.user_credits
    SET bonus_credits = COALESCE(bonus_credits, 0) + p_quantity
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('success', true, 'credited', p_quantity, 'duplicate', false);
  END IF;

  RETURN jsonb_build_object('success', true, 'credited', 0, 'duplicate', true);
END;
$function$;
