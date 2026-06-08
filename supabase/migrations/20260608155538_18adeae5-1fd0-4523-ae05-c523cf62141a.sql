
CREATE OR REPLACE FUNCTION public.get_all_studio_creations_admin(
  p_limit int DEFAULT 200,
  p_offset int DEFAULT 0,
  p_search text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  nome text,
  cognome text,
  titolo_generato text,
  categoria text,
  first_image_url text,
  status text,
  origin text,
  created_at timestamptz,
  plan text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'founder'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    sc.id,
    sc.user_id,
    COALESCE(p.email, '') AS email,
    COALESCE(p.nome, '') AS nome,
    COALESCE(p.cognome, '') AS cognome,
    sc.titolo_generato,
    sc.categoria,
    sc.first_image_url,
    sc.status,
    sc.origin,
    sc.created_at,
    COALESCE(uc.plan::text, 'free') AS plan
  FROM public.studio_creations sc
  LEFT JOIN public.profiles p ON p.user_id = sc.user_id
  LEFT JOIN public.user_credits uc ON uc.user_id = sc.user_id
  WHERE p_search IS NULL
     OR sc.titolo_generato ILIKE '%'||p_search||'%'
     OR p.email ILIKE '%'||p_search||'%'
     OR sc.categoria ILIKE '%'||p_search||'%'
  ORDER BY sc.created_at DESC
  LIMIT GREATEST(p_limit, 1)
  OFFSET GREATEST(p_offset, 0);
END;
$$;
