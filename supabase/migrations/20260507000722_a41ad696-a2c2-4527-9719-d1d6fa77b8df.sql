
-- Permetti al founder di vedere tutti gli annunci e analisi (necessario per realtime nella dashboard admin)
CREATE POLICY "Founder can view all studio_creations"
ON public.studio_creations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'founder'::public.app_role));

CREATE POLICY "Founder can view all analyses"
ON public.analyses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'founder'::public.app_role));

CREATE POLICY "Founder can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'founder'::public.app_role));
