ALTER TABLE public.studio_creations 
ADD COLUMN status text NOT NULL DEFAULT 'complete',
ADD COLUMN incomplete_phase text,
ADD COLUMN incomplete_data jsonb;