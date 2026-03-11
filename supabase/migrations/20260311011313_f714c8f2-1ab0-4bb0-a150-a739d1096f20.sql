
-- Drop all restrictive policies on analyses
DROP POLICY IF EXISTS "Anyone can delete analyses" ON public.analyses;
DROP POLICY IF EXISTS "Anyone can insert analyses" ON public.analyses;
DROP POLICY IF EXISTS "Anyone can read analyses" ON public.analyses;

-- Drop all restrictive policies on studio_creations
DROP POLICY IF EXISTS "Anyone can delete studio_creations" ON public.studio_creations;
DROP POLICY IF EXISTS "Anyone can insert studio_creations" ON public.studio_creations;
DROP POLICY IF EXISTS "Anyone can read studio_creations" ON public.studio_creations;
DROP POLICY IF EXISTS "Anyone can update studio_creations" ON public.studio_creations;

-- Recreate as PERMISSIVE policies on analyses
CREATE POLICY "Allow all select on analyses" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "Allow all insert on analyses" ON public.analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete on analyses" ON public.analyses FOR DELETE USING (true);

-- Recreate as PERMISSIVE policies on studio_creations
CREATE POLICY "Allow all select on studio_creations" ON public.studio_creations FOR SELECT USING (true);
CREATE POLICY "Allow all insert on studio_creations" ON public.studio_creations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on studio_creations" ON public.studio_creations FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on studio_creations" ON public.studio_creations FOR DELETE USING (true);
