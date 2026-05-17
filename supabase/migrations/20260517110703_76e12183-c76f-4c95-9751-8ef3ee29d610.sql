
DROP FUNCTION IF EXISTS public.get_all_users_admin();

CREATE OR REPLACE FUNCTION public.get_all_users_admin()
 RETURNS TABLE(
  user_id uuid, email text, nome text, cognome text, telefono text,
  role text, plan text,
  studio_used integer, studio_limit integer, bonus_credits integer,
  cd_used integer, cd_limit integer,
  created_at timestamp with time zone,
  studio_count bigint, analysis_count bigint,
  free_redeemed boolean, bundle_purchased integer
 )
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
    COALESCE((public.get_plan_limits(uc.plan)->>'studio_limit')::int, 0) AS studio_limit,
    COALESCE(uc.bonus_credits, 0) AS bonus_credits,
    COALESCE(uc.creative_director_used, 0) AS cd_used,
    COALESCE((public.get_plan_limits(uc.plan)->>'creative_director_limit')::int, 0) AS cd_limit,
    p.created_at,
    COALESCE(sc.cnt, 0) AS studio_count,
    COALESCE(ac.cnt, 0) AS analysis_count,
    (flc.user_id IS NOT NULL) AS free_redeemed,
    COALESCE(bp.total, 0)::int AS bundle_purchased
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  LEFT JOIN public.user_credits uc ON uc.user_id = p.user_id
  LEFT JOIN public.free_listing_claims flc ON flc.user_id = p.user_id
  LEFT JOIN LATERAL (SELECT COUNT(*)::BIGINT AS cnt FROM public.studio_creations s
    WHERE s.user_id = p.user_id AND s.status = 'complete') sc ON TRUE
  LEFT JOIN LATERAL (SELECT COUNT(*)::BIGINT AS cnt FROM public.analyses a
    WHERE a.user_id = p.user_id) ac ON TRUE
  LEFT JOIN LATERAL (SELECT COALESCE(SUM(quantity), 0) AS total FROM public.bundle_purchases b
    WHERE b.user_id = p.user_id) bp ON TRUE
  ORDER BY p.created_at DESC;
END;
$function$;
