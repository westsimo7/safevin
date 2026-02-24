
-- Add analysis_type column to distinguish between image-only and full audit analyses
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS analysis_type TEXT NOT NULL DEFAULT 'full';

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_analyses_type ON public.analyses(analysis_type);
