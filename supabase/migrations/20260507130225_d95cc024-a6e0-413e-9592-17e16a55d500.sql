
CREATE OR REPLACE FUNCTION public.test_age_test_user(p_user_id uuid, p_days int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET created_at = now() - make_interval(days => p_days)
  WHERE user_id = p_user_id
    AND email LIKE 'test+%@example.com';
END;
$$;
