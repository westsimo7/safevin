
CREATE OR REPLACE FUNCTION public.enforce_giardi_studio_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id = '6046eecc-35b8-4fd5-8408-4be64f78941c'
     AND NEW.plan = 'expert'
     AND NEW.studio_used >= 25 THEN
    NEW.plan := 'free';
    NEW.plan_type := 'free';
    NEW.studio_used := 0;
    NEW.creative_director_used := 0;
    NEW.current_period_start := now();
    NEW.current_period_end := now() + interval '30 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_giardi_studio_cap ON public.user_credits;
CREATE TRIGGER trg_enforce_giardi_studio_cap
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.enforce_giardi_studio_cap();
