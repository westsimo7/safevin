
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

  SELECT COUNT(*) INTO v_real_count
  FROM public.studio_creations
  WHERE user_id = p_user_id AND status = 'complete'
    AND created_at >= v_period_start AND created_at < v_period_end;

  UPDATE public.user_credits
  SET studio_used = GREATEST(v_real_count, 0),
      current_period_start = v_period_start,
      current_period_end = v_period_end
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_studio_creations_recount()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.user_id IS NOT NULL THEN
      PERFORM public.ensure_user_credits(NEW.user_id);
      PERFORM public.recount_studio_used(NEW.user_id);
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF NEW.user_id IS NOT NULL THEN PERFORM public.recount_studio_used(NEW.user_id); END IF;
    IF OLD.user_id IS NOT NULL AND OLD.user_id IS DISTINCT FROM NEW.user_id THEN
      PERFORM public.recount_studio_used(OLD.user_id);
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.user_id IS NOT NULL THEN PERFORM public.recount_studio_used(OLD.user_id); END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS studio_creations_recount ON public.studio_creations;
CREATE TRIGGER studio_creations_recount
AFTER INSERT OR UPDATE OR DELETE ON public.studio_creations
FOR EACH ROW EXECUTE FUNCTION public.trg_studio_creations_recount();

CREATE OR REPLACE FUNCTION public.consume_feature_credit(p_feature text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
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
    IF v_used >= v_limit THEN
      RETURN jsonb_build_object('success', false, 'error', 'limit_reached',
        'feature','studio','used',v_used,'limit',v_limit);
    END IF;
    RETURN jsonb_build_object('success', true, 'feature','studio','used',v_used,'limit',v_limit);
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

CREATE OR REPLACE FUNCTION public.ensure_user_credits(p_user_id uuid)
RETURNS user_credits
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_row public.user_credits;
  v_eff jsonb;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_real_count int;
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

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.user_credits LOOP
    PERFORM public.ensure_user_credits(r.user_id);
    PERFORM public.recount_studio_used(r.user_id);
  END LOOP;
END $$;
