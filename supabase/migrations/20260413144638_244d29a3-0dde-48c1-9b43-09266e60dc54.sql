
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('founder', 'admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only founder can see roles
CREATE POLICY "Founder can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'founder'));

-- Only founder can insert roles
CREATE POLICY "Founder can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'founder'));

-- Only founder can delete roles
CREATE POLICY "Founder can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'founder'));

-- No updates allowed (must delete and re-insert to change roles)
-- This prevents any privilege escalation via UPDATE

-- Admin view function: returns all users with profile, role, and creation counts
-- Only callable by founder
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  nome TEXT,
  cognome TEXT,
  telefono TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  studio_count BIGINT,
  analysis_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check caller is founder
  IF NOT public.has_role(auth.uid(), 'founder') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    p.email,
    p.nome,
    p.cognome,
    p.telefono,
    COALESCE(ur.role::TEXT, 'user') AS role,
    p.created_at,
    COALESCE(sc.cnt, 0) AS studio_count,
    COALESCE(ac.cnt, 0) AS analysis_count
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::BIGINT AS cnt FROM public.studio_creations s WHERE s.user_id = p.user_id AND s.status = 'complete'
  ) sc ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::BIGINT AS cnt FROM public.analyses a WHERE a.user_id = p.user_id
  ) ac ON TRUE
  ORDER BY p.created_at DESC;
END;
$$;
