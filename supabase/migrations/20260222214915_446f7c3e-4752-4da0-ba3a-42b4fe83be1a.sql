
-- Create table for SAFEViN Studio creations
CREATE TABLE public.studio_creations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  vision_report TEXT,
  questions_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  output JSONB,
  first_image_url TEXT,
  titolo_generato TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.studio_creations ENABLE ROW LEVEL SECURITY;

-- Public access policies (same pattern as analyses table)
CREATE POLICY "Anyone can read studio_creations"
ON public.studio_creations FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert studio_creations"
ON public.studio_creations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete studio_creations"
ON public.studio_creations FOR DELETE
USING (true);

CREATE POLICY "Anyone can update studio_creations"
ON public.studio_creations FOR UPDATE
USING (true);
