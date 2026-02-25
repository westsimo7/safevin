
-- Add Studio Signature Layer columns to studio_creations
ALTER TABLE public.studio_creations 
ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'studio',
ADD COLUMN IF NOT EXISTS studio_version TEXT NOT NULL DEFAULT 'v4',
ADD COLUMN IF NOT EXISTS keyword_list JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS structural_blocks JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS semantic_fingerprint TEXT;

-- Add origin column to analyses for dual-mode audit
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'external',
ADD COLUMN IF NOT EXISTS studio_creation_id UUID REFERENCES public.studio_creations(id);
