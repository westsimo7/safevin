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

CREATE OR REPLACE FUNCTION public.get_all_users_admin()
 RETURNS TABLE(user_id uuid, email text, nome text, cognome text, telefono text, role text, plan text, studio_used integer, studio_limit integer, bonus_credits integer, cd_used integer, cd_limit integer, created_at timestamp with time zone, studio_count bigint, analysis_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    COALESCE((public.get_plan_limits(uc.plan)->>'studio_limit')::int, 1) AS studio_limit,
    COALESCE(uc.bonus_credits, 0) AS bonus_credits,
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
$function$;