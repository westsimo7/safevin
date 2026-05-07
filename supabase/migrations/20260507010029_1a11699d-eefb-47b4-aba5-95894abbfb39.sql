
CREATE OR REPLACE FUNCTION public.cleanup_test_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.studio_creations
  WHERE user_id IN (SELECT user_id FROM public.profiles WHERE email LIKE 'test+%@example.com');

  DELETE FROM public.user_credits
  WHERE user_id IN (SELECT user_id FROM public.profiles WHERE email LIKE 'test+%@example.com');

  DELETE FROM public.profiles
  WHERE email LIKE 'test+%@example.com';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
