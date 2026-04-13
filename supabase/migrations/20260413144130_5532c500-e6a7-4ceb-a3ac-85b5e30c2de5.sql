
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  nome TEXT NOT NULL DEFAULT '',
  cognome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, nome, cognome)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'given_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'family_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add user_id to existing tables
ALTER TABLE public.analyses ADD COLUMN user_id UUID;
ALTER TABLE public.studio_creations ADD COLUMN user_id UUID;

-- Drop old permissive policies on analyses
DROP POLICY IF EXISTS "Allow all delete on analyses" ON public.analyses;
DROP POLICY IF EXISTS "Allow all insert on analyses" ON public.analyses;
DROP POLICY IF EXISTS "Allow all select on analyses" ON public.analyses;

-- New user-scoped policies for analyses
CREATE POLICY "Users can view their own analyses"
ON public.analyses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.analyses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.analyses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Drop old permissive policies on studio_creations
DROP POLICY IF EXISTS "Allow all delete on studio_creations" ON public.studio_creations;
DROP POLICY IF EXISTS "Allow all insert on studio_creations" ON public.studio_creations;
DROP POLICY IF EXISTS "Allow all select on studio_creations" ON public.studio_creations;
DROP POLICY IF EXISTS "Allow all update on studio_creations" ON public.studio_creations;

-- New user-scoped policies for studio_creations
CREATE POLICY "Users can view their own studio_creations"
ON public.studio_creations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own studio_creations"
ON public.studio_creations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own studio_creations"
ON public.studio_creations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own studio_creations"
ON public.studio_creations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
