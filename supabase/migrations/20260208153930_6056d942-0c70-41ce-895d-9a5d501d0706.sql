-- Allow anyone to delete analyses
CREATE POLICY "Anyone can delete analyses"
ON public.analyses
FOR DELETE
USING (true);