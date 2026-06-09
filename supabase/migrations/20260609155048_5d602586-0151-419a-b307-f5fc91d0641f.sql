CREATE OR REPLACE FUNCTION public.count_all_studio_creations_admin(p_search text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.studio_creations sc
  LEFT JOIN public.profiles p ON p.id = sc.user_id
  WHERE (
    p_search IS NULL
    OR p_search = ''
    OR sc.titolo_generato ILIKE '%' || p_search || '%'
    OR p.email ILIKE '%' || p_search || '%'
    OR sc.categoria ILIKE '%' || p_search || '%'
    OR p.nome ILIKE '%' || p_search || '%'
    OR p.cognome ILIKE '%' || p_search || '%'
  )
$$;

GRANT EXECUTE ON FUNCTION public.count_all_studio_creations_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_all_studio_creations_admin(text) TO service_role;