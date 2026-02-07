
-- Create table for storing analyses
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titolo TEXT NOT NULL DEFAULT '',
  descrizione TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL DEFAULT '',
  prezzo TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  condizioni TEXT NOT NULL DEFAULT '',
  taglia TEXT NOT NULL DEFAULT '',
  colore TEXT NOT NULL DEFAULT '',
  tempo_caricamento TEXT NOT NULL DEFAULT '',
  first_image_url TEXT,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Public read/insert for now (no auth in the app)
CREATE POLICY "Anyone can insert analyses"
ON public.analyses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read analyses"
ON public.analyses FOR SELECT
USING (true);

-- Create storage bucket for analysis images
INSERT INTO storage.buckets (id, name, public) VALUES ('analysis-images', 'analysis-images', true);

CREATE POLICY "Anyone can upload analysis images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'analysis-images');

CREATE POLICY "Anyone can view analysis images"
ON storage.objects FOR SELECT
USING (bucket_id = 'analysis-images');
